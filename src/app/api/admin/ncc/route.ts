import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/ncc — Danh sách NCC + filter + thống kê KPI
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loai_ncc = searchParams.get("loai_ncc");
  const tinh_thanh = searchParams.get("tinh_thanh");
  const trang_thai = searchParams.get("trang_thai");
  const diem_thap = searchParams.get("diem_thap"); // "1" = lọc dưới 6 điểm
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (loai_ncc) where.loai_ncc = loai_ncc;
  if (tinh_thanh) where.tinh_thanh = tinh_thanh;
  if (trang_thai) where.trang_thai = trang_thai;
  if (diem_thap === "1") where.diem_uy_tin = { lt: 6 };
  if (search) {
    where.OR = [
      { ten_ncc: { contains: search } },
      { ma_ncc: { contains: search } },
    ];
  }

  const [total, nccList, tongDangHopTac, nccDiemThap, hopDongSapHetHan] = await Promise.all([
    prisma.nha_cung_cap.count({ where }),
    prisma.nha_cung_cap.findMany({
      where,
      include: {
        ncc_san_pham: { include: { san_pham: { select: { ten_san_pham: true } } } },
        hop_dong_ncc: { where: { trang_thai: "HIEU_LUC" } },
        cong_no_ncc: true,
      },
      orderBy: { id: "desc" },
      skip,
      take: limit,
    }),
    prisma.nha_cung_cap.count({ where: { trang_thai: "DANG_HOP_TAC" } }),
    prisma.nha_cung_cap.count({ where: { diem_uy_tin: { lt: 6 } } }),
    prisma.hop_dong_ncc.count({
      where: {
        trang_thai: "HIEU_LUC",
        ngay_het_han: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    }),
  ]);

  // Tính tổng công nợ
  const tongCongNo = await prisma.cong_no_ncc.aggregate({
    _sum: { so_du_sau: true },
    where: {},
  });

  // Tính công nợ từng NCC (lấy giao dịch gần nhất)
  const nccWithDebt = await Promise.all(
    nccList.map(async (ncc) => {
      const lastDebt = await prisma.cong_no_ncc.findFirst({
        where: { ma_ncc: ncc.id },
        orderBy: { ngay_giao_dich: "desc" },
        select: { so_du_sau: true },
      });
      return {
        ...ncc,
        cong_no_hien_tai: lastDebt?.so_du_sau ?? 0,
      };
    })
  );

  return NextResponse.json({
    data: nccWithDebt,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    kpi: {
      tong_dang_hop_tac: tongDangHopTac,
      tong_cong_no: tongCongNo._sum.so_du_sau ?? 0,
      ncc_diem_thap: nccDiemThap,
      hop_dong_sap_het_han: hopDongSapHetHan,
    },
  });
}

// POST /api/admin/ncc — Tạo NCC mới
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Tự tạo mã NCC
  const lastNcc = await prisma.nha_cung_cap.findFirst({ orderBy: { id: "desc" } });
  const nextId = (lastNcc?.id ?? 0) + 1;
  const ma_ncc = `NCC-${String(nextId).padStart(3, "0")}`;

  const ncc = await prisma.nha_cung_cap.create({
    data: {
      ma_ncc,
      ten_ncc: body.ten_ncc,
      loai_ncc: body.loai_ncc,
      tinh_thanh: body.tinh_thanh,
      dia_chi: body.dia_chi,
      nguoi_lien_he: body.nguoi_lien_he,
      so_dien_thoai: body.so_dien_thoai,
      zalo: body.zalo,
      email: body.email,
      ma_so_thue: body.ma_so_thue,
      co_hoa_don_vat: body.co_hoa_don_vat ?? false,
      hinh_thuc_thanh_toan: body.hinh_thuc_thanh_toan,
      so_tai_khoan: body.so_tai_khoan,
      ten_ngan_hang: body.ten_ngan_hang,
      chu_ky_thanh_toan: body.chu_ky_thanh_toan,
      trang_thai: "DANG_HOP_TAC",
      diem_uy_tin: 5.0,
      ghi_chu_noi_bo: body.ghi_chu_noi_bo,
      ngay_bat_dau_hop_tac: body.ngay_bat_dau_hop_tac ? new Date(body.ngay_bat_dau_hop_tac) : null,
    },
  });

  return NextResponse.json(ncc, { status: 201 });
}
