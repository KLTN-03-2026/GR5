import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ma_ncc = parseInt(id);

    if (isNaN(ma_ncc)) {
      return NextResponse.json(
        { error: "ID nhà cung cấp không hợp lệ" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    // Get IDs of products already linked to this NCC
    const linkedProducts = await prisma.ncc_san_pham.findMany({
      where: { ma_ncc },
      select: { ma_san_pham: true },
    });

    const linkedProductIds = linkedProducts.map((p) => p.ma_san_pham);

    // Search products excluding already linked ones
    const products = await prisma.san_pham.findMany({
      where: {
        ten_san_pham: {
          contains: q,
        },
        ...(linkedProductIds.length > 0 && {
          id: { notIn: linkedProductIds },
        }),
      },
      select: {
        id: true,
        ten_san_pham: true,
      },
      take: 10,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error searching products for NCC:", error);
    return NextResponse.json(
      { error: "Lỗi khi tìm kiếm sản phẩm" },
      { status: 500 }
    );
  }
}
