import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";
const GHN_SHOP_ID = process.env.GHN_SHOP_ID || "";
const FROM_DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT_ID || 1526);
const FROM_WARD_CODE = process.env.GHN_FROM_WARD_CODE || "40113";

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

    // COD: khách trả tại cửa → tiền COD chỉ là tiền hàng (tong_tien đã gồm ship, trừ ra để GHN tự cộng lại khi thu)
    const codAmount = isCOD
      ? Math.max(0, Math.round(Number(order.tong_tien || 0) - Number(order.phi_van_chuyen || 0)))
      : 0;

    const totalQty = order.chi_tiet_don_hang.reduce((s, it) => s + (it.so_luong || 1), 0);
    const ghnPayload = {
      to_name: order.ho_ten_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || "Khách hàng",
      to_phone: order.sdt_nguoi_nhan || order.nguoi_dung?.ho_so_nguoi_dung?.so_dien_thoai || "0900000000",
      to_address: order.dia_chi_giao_hang || "Địa chỉ giao hàng",
      to_ward_code: String(order.ma_phuong_xa_ghn),
      to_district_id: Number(order.ma_quan_huyen_ghn),
      // Địa chỉ kho gửi — bắt buộc với GHN, lấy từ env
      from_district_id: FROM_DISTRICT_ID,
      from_ward_code: FROM_WARD_CODE,
      cod_amount: codAmount,
      weight: Math.max(200, totalQty * 500),
      length: 20,
      width: 20,
      height: 10,
      service_type_id: 2,
      payment_type_id: isCOD ? 2 : 1,
      required_note: "CHOXEMHANGKHONGTHU",
      client_order_code: `DH${String(order.id).padStart(4, "0")}`,
      content: items.map((i) => `${i.name} x${i.quantity}`).join(", ").slice(0, 2000),
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
      console.error("[GHN create-order] Failed payload:", JSON.stringify(ghnPayload));
      console.error("[GHN create-order] Response:", JSON.stringify(ghnData));
      return NextResponse.json(
        { error: `GHN lỗi: ${ghnData.message || ghnData.code_message_value || "Không rõ"}`, detail: ghnData },
        { status: 400 }
      );
    }

    const orderCode = ghnData.data?.order_code;
    const rawExpected = ghnData.data?.expected_delivery_time;
    let expectedDate: Date | null = null;
    if (rawExpected) {
      const d = typeof rawExpected === "string" ? new Date(rawExpected) : new Date(rawExpected * 1000);
      if (!isNaN(d.getTime())) expectedDate = d;
    }

    // Tìm doi_tac GHN hoặc tạo nếu chưa có
    let doiTac = await prisma.doi_tac_van_chuyen.findFirst({
      where: { ten_doi_tac: "GHN" },
    });
    if (!doiTac) {
      doiTac = await prisma.doi_tac_van_chuyen.create({
        data: { ten_doi_tac: "GHN", so_dien_thoai: "1900636976" },
      });
    }

    // Tìm bất kỳ don_van_chuyen nào của đơn (có thể đã được tạo từ checkout với ma_van_don=null)
    const anyShipment = await prisma.don_van_chuyen.findFirst({ where: { ma_don_hang: Number(orderId) } });
    if (anyShipment) {
      await prisma.don_van_chuyen.update({
        where: { id: anyShipment.id },
        data: {
          ma_doi_tac: doiTac.id,
          ma_van_don: orderCode,
          trang_thai: "ready_to_pick",
          ngay_giao_du_kien: expectedDate,
        },
      });
    } else {
      await prisma.don_van_chuyen.create({
        data: {
          ma_don_hang: Number(orderId),
          ma_doi_tac: doiTac.id,
          ma_van_don: orderCode,
          trang_thai: "ready_to_pick",
          ngay_giao_du_kien: expectedDate,
        },
      });
    }

    // Cập nhật trạng thái đơn hàng → DANG_GIAO_HANG
    await prisma.don_hang.update({ where: { id: Number(orderId) }, data: { trang_thai: "DANG_GIAO_HANG" } });
    await prisma.lich_su_don_hang.create({ data: { ma_don_hang: Number(orderId), trang_thai: "DANG_GIAO_HANG" } });

    return NextResponse.json({ success: true, order_code: orderCode });
  } catch (err: any) {
    console.error("❌ GHN create-order error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
