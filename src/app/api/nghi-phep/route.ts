import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lấy danh sách đơn xin nghỉ (Có thể lọc theo trạng thái)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trang_thai = searchParams.get('trang_thai'); // CHO_DUYET, DA_DUYET, TU_CHOI

    const danhSachDon = await prisma.don_xin_nghi.findMany({
      where: {
        ...(trang_thai ? { trang_thai: trang_thai as any } : {})
      },
      include: {
        nguoi_dung: {
          select: {
            ho_so_nguoi_dung: { select: { ho_ten: true, chuc_vu: true } }
          }
        },
        nguoi_dung_duyet: {
          select: {
            ho_so_nguoi_dung: { select: { ho_ten: true } }
          }
        }
      },
      orderBy: { ngay_tao: 'desc' }
    });

    return NextResponse.json({ success: true, data: danhSachDon });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách đơn' }, { status: 500 });
  }
}

// POST: Gửi đơn xin nghỉ mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, loai_nghi, ngay_bat_dau, ngay_ket_thuc, ly_do } = body;

    const donMoi = await prisma.don_xin_nghi.create({
      data: {
        ma_nguoi_dung,
        loai_nghi,
        ngay_bat_dau: new Date(ngay_bat_dau),
        ngay_ket_thuc: new Date(ngay_ket_thuc),
        ly_do,
        trang_thai: 'CHO_DUYET'
      }
    });

    return NextResponse.json({ success: true, data: donMoi }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi gửi đơn' }, { status: 500 });
  }
}