import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Ánh xạ trạng thái GHN → trạng thái đơn hàng nội bộ
const STATUS_MAP: Record<string, string> = {
  ready_to_pick:  "CHO_LAY_HANG",
  picking:        "DANG_LAY_HANG",
  picked:         "DA_LAY_HANG",
  storing:        "DANG_LUU_KHO",
  transporting:   "DANG_TRUNG_CHUYEN",
  sorting:        "DANG_PHAN_LOAI",
  delivering:     "DANG_GIAO_HANG",
  money_collect_delivering: "DANG_GIAO_HANG",
  delivered:      "DA_GIAO",
  delivery_fail:  "GIAO_THAT_BAI",
  waiting_to_return: "CHO_HOAN_HANG",
  return:         "DANG_HOAN_TRA",
  return_transporting: "DANG_HOAN_TRA",
  returned:       "DA_HOAN_TRA",
  cancel:         "DA_HUY",
  exception:      "NGOAI_LE",
  lost:           "THAT_LAC",
  damage:         "HONG_HOC",
};

// Trạng thái cần đồng bộ vào don_hang chính
const SYNC_TO_ORDER: Record<string, string> = {
  delivered: "DA_GIAO",
  returned:  "DA_HOAN_TRA",
  cancel:    "DA_HUY",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // GHN gửi: OrderCode, Status, Time, Description
    const { OrderCode, Status } = body;

    if (!OrderCode || !Status) {
      return NextResponse.json({ success: true, message: "Không có dữ liệu xử lý" });
    }

    const internalStatus = STATUS_MAP[Status.toLowerCase()] || Status;

    // Cập nhật bảng don_van_chuyen
    await prisma.don_van_chuyen.updateMany({
      where: { ma_van_don: OrderCode },
      data: { trang_thai: Status.toLowerCase() },
    });

    // Đồng bộ trạng thái đơn hàng nếu là trạng thái quan trọng
    const orderNewStatus = SYNC_TO_ORDER[Status.toLowerCase()];
    if (orderNewStatus) {
      const shipment = await prisma.don_van_chuyen.findFirst({
        where: { ma_van_don: OrderCode },
        select: { ma_don_hang: true },
      });

      if (shipment?.ma_don_hang) {
        await prisma.don_hang.update({
          where: { id: shipment.ma_don_hang },
          data: { trang_thai: orderNewStatus },
        });

        // Ghi lịch sử đơn hàng
        await prisma.lich_su_don_hang.create({
          data: { ma_don_hang: shipment.ma_don_hang, trang_thai: orderNewStatus },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ GHN webhook error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
