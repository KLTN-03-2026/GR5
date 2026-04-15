import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, phuong_thuc_xac_thuc = "FACE_ID" } = body;

    // 1. Bảo vệ đầu vào
    if (!ma_nguoi_dung || isNaN(Number(ma_nguoi_dung))) {
      return NextResponse.json(
        { success: false, message: "Mã người dùng không hợp lệ" },
        { status: 400 },
      );
    }

    const userId = Number(ma_nguoi_dung);
    const now = new Date();

    // Tạo mốc bắt đầu và kết thúc của ngày hôm nay để query chính xác
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    // 2. Kiểm tra chống chấm công lặp lại trong ngày (nếu chưa có giờ ra)
    const existingLog = await prisma.lich_su_cham_cong.findFirst({
      where: {
        ma_nguoi_dung: userId,
        gio_vao: { gte: startOfDay, lte: endOfDay },
        gio_ra: null, // Chỉ chặn nếu ca trước chưa kết thúc
      },
    });

    if (existingLog) {
      return NextResponse.json(
        { success: false, message: "Bạn đã chấm công vào và chưa kết thúc ca" },
        { status: 400 },
      );
    }

    // 3. Tìm lịch phân ca ngày hôm nay của nhân viên
    const lichCa = await prisma.lich_phan_cong_ca.findFirst({
      where: {
        ma_nguoi_dung: userId,
        ngay_lam_viec: { gte: startOfDay, lte: endOfDay },
      },
      include: { ca_lam_viec: true },
    });

    let trangThai = "DUNG_GIO";
    let soPhutTre = 0;
    let maCaLam = null;

    // 4. Tính toán trễ giờ (nếu có ca làm việc)
    if (lichCa?.ca_lam_viec?.gio_bat_dau) {
      maCaLam = lichCa.ma_ca_lam;

      // Extract giờ/phút từ kiểu db.Time của Prisma (thường ở dạng UTC 1970)
      const caStart = new Date(lichCa.ca_lam_viec.gio_bat_dau);
      const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        caStart.getUTCHours(),
        caStart.getUTCMinutes(),
      );

      // Cho phép chấm sớm (khoảng 30 phút), chỉ tính trễ khi now > targetTime
      if (now > targetTime) {
        const diffMs = now.getTime() - targetTime.getTime();
        soPhutTre = Math.floor(diffMs / 60000);

        if (soPhutTre > 0) {
          trangThai = "TRE";
        }
      }
    } else {
      trangThai = "KHONG_CO_LICH"; // Trường hợp làm thêm ngoài giờ/tăng ca
    }

    // 5. Ghi nhận vào Database
    const chamCong = await prisma.lich_su_cham_cong.create({
      data: {
        ma_nguoi_dung: userId,
        ma_ca_lam: maCaLam,
        gio_vao: now,
        phuong_thuc_xac_thuc: String(phuong_thuc_xac_thuc),
        trang_thai: trangThai,
        so_phut_tre: soPhutTre,
      },
    });

    return NextResponse.json(
      { success: true, data: chamCong },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API_CHAM_CONG_VAO] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi chấm công" },
      { status: 500 },
    );
  }
}
