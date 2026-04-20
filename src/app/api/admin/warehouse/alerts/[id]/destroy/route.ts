import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const alertId = Number(params.id);
    if (Number.isNaN(alertId)) {
      return NextResponse.json({ error: "ID cảnh báo không hợp lệ" }, { status: 400 });
    }

    const result = await WarehouseAdminService.approveDestroy(alertId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/admin/warehouse/alerts/[id]/destroy]", error);
    return NextResponse.json({ error: error.message || "Không thể duyệt tiêu hủy" }, { status: 500 });
  }
}