import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Lấy toàn bộ đơn hàng trong phạm vi
    const orders = await prisma.don_hang.findMany({
      where: { ngay_tao: { gte: startDate } },
      include: {
        lich_su_don_hang: true,
        giao_dich_thanh_toan: true,
        nguoi_dung: {
          include: { ho_so_nguoi_dung: true }
        }
      },
      orderBy: { ngay_tao: 'asc' }
    });

    // Các biến lưu trữ thống kê
    let totalOrders = orders.length;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalProcessingTime = 0; // In milliseconds
    let processedCount = 0;
    
    const statusDistribution: Record<string, number> = {};
    const trendByDate: Record<string, number> = {};
    const ordersByHour: Record<number, number> = {};
    
    // Khởi tạo hours
    for(let i=0; i<24; i++) ordersByHour[i] = 0;

    const paymentMethods: Record<string, { total: number; success: number; failed: number; pendingManual: number; revenue: number }> = {};
    const customerMap: Record<string, { id: string; name: string; frequency: number; monetary: number; recency: Date }> = {};

    orders.forEach(order => {
      // 1. Phân phối trạng thái
      const status = order.trang_thai || 'UNKNOWN';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      
      if (['DA_GIAO', 'HOAN_THANH'].includes(status)) completedOrders++;
      if (['DA_HUY', 'TU_CHOI', 'THANH_TOAN_THAT_BAI'].includes(status)) cancelledOrders++;

      // 2. Trend theo ngày
      if (order.ngay_tao) {
        const dateStr = order.ngay_tao.toISOString().split('T')[0];
        trendByDate[dateStr] = (trendByDate[dateStr] || 0) + 1;
        
        // 3. Peak hours
        const hour = order.ngay_tao.getHours();
        ordersByHour[hour]++;
      }

      // 4. Thời gian xử lý trung bình
      const history = order.lich_su_don_hang || [];
      const createdEvent = history.find(h => h.trang_thai === 'CHO_XAC_NHAN' || h.trang_thai === 'TAO_MOI');
      const deliveredEvent = history.find(h => h.trang_thai === 'DA_GIAO');
      if (createdEvent && deliveredEvent && createdEvent.thoi_gian_doi && deliveredEvent.thoi_gian_doi) {
        const diff = deliveredEvent.thoi_gian_doi.getTime() - createdEvent.thoi_gian_doi.getTime();
        if (diff > 0) {
          totalProcessingTime += diff;
          processedCount++;
        }
      }

      // 5. Thanh toán
      let pMethod = 'COD';
      let pStatus = 'CHO_THANH_TOAN';
      if (order.giao_dich_thanh_toan && order.giao_dich_thanh_toan.length > 0) {
        const tx = order.giao_dich_thanh_toan[0];
        pMethod = tx.phuong_thuc_thanh_toan || 'COD';
        pStatus = tx.trang_thai || 'CHO_THANH_TOAN';
      }
      
      if (!paymentMethods[pMethod]) paymentMethods[pMethod] = { total: 0, success: 0, failed: 0, pendingManual: 0, revenue: 0 };
      paymentMethods[pMethod].total++;
      if (pStatus === 'DA_THANH_TOAN' || (pMethod === 'COD' && status === 'DA_GIAO')) paymentMethods[pMethod].success++;
      else if (pStatus === 'THAT_BAI' || pStatus === 'DA_HUY') paymentMethods[pMethod].failed++;
      
      // Đơn CK chờ xác nhận
      if (pMethod === 'CHUYEN_KHOAN' && pStatus === 'CHO_XAC_NHAN') paymentMethods[pMethod].pendingManual++;

      if (status === 'DA_GIAO' || status === 'HOAN_THANH') {
        paymentMethods[pMethod].revenue += Number(order.tong_tien || 0);
      }

      // 6. Khách hàng (RFM base)
      const uId = order.ma_nguoi_dung?.toString();
      if (uId) {
        if (!customerMap[uId]) {
          customerMap[uId] = {
            id: uId,
            name: order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || order.nguoi_dung?.email || 'Khách hàng',
            frequency: 0,
            monetary: 0,
            recency: order.ngay_tao || new Date(0)
          };
        }
        customerMap[uId].frequency++;
        if (['DA_GIAO', 'HOAN_THANH'].includes(status)) {
          customerMap[uId].monetary += Number(order.tong_tien || 0);
        }
        if (order.ngay_tao && order.ngay_tao > customerMap[uId].recency) {
          customerMap[uId].recency = order.ngay_tao;
        }
      }
    });

    const avgProcessingHours = processedCount > 0 ? (totalProcessingTime / processedCount) / (1000 * 60 * 60) : 0;
    const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // Tính toán Customer Metrics
    const customers = Object.values(customerMap);
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.frequency > 1).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
    
    // Top customers (Monetary)
    const topCustomers = customers.sort((a, b) => b.monetary - a.monetary).slice(0, 10);

    // Format Data
    const formattedStatusDistribution = Object.entries(statusDistribution).map(([name, value]) => ({ name, value }));
    const formattedTrend = Object.entries(trendByDate).map(([date, value]) => ({ date, value }));
    const formattedHours = Object.entries(ordersByHour).map(([hour, value]) => ({ hour: `${hour}h`, value }));
    const formattedPayments = Object.entries(paymentMethods).map(([name, stats]) => ({
      name,
      ...stats,
      successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0
    }));

    return NextResponse.json({
      summary: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        cancelRate,
        avgProcessingHours,
        totalCustomers,
        repeatRate
      },
      statusDistribution: formattedStatusDistribution,
      trend: formattedTrend,
      peakHours: formattedHours,
      payments: formattedPayments,
      topCustomers
    });

  } catch (error) {
    console.error("API Orders Report Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders report" }, { status: 500 });
  }
}
