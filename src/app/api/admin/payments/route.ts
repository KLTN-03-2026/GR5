import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Lấy dữ liệu từ bảng giao_dich_thanh_toan
    const payments = await prisma.giao_dich_thanh_toan.findMany({
      include: {
        // Kéo thông tin đơn hàng và người dùng liên quan
        don_hang: {
          select: {
            id: true,
            nguoi_dung: {
              select: {
                email: true,
                ho_so_nguoi_dung: {
                  select: { ho_ten: true }
                }
              }
            },
            yeu_cau_doi_tra: {
              select: { trang_thai: true }
            }
          }
        },
        // Kéo tên phương thức thanh toán
        phuong_thuc_thanh_toan: {
          select: { ten_phuong_thuc: true }
        }
      },
      orderBy: {
        ngay_tao: 'desc'
      }
    });

    // 2. Chuyển đổi dữ liệu (Format) để giao diện Frontend dễ hiển thị
    const formattedPayments = payments.map(payment => {
      
      // Xác định trạng thái thanh toán (Mapping từ DB lên UI)
      let paymentStatus = payment.trang_thai; // Lấy trạng thái gốc từ bảng giao_dich_thanh_toan

      // Nếu đơn hàng này đang bị Hoàn trả (Yêu cầu đã duyệt) thì ghi đè trạng thái thành DA_HOAN_TIEN
      if (payment.don_hang?.yeu_cau_doi_tra?.length && payment.don_hang.yeu_cau_doi_tra[0].trang_thai === 'DA_DUYET') {
        paymentStatus = 'DA_HOAN_TIEN';
      }

      // Xử lý tên phương thức thanh toán
      // Giả sử ten_phuong_thuc trong DB là "Thanh toán khi nhận hàng", "Chuyển khoản ngân hàng", "VNPay"...
      // Mình gán tạm một string ngắn gọn để UI dễ xử lý icon (COD, CHUYEN_KHOAN, VNPAY)
      let methodShortName = 'COD';
      const methodNameDb = payment.phuong_thuc_thanh_toan?.ten_phuong_thuc?.toLowerCase() || '';
      
      if (methodNameDb.includes('vnpay')) {
        methodShortName = 'VNPAY';
      } else if (methodNameDb.includes('chuyển khoản') || methodNameDb.includes('ngân hàng') || methodNameDb.includes('banking')) {
        methodShortName = 'CHUYEN_KHOAN';
      }

      return {
        id: payment.id, // ID của giao dịch
        ma_don_hang: payment.ma_don_hang,
        tong_tien: payment.so_tien, // Cột số tiền trong bảng giao dịch
        phuong_thuc_thanh_toan: methodShortName, // COD, VNPAY, CHUYEN_KHOAN
        phuong_thuc_goc: payment.phuong_thuc_thanh_toan?.ten_phuong_thuc, // Tên đầy đủ
        trang_thai_thanh_toan: paymentStatus, // CHO_THANH_TOAN, DA_THANH_TOAN, THAT_BAI, DA_HOAN_TIEN
        ngay_tao: payment.ngay_tao,
        ma_giao_dich_ben_ngoai: payment.ma_giao_dich_ben_ngoai, // Mã tham chiếu VNPay (nếu có)
        nguoi_dung: payment.don_hang?.nguoi_dung // Đẩy cục người dùng ra ngoài cho UI dễ lấy
      };
    });

    return NextResponse.json(formattedPayments);
    
  } catch (error: any) {
    console.error("❌ Lỗi GET Admin Payments:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải dữ liệu thanh toán" }, 
      { status: 500 }
    );
  }
}