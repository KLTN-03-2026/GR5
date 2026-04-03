import { NextResponse } from 'next/server';
import { ImportGoodsSchema } from '@/schemas/warehouse.schema';
import { WarehouseService } from '@/services/admin/warehouse.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate dữ liệu
    const parsedData = ImportGoodsSchema.parse(body);

    // Gọi Service xử lý
    const result = await WarehouseService.createGoodsReceipt(parsedData);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("Import API Error:", error);
    return NextResponse.json(
      { success: false, message: error.errors ? error.errors[0].message : error.message },
      { status: 400 }
    );
  }
}