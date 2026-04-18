import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/admin/ncc/[id]/danh-gia — Tạo đánh giá sau mỗi lần nhập hàng
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const diemChat = body.diem_chat_luong ?? 0;
  const diemSoLuong = body.diem_dung_so_luong ?? 0;
  const diemHan = body.diem_dung_han ?? 0;
  const diemBaoGoi = body.diem_bao_goi ?? 0;
  const diemTrungBinh = (diemChat + diemSoLuong + diemHan + diemBaoGoi) / 4;

  const danhGia = await prisma.danh_gia_giao_hang_ncc.create({
    data: {
      ma_ncc: Number(id),
      ma_phieu_nhap: body.ma_phieu_nhap,
      nguoi_danh_gia_id: body.nguoi_danh_gia_id,
      diem_chat_luong: diemChat,
      diem_dung_so_luong: diemSoLuong,
      diem_dung_han: diemHan,
      diem_bao_goi: diemBaoGoi,
      diem_trung_binh: diemTrungBinh,
      co_van_de: body.co_van_de ?? false,
      mo_ta_van_de: body.mo_ta_van_de,
      hinh_anh_van_de: body.hinh_anh_van_de ?? [],
    },
  });

  // Tự động cập nhật điểm uy tín NCC theo công thức
  const allDanhGias = await prisma.danh_gia_giao_hang_ncc.findMany({
    where: { ma_ncc: Number(id) },
  });
  const n = allDanhGias.length;
  if (n > 0) {
    const avgChat = allDanhGias.reduce((s, d) => s + (d.diem_chat_luong ?? 0), 0) / n;
    const rateDungHan = allDanhGias.filter((d) => (d.diem_dung_han ?? 0) >= 4).length / n;
    const rateDuSoLuong = allDanhGias.filter((d) => (d.diem_dung_so_luong ?? 0) >= 4).length / n;
    const avgBaoGoi = allDanhGias.reduce((s, d) => s + (d.diem_bao_goi ?? 0), 0) / n;

    // Công thức điểm uy tín: Chất lượng 40% + Đúng hạn 30% + Đủ SL 20% + Bao gói 10%
    // Quy ra thang 0–10 (điểm 1–5 × 2)
    const diemUyTin =
      (avgChat / 5) * 10 * 0.4 +
      rateDungHan * 10 * 0.3 +
      rateDuSoLuong * 10 * 0.2 +
      (avgBaoGoi / 5) * 10 * 0.1;

    await prisma.nha_cung_cap.update({
      where: { id: Number(id) },
      data: { diem_uy_tin: Math.round(diemUyTin * 10) / 10 },
    });
  }

  return NextResponse.json(danhGia, { status: 201 });
}
