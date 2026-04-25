import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    const skip = (page - 1) * limit;

    const [total, promos] = await Promise.all([
      prisma.ma_giam_gia.count(),
      prisma.ma_giam_gia.findMany({
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: promos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("LỖI GET KHUYẾN MÃI:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPromo = await prisma.ma_giam_gia.create({
      data: {
        ma_code: body.ma_code.toUpperCase(), // Tự động viết hoa chữ cái mã code
        loai_giam_gia: body.loai_giam_gia || "PHAN_TRAM",
        gia_tri_giam: body.gia_tri_giam ? parseFloat(body.gia_tri_giam) : null,
        don_toi_thieu: body.don_toi_thieu ? parseFloat(body.don_toi_thieu) : null,
        gioi_han_su_dung: body.gioi_han_su_dung ? parseInt(body.gioi_han_su_dung) : null,
        ngay_bat_dau: body.ngay_bat_dau ? new Date(body.ngay_bat_dau) : null,
        ngay_ket_thuc: body.ngay_ket_thuc ? new Date(body.ngay_ket_thuc) : null,
      }
    });
    return NextResponse.json(newPromo, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Mã giảm giá này đã tồn tại!" }, { status: 400 });
    }
    console.error("LỖI LƯU KHUYẾN MÃI:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}