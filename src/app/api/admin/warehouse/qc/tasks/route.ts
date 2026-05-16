import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const tasks = await prisma.nhiem_vu_kiem_dinh.findMany({
      where: status && status !== 'ALL' ? {
        trang_thai: status
      } : {},
      include: {
        chi_tiet_nhap: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: true
              }
            },
            phieu_nhap_kho: {
              include: {
                nha_cung_cap: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_cap_nhat: 'asc' // Lâu nhất lên đầu
      }
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error('[GET /api/admin/warehouse/qc/tasks]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
