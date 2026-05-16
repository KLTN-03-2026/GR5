import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // In a real app we check session role === "QUAN_LY" or "ADMIN"
    const userId = 1; 
    const userName = "Admin";

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) }
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    if (phieu.trang_thai !== "DA_KIEM_TRA") {
      return NextResponse.json({ error: "Chỉ phiếu DA_KIEM_TRA mới được yêu cầu kiểm tra lại" }, { status: 400 });
    }

    if (phieu.ma_ncc) {
      const ncc = await prisma.nha_cung_cap.findUnique({ where: { id: phieu.ma_ncc } });
      if (ncc) {
         const newNote = `[${new Date().toISOString()}] ${userName} → Yêu cầu kiểm tra lại lần ${phieu.lan_kiem_tra + 1}: ${body.ly_do}`;
         const updatedNote = ncc.ghi_chu_noi_bo ? ncc.ghi_chu_noi_bo + "\n" + newNote : newNote;
         await prisma.nha_cung_cap.update({
           where: { id: ncc.id },
           data: { ghi_chu_noi_bo: updatedNote }
         });
      }
    }

    const updated = await prisma.phieu_nhap_kho.update({
      where: { id: Number(id) },
      data: {
        trang_thai: "DANG_KIEM_TRA_LAI",
        ly_do_kiem_tra_lai: body.ly_do,
        nguoi_yeu_cau_lai_id: userId,
        ngay_yeu_cau_kiem_tra_lai: new Date(),
        lan_kiem_tra: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, trang_thai: "DANG_KIEM_TRA_LAI" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
