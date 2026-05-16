import { NextResponse } from 'next/server';
import { ScanGoodsSchema } from '@/schemas/warehouse.schema';
import { WarehouseService } from '@/services/admin/warehouse.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scannedQR, expectedQR, phieuXuatId } = ScanGoodsSchema.parse(body);

    const pxId = phieuXuatId || (await (async () => {
      const { default: prisma } = await import("@/lib/prisma");
      const px = await prisma.phieu_xuat_kho.create({ data: { ly_do_xuat: "XUAT_QUET_QR", trang_thai: "HOAN_THANH" } });
      return px.id;
    })());

    const result = await WarehouseService.scanAndIssueItem(scannedQR, pxId);

    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.errors ? error.errors[0].message : error.message },
      { status: 400 }
    );
  }
}