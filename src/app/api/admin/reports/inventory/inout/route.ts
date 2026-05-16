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

    // 1. Get current stock (Tồn Cuối Kỳ)
    const currentStock = await prisma.ton_kho_tong.findMany({
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: { include: { danh_muc: true } }
              }
            }
          }
        }
      }
    });

    const stockMap: Record<number, { 
      variantId: number, sku: string, name: string, variant: string, unit: string, 
      category: string, currentStock: number 
    }> = {};

    currentStock.forEach(item => {
      const bt = item.lo_hang?.bien_the_san_pham;
      if (!bt) return;
      if (!stockMap[bt.id]) {
        stockMap[bt.id] = {
          variantId: bt.id,
          sku: bt.ma_sku || '',
          name: bt.san_pham?.ten_san_pham || 'Không xác định',
          variant: bt.ten_bien_the || '',
          unit: bt.don_vi_tinh || 'Cái',
          category: bt.san_pham?.danh_muc?.ten_danh_muc || 'Khác',
          currentStock: 0
        };
      }
      stockMap[bt.id].currentStock += (item.so_luong || 0);
    });

    // 2. Get Import in period
    const imports = await prisma.chi_tiet_phieu_nhap.findMany({
      where: {
        phieu_nhap_kho: {
          ngay_tao: { gte: startDate }
        }
      }
    });

    const importMap: Record<number, number> = {};
    imports.forEach(imp => {
      importMap[imp.ma_bien_the] = (importMap[imp.ma_bien_the] || 0) + (imp.so_luong_thuc_nhan || imp.so_luong_yeu_cau || 0);
    });

    // 3. Get Export in period
    const exports = await prisma.chi_tiet_phieu_xuat.findMany({
      where: {
        phieu_xuat_kho: {
          ngay_tao: { gte: startDate }
        }
      }
    });

    const exportMap: Record<number, number> = {};
    exports.forEach(exp => {
      exportMap[exp.ma_bien_the] = (exportMap[exp.ma_bien_the] || 0) + (exp.so_luong_thuc_xuat || exp.so_luong_yeu_cau || 0);
    });

    // 4. Combine data
    // Add variants that might have zero current stock but had activity
    const allVariantIds = new Set([
      ...Object.keys(stockMap).map(Number),
      ...Object.keys(importMap).map(Number),
      ...Object.keys(exportMap).map(Number)
    ]);

    // If there are variants with activity but no current stock, we need to fetch their details
    const missingIds = Array.from(allVariantIds).filter(id => !stockMap[id]);
    if (missingIds.length > 0) {
      const missingVariants = await prisma.bien_the_san_pham.findMany({
        where: { id: { in: missingIds } },
        include: { san_pham: { include: { danh_muc: true } } }
      });
      missingVariants.forEach(bt => {
        stockMap[bt.id] = {
          variantId: bt.id,
          sku: bt.ma_sku || '',
          name: bt.san_pham?.ten_san_pham || 'Không xác định',
          variant: bt.ten_bien_the || '',
          unit: bt.don_vi_tinh || 'Cái',
          category: bt.san_pham?.danh_muc?.ten_danh_muc || 'Khác',
          currentStock: 0
        };
      });
    }

    const reportItems = Array.from(allVariantIds).map(id => {
      const info = stockMap[id];
      const nhap = importMap[id] || 0;
      const xuat = exportMap[id] || 0;
      const tonCuoi = info.currentStock;
      
      // Tồn Đầu = Tồn Cuối - Nhập + Xuất
      const tonDau = tonCuoi - nhap + xuat;

      return {
        id: info.sku,
        name: info.name,
        variant: info.variant,
        unit: info.unit,
        category: info.category,
        startStock: tonDau,
        import: nhap,
        export: xuat,
        endStock: tonCuoi
      };
    });

    let totalStart = 0;
    let totalImport = 0;
    let totalExport = 0;
    let totalEnd = 0;

    reportItems.forEach(item => {
      totalStart += item.startStock;
      totalImport += item.import;
      totalExport += item.export;
      totalEnd += item.endStock;
    });

    return NextResponse.json({
      summary: {
        totalStart,
        totalImport,
        totalExport,
        totalEnd
      },
      items: reportItems
    });

  } catch (error) {
    console.error("API Inventory InOut Error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory inout data" }, { status: 500 });
  }
}
