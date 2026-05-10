import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const sort = searchParams.get("sort") || "newest";

    const where: any = {
      vai_tro_nguoi_dung: {
        some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } },
      },
    };

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { ho_so_nguoi_dung: { ho_ten: { contains: search } } },
        { ho_so_nguoi_dung: { so_dien_thoai: { contains: search } } },
      ];
    }

    const [total, rawCustomers] = await Promise.all([
      prisma.nguoi_dung.count({ where }),
      prisma.nguoi_dung.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          ngay_tao: true,
          trang_thai: true,
          ho_so_nguoi_dung: {
            select: { ho_ten: true, so_dien_thoai: true, anh_dai_dien: true, gioi_tinh: true, ngay_sinh: true },
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
        orderBy: sort === "spent" ? { id: "desc" } : { ngay_tao: "desc" },
      }),
    ]);

    const customers = rawCustomers.map((user) => {
      const tongChiTieu = user.don_hang.reduce((sum, don) => sum + Number(don.tong_tien || 0), 0);
      const donGiao = user.don_hang.filter((d) => d.trang_thai === "DA_GIAO").length;
      const lastOrder = user.don_hang.length > 0
        ? user.don_hang.sort((a, b) => new Date(b.ngay_tao!).getTime() - new Date(a.ngay_tao!).getTime())[0].ngay_tao
        : null;
      const diaChi = user.dia_chi_nguoi_dung[0];

      return {
        id: user.id,
        ten: user.ho_so_nguoi_dung?.ho_ten || "Chưa cập nhật",
        email: user.email,
        sdt: user.ho_so_nguoi_dung?.so_dien_thoai || null,
        avatar: user.ho_so_nguoi_dung?.anh_dai_dien || null,
        gioi_tinh: user.ho_so_nguoi_dung?.gioi_tinh || null,
        ngay_tao: user.ngay_tao,
        trang_thai: user.trang_thai,
        tinh_thanh: diaChi?.tinh_thanh || null,
        quan_huyen: diaChi?.quan_huyen || null,
        tong_don: user._count.don_hang,
        don_giao: donGiao,
        tong_chi_tieu: tongChiTieu,
        don_cuoi: lastOrder,
      };
    });

    if (sort === "spent") {
      customers.sort((a, b) => b.tong_chi_tieu - a.tong_chi_tieu);
    }

    // Stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await prisma.nguoi_dung.count({
      where: {
        vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } } },
        ngay_tao: { gte: startOfMonth },
      },
    });

    const repeatBuyers = rawCustomers.filter((u) => u._count.don_hang > 1).length;
    const repeatRate = total > 0 ? Math.round((repeatBuyers / Math.min(total, rawCustomers.length)) * 100) : 0;

    return NextResponse.json({
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        newThisMonth,
        repeatRate,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu khách hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
