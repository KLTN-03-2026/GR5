import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      vai_tro_nguoi_dung: {
        some: {
          vai_tro: {
            ten_vai_tro: "KHACH_HANG"
          }
        }
      }
    };

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { ho_so_nguoi_dung: { ho_ten: { contains: search } } },
        { ho_so_nguoi_dung: { so_dien_thoai: { contains: search } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.nguoi_dung.count({ where }),
      prisma.nguoi_dung.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngay_tao: "desc" },
        include: {
          ho_so_nguoi_dung: true,
          _count: {
            select: { don_hang: true }
          },
          don_hang: {
            where: { trang_thai: "DA_GIAO" },
            select: { tong_tien: true }
          }
        }
      })
    ]);

    const data = users.map(user => {
      const totalSpent = user.don_hang.reduce((sum, order) => sum + Number(order.tong_tien || 0), 0);
      
      return {
        id: `KH${user.id.toString().padStart(4, '0')}`,
        rawId: user.id,
        name: user.ho_so_nguoi_dung?.ho_ten || "Khách hàng",
        email: user.email,
        phone: user.ho_so_nguoi_dung?.so_dien_thoai || "Chưa cập nhật",
        orders: user._count.don_hang,
        spent: totalSpent.toLocaleString('vi-VN') + 'đ',
        rawSpent: totalSpent,
        joined: user.ngay_tao ? new Date(user.ngay_tao).getFullYear().toString() : "N/A",
        segment: totalSpent > 10000000 ? "VIP" : totalSpent > 2000000 ? "Loyal" : "Mới",
        points: Math.floor(totalSpent / 10000).toLocaleString('en-US'),
        refundRate: "0%",
        notes: "Khách hàng từ hệ thống",
        avatar: user.ho_so_nguoi_dung?.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.ho_so_nguoi_dung?.ho_ten || user.email)}&background=random`
      };
    });

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách khách hàng:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
