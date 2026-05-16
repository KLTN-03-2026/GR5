import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.code);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Mã PO không hợp lệ' }, { status: 400 });
    }

    const po = await prisma.phieu_nhap_kho.findUnique({
      where: { id },
      include: {
        nha_cung_cap: true,
        chi_tiet_phieu_nhap: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: true,
              }
            }
          }
        }
      }
    });

    if (!po) {
      return NextResponse.json({ error: 'Không tìm thấy phiếu nhập' }, { status: 404 });
    }

    return NextResponse.json(po);
  } catch (error: any) {
    console.error('[GET /api/admin/warehouse/receiving/po/[code]]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
