import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/admin/ncc/[id]/chot-gia
 *
 * ✅ FIX ĐIỂM 1 & ĐIỂM 6: Tách luồng "Thủ kho duyệt hàng về" vs "Kế toán chốt giá"
 *
 * Nghiệp vụ:
 * 1. Kế toán xác nhận đơn giá thực tế trên phiếu nhập đã được duyệt (DA_DUYET)
 * 2. Hệ thống tự động:
 *    a. Cập nhật don_gia và tong_tien trên phiếu nhập
 *    b. Sinh giao dịch PHAT_SINH_NO cho NCC
 *    c. Ghi audit log
 *
 * Body: { ma_phieu_nhap: number, don_gia: number, ghi_chu?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const body = await req.json();
  const { ma_phieu_nhap, don_gia, ghi_chu } = body;

  if (!ma_phieu_nhap || !don_gia || Number(don_gia) <= 0) {
    return NextResponse.json(
      { error: "Thiếu mã phiếu nhập hoặc đơn giá không hợp lệ" },
      { status: 400 }
    );
  }

  // ✅ FIX ĐIỂM 5: Kiểm tra idempotency — chặn double-submit
  const existingDebt = await prisma.cong_no_ncc.findFirst({
    where: {
      ma_ncc: Number(id),
      loai_giao_dich: "PHAT_SINH_NO",
      ghi_chu: { contains: `PN#${ma_phieu_nhap}` },
    },
  });
  if (existingDebt) {
    return NextResponse.json(
      { message: "Phiếu nhập này đã được chốt giá và ghi nợ trước đó", tx: existingDebt },
      { status: 200 }
    );
  }

  // Lấy chi tiết phiếu nhập, kiểm tra phiếu đã duyệt và thuộc NCC đúng
  const phieu = await prisma.phieu_nhap_kho.findUnique({
    where: { id: Number(ma_phieu_nhap) },
    include: { chi_tiet_phieu_nhap: true },
  });

  if (!phieu) {
    return NextResponse.json({ error: "Không tìm thấy phiếu nhập" }, { status: 404 });
  }
  if (phieu.ma_ncc !== Number(id)) {
    return NextResponse.json(
      { error: "Phiếu nhập không thuộc về NCC này" },
      { status: 400 }
    );
  }
  if (phieu.trang_thai !== "DA_DUYET") {
    return NextResponse.json(
      {
        error: `Chỉ được chốt giá phiếu đã duyệt xong (DA_DUYET). Trạng thái hiện tại: ${phieu.trang_thai}`,
      },
      { status: 400 }
    );
  }

  // Tính tổng tiền = đơn giá × số lượng thực nhận
  const chiTiet = phieu.chi_tiet_phieu_nhap[0];
  const soLuong = chiTiet?.so_luong_thuc_nhan ?? chiTiet?.so_luong_yeu_cau ?? 0;
  const tongTien = Number(don_gia) * soLuong;

  // ✅ FIX ĐIỂM 7: Audit info
  const actor =
    (session?.user as any)?.name || (session?.user as any)?.email || "Kế toán";
  const timestamp = new Date().toLocaleString("vi-VN");

  // Thực hiện trong transaction để đảm bảo tính nhất quán
  const result = await prisma.$transaction(async (tx) => {
    // 1. Cập nhật đơn giá & tổng tiền lên chi tiết phiếu và phiếu chính
    if (chiTiet) {
      await tx.chi_tiet_phieu_nhap.update({
        where: { id: chiTiet.id },
        data: { don_gia: Number(don_gia) },
      });
    }
    await tx.phieu_nhap_kho.update({
      where: { id: Number(ma_phieu_nhap) },
      data: { tong_tien: tongTien },
    });

    // 2. ✅ FIX ĐIỂM 1: Sinh giao dịch PHAT_SINH_NO → tạo công nợ cho NCC
    const debtTx = await tx.cong_no_ncc.create({
      data: {
        ma_ncc: Number(id),
        loai_giao_dich: "PHAT_SINH_NO",
        so_tien: tongTien,
        // so_du_sau: snapshot tại thời điểm giao dịch (không dùng để tính sổ chính thức)
        so_du_sau: null, // ✅ Không ghi so_du_sau — số dư chính thức tính bằng SUM
        phuong_thuc: null,
        ma_giao_dich: `PN#${ma_phieu_nhap}`,
        nguoi_thuc_hien_id: (session?.user as any)?.id ?? null,
        ghi_chu: `[${timestamp}] ${actor} chốt giá PN#${ma_phieu_nhap}: ${soLuong} x ${Number(don_gia).toLocaleString("vi-VN")}đ = ${tongTien.toLocaleString("vi-VN")}đ${ghi_chu ? `. ${ghi_chu}` : ""}`,
      },
    });

    return { debtTx, tongTien };
  });

  return NextResponse.json(
    {
      message: `Đã chốt giá và ghi nợ ${tongTien.toLocaleString("vi-VN")}đ cho NCC`,
      tong_tien: result.tongTien,
      giao_dich: result.debtTx,
    },
    { status: 201 }
  );
}
