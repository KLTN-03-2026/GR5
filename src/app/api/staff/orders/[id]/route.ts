import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================================
// [GET] Chi tiết đơn hàng cho nhân viên
// ============================================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const orderId = Number(rawId);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ" }, { status: 400 });
    }

    const order = await prisma.don_hang.findUnique({
      where: { id: orderId },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            email: true,
            ho_so_nguoi_dung: {
              select: { ho_ten: true, so_dien_thoai: true, anh_dai_dien: true },
            },
          },
        },
        chi_tiet_don_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: {
                  select: {
                    id: true,
                    ten_san_pham: true,
                    anh_san_pham: { take: 1, select: { duong_dan_anh: true } },
                  },
                },
                lo_hang: {
                  where: { trang_thai: "BINH_THUONG" },
                  select: {
                    id: true,
                    ma_lo_hang: true,
                    han_su_dung: true,
                    ton_kho_tong: { select: { so_luong: true } },
                  },
                  orderBy: { han_su_dung: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
        giao_dich_thanh_toan: {
          orderBy: { ngay_tao: "desc" },
          select: {
            id: true,
            trang_thai: true,
            phuong_thuc_thanh_toan: true,
            so_tien: true,
            ma_giao_dich_ben_ngoai: true,
            ngay_tao: true,
          },
        },
        don_van_chuyen: {
          include: { doi_tac_van_chuyen: { select: { ten_doi_tac: true } } },
        },
        lich_su_don_hang: {
          orderBy: { thoi_gian_doi: "asc" },
          select: { trang_thai: true, thoi_gian_doi: true },
        },
        yeu_cau_doi_tra: {
          where: { trang_thai: "CHO_DUYET" },
          include: {
            chi_tiet_doi_tra: {
              include: {
                bien_the_san_pham: {
                  include: { san_pham: { select: { ten_san_pham: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const payment = order.giao_dich_thanh_toan[0] ?? null;

    const itemsWithStock = order.chi_tiet_don_hang.map((item) => {
      const bienThe = item.bien_the_san_pham;
      const loHang = bienThe?.lo_hang[0] ?? null;
      const tonKho = loHang?.ton_kho_tong.reduce(
        (sum: number, t: { so_luong: number | null }) => sum + (t.so_luong ?? 0),
        0
      ) ?? 0;
      const soLuongYeuCau = item.so_luong ?? 0;
      const duHang = tonKho >= soLuongYeuCau;

      const hsd = loHang?.han_su_dung ? new Date(loHang.han_su_dung) : null;
      const daysLeft = hsd ? (hsd.getTime() - Date.now()) / (1000 * 60 * 60 * 24) : null;
      const soonExpiry = daysLeft !== null && daysLeft <= 3;

      return {
        id: item.id,
        tenSanPham: bienThe?.san_pham?.ten_san_pham ?? "N/A",
        tenBienThe: bienThe?.ten_bien_the ?? "",
        donViTinh: bienThe?.don_vi_tinh ?? "",
        maSku: bienThe?.ma_sku ?? "",
        soLuong: soLuongYeuCau,
        donGia: Number(item.don_gia ?? 0),
        anhSanPham: bienThe?.san_pham?.anh_san_pham[0]?.duong_dan_anh ?? null,
        tonKho,
        maLoHang: loHang?.ma_lo_hang ?? null,
        hanSuDung: loHang?.han_su_dung ?? null,
        duHang,
        soonExpiry,
        stockWarning: !duHang
          ? `Kho chỉ còn ${tonKho} ${bienThe?.don_vi_tinh ?? ""}, thiếu ${soLuongYeuCau - tonKho}`
          : null,
      };
    });

    const formatted = {
      id: order.id,
      maHienThi: `DH${order.id}`,
      customerName:
        order.ho_ten_nguoi_nhan ||
        order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten ||
        order.nguoi_dung?.email ||
        "N/A",
      customerPhone:
        order.sdt_nguoi_nhan ||
        order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai ||
        "",
      customerEmail: order.nguoi_dung?.email || "",
      address: order.dia_chi_giao_hang || "",
      notes: order.ghi_chu || "",
      total: Number(order.tong_tien ?? 0),
      shippingFee: Number(order.phi_van_chuyen ?? 0),
      status: order.trang_thai || "CHO_XAC_NHAN",
      ngayTao: order.ngay_tao,
      items: itemsWithStock,
      hasStockIssue: itemsWithStock.some((i) => !i.duHang),
      hasSoonExpiry: itemsWithStock.some((i) => i.soonExpiry),
      payment: payment
        ? {
            id: payment.id,
            phuongThuc: payment.phuong_thuc_thanh_toan || "COD",
            trangThai: payment.trang_thai || "CHO_THANH_TOAN",
            soTien: Number(payment.so_tien ?? 0),
            maGiaoDich: payment.ma_giao_dich_ben_ngoai || null,
            ngayTao: payment.ngay_tao,
          }
        : null,
      shipping: order.don_van_chuyen[0]
        ? {
            maVanDon: order.don_van_chuyen[0].ma_van_don,
            trangThai: order.don_van_chuyen[0].trang_thai,
            doiTac: order.don_van_chuyen[0].doi_tac_van_chuyen?.ten_doi_tac ?? "",
            ngayGiaoDuKien: order.don_van_chuyen[0].ngay_giao_du_kien,
          }
        : null,
      timeline: order.lich_su_don_hang.map((h) => ({
        trangThai: h.trang_thai,
        thoiGian: h.thoi_gian_doi,
      })),
      returnRequests: order.yeu_cau_doi_tra.map((r) => ({
        id: r.id,
        loaiYeuCau: r.loai_yeu_cau,
        trangThai: r.trang_thai,
        soTienHoan: Number(r.so_tien_hoan ?? 0),
        chiTiet: r.chi_tiet_doi_tra.map((ct) => ({
          tenSanPham: ct.bien_the_san_pham?.san_pham?.ten_san_pham ?? "N/A",
          soLuong: ct.so_luong,
          lyDo: ct.ly_do,
          anhMinhChung: ct.anh_minh_chung,
        })),
      })),
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("[GET /api/staff/orders/[id]]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// ============================================================================
// [PATCH] Cập nhật đơn hàng: xác nhận thanh toán, trạng thái, vận đơn
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const orderId = Number(rawId);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const { action, data: actionData } = body;

    if (action === "CONFIRM_PAYMENT") {
      await prisma.$transaction(async (tx) => {
        await tx.giao_dich_thanh_toan.updateMany({
          where: { ma_don_hang: orderId, trang_thai: "CHO_THANH_TOAN" },
          data: { trang_thai: "DA_THANH_TOAN" },
        });
        await tx.don_hang.update({
          where: { id: orderId },
          data: { trang_thai: "CHO_GIAO_HANG" },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: orderId, trang_thai: "CHO_GIAO_HANG" },
        });
      });
      return NextResponse.json({ success: true, message: "Đã xác nhận thanh toán" });
    }

    if (action === "CONFIRM_ORDER") {
      await prisma.$transaction(async (tx) => {
        await tx.don_hang.update({
          where: { id: orderId },
          data: { trang_thai: "CHO_GIAO_HANG" },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: orderId, trang_thai: "CHO_GIAO_HANG" },
        });
      });
      return NextResponse.json({ success: true, message: "Đã xác nhận đơn hàng" });
    }

    if (action === "ADD_TRACKING") {
      const { maVanDon, maDoiTac } = (actionData ?? {}) as { maVanDon?: string; maDoiTac?: string };
      if (!maVanDon) {
        return NextResponse.json({ success: false, message: "Thiếu mã vận đơn" }, { status: 400 });
      }
      await prisma.$transaction(async (tx) => {
        const existing = await tx.don_van_chuyen.findFirst({ where: { ma_don_hang: orderId } });
        if (existing) {
          await tx.don_van_chuyen.update({
            where: { id: existing.id },
            data: { ma_van_don: maVanDon, trang_thai: "DANG_GIAO" },
          });
        } else {
          await tx.don_van_chuyen.create({
            data: {
              ma_don_hang: orderId,
              ma_doi_tac: maDoiTac ? Number(maDoiTac) : null,
              ma_van_don: maVanDon,
              trang_thai: "DANG_GIAO",
            },
          });
        }
        await tx.don_hang.update({ where: { id: orderId }, data: { trang_thai: "DANG_GIAO_HANG" } });
        await tx.lich_su_don_hang.create({ data: { ma_don_hang: orderId, trang_thai: "DANG_GIAO_HANG" } });
      });
      return NextResponse.json({ success: true, message: "Đã cập nhật vận đơn" });
    }

    if (action === "CONFIRM_DELIVERED") {
      await prisma.$transaction(async (tx) => {
        await tx.don_hang.update({ where: { id: orderId }, data: { trang_thai: "DA_GIAO" } });
        await tx.giao_dich_thanh_toan.updateMany({
          where: { ma_don_hang: orderId, phuong_thuc_thanh_toan: "COD", trang_thai: "CHO_THANH_TOAN" },
          data: { trang_thai: "DA_THANH_TOAN" },
        });
        await tx.lich_su_don_hang.create({ data: { ma_don_hang: orderId, trang_thai: "DA_GIAO" } });
      });
      return NextResponse.json({ success: true, message: "Đã xác nhận giao thành công" });
    }

    if (action === "CANCEL_ORDER") {
      const { lyDo } = (actionData ?? {}) as { lyDo?: string };
      await prisma.$transaction(async (tx) => {
        await tx.don_hang.update({
          where: { id: orderId },
          data: {
            trang_thai: "DA_HUY",
            ...(lyDo ? { ghi_chu: `[Hủy bởi NV]: ${lyDo}` } : {}),
          },
        });
        await tx.lich_su_don_hang.create({ data: { ma_don_hang: orderId, trang_thai: "DA_HUY" } });
      });
      return NextResponse.json({ success: true, message: "Đã hủy đơn hàng" });
    }

    if (action === "CREATE_GHN_ORDER") {
      const order = await prisma.don_hang.findUnique({
        where: { id: orderId },
        include: {
          chi_tiet_don_hang: {
            include: { bien_the_san_pham: { include: { san_pham: true } } },
          },
          giao_dich_thanh_toan: { take: 1, orderBy: { ngay_tao: "desc" } },
        },
      });
      if (!order) {
        return NextResponse.json({ success: false, message: "Không tìm thấy đơn" }, { status: 404 });
      }

      const ghnToken = process.env.GHN_TOKEN;
      const ghnShopId = process.env.GHN_SHOP_ID;
      const ghnBaseUrl = process.env.GHN_BASE_URL;
      const fromDistrictId = parseInt(process.env.GHN_FROM_DISTRICT_ID || "1542");

      if (!ghnToken || !ghnShopId || !ghnBaseUrl) {
        return NextResponse.json({ success: false, message: "Chưa cấu hình GHN" }, { status: 500 });
      }

      const payment = order.giao_dich_thanh_toan[0];
      const isCOD = payment?.phuong_thuc_thanh_toan === "COD";

      const ghnRes = await fetch(`${ghnBaseUrl}/v2/shipping-order/create`, {
        method: "POST",
        headers: {
          Token: ghnToken,
          ShopId: ghnShopId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_name: order.ho_ten_nguoi_nhan || "Khách hàng",
          to_phone: order.sdt_nguoi_nhan || "",
          to_address: order.dia_chi_giao_hang || "",
          to_ward_code: order.ma_phuong_xa_ghn || "",
          to_district_id: order.ma_quan_huyen_ghn || 0,
          from_district_id: fromDistrictId,
          cod_amount: isCOD ? Number(order.tong_tien || 0) : 0,
          weight: Math.max(200, order.chi_tiet_don_hang.length * 500),
          service_type_id: 2,
          payment_type_id: 1,
          required_note: "CHOXEMHANGKHONGTHU",
          items: order.chi_tiet_don_hang.map((item) => ({
            name: item.bien_the_san_pham?.san_pham?.ten_san_pham || "SP",
            quantity: item.so_luong || 1,
            price: Number(item.don_gia || 0),
          })),
        }),
      });

      const ghnData = await ghnRes.json();
      if (ghnData.code !== 200) {
        return NextResponse.json({
          success: false,
          message: `GHN lỗi: ${ghnData.message || "Không tạo được vận đơn"}`,
        }, { status: 400 });
      }

      const orderCode = ghnData.data?.order_code;
      const expectedDate = ghnData.data?.expected_delivery_time;

      await prisma.$transaction(async (tx) => {
        const existing = await tx.don_van_chuyen.findFirst({ where: { ma_don_hang: orderId } });
        if (existing) {
          await tx.don_van_chuyen.update({
            where: { id: existing.id },
            data: { ma_van_don: orderCode, trang_thai: "DANG_GIAO", ngay_giao_du_kien: expectedDate ? new Date(expectedDate) : null },
          });
        } else {
          await tx.don_van_chuyen.create({
            data: {
              ma_don_hang: orderId,
              ma_van_don: orderCode,
              trang_thai: "DANG_GIAO",
              ngay_giao_du_kien: expectedDate ? new Date(expectedDate) : null,
            },
          });
        }
        await tx.don_hang.update({ where: { id: orderId }, data: { trang_thai: "DANG_GIAO_HANG" } });
        await tx.lich_su_don_hang.create({ data: { ma_don_hang: orderId, trang_thai: "DANG_GIAO_HANG" } });
      });

      return NextResponse.json({ success: true, message: `Đã tạo vận đơn GHN: ${orderCode}`, orderCode });
    }

    if (action === "ADD_NOTE") {
      const { note } = (actionData ?? {}) as { note?: string };
      if (!note) {
        return NextResponse.json({ success: false, message: "Thiếu ghi chú" }, { status: 400 });
      }
      const order = await prisma.don_hang.findUnique({ where: { id: orderId }, select: { ghi_chu: true } });
      const existingNote = order?.ghi_chu || "";
      const timestamp = new Date().toLocaleString("vi-VN");
      const newNote = existingNote
        ? `${existingNote}\n[NV ${timestamp}]: ${note}`
        : `[NV ${timestamp}]: ${note}`;
      await prisma.don_hang.update({ where: { id: orderId }, data: { ghi_chu: newNote } });
      return NextResponse.json({ success: true, message: "Đã thêm ghi chú" });
    }

    return NextResponse.json({ success: false, message: "Action không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("[PATCH /api/staff/orders/[id]]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
