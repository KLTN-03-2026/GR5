import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) },
      include: { chi_tiet_phieu_nhap: true }
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    if (phieu.da_xac_nhan_kiem_tra) {
      return NextResponse.json({ error: "Phiếu đã được xác nhận kiểm tra" }, { status: 400 });
    }

    const hasNull = phieu.chi_tiet_phieu_nhap.some(ct => ct.so_luong_thuc_nhan === null || ct.so_luong_thuc_nhan === undefined);
    if (hasNull) {
      return NextResponse.json({ error: "Vui lòng nhập đủ số lượng thực nhận" }, { status: 400 });
    }

    await prisma.phieu_nhap_kho.update({
      where: { id: Number(id) },
      data: { da_xac_nhan_kiem_tra: true, trang_thai: "DA_KIEM_TRA" }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
