import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/admin/ncc/[id]/thanh-toan — Ghi nhận thanh toán
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Lấy số dư hiện tại
  const lastTx = await prisma.cong_no_ncc.findFirst({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_giao_dich: "desc" },
    select: { so_du_sau: true },
  });
  const soDuHienTai = Number(lastTx?.so_du_sau ?? 0);
  const soDuMoi = soDuHienTai - Number(body.so_tien);

  const tx = await prisma.cong_no_ncc.create({
    data: {
      ma_ncc: Number(id),
      loai_giao_dich: "THANH_TOAN",
      so_tien: body.so_tien,
      so_du_sau: soDuMoi,
      phuong_thuc: body.phuong_thuc,
      ma_giao_dich: body.ma_giao_dich,
      nguoi_thuc_hien_id: body.nguoi_thuc_hien_id,
      ghi_chu: body.ghi_chu,
    },
  });

  return NextResponse.json(tx, { status: 201 });
}

// GET /api/admin/ncc/[id]/thanh-toan — Lấy lịch sử công nợ
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lichSu = await prisma.cong_no_ncc.findMany({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_giao_dich: "desc" },
  });
  const lastTx = lichSu[0];
  return NextResponse.json({
    cong_no_hien_tai: lastTx?.so_du_sau ?? 0,
    lich_su: lichSu,
  });
}
