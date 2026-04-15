import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    
    // ĐÃ FIX: Bỏ cái lọc trạng thái đi, chỉ tìm kiếm theo tên
    const whereCondition = search ? { ten_danh_muc: { contains: search } } : {};

    const [total, categories] = await Promise.all([
      prisma.danh_muc.count({ where: whereCondition }),
      prisma.danh_muc.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: { select: { san_pham: true } }
        }
      })
    ]);

    return NextResponse.json({
      data: categories,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ten_danh_muc } = body;
    if (!ten_danh_muc) return NextResponse.json({ error: "Tên danh mục không được để trống" }, { status: 400 });
    
    const newCategory = await prisma.danh_muc.create({
      data: { ten_danh_muc },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}