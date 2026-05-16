import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { syncProductStatusFromStock } from "@/lib/product-stock-status";

export const dynamic = 'force-dynamic';

// ============================================================================
// [POST] TẠO ĐƠN HÀNG MỚI (CỦA KHÁCH HÀNG)
// - Xác thực session
// - Tính tổng tiền server-side từ giá biến thể trong DB
// - Kiểm tra & trừ tồn kho
// - Hỗ trợ idempotency key chống tạo đơn trùng
// - Row-level locking (SELECT FOR UPDATE) chống oversell
// ============================================================================
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const sessionUserId = Number((session.user as any).id);

    const body = await req.json();
    const {
      phi_van_chuyen, items, ghi_chu,
      phuong_thuc_thanh_toan,
      ho_ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang,
      ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn,
      idempotency_key,
      ma_giam_gia,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Giỏ hàng trống" }, { status: 400 });
    }

    // === INPUT VALIDATION ===
    // Validate so_luong: must be a positive integer (> 0)
    for (const item of items) {
      const soLuong = Number(item.so_luong || 1);
      if (!Number.isInteger(soLuong) || soLuong <= 0) {
        return NextResponse.json(
          { success: false, message: "Số lượng sản phẩm phải là số nguyên dương (> 0)" },
          { status: 400 }
        );
      }
    }

    // Validate phi_van_chuyen: must be non-negative number
    if (phi_van_chuyen !== undefined && phi_van_chuyen !== null) {
      const phiShipVal = Number(phi_van_chuyen);
      if (isNaN(phiShipVal) || phiShipVal < 0) {
        return NextResponse.json(
          { success: false, message: "Phí vận chuyển không hợp lệ (phải >= 0)" },
          { status: 400 }
        );
      }
    }

    // Idempotency: kiểm tra đơn trùng trong 5 phút gần nhất
    if (idempotency_key) {
      const recentOrder = await prisma.don_hang.findFirst({
        where: {
          ma_nguoi_dung: sessionUserId,
          ghi_chu: { contains: `[IK:${idempotency_key}]` },
          ngay_tao: { gte: new Date(Date.now() - 5 * 60 * 1000) }
        },
        select: { id: true, tong_tien: true }
      });
      if (recentOrder) {
        return NextResponse.json({
          success: true,
          orderId: recentOrder.id,
          totalAmount: Number(recentOrder.tong_tien || 0),
          duplicate: true
        });
      }
    }

    // Lấy giá & kiểm tra biến thể tồn tại
    const bienTheIds = items.map((item: any) => Number(item.ma_bien_the || item.id));
    const bienTheList = await prisma.bien_the_san_pham.findMany({
      where: { id: { in: bienTheIds } },
      select: { id: true, gia_ban: true }
    });

    if (bienTheList.length !== bienTheIds.length) {
      return NextResponse.json({ success: false, message: "Một số sản phẩm không tồn tại" }, { status: 400 });
    }

    const giaMap = new Map(bienTheList.map(bt => [bt.id, Number(bt.gia_ban)]));

    // Tính tổng tiền server-side
    let tongTienSP = 0;
    const orderItems = items.map((item: any) => {
      const maBienThe = Number(item.ma_bien_the || item.id);
      const soLuong = Number(item.so_luong || 1);
      const donGia = giaMap.get(maBienThe) || 0;
      tongTienSP += donGia * soLuong;
      return { ma_bien_the: maBienThe, so_luong: soLuong, don_gia: donGia };
    });

    const phiShip = Number(phi_van_chuyen || 0);

    // === VALIDATE & APPLY COUPON ===
    let couponId: number | null = null;
    let soTienGiam = 0;

    if (ma_giam_gia && typeof ma_giam_gia === 'string' && ma_giam_gia.trim()) {
      const coupon = await prisma.ma_giam_gia.findUnique({
        where: { ma_code: ma_giam_gia.trim() },
      });

      if (!coupon) {
        return NextResponse.json({ success: false, message: "Mã giảm giá không tồn tại" }, { status: 400 });
      }

      // Check expiration dates
      const now = new Date();
      if (coupon.ngay_bat_dau && now < new Date(coupon.ngay_bat_dau)) {
        return NextResponse.json({ success: false, message: "Mã giảm giá chưa đến thời gian sử dụng" }, { status: 400 });
      }
      if (coupon.ngay_ket_thuc && now > new Date(coupon.ngay_ket_thuc)) {
        return NextResponse.json({ success: false, message: "Mã giảm giá đã hết hạn" }, { status: 400 });
      }

      // Check usage limit
      if (coupon.gioi_han_su_dung !== null && coupon.gioi_han_su_dung !== undefined) {
        const usageCount = await prisma.don_hang.count({
          where: { ma_khuyen_mai: coupon.id, trang_thai: { not: "DA_HUY" } },
        });
        if (usageCount >= coupon.gioi_han_su_dung) {
          return NextResponse.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
        }
      }

      // Check minimum order amount
      if (coupon.don_toi_thieu && tongTienSP < Number(coupon.don_toi_thieu)) {
        return NextResponse.json({
          success: false,
          message: `Đơn hàng tối thiểu ${Number(coupon.don_toi_thieu).toLocaleString('vi-VN')}đ để sử dụng mã này`
        }, { status: 400 });
      }

      // Calculate discount amount server-side
      const giaTriGiam = Number(coupon.gia_tri_giam || 0);
      if (coupon.loai_giam_gia === 'PHAN_TRAM' || coupon.loai_giam_gia === 'percent') {
        soTienGiam = Math.round(tongTienSP * giaTriGiam / 100);
      } else {
        // Fixed amount discount
        soTienGiam = giaTriGiam;
      }

      // Discount cannot exceed product total
      soTienGiam = Math.min(soTienGiam, tongTienSP);
      couponId = coupon.id;
    }

    const tongTien = tongTienSP + phiShip - soTienGiam;

    // Transaction with row-level locking: kiểm tra tồn kho + trừ kho + tạo đơn
    const newOrder = await prisma.$transaction(async (tx) => {
      // Acquire row-level locks on bien_the_san_pham rows to prevent concurrent overselling
      // SELECT FOR UPDATE locks these rows until the transaction completes
      for (const item of orderItems) {
        await tx.$queryRaw`SELECT id FROM bien_the_san_pham WHERE id = ${item.ma_bien_the} FOR UPDATE`;
      }

      // Kiểm tra tồn kho cho từng biến thể (with rows locked above)
      for (const item of orderItems) {
        // Also lock ton_kho_tong rows to prevent concurrent stock modifications
        const stockRows: any[] = await tx.$queryRaw`
          SELECT tkt.id, tkt.so_luong
          FROM ton_kho_tong tkt
          INNER JOIN lo_hang lh ON tkt.ma_lo_hang = lh.id
          WHERE lh.ma_bien_the = ${item.ma_bien_the}
          FOR UPDATE
        `;

        const available = stockRows.reduce((sum, row) => sum + (Number(row.so_luong) || 0), 0);
        if (available < item.so_luong) {
          const bt = await tx.bien_the_san_pham.findUnique({
            where: { id: item.ma_bien_the },
            include: { san_pham: { select: { ten_san_pham: true } } }
          });
          throw new Error(`Sản phẩm "${bt?.san_pham?.ten_san_pham || item.ma_bien_the}" chỉ còn ${available} trong kho`);
        }
      }

      // Trừ tồn kho (ưu tiên lô gần hết hạn trước - FEFO)
      // Rows are already locked by FOR UPDATE above
      for (const item of orderItems) {
        let remaining = item.so_luong;
        const stocks = await tx.ton_kho_tong.findMany({
          where: {
            lo_hang: { ma_bien_the: item.ma_bien_the },
            so_luong: { gt: 0 }
          },
          include: { lo_hang: { select: { han_su_dung: true } } },
          orderBy: { lo_hang: { han_su_dung: "asc" } }
        });

        for (const stock of stocks) {
          if (remaining <= 0) break;
          const deduct = Math.min(remaining, stock.so_luong || 0);
          await tx.ton_kho_tong.update({
            where: { id: stock.id },
            data: { so_luong: { decrement: deduct } }
          });
          remaining -= deduct;
        }
      }

      await syncProductStatusFromStock(tx, orderItems.map((it) => it.ma_bien_the));

      // Tạo đơn hàng
      const ghiChuFull = idempotency_key
        ? `${ghi_chu || ""}[IK:${idempotency_key}]`
        : (ghi_chu || null);

      // Verify user exists before creating order
      const userExists = await tx.nguoi_dung.findUnique({ where: { id: sessionUserId }, select: { id: true } });
      if (!userExists) {
        throw new Error("Tài khoản không tồn tại trong hệ thống. Vui lòng đăng nhập lại.");
      }

      const order = await tx.don_hang.create({
        data: {
          ma_nguoi_dung: sessionUserId,
          ma_khuyen_mai: couponId,
          tong_tien: tongTien,
          phi_van_chuyen: phiShip,
          trang_thai: "CHO_XAC_NHAN",
          ghi_chu: ghiChuFull,
          ho_ten_nguoi_nhan: ho_ten_nguoi_nhan || null,
          sdt_nguoi_nhan: sdt_nguoi_nhan || null,
          dia_chi_giao_hang: dia_chi_giao_hang || null,
          ma_tinh_ghn: ma_tinh_ghn ? Number(ma_tinh_ghn) : null,
          ma_quan_huyen_ghn: ma_quan_huyen_ghn ? Number(ma_quan_huyen_ghn) : null,
          ma_phuong_xa_ghn: ma_phuong_xa_ghn || null,
          chi_tiet_don_hang: {
            create: orderItems
          },
          giao_dich_thanh_toan: {
            create: {
              so_tien: tongTien,
              phuong_thuc_thanh_toan: phuong_thuc_thanh_toan || "COD",
              trang_thai: "CHO_THANH_TOAN",
            }
          },
          lich_su_don_hang: {
            create: { trang_thai: "CHO_XAC_NHAN" }
          }
        } as any
      });

      return order;
    }, {
      // Set transaction isolation level to prevent dirty reads during locking
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      totalAmount: Number(newOrder.tong_tien || 0)
    });
  } catch (error: any) {
    console.error("Lỗi POST đơn hàng:", error.message);
    const status = error.message.includes("chỉ còn") ? 409 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

// ============================================================================
// [GET] LẤY DANH SÁCH ĐƠN HÀNG CỦA KHÁCH (xác thực session)
// ============================================================================
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const userId = Number((session.user as any).id);

    const orders = await prisma.don_hang.findMany({
      where: { ma_nguoi_dung: userId },
      include: {
        chi_tiet_don_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: true,
              }
            }
          }
        },
        don_van_chuyen: true,
        yeu_cau_doi_tra: true
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Lỗi GET đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ============================================================================
// [PUT] HỦY ĐƠN / YÊU CẦU ĐỔI TRẢ (xác thực session + quyền sở hữu)
// ============================================================================
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const sessionUserId = Number((session.user as any).id);

    const body = await req.json();
    const { orderId, action, reason, images } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    // Kiểm tra quyền sở hữu đơn hàng
    const order = await prisma.don_hang.findUnique({
      where: { id: Number(orderId) },
      select: { ma_nguoi_dung: true, trang_thai: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    if (order.ma_nguoi_dung !== sessionUserId) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thao tác đơn hàng này" }, { status: 403 });
    }

    // HỦY ĐƠN
    if (action === "CANCEL") {
      if (order.trang_thai !== "CHO_XAC_NHAN") {
        return NextResponse.json({ success: false, message: "Chỉ có thể hủy đơn đang chờ xác nhận" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Hoàn lại tồn kho
        const chiTiet = await tx.chi_tiet_don_hang.findMany({
          where: { ma_don_hang: Number(orderId) }
        });

        for (const item of chiTiet) {
          if (item.ma_bien_the && item.so_luong) {
            const stock = await tx.ton_kho_tong.findFirst({
              where: { lo_hang: { ma_bien_the: item.ma_bien_the } },
              orderBy: { ngay_cap_nhat: "desc" },
            });
            if (stock) {
              await tx.ton_kho_tong.update({
                where: { id: stock.id },
                data: { so_luong: { increment: item.so_luong } },
              });
            }
          }
        }

        // Hoàn tiền nếu đơn đã thanh toán online
        const paidTransaction = await tx.giao_dich_thanh_toan.findFirst({
          where: { ma_don_hang: Number(orderId), trang_thai: "DA_THANH_TOAN" }
        });
        if (paidTransaction) {
          await tx.lich_su_hoan_tien.create({
            data: {
              ma_giao_dich: paidTransaction.id,
              so_tien: paidTransaction.so_tien,
              trang_thai: "DANG_XU_LY",
            },
          });
        }

        // Cập nhật trạng thái đơn
        const cancelled = await tx.don_hang.update({
          where: { id: Number(orderId) },
          data: {
            trang_thai: "DA_HUY",
            ly_do_huy: reason || null
          }
        });

        await tx.lich_su_don_hang.create({
          data: {
            ma_don_hang: Number(orderId),
            trang_thai: "DA_HUY",
            ghi_chu: reason || null
          }
        });

        return cancelled;
      });

      return NextResponse.json({ success: true, message: "Đã hủy đơn hàng", data: result });
    }

    // YÊU CẦU ĐỔI TRẢ
    if (action === "RETURN") {
      if (order.trang_thai !== "DA_GIAO") {
        return NextResponse.json({ success: false, message: "Chỉ có thể yêu cầu đổi trả cho đơn đã giao" }, { status: 400 });
      }

      // Giới hạn kích thước ảnh (max 2MB mỗi ảnh khi base64)
      if (images && Array.isArray(images)) {
        for (const img of images) {
          if (typeof img === "string" && img.length > 2 * 1024 * 1024 * 1.37) {
            return NextResponse.json({ success: false, message: "Ảnh quá lớn (tối đa 2MB/ảnh)" }, { status: 400 });
          }
        }
      }

      const hinhAnhJson = images && images.length > 0 ? JSON.stringify(images.slice(0, 5)) : null;

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.don_hang.update({
          where: { id: Number(orderId) },
          data: {
            trang_thai: "YEU_CAU_DOI_TRA",
            yeu_cau_doi_tra: {
              create: {
                nguoi_dung: { connect: { id: sessionUserId } },
                loai_yeu_cau: "HOAN_TRA",
                ly_do_hoan_tra: reason || null,
                anh_minh_chung: hinhAnhJson,
                trang_thai: "CHO_DUYET"
              }
            }
          }
        });

        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: Number(orderId), trang_thai: "YEU_CAU_DOI_TRA" }
        });

        return updated;
      });

      return NextResponse.json({
        success: true,
        message: "Đã gửi yêu cầu thành công!",
        data: updatedOrder
      });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });

  } catch (error: any) {
    console.error("Lỗi PUT đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
