import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Tìm đại 1 sản phẩm đang có trong kho
    const product = await prisma.san_pham.findFirst();
    if (!product) {
      return NextResponse.json({ error: "Sếp phải tạo ít nhất 1 sản phẩm trước đã!" }, { status: 400 });
    }

    // 2. Tìm đại 1 user (hoặc tạo 1 user khách vãng lai nếu DB chưa có ai)
    let user = await prisma.nguoi_dung.findFirst();
    
    if (!user) {
      // ĐÃ FIX: Chỉ chèn email và mat_khau theo đúng Schema nguoi_dung của sếp
      user = await prisma.nguoi_dung.create({
        data: {
          email: `khachtest_${Date.now()}@gmail.com`, // Thêm Date.now() để email không bị trùng nếu bấm nhiều lần
          mat_khau: "123456",
        }
      });
    }

    // 3. Bơm 3 cái đánh giá giả với đủ thể loại (5 sao, 3 sao, 1 sao bị ẩn)
    await prisma.danh_gia_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_nguoi_dung: user.id,
          so_sao: 5,
          noi_dung: "Sản phẩm tuyệt vời! Rau rất tươi, giao hàng nhanh. Sẽ ủng hộ shop dài dài.",
          trang_thai: "HIEN_THI"
        },
        {
          ma_san_pham: product.id,
          ma_nguoi_dung: user.id,
          so_sao: 3,
          noi_dung: "Giao hàng hơi lâu, trái cây bị cấn dập 1 xíu nhưng ăn vẫn ngọt. Tạm cho 3 sao.",
          trang_thai: "HIEN_THI"
        },
        {
          ma_san_pham: product.id,
          ma_nguoi_dung: user.id,
          so_sao: 1,
          noi_dung: "Shop làm ăn chán quá, giao nhầm hàng cho tôi. Thái độ nhân viên lồi lõm!!!!",
          trang_thai: "DA_AN" // Tự động ẩn luôn để sếp test
        }
      ]
    });

    return NextResponse.json({ message: "🎉 Đã bơm 3 đánh giá giả thành công! Sếp quay lại trang Admin gõ F5 xem nhé!" });
  } catch (error: any) {
    console.error("LỖI BƠM DỮ LIỆU:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}