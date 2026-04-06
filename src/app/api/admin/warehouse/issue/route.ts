import { NextResponse } from 'next/server';
import { WarehouseService } from '@/services/admin/warehouse.service'; // Đảm bảo đường dẫn này trúng file service của bạn

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.qrCode) {
      return NextResponse.json({ error: "Vui lòng cung cấp mã QR" }, { status: 400 });
    }

    // Gọi vào hàm trí tuệ FEFO mà chúng ta đã code
    // (Mặc định truyền phieuXuatId = 1 để test, thực tế sẽ lấy từ chọn đơn hàng)
    const result = await WarehouseService.scanAndIssueItem(body.qrCode, 1);

    return NextResponse.json({ success: true, message: result.message });
    
  } catch (error: any) {
    // Nếu bị kẹt luật FEFO, nó sẽ văng lỗi ra đây và Frontend sẽ đỏ rực lên
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}