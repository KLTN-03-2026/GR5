import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "import") as "import" | "export";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    const history = await WarehouseAdminService.getHistory(type, page, limit);
    return NextResponse.json(history);
  } catch (error) {
    console.error("[GET /api/admin/warehouse/history]", error);
    return NextResponse.json({ error: "Lỗi tải lịch sử giao dịch" }, { status: 500 });
  }
}
