import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const sessionUserId = Number((session.user as any).id);
    const { id } = await params;
    const orderId = Number(id);

    const order = await prisma.don_hang.findUnique({
      where: { id: orderId },
      include: {
        nguoi_dung: {
          select: {
            email: true,
            ho_so_nguoi_dung: {
              select: { ho_ten: true, so_dien_thoai: true, anh_dai_dien: true }
            },
            dia_chi_nguoi_dung: {
              where: { la_mac_dinh: true },
              take: 1,
            }
          }
        },
        chi_tiet_don_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: {
                  include: { anh_san_pham: { take: 1 } }
                }
              }
            }
          }
        },
        don_van_chuyen: true,
        yeu_cau_doi_tra: true,
        giao_dich_thanh_toan: true,
        ma_giam_gia: true,
        lich_su_don_hang: {
          orderBy: { thoi_gian_doi: "asc" }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    if (order.ma_nguoi_dung !== sessionUserId) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền xem đơn hàng này" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Lỗi GET chi tiết đơn hàng:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
