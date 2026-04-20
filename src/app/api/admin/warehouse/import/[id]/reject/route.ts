import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const receiptId = Number(params.id);
    const body = await request.json();

    if (Number.isNaN(receiptId)) {
      return NextResponse.json({ error: "ID phiếu không hợp lệ" }, { status: 400 });
    }

    if (!body?.reason) {
      return NextResponse.json({ error: "Vui lòng nhập lý do từ chối" }, { status: 400 });
    }

    const result = await WarehouseAdminService.rejectReceipt(receiptId, String(body.reason));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/admin/warehouse/import/[id]/reject]", error);
    return NextResponse.json({ error: error.message || "Không thể từ chối phiếu" }, { status: 500 });
  }
}