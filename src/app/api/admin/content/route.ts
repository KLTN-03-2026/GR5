import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contents = await prisma.banner_quang_cao.findMany({
      orderBy: { thu_tu_sap_xep: 'asc' }
    });
    return NextResponse.json(contents);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ép kiểu an toàn chống sập DB
    const thu_tu = parseInt(body.thu_tu_sap_xep);
    const safeThuTu = isNaN(thu_tu) ? 0 : thu_tu;
    const isActive = body.dang_hoat_dong === true || body.dang_hoat_dong === "true";

    const newContent = await prisma.banner_quang_cao.create({
      data: {
        tieu_de: body.tieu_de || "Nội dung không tên",
        duong_dan_anh: body.duong_dan_anh || "",
        thu_tu_sap_xep: safeThuTu,
        dang_hoat_dong: isActive
      }
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error: any) {
    console.error("🔥 LỖI LƯU CONTENT:", error); 
    return NextResponse.json({ error: "Không thể lưu vào Database" }, { status: 500 });
  }
}