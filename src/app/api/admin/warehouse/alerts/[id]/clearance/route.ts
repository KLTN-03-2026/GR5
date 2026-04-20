import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const alertId = Number(params.id);
    const body = await request.json();

    if (Number.isNaN(alertId)) {
      return NextResponse.json({ error: "ID cảnh báo không hợp lệ" }, { status: 400 });
    }

    const discountPercent = Number(body?.discountPercent);
    const endDate = body?.endDate ? new Date(body.endDate) : null;

    if (!discountPercent || Number.isNaN(discountPercent) || discountPercent <= 0) {
      return NextResponse.json({ error: "Vui lòng nhập % giảm hợp lệ" }, { status: 400 });
    }

    if (!endDate || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Vui lòng chọn ngày kết thúc hợp lệ" }, { status: 400 });
    }

    const result = await WarehouseAdminService.approveClearance(alertId, discountPercent, endDate);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/admin/warehouse/alerts/[id]/clearance]", error);
    return NextResponse.json({ error: error.message || "Không thể duyệt xả kho" }, { status: 500 });
  }
}