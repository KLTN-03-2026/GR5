export const dynamic = 'force-dynamic'; // Tắt cache vĩnh viễn

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { noi_dung: { contains: search } },
        { san_pham: { ten_san_pham: { contains: search } } },
        { nguoi_dung: { ho_so_nguoi_dung: { ho_ten: { contains: search } } } },
      ];
    }

    const [total, reviewsData] = await Promise.all([
      prisma.danh_gia_san_pham.count({ where }),
      prisma.danh_gia_san_pham.findMany({
        where,
        include: {
          san_pham: {
            select: { ten_san_pham: true, anh_san_pham: { take: 1 } }
          },
          nguoi_dung: {
            select: { 
              email: true,
              ho_so_nguoi_dung: true 
            }
          }
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      })
    ]);

    // Format dữ liệu để map đúng với r.nguoi_dung?.ho_ten mà frontend đang sử dụng
    const formattedReviews = reviewsData.map((r) => ({
      ...r,
      nguoi_dung: {
        ...r.nguoi_dung,
        ho_ten: r.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || r.nguoi_dung?.email
      }
    }));

    return NextResponse.json({
      data: formattedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("LỖI LẤY ĐÁNH GIÁ:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}