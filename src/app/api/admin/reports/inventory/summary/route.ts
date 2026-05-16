import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    // Lấy toàn bộ tồn kho có số lượng > 0
    const inventoryData = await prisma.ton_kho_tong.findMany({
      where: {
        so_luong: { gt: 0 }
      },
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: {
                  include: {
                    danh_muc: true
                  }
                }
              }
            },
            nha_cung_cap: true
          }
        },
        vi_tri_kho: true
      }
    });

    let totalQuantity = 0;
    let totalValue = 0;
    let expiringItems = 0;
    
    const currentDate = new Date();
    const WARNING_DAYS = 7; // <= 7 ngày là cận date theo kho-hang.md
    
    const items = inventoryData.map(item => {
      const quantity = item.so_luong || 0;
      const variant = item.lo_hang?.bien_the_san_pham;
      const product = variant?.san_pham;
      // Dùng giá gốc để tính giá trị tồn kho, nếu không có lấy giá bán
      const price = Number(variant?.gia_goc || variant?.gia_ban || 0);
      const value = quantity * price;
      
      totalQuantity += quantity;
      totalValue += value;

      const expDate = item.lo_hang?.han_su_dung ? new Date(item.lo_hang.han_su_dung) : null;
      let status = "NORMAL";
      let daysLeft = null;

      if (expDate) {
        const timeDiff = expDate.getTime() - currentDate.getTime();
        daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysLeft <= 0) {
          status = "EXPIRED";
          expiringItems++;
        } else if (daysLeft <= WARNING_DAYS) {
          status = "EXPIRING";
          expiringItems++;
        }
      }

      // Xử lý vị trí kho
      const viTri = item.vi_tri_kho;
      const locationString = viTri 
        ? `${viTri.khu_vuc || ''} - ${viTri.day || ''} - ${viTri.ke ? 'Kệ ' + viTri.ke : ''}`.replace(/ -  - | - $/g, '')
        : 'Chưa xếp kho';

      const inactiveDays = item.ngay_cap_nhat 
        ? Math.floor((currentDate.getTime() - new Date(item.ngay_cap_nhat).getTime()) / (1000 * 3600 * 24))
        : 0;

      return {
        id: variant?.ma_sku || `UNK-${item.id}`,
        name: product?.ten_san_pham || 'Sản phẩm không xác định',
        variant: variant?.ten_bien_the || '',
        unit: variant?.don_vi_tinh || '',
        category: product?.danh_muc?.ten_danh_muc || 'Không phân loại',
        supplier: item.lo_hang?.nha_cung_cap?.ten_ncc || 'Không rõ NCC',
        quantity,
        value,
        location: locationString,
        status,
        daysLeft,
        loHang: item.lo_hang?.ma_lo_hang,
        inactiveDays
      };
    });

    // Lọc theo danh mục nếu cần
    const filteredItems = category !== 'all' 
      ? items.filter(i => i.category.toLowerCase().includes(category.toLowerCase())) 
      : items;

    const summary = {
      totalItems: items.length, // Số lô/dòng mặt hàng
      totalQuantity,
      totalValue,
      expiringItems
    };

    return NextResponse.json({
      summary,
      items: filteredItems
    });
  } catch (error) {
    console.error("API Inventory Summary Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory summary" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
