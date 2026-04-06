import { NextResponse } from 'next/server';
import { WarehouseService } from '@/services/admin/warehouse.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ép kiểu dữ liệu
    const parsedData = {
      ...body,
      ma_ncc: parseInt(body.ma_ncc),
      ma_bien_the: parseInt(body.ma_bien_the),
      so_luong_thung: parseInt(body.so_luong_thung),
    };

    // 1. Tạo phiếu (Ban đầu nó sẽ là CHO_DUYET)
    const draft = await WarehouseService.createDraftReceipt(parsedData);

    // 2. TỰ ĐỘNG DUYỆT LUÔN (Bỏ qua bước chờ quản lý)
    const result = await WarehouseService.approveReceipt(draft.id);

    // Trả về kết quả đã duyệt và mảng QR Code
    return NextResponse.json({ success: true, data: result }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}