import { NextResponse } from 'next/server';
import { ScanGoodsSchema } from '@/schemas/warehouse.schema';
import { WarehouseService } from '@/services/admin/warehouse.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scannedQR, expectedQR } = ScanGoodsSchema.parse(body);

    const result = await WarehouseService.scanAndIssueItem(scannedQR);

    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.errors ? error.errors[0].message : error.message },
      { status: 400 }
    );
  }
}