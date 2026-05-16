import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const FACE_MATCH_THRESHOLD = 0.5;

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, descriptor, anh, phuong_thuc_xac_thuc = "FACE_ID" } = body;

    if (!ma_nguoi_dung || isNaN(Number(ma_nguoi_dung))) {
      return NextResponse.json(
        { success: false, message: "Mã người dùng không hợp lệ" },
        { status: 400 },
      );
    }

    if (!Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json(
        { success: false, message: "Yêu cầu xác thực khuôn mặt" },
        { status: 400 },
      );
    }

    const userId = Number(ma_nguoi_dung);

    const faceRow = await prisma.du_lieu_khuon_mat.findFirst({
      where: { ma_nguoi_dung: userId },
      select: { vector_khuon_mat: true },
    });
    if (!faceRow) {
      return NextResponse.json(
        { success: false, message: "Bạn chưa đăng ký FaceID. Vui lòng đăng ký trước." },
        { status: 400 },
      );
    }

    let saved: number[];
    try {
      saved = JSON.parse(faceRow.vector_khuon_mat);
    } catch {
      return NextResponse.json(
        { success: false, message: "Dữ liệu khuôn mặt không hợp lệ" },
        { status: 500 },
      );
    }

    const dist = euclideanDistance(descriptor as number[], saved);
    if (dist >= FACE_MATCH_THRESHOLD) {
      return NextResponse.json(
        { success: false, message: "Khuôn mặt không khớp tài khoản đăng nhập" },
        { status: 401 },
      );
    }

    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Kiểm tra chống chấm công lặp lại trong ngày (nếu chưa có giờ ra)
    const existingLog = await prisma.lich_su_cham_cong.findFirst({
      where: {
        ma_nguoi_dung: userId,
        gio_vao: { gte: startOfDay, lte: endOfDay },
        gio_ra: null,
      },
    });

    if (existingLog) {
      return NextResponse.json(
        { success: false, message: "Bạn đã chấm công vào và chưa kết thúc ca" },
        { status: 400 },
      );
    }

    // Tìm lịch phân ca ngày hôm nay
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

    if (lichCa?.ca_lam_viec?.gio_bat_dau) {
      maCaLam = lichCa.ma_ca_lam;

      const caStart = new Date(lichCa.ca_lam_viec.gio_bat_dau);
      const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        caStart.getUTCHours(),
        caStart.getUTCMinutes(),
      );

      if (now > targetTime) {
        const diffMs = now.getTime() - targetTime.getTime();
        soPhutTre = Math.floor(diffMs / 60000);
        if (soPhutTre > 0) {
          trangThai = "TRE";
        }
      }
    } else {
      trangThai = "KHONG_CO_LICH";
    }

    const chamCong = await prisma.lich_su_cham_cong.create({
      data: {
        ma_nguoi_dung: userId,
        ma_ca_lam: maCaLam,
        gio_vao: now,
        phuong_thuc_xac_thuc: String(phuong_thuc_xac_thuc),
        trang_thai: trangThai,
        so_phut_tre: soPhutTre,
        anh_vao: typeof anh === "string" && anh.startsWith("data:image") ? anh : null,
      },
    });

    return NextResponse.json({ success: true, data: chamCong }, { status: 201 });
  } catch (error) {
    console.error("[API_CHAM_CONG_VAO] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi chấm công" },
      { status: 500 },
    );
  }
}
