import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ✅ Helper: Tính công nợ bằng SUM (chuẩn kế toán)
async function calcCongNo(ma_ncc: number): Promise<number> {
  const [phatSinh, thanhToan, traHang] = await Promise.all([
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "PHAT_SINH_NO" },
    }),
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "THANH_TOAN" },
    }),
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "TRA_HANG_HOAN_TIEN" },
    }),
  ]);
  return (
    Number(phatSinh._sum.so_tien ?? 0) -
    Number(thanhToan._sum.so_tien ?? 0) -
    Number(traHang._sum.so_tien ?? 0)
  );
}

/**
 * GET /api/admin/ncc/[id]/tra-hang
 * Lấy danh sách phiếu trả hàng NCC
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const phieuTraList = await prisma.phieu_tra_nha_cung_cap.findMany({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_tao: "desc" },
    include: {
      phieu_xuat_kho: {
        include: {
          chi_tiet_phieu_xuat: {
            include: {
              bien_the_san_pham: {
                select: { ten_bien_the: true, san_pham: { select: { ten_san_pham: true } } },
              },
            },
          },
        },
      },
    },
  });

  // Công nợ hiện tại tính bằng SUM
  const congNoHienTai = await calcCongNo(Number(id));

  return NextResponse.json({ phieu_tra_list: phieuTraList, cong_no_hien_tai: congNoHienTai });
}

/**
 * POST /api/admin/ncc/[id]/tra-hang
 *
 * Luồng nghiệp vụ:
 * 1. Tạo phiếu trả NCC (phieu_tra_nha_cung_cap)
 * 2. Tạo phiếu xuất kho gắn với phiếu trả (phieu_xuat_kho)
 * 3. Đánh dấu từng kiện hàng là TRA_NCC (giảm tồn kho)
 * 4. Đồng bộ cache tồn kho
 * 5. Ghi giao dịch TRA_HANG_HOAN_TIEN → giảm công nợ NCC
 *
 * Body:
 * {
 *   ma_lo_hang: number,         // Lô hàng cần trả
 *   so_kien_tra: number,        // Số kiện/thùng trả về
 *   don_gia_tra: number,        // Đơn giá hoàn tiền mỗi kiện
 *   ly_do: string,              // Lý do trả hàng
 *   ma_kho?: number,            // Kho xuất
 *   qr_codes?: string[],        // QR cụ thể nếu scan tay; nếu bỏ qua → hệ thống tự chọn FIFO
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const body = await req.json();

  const { ma_lo_hang, so_kien_tra, don_gia_tra, ly_do, ma_kho, qr_codes } = body;

  // --- Validation ---
  if (!ma_lo_hang || !so_kien_tra || !don_gia_tra || !ly_do) {
    return NextResponse.json(
      { error: "Thiếu thông tin bắt buộc: ma_lo_hang, so_kien_tra, don_gia_tra, ly_do" },
      { status: 400 }
    );
  }
  if (Number(so_kien_tra) <= 0 || Number(don_gia_tra) <= 0) {
    return NextResponse.json(
      { error: "Số kiện trả và đơn giá phải lớn hơn 0" },
      { status: 400 }
    );
  }

  // --- Kiểm tra lô hàng ---
  const loHang = await prisma.lo_hang.findUnique({
    where: { id: Number(ma_lo_hang) },
    include: {
      bien_the_san_pham: { select: { id: true, ten_bien_the: true } },
    },
  });
  if (!loHang) {
    return NextResponse.json({ error: "Không tìm thấy lô hàng" }, { status: 404 });
  }
  if (loHang.ma_ncc !== Number(id)) {
    return NextResponse.json(
      { error: "Lô hàng này không thuộc về NCC này" },
      { status: 400 }
    );
  }

  // --- Lấy kiện hàng cần xuất trả ---
  let kienHangCanTra;
  if (qr_codes && Array.isArray(qr_codes) && qr_codes.length > 0) {
    // Dùng QR scan tay cụ thể
    kienHangCanTra = await prisma.kien_hang_chi_tiet.findMany({
      where: {
        ma_vach_quet: { in: qr_codes },
        ma_lo_hang: Number(ma_lo_hang),
        trang_thai: "TRONG_KHO",
      },
    });
    if (kienHangCanTra.length !== qr_codes.length) {
      return NextResponse.json(
        {
          error: `Một số kiện hàng không tồn tại hoặc không ở trong kho. Tìm thấy ${kienHangCanTra.length}/${qr_codes.length}`,
        },
        { status: 400 }
      );
    }
  } else {
    // Tự động chọn FIFO (lấy theo thứ tự nhập vào)
    kienHangCanTra = await prisma.kien_hang_chi_tiet.findMany({
      where: { ma_lo_hang: Number(ma_lo_hang), trang_thai: "TRONG_KHO" },
      orderBy: { ngay_tao: "asc" },
      take: Number(so_kien_tra),
    });
  }

  if (kienHangCanTra.length < Number(so_kien_tra)) {
    return NextResponse.json(
      {
        error: `Không đủ kiện hàng trong kho. Yêu cầu: ${so_kien_tra}, có sẵn: ${kienHangCanTra.length}`,
      },
      { status: 400 }
    );
  }

  const tongTienHoan = Number(so_kien_tra) * Number(don_gia_tra);
  const actor =
    (session?.user as any)?.name || (session?.user as any)?.email || "Hệ thống";
  const timestamp = new Date().toLocaleString("vi-VN");

  // --- Thực hiện trong Transaction ---
  const result = await prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu trả hàng NCC
    const phieuTra = await tx.phieu_tra_nha_cung_cap.create({
      data: {
        ma_ncc: Number(id),
        ma_nguoi_tao: (session?.user as any)?.id ?? null,
        tong_tien_hoan_du_kien: tongTienHoan,
        trang_thai: "DANG_XU_LY",
      },
    });

    // 2. Tạo phiếu xuất kho gắn với phiếu trả
    const phieuXuat = await tx.phieu_xuat_kho.create({
      data: {
        ma_nguoi_tao: (session?.user as any)?.id ?? null,
        ma_kho: ma_kho ?? null,
        ma_phieu_tra_ncc: phieuTra.id,
        ly_do_xuat: `TRA_NCC: ${ly_do}`,
        trang_thai: "HOAN_THANH",
      },
    });

    // 3. Tạo chi tiết phiếu xuất
    if (loHang.ma_bien_the) {
      await tx.chi_tiet_phieu_xuat.create({
        data: {
          ma_phieu_xuat: phieuXuat.id,
          ma_bien_the: loHang.ma_bien_the,
          so_luong_yeu_cau: Number(so_kien_tra),
          so_luong_thuc_xuat: Number(so_kien_tra),
        },
      });
    }

    // 4. Đánh dấu từng kiện hàng là TRA_NCC (xuất khỏi kho)
    const kienHangIds = kienHangCanTra.map((k) => k.id);
    await tx.kien_hang_chi_tiet.updateMany({
      where: { id: { in: kienHangIds } },
      data: { trang_thai: "TRA_NCC" },
    });

    // 5. Đồng bộ cache tồn kho cho từng vị trí bị ảnh hưởng
    const viTriGroups = [...new Set(kienHangCanTra.map((k) => k.ma_vi_tri).filter(Boolean))];
    for (const maViTri of viTriGroups) {
      if (!maViTri) continue;
      const actualCount = await tx.kien_hang_chi_tiet.count({
        where: { ma_lo_hang: Number(ma_lo_hang), ma_vi_tri: maViTri, trang_thai: "TRONG_KHO" },
      });
      await tx.ton_kho_tong.updateMany({
        where: { ma_lo_hang: Number(ma_lo_hang), ma_vi_tri: maViTri },
        data: { so_luong: actualCount },
      });
    }

    // 6. Cập nhật trạng thái phiếu trả thành HOAN_THANH
    await tx.phieu_tra_nha_cung_cap.update({
      where: { id: phieuTra.id },
      data: { trang_thai: "HOAN_THANH" },
    });

    // 7. Ghi giao dịch TRA_HANG_HOAN_TIEN → giảm công nợ NCC
    const debtTx = await tx.cong_no_ncc.create({
      data: {
        ma_ncc: Number(id),
        loai_giao_dich: "TRA_HANG_HOAN_TIEN",
        so_tien: tongTienHoan,
        so_du_sau: null, // Không dùng so_du_sau — tính bằng SUM
        phuong_thuc: null,
        ma_giao_dich: `TRA-${phieuTra.id}`,
        nguoi_thuc_hien_id: (session?.user as any)?.id ?? null,
        ghi_chu: `[${timestamp}] ${actor} trả hàng Lô#${ma_lo_hang}: ${so_kien_tra} kiện × ${Number(don_gia_tra).toLocaleString("vi-VN")}đ = ${tongTienHoan.toLocaleString("vi-VN")}đ. Lý do: ${ly_do}`,
      },
    });

    return { phieuTra, phieuXuat, debtTx, soKienDaXuat: kienHangCanTra.length };
  });

  return NextResponse.json(
    {
      message: `Đã trả ${result.soKienDaXuat} kiện hàng. Công nợ giảm ${tongTienHoan.toLocaleString("vi-VN")}đ`,
      phieu_tra: result.phieuTra,
      phieu_xuat: result.phieuXuat,
      giao_dich_cong_no: result.debtTx,
      tong_tien_hoan: tongTienHoan,
    },
    { status: 201 }
  );
}
