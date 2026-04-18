import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/admin/ncc/[id]/trang-thai
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { trang_thai, ly_do } = body;

  if (!["DANG_HOP_TAC", "TAM_DUNG", "NGUNG"].includes(trang_thai)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }

  // Cảnh báo nếu còn công nợ khi Ngừng hợp tác
  if (trang_thai === "NGUNG") {
    const lastDebt = await prisma.cong_no_ncc.findFirst({
      where: { ma_ncc: Number(id) },
      orderBy: { ngay_giao_dich: "desc" },
      select: { so_du_sau: true },
    });
    const conNo = Number(lastDebt?.so_du_sau ?? 0);
    if (conNo > 0) {
      return NextResponse.json(
        { warning: true, cong_no: conNo, message: `NCC còn công nợ ${conNo.toLocaleString("vi-VN")}đ chưa thanh toán. Bạn có chắc chắn muốn ngừng hợp tác?` },
        { status: 200 }
      );
    }
  }

  const updated = await prisma.nha_cung_cap.update({
    where: { id: Number(id) },
    data: {
      trang_thai,
      ghi_chu_noi_bo: ly_do ? `[${new Date().toLocaleDateString("vi-VN")}] ${ly_do}` : undefined,
    },
  });

  return NextResponse.json(updated);
}
