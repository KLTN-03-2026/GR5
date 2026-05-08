import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// [GET] Lấy danh sách địa chỉ
export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.dia_chi_nguoi_dung.findMany({
    where: { nguoi_dung: { email: session.user.email } },
    orderBy: { la_mac_dinh: "desc" },
  });
  return NextResponse.json(addresses);
}

// [POST] Thêm địa chỉ mới
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const {
    chi_tiet_dia_chi,
    ho_ten, so_dien_thoai,
    tinh_thanh, quan_huyen, phuong_xa,
    ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn,
  } = await req.json();

  const count = await prisma.dia_chi_nguoi_dung.count({
    where: { ma_nguoi_dung: user.id },
  });

  const address = await prisma.dia_chi_nguoi_dung.create({
    data: {
      ma_nguoi_dung: user.id,
      chi_tiet_dia_chi,
      la_mac_dinh: count === 0,
      ho_ten: ho_ten || null,
      so_dien_thoai: so_dien_thoai || null,
      tinh_thanh: tinh_thanh || null,
      quan_huyen: quan_huyen || null,
      phuong_xa: phuong_xa || null,
      ma_tinh_ghn: ma_tinh_ghn ? Number(ma_tinh_ghn) : null,
      ma_quan_huyen_ghn: ma_quan_huyen_ghn ? Number(ma_quan_huyen_ghn) : null,
      ma_phuong_xa_ghn: ma_phuong_xa_ghn || null,
    } as any,
  });

  return NextResponse.json(address);
}

// [PUT] Đặt mặc định hoặc Cập nhật địa chỉ
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    id, action,
    chi_tiet_dia_chi,
    ho_ten, so_dien_thoai,
    tinh_thanh, quan_huyen, phuong_xa,
    ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn,
  } = await req.json();

  if (action === "set-default") {
    const user = await prisma.nguoi_dung.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    await prisma.dia_chi_nguoi_dung.updateMany({
      where: { ma_nguoi_dung: user?.id },
      data: { la_mac_dinh: false },
    });
    await prisma.dia_chi_nguoi_dung.update({
      where: { id: Number(id) },
      data: { la_mac_dinh: true },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "update") {
    await prisma.dia_chi_nguoi_dung.update({
      where: { id: Number(id) },
      data: {
        chi_tiet_dia_chi,
        ho_ten: ho_ten || null,
        so_dien_thoai: so_dien_thoai || null,
        tinh_thanh: tinh_thanh || null,
        quan_huyen: quan_huyen || null,
        phuong_xa: phuong_xa || null,
        ma_tinh_ghn: ma_tinh_ghn ? Number(ma_tinh_ghn) : null,
        ma_quan_huyen_ghn: ma_quan_huyen_ghn ? Number(ma_quan_huyen_ghn) : null,
        ma_phuong_xa_ghn: ma_phuong_xa_ghn || null,
      } as any,
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// [DELETE] Xóa địa chỉ
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.dia_chi_nguoi_dung.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
