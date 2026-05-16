import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_ADDRESSES = 5;
const PHONE_REGEX = /^0\d{9,10}$/;

async function getAuthUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function verifyOwnership(addressId: number, userId: number): Promise<boolean> {
  const address = await prisma.dia_chi_nguoi_dung.findUnique({
    where: { id: addressId },
    select: { ma_nguoi_dung: true },
  });
  return address?.ma_nguoi_dung === userId;
}

// [GET] Lấy danh sách địa chỉ
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.dia_chi_nguoi_dung.findMany({
    where: { ma_nguoi_dung: userId },
    orderBy: { la_mac_dinh: "desc" },
  });
  return NextResponse.json(addresses);
}

// [POST] Thêm địa chỉ mới
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    chi_tiet_dia_chi,
    ho_ten, so_dien_thoai,
    tinh_thanh, quan_huyen, phuong_xa,
    ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn,
  } = await req.json();

  if (so_dien_thoai && !PHONE_REGEX.test(so_dien_thoai)) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)" }, { status: 400 });
  }

  const count = await prisma.dia_chi_nguoi_dung.count({
    where: { ma_nguoi_dung: userId },
  });

  if (count >= MAX_ADDRESSES) {
    return NextResponse.json({ error: `Bạn chỉ được lưu tối đa ${MAX_ADDRESSES} địa chỉ` }, { status: 400 });
  }

  const address = await prisma.dia_chi_nguoi_dung.create({
    data: {
      ma_nguoi_dung: userId,
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
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    id, action,
    chi_tiet_dia_chi,
    ho_ten, so_dien_thoai,
    tinh_thanh, quan_huyen, phuong_xa,
    ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn,
  } = await req.json();

  if (!await verifyOwnership(Number(id), userId)) {
    return NextResponse.json({ error: "Không có quyền thao tác địa chỉ này" }, { status: 403 });
  }

  if (action === "set-default") {
    await prisma.dia_chi_nguoi_dung.updateMany({
      where: { ma_nguoi_dung: userId },
      data: { la_mac_dinh: false },
    });
    await prisma.dia_chi_nguoi_dung.update({
      where: { id: Number(id) },
      data: { la_mac_dinh: true },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "update") {
    if (so_dien_thoai && !PHONE_REGEX.test(so_dien_thoai)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)" }, { status: 400 });
    }

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
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  if (!await verifyOwnership(Number(id), userId)) {
    return NextResponse.json({ error: "Không có quyền xoá địa chỉ này" }, { status: 403 });
  }

  await prisma.dia_chi_nguoi_dung.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
