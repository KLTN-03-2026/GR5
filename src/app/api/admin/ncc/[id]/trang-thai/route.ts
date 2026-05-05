import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/admin/ncc/[id]/trang-thai
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const body = await req.json();
  const { trang_thai, ly_do, force } = body;

  if (!["DANG_HOP_TAC", "TAM_DUNG", "NGUNG"].includes(trang_thai)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }

  // ✅ FIX ĐIỂM 4: Kiểm tra công nợ bằng SUM khi Ngừng hợp tác
  if (trang_thai === "NGUNG" && !force) {
    const [phatSinh, thanhToan] = await Promise.all([
      prisma.cong_no_ncc.aggregate({
        _sum: { so_tien: true },
        where: { ma_ncc: Number(id), loai_giao_dich: "PHAT_SINH_NO" },
      }),
      prisma.cong_no_ncc.aggregate({
        _sum: { so_tien: true },
        where: { ma_ncc: Number(id), loai_giao_dich: "THANH_TOAN" },
      }),
    ]);
    const conNo = Number(phatSinh._sum.so_tien ?? 0) - Number(thanhToan._sum.so_tien ?? 0);
    if (conNo > 0) {
      return NextResponse.json(
        {
          warning: true,
          cong_no: conNo,
          message: `NCC còn công nợ ${conNo.toLocaleString("vi-VN")}đ chưa thanh toán. Bạn có chắc chắn muốn ngừng hợp tác?`,
        },
        { status: 200 }
      );
    }
  }

  // ✅ FIX ĐIỂM 7: Audit log — ghi rõ ai thay đổi, khi nào, lý do gì
  const actor = (session?.user as any)?.name || (session?.user as any)?.email || "Hệ thống";
  const timestamp = new Date().toLocaleString("vi-VN");
  const auditEntry = `[${timestamp}] ${actor} Đổi trạng thái → ${trang_thai}${ly_do ? `: ${ly_do}` : ""}`;

  const current = await prisma.nha_cung_cap.findUnique({
    where: { id: Number(id) },
    select: { ghi_chu_noi_bo: true },
  });

  const updatedGhiChu = current?.ghi_chu_noi_bo
    ? `${current.ghi_chu_noi_bo}\n${auditEntry}`
    : auditEntry;

  const updated = await prisma.nha_cung_cap.update({
    where: { id: Number(id) },
    data: {
      trang_thai,
      ghi_chu_noi_bo: updatedGhiChu,
    },
  });

  return NextResponse.json(updated);
}
