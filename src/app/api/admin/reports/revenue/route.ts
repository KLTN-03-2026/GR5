import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const REVENUE_EXCLUDED_STATUSES = ["DA_HUY", "TU_CHOI", "THANH_TOAN_THAT_BAI"];
const REVENUE_RECOGNIZED_STATUSES = ["DA_GIAO", "HOAN_THANH"];

function formatDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';
    
    const now = new Date();
    let startDate = new Date();
    
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Doanh thu ghi nhận khi đơn đã thanh toán hoặc đã hoàn thành giao hàng.
    // Không chờ DA_GIAO, vì đơn online/bank đã thanh toán sẽ đi thẳng CHO_GIAO_HANG/DANG_GIAO_HANG.
    const orders = await prisma.don_hang.findMany({
      where: {
        ngay_tao: { gte: startDate },
        trang_thai: { notIn: REVENUE_EXCLUDED_STATUSES },
        OR: [
          { giao_dich_thanh_toan: { some: { trang_thai: "DA_THANH_TOAN" } } },
          { trang_thai: { in: REVENUE_RECOGNIZED_STATUSES } },
        ],
      },
      include: {
        giao_dich_thanh_toan: true,
        nhiem_vu_cong_viec: {
          include: { nguoi_dung: { include: { ho_so_nguoi_dung: true } } }
        },
        chi_tiet_don_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: { include: { danh_muc: true } }
              }
            }
          }
        }
      },
      orderBy: { ngay_tao: 'asc' }
    });

    // Tính giá vốn bình quân gia quyền từ TẤT CẢ phiếu nhập của các biến thể đã bán.
    // Lý do: dùng `take:1` (1 phiếu mới nhất) hoặc fallback `gia_goc` (giá niêm yết, thường > giá bán)
    // làm cost dẫn đến lợi nhuận âm sai sự thật.
    const variantIds = new Set<number>();
    orders.forEach(o => o.chi_tiet_don_hang.forEach(d => {
      if (d.ma_bien_the != null) variantIds.add(d.ma_bien_the);
    }));

    const importDetails = variantIds.size > 0
      ? await prisma.chi_tiet_phieu_nhap.findMany({
          where: {
            ma_bien_the: { in: Array.from(variantIds) },
            so_luong_thuc_nhan: { gt: 0 },
          },
          select: { ma_bien_the: true, so_luong_thuc_nhan: true, don_gia: true },
        })
      : [];

    const costAgg: Record<number, { totalCost: number; totalQty: number }> = {};
    importDetails.forEach(d => {
      const id = d.ma_bien_the;
      const qty = d.so_luong_thuc_nhan || 0;
      if (!costAgg[id]) costAgg[id] = { totalCost: 0, totalQty: 0 };
      costAgg[id].totalCost += Number(d.don_gia) * qty;
      costAgg[id].totalQty += qty;
    });
    const avgCostPerVariant: Record<number, number> = {};
    Object.entries(costAgg).forEach(([id, agg]) => {
      if (agg.totalQty > 0) avgCostPerVariant[Number(id)] = agg.totalCost / agg.totalQty;
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalShippingCost = 0;

    const revenueByDate: Record<string, number> = {};
    const revenueByCategory: Record<string, number> = {};
    const profitByCategory: Record<string, number> = {};
    const revenueByCity: Record<string, number> = {};
    const revenueByStaff: Record<string, { name: string; revenue: number; orders: number }> = {};
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach(order => {
      const orderValue = Number(order.tong_tien || 0);
      const shippingFee = Number(order.phi_van_chuyen || 0);
      
      totalRevenue += orderValue;
      totalShippingCost += shippingFee;

      // Nhóm theo ngày
      if (order.ngay_tao) {
        const dateStr = formatDateKey(order.ngay_tao);
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + orderValue;
      }

      // Nhóm theo tỉnh/thành phố (từ địa chỉ giao hàng, giả sử format là "..., Tỉnh ABC")
      // Hoặc dựa vào thuộc tính ma_tinh_ghn (nếu có mapping). Ở đây dùng chuỗi fallback đơn giản
      const cityMatch = order.dia_chi_giao_hang?.split(',').pop()?.trim() || 'Chưa rõ';
      revenueByCity[cityMatch] = (revenueByCity[cityMatch] || 0) + orderValue;

      // Nhóm theo nhân viên xử lý
      if (order.nhiem_vu_cong_viec && order.nhiem_vu_cong_viec.length > 0) {
        const task = order.nhiem_vu_cong_viec[0];
        const staffName = task.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || task.nguoi_dung?.email || 'Hệ thống';
        if (!revenueByStaff[staffName]) revenueByStaff[staffName] = { name: staffName, revenue: 0, orders: 0 };
        revenueByStaff[staffName].revenue += orderValue;
        revenueByStaff[staffName].orders += 1;
      }

      // Tính chi phí vốn (Giá nhập) và Doanh thu theo danh mục
      order.chi_tiet_don_hang.forEach(detail => {
        const qty = detail.so_luong || 0;
        const price = Number(detail.don_gia || 0);

        // Cost = giá nhập bình quân gia quyền của biến thể. Nếu chưa có phiếu nhập nào,
        // ước lượng cost = 70% giá bán (giả định biên 30% — không dùng `gia_goc` vì đó là giá niêm yết).
        const variantId = detail.ma_bien_the;
        const costPrice = (variantId != null && avgCostPerVariant[variantId] !== undefined)
          ? avgCostPerVariant[variantId]
          : price * 0.7;

        const itemCost = qty * costPrice;
        const itemRevenue = qty * price;
        totalCost += itemCost;

        const categoryName = detail.bien_the_san_pham?.san_pham?.danh_muc?.ten_danh_muc || 'Khác';
        revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + itemRevenue;
        profitByCategory[categoryName] = (profitByCategory[categoryName] || 0) + (itemRevenue - itemCost);

        // Top sản phẩm
        const productName = detail.bien_the_san_pham?.san_pham?.ten_san_pham || 'Sản phẩm';
        if (!productStats[productName]) productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
        productStats[productName].quantity += qty;
        productStats[productName].revenue += itemRevenue;
      });
    });

    // Phí ship là khoản thu hộ: khách trả cho shop rồi shop trả GHN (1:1) → không vào LN
    const productRevenue = totalRevenue - totalShippingCost;
    const grossProfit = productRevenue - totalCost;
    const margin = productRevenue > 0 ? (grossProfit / productRevenue) * 100 : 0;

    // Chuẩn bị dữ liệu trả về mảng
    const chartData = Object.entries(revenueByDate).map(([date, value]) => ({ date, value }));
    const categoryData = Object.entries(revenueByCategory).map(([name, value]) => ({ name, value, profit: profitByCategory[name] || 0 }));
    const cityData = Object.entries(revenueByCity).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    const staffData = Object.values(revenueByStaff).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenue,
        productRevenue,
        totalCost,
        totalShippingCost,
        grossProfit,
        margin,
        ordersCount: orders.length
      },
      chartData,
      categoryData,
      cityData,
      staffData,
      topProducts
    });
  } catch (error) {
    console.error("API Revenue Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
