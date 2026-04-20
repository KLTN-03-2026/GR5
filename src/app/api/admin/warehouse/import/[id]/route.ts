import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const receiptId = Number(params.id);
    if (Number.isNaN(receiptId)) {
      return NextResponse.json({ error: "ID phiếu không hợp lệ" }, { status: 400 });
    }

    const data = await WarehouseAdminService.getReceiptDetail(receiptId);
    if (!data) {
      return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/warehouse/import/[id]]", error);
    return NextResponse.json({ error: "Không thể tải chi tiết phiếu" }, { status: 500 });
  }
}