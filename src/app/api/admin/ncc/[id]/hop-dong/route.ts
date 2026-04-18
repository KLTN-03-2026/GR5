import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/ncc/[id]/hop-dong
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hopDongs = await prisma.hop_dong_ncc.findMany({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_tao: "desc" },
  });
  return NextResponse.json(hopDongs);
}

// POST /api/admin/ncc/[id]/hop-dong
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const hopDong = await prisma.hop_dong_ncc.create({
    data: {
      ma_ncc: Number(id),
      so_hop_dong: body.so_hop_dong,
      loai_hop_dong: body.loai_hop_dong,
      ngay_ky: body.ngay_ky ? new Date(body.ngay_ky) : null,
      ngay_het_han: body.ngay_het_han ? new Date(body.ngay_het_han) : null,
      gia_tri_hop_dong: body.gia_tri_hop_dong,
      dieu_khoan_phat: body.dieu_khoan_phat,
      file_hop_dong: body.file_hop_dong, // S3 URL từ client
      trang_thai: "HIEU_LUC",
      ghi_chu: body.ghi_chu,
    },
  });

  return NextResponse.json(hopDong, { status: 201 });
}
