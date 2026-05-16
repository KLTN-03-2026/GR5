import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pos = await prisma.phieu_nhap_kho.findMany({
      include: {
        nha_cung_cap: true,
        chi_tiet_phieu_nhap: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: true }
            }
          }
        }
      },
      orderBy: { ngay_tao: 'desc' },
      take: 50
    });

    return NextResponse.json(pos);
  } catch (error: any) {
    console.error('[GET /api/admin/warehouse/receiving/today]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
