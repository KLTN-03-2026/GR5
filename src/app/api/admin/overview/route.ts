import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "week";

  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "week":
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
  }

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrdersInRange,
    expiringLots,
    totalRevenue,
    totalProducts,
    totalCustomers,
    recentOrders,
    topProducts,
    ordersByDay,
    revenueByDay,
    categoryStats,
    lowStockCount,
  ] = await Promise.all([
    // Tổng đơn hàng trong khoảng
    prisma.don_hang.count({ where: { ngay_tao: { gte: startDate } } }),
    // Đơn chờ xác nhận (tất cả, không filter theo ngày)
    prisma.don_hang.count({ where: { trang_thai: "CHO_XAC_NHAN" } }),
    // Đơn đang xử lý: đã xác nhận + đang đóng gói + đã thanh toán + chờ giao hàng + chờ xử lý (tất cả, không filter theo ngày)
    prisma.don_hang.count({ where: { trang_thai: { in: ["DA_XAC_NHAN", "DANG_DONG_GOI", "DA_THANH_TOAN", "CHO_XU_LY", "CHO_GIAO_HANG"] } } }),
    // Đơn đang giao (tất cả, không filter theo ngày)
    prisma.don_hang.count({ where: { trang_thai: "DANG_GIAO_HANG" } }),
    // Đơn đã giao (trong khoảng thời gian)
    prisma.don_hang.count({ where: { trang_thai: "DA_GIAO", ngay_tao: { gte: startDate } } }),
    // Đơn đã hủy (trong khoảng thời gian)
    prisma.don_hang.count({ where: { trang_thai: "DA_HUY", ngay_tao: { gte: startDate } } }),
    // Tất cả đơn trong range (lấy tổng tiền)
    prisma.don_hang.findMany({
      where: { ngay_tao: { gte: startDate }, trang_thai: { not: "DA_HUY" } },
      select: { tong_tien: true, ngay_tao: true },
    }),
    // Lô sắp hết hạn (trong 7 ngày tới)
    prisma.lo_hang.count({
      where: {
        han_su_dung: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), gte: now },
      },
    }),
    // Doanh thu (đơn đã giao)
    prisma.don_hang.aggregate({
      where: { trang_thai: "DA_GIAO", ngay_tao: { gte: startDate } },
      _sum: { tong_tien: true },
    }),
    // Tổng sản phẩm đang bán
    prisma.san_pham.count({ where: { trang_thai: "DANG_BAN" } }),
    // Tổng khách hàng
    prisma.nguoi_dung.count({
      where: { vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } } } },
    }),
    // 5 đơn hàng gần nhất
    prisma.don_hang.findMany({
      take: 5,
      orderBy: { ngay_tao: "desc" },
      select: {
        id: true,
        tong_tien: true,
        trang_thai: true,
        ngay_tao: true,
        ho_ten_nguoi_nhan: true,
        chi_tiet_don_hang: { select: { so_luong: true } },
      },
    }),
    // Top 5 sản phẩm bán chạy
    prisma.chi_tiet_don_hang.groupBy({
      by: ["ma_bien_the"],
      where: { don_hang: { trang_thai: { in: ["DA_GIAO", "DANG_GIAO_HANG", "DA_XAC_NHAN", "DANG_DONG_GOI", "DA_THANH_TOAN", "CHO_XU_LY", "CHO_GIAO_HANG"] } } },
      _sum: { so_luong: true },
      orderBy: { _sum: { so_luong: "desc" } },
      take: 5,
    }),
    // Đơn hàng theo ngày (7 ngày gần nhất)
    prisma.$queryRaw<{ ngay: string; so_don: bigint; doanh_thu: number }[]>`
      SELECT DATE(ngay_tao) as ngay, COUNT(*) as so_don, COALESCE(SUM(tong_tien), 0) as doanh_thu
      FROM don_hang
      WHERE ngay_tao >= ${startDate} AND trang_thai != 'DA_HUY'
      GROUP BY DATE(ngay_tao)
      ORDER BY ngay ASC
    `,
    // Doanh thu theo ngày
    prisma.$queryRaw<{ ngay: string; doanh_thu: number }[]>`
      SELECT DATE(ngay_tao) as ngay, COALESCE(SUM(tong_tien), 0) as doanh_thu
      FROM don_hang
      WHERE ngay_tao >= ${startDate} AND trang_thai = 'DA_GIAO'
      GROUP BY DATE(ngay_tao)
      ORDER BY ngay ASC
    `,
    // Thống kê theo danh mục
    prisma.$queryRaw<{ ten_danh_muc: string; so_san_pham: bigint; tong_ban: bigint }[]>`
      SELECT dm.ten_danh_muc, COUNT(DISTINCT sp.id) as so_san_pham,
             COALESCE(SUM(ct.so_luong), 0) as tong_ban
      FROM danh_muc dm
      LEFT JOIN san_pham sp ON sp.ma_danh_muc = dm.id
      LEFT JOIN bien_the_san_pham bt ON bt.ma_san_pham = sp.id
      LEFT JOIN chi_tiet_don_hang ct ON ct.ma_bien_the = bt.id
      LEFT JOIN don_hang dh ON dh.id = ct.ma_don_hang AND dh.trang_thai != 'DA_HUY'
      WHERE dm.ma_danh_muc_cha IS NULL
      GROUP BY dm.id, dm.ten_danh_muc
      ORDER BY tong_ban DESC
    `,
    // Tồn kho thấp (< 10)
    prisma.ton_kho_tong.count({ where: { so_luong: { lt: 10 } } }),
  ]);

  // Tổng doanh thu
  const revenue = Number(totalRevenue._sum.tong_tien || 0);

  // Doanh thu tuần trước để so sánh %
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevRevenue = await prisma.don_hang.aggregate({
    where: { trang_thai: "DA_GIAO", ngay_tao: { gte: prevStart, lt: startDate } },
    _sum: { tong_tien: true },
  });
  const prevRev = Number(prevRevenue._sum.tong_tien || 0);
  const revenueChange = prevRev > 0 ? Math.round(((revenue - prevRev) / prevRev) * 100) : 0;

  // Enriching top products
  const topProductDetails = await Promise.all(
    topProducts.map(async (tp) => {
      const bt = await prisma.bien_the_san_pham.findUnique({
        where: { id: tp.ma_bien_the! },
        select: { ten_bien_the: true, gia_ban: true, san_pham: { select: { ten_san_pham: true, anh_san_pham: { where: { la_anh_chinh: true }, take: 1, select: { duong_dan_anh: true } } } } },
      });
      return {
        ten_san_pham: bt?.san_pham?.ten_san_pham || "N/A",
        bien_the: bt?.ten_bien_the || "",
        anh: bt?.san_pham?.anh_san_pham[0]?.duong_dan_anh || "",
        gia_ban: Number(bt?.gia_ban || 0),
        so_luong_ban: Number(tp._sum.so_luong || 0),
      };
    })
  );

  return NextResponse.json({
    kpiCards: {
      expiringLots: expiringLots,
      pendingOrders: pendingOrders + processingOrders,
      deliveredOrders: deliveredOrders,
      revenue: revenue,
      revenueChange: revenueChange,
      totalProducts: totalProducts,
      totalCustomers: totalCustomers,
      lowStock: lowStockCount,
    },
    orderStatus: {
      total: pendingOrders + processingOrders + shippingOrders + deliveredOrders + cancelledOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipping: shippingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    ordersByDay: ordersByDay.map((d) => ({
      ngay: d.ngay,
      so_don: Number(d.so_don),
      doanh_thu: Number(d.doanh_thu),
    })),
    revenueByDay: revenueByDay.map((d) => ({
      ngay: d.ngay,
      doanh_thu: Number(d.doanh_thu),
    })),
    categoryStats: categoryStats.map((c) => ({
      ten_danh_muc: c.ten_danh_muc,
      so_san_pham: Number(c.so_san_pham),
      tong_ban: Number(c.tong_ban),
    })),
    topProducts: topProductDetails,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      tong_tien: Number(o.tong_tien),
      trang_thai: o.trang_thai,
      ngay_tao: o.ngay_tao,
      ho_ten: o.ho_ten_nguoi_nhan,
      so_san_pham: o.chi_tiet_don_hang.reduce((s, c) => s + (c.so_luong || 0), 0),
    })),
  });
}
