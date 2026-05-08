import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================================
// [GET] Danh sách đơn hàng cho nhân viên
// Query: status, paymentStatus, paymentMethod, search, page, limit,
//        dateFrom, dateTo, sortBy
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.trang_thai = status;

    if (search) {
      where.OR = [
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { ho_ten_nguoi_nhan: { contains: search } },
        { sdt_nguoi_nhan: { contains: search } },
        { nguoi_dung: { email: { contains: search } } },
      ].filter(Boolean);
    }

    if (dateFrom || dateTo) {
      where.ngay_tao = {};
      if (dateFrom) where.ngay_tao.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.ngay_tao.lte = end;
      }
    }

    if (paymentStatus || paymentMethod) {
      const paymentWhere: any = {};
      if (paymentStatus) paymentWhere.trang_thai = paymentStatus;
      if (paymentMethod) paymentWhere.phuong_thuc_thanh_toan = paymentMethod;
      where.giao_dich_thanh_toan = { some: paymentWhere };
    }

    let orderBy: any = { ngay_tao: "desc" };
    if (sortBy === "oldest") orderBy = { ngay_tao: "asc" };
    else if (sortBy === "highest") orderBy = { tong_tien: "desc" };
    else if (sortBy === "lowest") orderBy = { tong_tien: "asc" };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, orders, kpiCounts, todayStats] = await Promise.all([
      prisma.don_hang.count({ where }),
      prisma.don_hang.findMany({
        where,
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
                      ten_san_pham: true,
                      anh_san_pham: { take: 1, select: { duong_dan_anh: true } },
                    },
                  },
                },
              },
            },
          },
          giao_dich_thanh_toan: {
            take: 1,
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
            take: 1,
            select: { ma_van_don: true, trang_thai: true },
          },
          lich_su_don_hang: {
            orderBy: { thoi_gian_doi: "asc" },
            select: { trang_thai: true, thoi_gian_doi: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      // KPI counts from entire DB (not just current page)
      Promise.all([
        prisma.don_hang.count({ where: { trang_thai: "CHO_XAC_NHAN" } }),
        prisma.don_hang.count({
          where: {
            trang_thai: "CHO_XAC_NHAN",
            giao_dich_thanh_toan: {
              some: { trang_thai: "CHO_THANH_TOAN", phuong_thuc_thanh_toan: { not: "COD" } },
            },
          },
        }),
        prisma.don_hang.count({ where: { trang_thai: "DANG_GIAO_HANG" } }),
        prisma.don_hang.count({ where: { trang_thai: "CHO_GIAO_HANG" } }),
        prisma.don_hang.count({ where: { trang_thai: "DA_GIAO" } }),
        prisma.don_hang.count({ where: { trang_thai: "DA_HUY" } }),
      ]),
      // Today's stats
      Promise.all([
        prisma.don_hang.count({ where: { ngay_tao: { gte: todayStart } } }),
        prisma.don_hang.aggregate({
          where: { trang_thai: "DA_GIAO", ngay_tao: { gte: todayStart } },
          _sum: { tong_tien: true },
        }),
        prisma.don_hang.count({ where: { trang_thai: "DA_GIAO", ngay_tao: { gte: todayStart } } }),
      ]),
    ]);

    const now = new Date();
    const data = orders.map((order) => {
      const payment = order.giao_dich_thanh_toan[0];
      const shipping = order.don_van_chuyen[0];
      const diffMs = now.getTime() - new Date(order.ngay_tao!).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo = `${diffMins} phút trước`;
      if (diffMins >= 60 && diffHours < 24) timeAgo = `${diffHours} giờ trước`;
      else if (diffHours >= 24) timeAgo = `${diffDays} ngày trước`;

      const productSummary = order.chi_tiet_don_hang
        .slice(0, 2)
        .map(
          (item) =>
            `${item.bien_the_san_pham?.san_pham?.ten_san_pham ?? "SP"} x${item.so_luong}`
        )
        .join(", ");

      const isUrgent =
        order.trang_thai === "CHO_XAC_NHAN" && diffMins < 30;

      return {
        id: order.id,
        maHienThi: `DH${order.id}`,
        customerName: order.ho_ten_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || order.nguoi_dung?.email || "N/A",
        customerPhone: order.sdt_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai || "",
        customerEmail: order.nguoi_dung?.email || "",
        address: order.dia_chi_giao_hang || "",
        products: productSummary + (order.chi_tiet_don_hang.length > 2 ? "..." : ""),
        itemCount: order.chi_tiet_don_hang.length,
        total: Number(order.tong_tien || 0),
        shippingFee: Number(order.phi_van_chuyen || 0),
        status: order.trang_thai || "CHO_XAC_NHAN",
        notes: order.ghi_chu || "",
        paymentMethod: payment?.phuong_thuc_thanh_toan || "COD",
        paymentStatus: payment?.trang_thai || "CHO_THANH_TOAN",
        paymentId: payment?.id || null,
        transactionId: payment?.ma_giao_dich_ben_ngoai || null,
        maVanDon: shipping?.ma_van_don || null,
        shippingStatus: shipping?.trang_thai || null,
        timeAgo,
        ngayTao: order.ngay_tao,
        isUrgent,
        timeline: order.lich_su_don_hang,
      };
    });

    const [choXacNhan, choXacNhanCK, dangGiao, choGiao, daGiao, daHuy] = kpiCounts;
    const [tongDonHomNay, doanhThuHomNay, daGiaoHomNay] = todayStats;

    return NextResponse.json({
      success: true,
      data,
      kpi: {
        choXacNhan,
        choXacNhanCK,
        dangGiao,
        choGiao,
        daGiao,
        daHuy,
        tongDonHomNay,
        doanhThuHomNay: Number(doanhThuHomNay._sum.tong_tien || 0),
        daGiaoHomNay,
      },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/staff/orders]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách đơn hàng" },
      { status: 500 }
    );
  }
}

// ============================================================================
// [POST] Xử lý hành động trên đơn hàng
// action: CONFIRM_PAYMENT | UPDATE_STATUS | BULK_CONFIRM_PAYMENT
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, data: actionData } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Thiếu action" },
        { status: 400 }
      );
    }

    // Xác nhận chuyển khoản cho một đơn
    if (action === "CONFIRM_PAYMENT") {
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: "Thiếu orderId" },
          { status: 400 }
        );
      }
      const numId = Number(orderId);

      await prisma.$transaction(async (tx) => {
        await tx.giao_dich_thanh_toan.updateMany({
          where: { ma_don_hang: numId, trang_thai: "CHO_THANH_TOAN" },
          data: { trang_thai: "DA_THANH_TOAN" },
        });
        await tx.don_hang.update({
          where: { id: numId },
          data: { trang_thai: "CHO_GIAO_HANG" },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: numId, trang_thai: "CHO_GIAO_HANG" },
        });
      });

      return NextResponse.json({ success: true, message: "Đã xác nhận thanh toán" });
    }

    // Cập nhật trạng thái đơn hàng
    if (action === "UPDATE_STATUS") {
      const { newStatus, notes } = actionData || {};
      if (!orderId || !newStatus) {
        return NextResponse.json(
          { success: false, message: "Thiếu orderId hoặc newStatus" },
          { status: 400 }
        );
      }
      const numId = Number(orderId);

      await prisma.$transaction(async (tx) => {
        await tx.don_hang.update({
          where: { id: numId },
          data: { trang_thai: newStatus, ...(notes ? { ghi_chu: notes } : {}) },
        });
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: numId, trang_thai: newStatus },
        });
      });

      return NextResponse.json({ success: true, message: "Đã cập nhật trạng thái" });
    }

    // Xác nhận thanh toán hàng loạt
    if (action === "BULK_CONFIRM_PAYMENT") {
      const { orderIds } = actionData || {};
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "Thiếu danh sách orderIds" },
          { status: 400 }
        );
      }

      let successCount = 0;
      const errors: string[] = [];

      for (const oid of orderIds) {
        try {
          const numId = Number(oid);
          await prisma.$transaction(async (tx) => {
            await tx.giao_dich_thanh_toan.updateMany({
              where: { ma_don_hang: numId, trang_thai: "CHO_THANH_TOAN" },
              data: { trang_thai: "DA_THANH_TOAN" },
            });
            await tx.don_hang.update({
              where: { id: numId },
              data: { trang_thai: "CHO_GIAO_HANG" },
            });
            await tx.lich_su_don_hang.create({
              data: { ma_don_hang: numId, trang_thai: "CHO_GIAO_HANG" },
            });
          });
          successCount++;
        } catch {
          errors.push(String(oid));
        }
      }

      return NextResponse.json({
        success: true,
        message: `Xác nhận ${successCount}/${orderIds.length} đơn`,
        successCount,
        errors,
      });
    }

    return NextResponse.json(
      { success: false, message: "Action không hợp lệ" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/staff/orders]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý đơn hàng" },
      { status: 500 }
    );
  }
}
