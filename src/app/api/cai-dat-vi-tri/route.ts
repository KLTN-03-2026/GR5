import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const viTri = await prisma.cai_dat_vi_tri.findFirst({
      where: { dang_kich_hoat: true },
    });
    return NextResponse.json({ success: true, data: viTri });
  } catch (error) {
    console.error("[API_CAI_DAT_VI_TRI] GET Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ten_vi_tri, vi_do, kinh_do, ban_kinh = 500, dang_kich_hoat = true } = body;

    if (!ten_vi_tri || vi_do == null || kinh_do == null) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const existing = await prisma.cai_dat_vi_tri.findFirst({
      where: { dang_kich_hoat: true },
    });

    let result;
    if (existing) {
      result = await prisma.cai_dat_vi_tri.update({
        where: { id: existing.id },
        data: { ten_vi_tri, vi_do, kinh_do, ban_kinh, dang_kich_hoat },
      });
    } else {
      result = await prisma.cai_dat_vi_tri.create({
        data: { ten_vi_tri, vi_do, kinh_do, ban_kinh, dang_kich_hoat },
      });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("[API_CAI_DAT_VI_TRI] POST Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
