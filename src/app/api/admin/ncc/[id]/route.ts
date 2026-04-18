import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/ncc/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ncc = await prisma.nha_cung_cap.findUnique({
    where: { id: Number(id) },
    include: {
      ncc_san_pham: {
        include: { san_pham: { select: { id: true, ten_san_pham: true } } },
      },
      hop_dong_ncc: { orderBy: { ngay_tao: "desc" } },
      danh_gia_giao_hang_ncc: {
        orderBy: { ngay_danh_gia: "desc" },
        take: 20,
        include: {
          phieu_nhap_kho: { select: { id: true, ngay_tao: true, tong_tien: true } },
        },
      },
      cong_no_ncc: { orderBy: { ngay_giao_dich: "desc" }, take: 50 },
      phieu_nhap_kho: {
        orderBy: { ngay_tao: "desc" },
        take: 20,
        select: { id: true, ngay_tao: true, tong_tien: true, trang_thai: true },
      },
    },
  });

  if (!ncc) return NextResponse.json({ error: "Không tìm thấy NCC" }, { status: 404 });

  // Tính chỉ số
  const danhGias = ncc.danh_gia_giao_hang_ncc;
  const tongGiao = danhGias.length;
  const dungHan = danhGias.filter((d) => (d.diem_dung_han ?? 0) >= 4).length;
  const dungSoLuong = danhGias.filter((d) => (d.diem_dung_so_luong ?? 0) >= 4).length;
  const coVanDe = danhGias.filter((d) => d.co_van_de).length;
  const diemTb3Thang = danhGias
    .filter((d) => d.ngay_danh_gia && d.ngay_danh_gia > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    .reduce((acc, d, _, arr) => acc + Number(d.diem_trung_binh ?? 0) / arr.length, 0);

  const chiSo = {
    tong_giao: tongGiao,
    ti_le_dung_han: tongGiao > 0 ? Math.round((dungHan / tongGiao) * 100) : 0,
    ti_le_du_so_luong: tongGiao > 0 ? Math.round((dungSoLuong / tongGiao) * 100) : 0,
    diem_tb_3_thang: Math.round(diemTb3Thang * 10) / 10,
    so_lan_van_de: coVanDe,
  };

  // Công nợ hiện tại
  const lastDebt = await prisma.cong_no_ncc.findFirst({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_giao_dich: "desc" },
    select: { so_du_sau: true },
  });

  return NextResponse.json({
    ...ncc,
    chi_so: chiSo,
    cong_no_hien_tai: lastDebt?.so_du_sau ?? 0,
  });
}

// PUT /api/admin/ncc/[id] — Cập nhật thông tin
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.nha_cung_cap.update({
    where: { id: Number(id) },
    data: {
      ten_ncc: body.ten_ncc,
      loai_ncc: body.loai_ncc,
      tinh_thanh: body.tinh_thanh,
      dia_chi: body.dia_chi,
      nguoi_lien_he: body.nguoi_lien_he,
      so_dien_thoai: body.so_dien_thoai,
      zalo: body.zalo,
      email: body.email,
      ma_so_thue: body.ma_so_thue,
      co_hoa_don_vat: body.co_hoa_don_vat,
      hinh_thuc_thanh_toan: body.hinh_thuc_thanh_toan,
      so_tai_khoan: body.so_tai_khoan,
      ten_ngan_hang: body.ten_ngan_hang,
      chu_ky_thanh_toan: body.chu_ky_thanh_toan,
      ghi_chu_noi_bo: body.ghi_chu_noi_bo,
      ngay_bat_dau_hop_tac: body.ngay_bat_dau_hop_tac ? new Date(body.ngay_bat_dau_hop_tac) : undefined,
    },
  });
  return NextResponse.json(updated);
}
