import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const receiptId = Number(params.id);
    if (Number.isNaN(receiptId)) {
      return NextResponse.json({ error: "ID phiếu không hợp lệ" }, { status: 400 });
    }

    const result = await WarehouseAdminService.approveReceipt(receiptId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/admin/warehouse/import/[id]/approve]", error);
    return NextResponse.json({ error: error.message || "Không thể duyệt phiếu" }, { status: 500 });
  }
}