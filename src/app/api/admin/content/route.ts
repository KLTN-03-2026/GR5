import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner_quang_cao.findMany({
      orderBy: { thu_tu_sap_xep: "asc" },
    });
    return NextResponse.json(banners);
  } catch {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const thu_tu = parseInt(body.thu_tu_sap_xep);

    const banner = await prisma.banner_quang_cao.create({
      data: {
        tieu_de: body.tieu_de || "Banner không tên",
        mo_ta: body.mo_ta || null,
        duong_dan_anh: body.duong_dan_anh || "",
        lien_ket: body.lien_ket || null,
        loai_banner: body.loai_banner || "hero",
        thu_tu_sap_xep: isNaN(thu_tu) ? 0 : thu_tu,
        dang_hoat_dong: body.dang_hoat_dong !== false,
        ngay_bat_dau: body.ngay_bat_dau ? new Date(body.ngay_bat_dau) : null,
        ngay_ket_thuc: body.ngay_ket_thuc ? new Date(body.ngay_ket_thuc) : null,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/content error:", error);
    return NextResponse.json({ error: "Không thể lưu vào Database" }, { status: 500 });
  }
}
