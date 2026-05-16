import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';
    
    const now = new Date();
    let startDate = new Date();
    
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Get total import quantity and value in period
    const imports = await prisma.chi_tiet_phieu_nhap.findMany({
      where: {
        phieu_nhap_kho: {
          ngay_tao: { gte: startDate }
        }
      },
      include: {
        bien_the_san_pham: {
          include: {
            san_pham: {
              include: { danh_muc: true }
            }
          }
        }
      }
    });

    const categoryStats: Record<string, { importQty: number, importValue: number, wasteQty: number, wasteValue: number }> = {};
    let totalImportQty = 0;
    
    imports.forEach(imp => {
      const cat = imp.bien_the_san_pham.san_pham?.danh_muc?.ten_danh_muc || 'Không phân loại';
      const qty = imp.so_luong_thuc_nhan || imp.so_luong_yeu_cau || 0;
      const val = qty * Number(imp.don_gia || 0);

      if (!categoryStats[cat]) {
        categoryStats[cat] = { importQty: 0, importValue: 0, wasteQty: 0, wasteValue: 0 };
      }
      categoryStats[cat].importQty += qty;
      categoryStats[cat].importValue += val;
      totalImportQty += qty;
    });

    // 2. Get total wastage (exports that are not sales and not returns to supplier)
    // Common indicator for wastage: ly_do_xuat contains specific keywords OR it's an internal export
    const wastages = await prisma.chi_tiet_phieu_xuat.findMany({
      where: {
        phieu_xuat_kho: {
          ngay_tao: { gte: startDate },
          ma_don_hang: null,
          ma_phieu_tra_ncc: null,
          // We could also explicitly filter by ly_do_xuat if we have standard values like 'HUY', 'HAO_HUT'
        }
      },
      include: {
        phieu_xuat_kho: true,
        bien_the_san_pham: {
          include: {
            san_pham: {
              include: { danh_muc: true }
            }
          }
        }
      }
    });

    const wastageItemsMap: Record<number, { 
      variantId: number, sku: string, name: string, variant: string, unit: string, category: string,
      wasteQty: number, wasteValue: number, reason: string
    }> = {};

    let totalWasteQty = 0;
    let totalWasteValue = 0;
    const reasonsMap: Record<string, number> = {};

    wastages.forEach(waste => {
      const bt = waste.bien_the_san_pham;
      const cat = bt.san_pham?.danh_muc?.ten_danh_muc || 'Không phân loại';
      const qty = waste.so_luong_thuc_xuat || waste.so_luong_yeu_cau || 0;
      
      // We don't have direct cost in export details, we use an approximation or 0 if not needed, 
      // but let's assume value = qty * some average or we just leave it as an estimated value.
      // Since we don't have cost here, we'll try to find it or just set to 0. 
      // For simplicity, we just use quantity.
      const val = 0; // We can improve this if needed

      if (!categoryStats[cat]) {
        categoryStats[cat] = { importQty: 0, importValue: 0, wasteQty: 0, wasteValue: 0 };
      }
      categoryStats[cat].wasteQty += qty;
      totalWasteQty += qty;
      totalWasteValue += val;

      const reason = waste.phieu_xuat_kho.ly_do_xuat || 'Khác';
      reasonsMap[reason] = (reasonsMap[reason] || 0) + qty;

      if (!wastageItemsMap[bt.id]) {
        wastageItemsMap[bt.id] = {
          variantId: bt.id,
          sku: bt.ma_sku || '',
          name: bt.san_pham?.ten_san_pham || 'Không xác định',
          variant: bt.ten_bien_the || '',
          unit: bt.don_vi_tinh || 'Cái',
          category: cat,
          wasteQty: 0,
          wasteValue: 0,
          reason
        };
      }
      wastageItemsMap[bt.id].wasteQty += qty;
      // We might want to append reasons if there are multiple
      if (!wastageItemsMap[bt.id].reason.includes(reason)) {
        wastageItemsMap[bt.id].reason += `, ${reason}`;
      }
    });

    const overallRate = totalImportQty > 0 ? (totalWasteQty / totalImportQty) * 100 : 0;

    const categories = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      ...stats,
      rate: stats.importQty > 0 ? (stats.wasteQty / stats.importQty) * 100 : 0
    }));

    const reasons = Object.entries(reasonsMap).map(([name, value]) => ({ name, value }));
    const itemsList = Object.values(wastageItemsMap).sort((a, b) => b.wasteQty - a.wasteQty);

    return NextResponse.json({
      summary: {
        totalImportQty,
        totalWasteQty,
        totalWasteValue,
        overallRate
      },
      categories,
      reasons,
      items: itemsList
    });

  } catch (error) {
    console.error("API Inventory Wastage Error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory wastage data" }, { status: 500 });
  }
}
