import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Lấy dữ liệu từ bảng giao_dich_thanh_toan
    const payments = await prisma.giao_dich_thanh_toan.findMany({
      include: {
        don_hang: {
          include: {
            nguoi_dung: {
              include: {
                ho_so_nguoi_dung: true
              }
            },
            yeu_cau_doi_tra: true
          }
        },
        phuong_thuc_thanh_toan_ref: true,
        lich_su_hoan_tien: true
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
      // Ưu tiên dùng cột phuong_thuc_thanh_toan trực tiếp trên giao_dich_thanh_toan (VARCHAR(50))
      // Cột này lưu giá trị như "COD", "VNPAY", "MOMO", "CHUYEN_KHOAN"
      // Fallback sang phuong_thuc_thanh_toan_ref.ten_phuong_thuc nếu cột trực tiếp rỗng
      let methodShortName = 'COD';
      const directMethod = payment.phuong_thuc_thanh_toan?.toUpperCase()?.trim() || '';

      if (directMethod && ['COD', 'VNPAY', 'MOMO', 'CHUYEN_KHOAN'].includes(directMethod)) {
        // Dùng giá trị trực tiếp từ cột phuong_thuc_thanh_toan
        methodShortName = directMethod;
      } else {
        // Fallback: parse từ tên phương thức trong bảng tham chiếu
        const methodNameDb = payment.phuong_thuc_thanh_toan_ref?.ten_phuong_thuc?.toLowerCase() || '';
        if (methodNameDb.includes('vnpay')) {
          methodShortName = 'VNPAY';
        } else if (methodNameDb.includes('momo')) {
          methodShortName = 'MOMO';
        } else if (methodNameDb.includes('chuyển khoản') || methodNameDb.includes('ngân hàng') || methodNameDb.includes('banking')) {
          methodShortName = 'CHUYEN_KHOAN';
        }
      }

      return {
        id: payment.id, // ID của giao dịch
        ma_don_hang: payment.ma_don_hang,
        tong_tien: payment.so_tien, // Cột số tiền trong bảng giao dịch
        phi_van_chuyen: payment.don_hang?.phi_van_chuyen ?? 0, // Phí vận chuyển từ đơn hàng
        phuong_thuc_thanh_toan: methodShortName, // COD, VNPAY, MOMO, CHUYEN_KHOAN
        phuong_thuc_goc: payment.phuong_thuc_thanh_toan_ref?.ten_phuong_thuc, // Tên đầy đủ
        trang_thai_thanh_toan: paymentStatus, // CHO_THANH_TOAN, DA_THANH_TOAN, THAT_BAI, DA_HOAN_TIEN
        ngay_tao: payment.ngay_tao,
        ma_giao_dich_ben_ngoai: payment.ma_giao_dich_ben_ngoai, // Mã tham chiếu VNPay (nếu có)
        nguoi_dung: payment.don_hang?.nguoi_dung // Đẩy cục người dùng ra ngoài cho UI dễ lấy
      };
    });

    return NextResponse.json(formattedPayments);

  } catch (error: unknown) {
    console.error("Lỗi GET Admin Payments:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải dữ liệu thanh toán" },
      { status: 500 }
    );
  }
}