import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";
const GHN_SHOP_ID = process.env.GHN_SHOP_ID || "";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });

    const order = await prisma.don_hang.findUnique({
      where: { id: Number(orderId) },
      include: {
        nguoi_dung: { include: { ho_so_nguoi_dung: true } },
        chi_tiet_don_hang: {
          include: {
            bien_the_san_pham: { include: { san_pham: true } },
          },
        },
        giao_dich_thanh_toan: {
          take: 1,
          orderBy: { ngay_tao: "desc" },
          select: { phuong_thuc_thanh_toan: true },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

    // Kiểm tra đã có vận đơn chưa
    const existingShipment = await prisma.don_van_chuyen.findFirst({
      where: { ma_don_hang: Number(orderId), ma_van_don: { not: null } },
    });
    if (existingShipment?.ma_van_don) {
      return NextResponse.json({
        success: true,
        order_code: existingShipment.ma_van_don,
        message: "Vận đơn đã được tạo trước đó",
      });
    }

    // Lấy địa chỉ GHN từ don_hang (snapshot lúc đặt)
    if (!order.ma_quan_huyen_ghn || !order.ma_phuong_xa_ghn) {
      return NextResponse.json(
        { error: "Đơn hàng chưa có thông tin địa chỉ GHN (district/ward). Vui lòng cập nhật địa chỉ." },
        { status: 400 }
      );
    }

    const paymentMethod = order.giao_dich_thanh_toan[0]?.phuong_thuc_thanh_toan || "COD";
    const isCOD = paymentMethod === "COD";

    const items = order.chi_tiet_don_hang.map((item: any) => ({
      name: item.bien_the_san_pham?.san_pham?.ten_san_pham || `SP #${item.ma_bien_the}`,
      quantity: item.so_luong || 1,
      price: Number(item.don_gia || 0),
    }));

    const ghnPayload = {
      to_name: order.ho_ten_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || "Khách hàng",
      to_phone: order.sdt_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai || "0900000000",
      to_address: order.dia_chi_giao_hang || "Địa chỉ giao hàng",
      to_ward_code: String(order.ma_phuong_xa_ghn),
      to_district_id: Number(order.ma_quan_huyen_ghn),
      cod_amount: isCOD ? Math.round(Number(order.tong_tien || 0)) : 0,
      weight: Math.max(items.reduce((s: number) => s + 500, 0), 200),
      service_type_id: 2,
      payment_type_id: 1,
      required_note: "CHOXEMHANGKHONGTHU",
      note: order.ghi_chu || "",
      items,
    };

    const ghnRes = await fetch(`${GHN_BASE}/v2/shipping-order/create`, {
      method: "POST",
      headers: {
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ghnPayload),
    });

    const ghnData = await ghnRes.json();

    if (ghnData.code !== 200) {
      return NextResponse.json(
        { error: `GHN lỗi: ${ghnData.message}`, detail: ghnData },
        { status: 400 }
      );
    }

    const orderCode = ghnData.data?.order_code;
    const expectedDate = ghnData.data?.expected_delivery_time
      ? new Date(ghnData.data.expected_delivery_time * 1000)
      : null;

    // Tìm doi_tac GHN hoặc tạo nếu chưa có
    let doiTac = await prisma.doi_tac_van_chuyen.findFirst({
      where: { ten_doi_tac: "GHN" },
    });
    if (!doiTac) {
      doiTac = await prisma.doi_tac_van_chuyen.create({
        data: { ten_doi_tac: "GHN", so_dien_thoai: "1900636976" },
      });
    }

    // Upsert don_van_chuyen
    await prisma.don_van_chuyen.upsert({
      where: { id: existingShipment?.id ?? 0 },
      create: {
        ma_don_hang: Number(orderId),
        ma_doi_tac: doiTac.id,
        ma_van_don: orderCode,
        trang_thai: "ready_to_pick",
        ngay_giao_du_kien: expectedDate,
      },
      update: {
        ma_van_don: orderCode,
        trang_thai: "ready_to_pick",
        ngay_giao_du_kien: expectedDate,
      },
    });

    return NextResponse.json({ success: true, order_code: orderCode });
  } catch (err: any) {
    console.error("❌ GHN create-order error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
