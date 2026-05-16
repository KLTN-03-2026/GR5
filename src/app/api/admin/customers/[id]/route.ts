import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const user = await prisma.nguoi_dung.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        ngay_tao: true,
        trang_thai: true,
        ho_so_nguoi_dung: {
          select: {
            ho_ten: true,
            so_dien_thoai: true,
            anh_dai_dien: true,
            gioi_tinh: true,
            ngay_sinh: true,
          },
        },
        dia_chi_nguoi_dung: {
          where: { la_mac_dinh: true },
          take: 1,
          select: { tinh_thanh: true, quan_huyen: true },
        },
        don_hang: {
          where: { trang_thai: { not: "DA_HUY" } },
          select: { tong_tien: true, trang_thai: true, ngay_tao: true },
        },
        _count: {
          select: { don_hang: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    const tongChiTieu = user.don_hang.reduce(
      (sum, don) => sum + Number(don.tong_tien || 0),
      0
    );
    const donGiao = user.don_hang.filter(
      (d) => d.trang_thai === "DA_GIAO"
    ).length;
    const lastOrder =
      user.don_hang.length > 0
        ? user.don_hang.sort(
            (a, b) =>
              new Date(b.ngay_tao!).getTime() -
              new Date(a.ngay_tao!).getTime()
          )[0].ngay_tao
        : null;
    const diaChi = user.dia_chi_nguoi_dung[0];

    return NextResponse.json({
      data: {
        id: user.id,
        ten: user.ho_so_nguoi_dung?.ho_ten || "Chưa cập nhật",
        email: user.email,
        sdt: user.ho_so_nguoi_dung?.so_dien_thoai || null,
        avatar: user.ho_so_nguoi_dung?.anh_dai_dien || null,
        gioi_tinh: user.ho_so_nguoi_dung?.gioi_tinh || null,
        ngay_sinh: user.ho_so_nguoi_dung?.ngay_sinh || null,
        ngay_tao: user.ngay_tao,
        trang_thai: user.trang_thai,
        tinh_thanh: diaChi?.tinh_thanh || null,
        quan_huyen: diaChi?.quan_huyen || null,
        tong_don: user._count.don_hang,
        don_giao: donGiao,
        tong_chi_tieu: tongChiTieu,
        don_cuoi: lastOrder,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin khách hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await req.json();
    const { ho_ten, so_dien_thoai, gioi_tinh, ngay_sinh, trang_thai, email } =
      body;

    const existingUser = await prisma.nguoi_dung.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    // Update nguoi_dung (email, trang_thai)
    const updatedUser = await prisma.nguoi_dung.update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(trang_thai !== undefined && { trang_thai: Number(trang_thai) }),
      },
    });

    // Upsert ho_so_nguoi_dung
    const profileData = {
      ...(ho_ten !== undefined && { ho_ten }),
      ...(so_dien_thoai !== undefined && { so_dien_thoai }),
      ...(gioi_tinh !== undefined && { gioi_tinh }),
      ...(ngay_sinh !== undefined && {
        ngay_sinh: ngay_sinh ? new Date(ngay_sinh) : null,
      }),
    };

    const updatedProfile = await prisma.ho_so_nguoi_dung.upsert({
      where: { ma_nguoi_dung: id },
      update: profileData,
      create: {
        ma_nguoi_dung: id,
        ...(profileData as any),
      },
    });

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        trang_thai: updatedUser.trang_thai,
        ho_ten: updatedProfile.ho_ten,
        so_dien_thoai: updatedProfile.so_dien_thoai,
        gioi_tinh: updatedProfile.gioi_tinh,
        ngay_sinh: updatedProfile.ngay_sinh,
      },
      message: "Cập nhật thông tin khách hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật khách hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
