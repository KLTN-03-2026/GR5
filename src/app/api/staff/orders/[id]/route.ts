import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncProductStatusFromStock } from "@/lib/product-stock-status";

export const dynamic = "force-dynamic";

const isGhnSandbox = (baseUrl: string) => baseUrl.includes("dev-online-gateway");

async function fetchGhnOrderDetail(baseUrl: string, token: string, shopId: string, orderCode: string) {
  const res = await fetch(`${baseUrl}/v2/shipping-order/detail`, {
    method: "POST",
    headers: {
      Token: token,
      ShopId: shopId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order_code: orderCode }),
  });

  const data = await res.json().catch(() => null);
  return {
    ok: res.ok && data?.code === 200,
    data,
  };
}

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
        phieu_xuat_kho: {
          orderBy: { ngay_tao: "desc" },
          take: 1,
          select: { id: true, trang_thai: true, ngay_tao: true },
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
      phieuXuat: order.phieu_xuat_kho[0]
        ? {
            id: order.phieu_xuat_kho[0].id,
            trangThai: order.phieu_xuat_kho[0].trang_thai,
            ngayTao: order.phieu_xuat_kho[0].ngay_tao,
          }
        : null,
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
          data: { trang_thai: "CHO_XU_LY" },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: orderId, trang_thai: "CHO_XU_LY" },
        });
      });
      return NextResponse.json({ success: true, message: "Đã xác nhận thanh toán, chuyển sang chờ xử lý" });
    }

    // Admin/staff duyệt đơn COD: CHO_XAC_NHAN → CHO_XU_LY (không soạn phiếu xuất, chưa trừ kho)
    if (action === "APPROVE_ORDER") {
      const current = await prisma.don_hang.findUnique({ where: { id: orderId }, select: { trang_thai: true } });
      if (!current) return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
      if (current.trang_thai !== "CHO_XAC_NHAN") {
        return NextResponse.json({ success: false, message: `Đơn không ở trạng thái Chờ duyệt (đang: ${current.trang_thai})` }, { status: 409 });
      }
      await prisma.$transaction(async (tx) => {
        await tx.don_hang.update({ where: { id: orderId }, data: { trang_thai: "CHO_XU_LY" } });
        await tx.lich_su_don_hang.create({ data: { ma_don_hang: orderId, trang_thai: "CHO_XU_LY" } });
      });
      return NextResponse.json({ success: true, message: "Đã duyệt đơn, chờ nhân viên xử lý" });
    }

    if (action === "CONFIRM_ORDER") {
      const result = await prisma.$transaction(async (tx) => {
        // Lấy đơn hàng + chi tiết
        const order = await tx.don_hang.findUnique({
          where: { id: orderId },
          include: { chi_tiet_don_hang: true },
        });
        if (!order) throw new Error("Không tìm thấy đơn hàng");

        // Cập nhật trạng thái đơn
        await tx.don_hang.update({
          where: { id: orderId },
          data: { trang_thai: "CHO_GIAO_HANG" },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: orderId, trang_thai: "CHO_GIAO_HANG" },
        });

        // Phân loại đơn GAN/TRUNG/XA (Distance-Aware FEFO)
        const provinceId = order.ma_tinh_ghn ?? 0;
        const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45, 223, 243, 218, 219, 221, 224, 225];
        let loaiDon: "GAN" | "TRUNG" | "XA" = "XA";
        if (provinceId === 48 || provinceId === 203) loaiDon = "GAN";
        else if (mienTrung.includes(provinceId)) loaiDon = "TRUNG";

        const minDaysLeft = loaiDon === "GAN" ? 1 : loaiDon === "TRUNG" ? 3 : 5;

        // Tạo phiếu xuất kho
        const phieuXuat = await tx.phieu_xuat_kho.create({
          data: {
            ma_don_hang: orderId,
            trang_thai: "DANG_SOAN",
            ly_do_xuat: "XUAT_THEO_DON_HANG",
            ngay_tao: new Date(),
          },
        });

        const today = new Date();
        const fefoAllocations: { bienThe: string; loHang: string; soLuong: number; daysLeft: number }[] = [];
        let hasInsufficientStock = false;

        // Tạo chi tiết phiếu xuất + tự động phân bổ lô FEFO
        for (const item of order.chi_tiet_don_hang) {
          if (!item.ma_bien_the) continue;

          const chiTietXuat = await tx.chi_tiet_phieu_xuat.create({
            data: {
              ma_phieu_xuat: phieuXuat.id,
              ma_bien_the: item.ma_bien_the,
              so_luong_yeu_cau: item.so_luong ?? 1,
              so_luong_thuc_xuat: 0,
            },
          });

          // FEFO: Lấy tồn kho sắp xếp theo HSD tăng dần (hết hạn sớm nhất trước)
          const tonKhoList = await tx.ton_kho_tong.findMany({
            where: {
              so_luong: { gt: 0 },
              lo_hang: {
                ma_bien_the: item.ma_bien_the,
                trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
              },
            },
            include: { lo_hang: true, vi_tri_kho: true },
            orderBy: { lo_hang: { han_su_dung: "asc" } },
          });

          // Lọc theo minDaysLeft (distance-aware)
          const eligibleLots = tonKhoList.filter((tk) => {
            if (!tk.lo_hang?.han_su_dung) return true;
            const hsd = new Date(tk.lo_hang.han_su_dung);
            const daysLeft = Math.ceil((hsd.getTime() - today.getTime()) / 86400000);
            return daysLeft >= minDaysLeft;
          });

          // Phân bổ FEFO: lấy từ lô cũ nhất trước
          let remaining = item.so_luong ?? 1;
          for (const tk of eligibleLots) {
            if (remaining <= 0) break;
            const allocate = Math.min(tk.so_luong ?? 0, remaining);
            if (allocate <= 0) continue;

            // Trừ tồn kho
            await tx.ton_kho_tong.update({
              where: { id: tk.id },
              data: { so_luong: (tk.so_luong ?? 0) - allocate },
            });

            const hsd = tk.lo_hang?.han_su_dung ? new Date(tk.lo_hang.han_su_dung) : null;
            const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / 86400000) : 999;

            fefoAllocations.push({
              bienThe: `${item.ma_bien_the}`,
              loHang: tk.lo_hang?.ma_lo_hang ?? `LO-${tk.ma_lo_hang}`,
              soLuong: allocate,
              daysLeft,
            });

            remaining -= allocate;
          }

          if (remaining > 0) {
            hasInsufficientStock = true;
          }
        }

        await syncProductStatusFromStock(
          tx,
          order.chi_tiet_don_hang.map((it) => it.ma_bien_the),
        );

        return {
          loaiDon,
          minDaysLeft,
          fefoAllocations,
          hasInsufficientStock,
          phieuXuatId: phieuXuat.id,
        };
      });

      return NextResponse.json({
        success: true,
        message: `Đã xác nhận đơn hàng & phân bổ FEFO (${result.loaiDon}, min ${result.minDaysLeft} ngày HSD)`,
        data: {
          loai_don: result.loaiDon,
          min_days_left: result.minDaysLeft,
          phieu_xuat_id: result.phieuXuatId,
          fefo_allocations: result.fefoAllocations,
          insufficient_stock: result.hasInsufficientStock,
        },
      });
    }

    if (action === "ADD_TRACKING") {
      const { maVanDon, maDoiTac } = (actionData ?? {}) as { maVanDon?: string; maDoiTac?: string };
      if (!maVanDon) {
        return NextResponse.json({ success: false, message: "Thiếu mã vận đơn" }, { status: 400 });
      }
      const phieuXuat = await prisma.phieu_xuat_kho.findFirst({
        where: { ma_don_hang: orderId },
        orderBy: { ngay_tao: "desc" },
        select: { trang_thai: true },
      });
      if (!phieuXuat || phieuXuat.trang_thai !== "HOAN_THANH") {
        return NextResponse.json({
          success: false,
          message: "Phải hoàn thành xuất kho trước khi gán mã vận đơn",
        }, { status: 409 });
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

        // Hủy phiếu xuất kho nếu có (DANG_SOAN)
        const phieuXuat = await tx.phieu_xuat_kho.findFirst({
          where: { ma_don_hang: orderId, trang_thai: "DANG_SOAN" },
          include: { chi_tiet_phieu_xuat: { include: { kien_hang_da_xuat: true } } },
        });
        if (phieuXuat) {
          // Hoàn kiện hàng đã quét về TRONG_KHO
          for (const ct of phieuXuat.chi_tiet_phieu_xuat) {
            for (const kx of ct.kien_hang_da_xuat) {
              if (kx.ma_kien_hang) {
                await tx.kien_hang_chi_tiet.update({
                  where: { id: kx.ma_kien_hang },
                  data: { trang_thai: "TRONG_KHO" },
                });
              }
            }
          }
          // Hủy phiếu xuất
          await tx.phieu_xuat_kho.update({
            where: { id: phieuXuat.id },
            data: { trang_thai: "DA_HUY" },
          });
        }
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
          don_van_chuyen: true,
          phieu_xuat_kho: { orderBy: { ngay_tao: "desc" }, take: 1, select: { trang_thai: true } },
        },
      });
      if (!order) {
        return NextResponse.json({ success: false, message: "Không tìm thấy đơn" }, { status: 404 });
      }

      const latestPhieuXuat = order.phieu_xuat_kho[0];
      if (!latestPhieuXuat || latestPhieuXuat.trang_thai !== "HOAN_THANH") {
        return NextResponse.json({
          success: false,
          message: "Phải hoàn thành xuất kho trước khi tạo vận đơn GHN",
        }, { status: 409 });
      }

      const ghnToken = process.env.GHN_TOKEN;
      const ghnShopId = process.env.GHN_SHOP_ID;
      const ghnBaseUrl = process.env.GHN_BASE_URL;
      const fromDistrictId = parseInt(process.env.GHN_FROM_DISTRICT_ID || "1526");
      const fromWardCode = process.env.GHN_FROM_WARD_CODE || "40113";

      if (!ghnToken || !ghnShopId || !ghnBaseUrl) {
        return NextResponse.json({ success: false, message: "Chưa cấu hình GHN" }, { status: 500 });
      }

      const payment = order.giao_dich_thanh_toan[0];
      const isCOD = payment?.phuong_thuc_thanh_toan === "COD";
      const clientOrderCode = `DH${String(order.id).padStart(4, "0")}`;
      const existingShipping = order.don_van_chuyen.find((item) => item.ma_van_don);

      if (existingShipping?.ma_van_don) {
        const detail = await fetchGhnOrderDetail(ghnBaseUrl, ghnToken, ghnShopId, existingShipping.ma_van_don);
        if (detail.ok) {
          const envText = isGhnSandbox(ghnBaseUrl) ? "sandbox/dev" : "production";
          return NextResponse.json({
            success: true,
            message: `Vận đơn GHN đã tồn tại trên ${envText}: ${existingShipping.ma_van_don}`,
            orderCode: existingShipping.ma_van_don,
            environment: envText,
          });
        }
      }

      // Validate địa chỉ giao trước khi gọi GHN — tránh GHN trả 400 khó debug
      if (!order.ma_quan_huyen_ghn || !order.ma_phuong_xa_ghn) {
        return NextResponse.json({
          success: false,
          message: "Đơn hàng chưa có district_id/ward_code GHN. Khách cần cập nhật địa chỉ theo dữ liệu GHN.",
        }, { status: 400 });
      }
      if (!order.sdt_nguoi_nhan || order.sdt_nguoi_nhan.length < 9) {
        return NextResponse.json({
          success: false,
          message: "Số điện thoại người nhận không hợp lệ (cần ≥ 9 ký tự).",
        }, { status: 400 });
      }

      const totalQty = order.chi_tiet_don_hang.reduce((s, it) => s + (it.so_luong || 1), 0);
      const ghnPayload = {
        to_name: order.ho_ten_nguoi_nhan || "Khách hàng",
        to_phone: order.sdt_nguoi_nhan,
        to_address: order.dia_chi_giao_hang || "",
        to_ward_code: String(order.ma_phuong_xa_ghn),
        to_district_id: Number(order.ma_quan_huyen_ghn),
        from_district_id: fromDistrictId,
        from_ward_code: fromWardCode,
        // COD: tiền COD = tiền hàng (loại phí ship, GHN tự cộng lại khi thu của khách)
        cod_amount: isCOD
          ? Math.max(0, Math.round(Number(order.tong_tien || 0) - Number(order.phi_van_chuyen || 0)))
          : 0,
        weight: Math.max(200, totalQty * 500),
        length: 20,
        width: 20,
        height: 10,
        service_type_id: 2,
        // COD: khách trả phí ship tại cửa. Đơn online đã thanh toán full: shop trả.
        payment_type_id: isCOD ? 2 : 1,
        required_note: "CHOXEMHANGKHONGTHU",
        client_order_code: clientOrderCode,
        content: order.chi_tiet_don_hang
          .map((item) => `${item.bien_the_san_pham?.san_pham?.ten_san_pham || "SP"} x${item.so_luong || 1}`)
          .join(", ")
          .slice(0, 2000),
        items: order.chi_tiet_don_hang.map((item) => ({
          name: item.bien_the_san_pham?.san_pham?.ten_san_pham || "SP",
          quantity: item.so_luong || 1,
          price: Number(item.don_gia || 0),
        })),
      };

      const ghnRes = await fetch(`${ghnBaseUrl}/v2/shipping-order/create`, {
        method: "POST",
        headers: {
          Token: ghnToken,
          ShopId: ghnShopId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ghnPayload),
      });

      const ghnData = await ghnRes.json();
      if (ghnData.code !== 200) {
        console.error("[GHN CREATE_GHN_ORDER] Payload:", JSON.stringify(ghnPayload));
        console.error("[GHN CREATE_GHN_ORDER] Response:", JSON.stringify(ghnData));
        const detailMsg = ghnData.message || ghnData.code_message_value
          || (ghnData.data ? JSON.stringify(ghnData.data) : "Không tạo được vận đơn");
        return NextResponse.json({
          success: false,
          message: `GHN lỗi: ${detailMsg}`,
          ghnDetail: ghnData,
        }, { status: 400 });
      }

      const orderCode = ghnData.data?.order_code;
      const expectedDate = ghnData.data?.expected_delivery_time;
      if (!orderCode) {
        return NextResponse.json({
          success: false,
          message: "GHN đã phản hồi thành công nhưng không trả mã vận đơn",
        }, { status: 400 });
      }

      const detail = await fetchGhnOrderDetail(ghnBaseUrl, ghnToken, ghnShopId, orderCode);
      if (!detail.ok) {
        return NextResponse.json({
          success: false,
          message: `GHN đã trả mã ${orderCode} nhưng kiểm tra lại không thấy đơn. Chưa lưu vận đơn vào hệ thống.`,
          ghnDetail: detail.data,
        }, { status: 502 });
      }

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

      const envText = isGhnSandbox(ghnBaseUrl) ? "sandbox/dev" : "production";
      return NextResponse.json({
        success: true,
        message: `Đã tạo vận đơn GHN (${envText}): ${orderCode}`,
        orderCode,
        clientOrderCode,
        environment: envText,
      });
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
