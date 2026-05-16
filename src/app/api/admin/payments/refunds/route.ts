import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const refunds = await prisma.lich_su_hoan_tien.findMany({
      include: {
        giao_dich_thanh_toan: {
          select: {
            id: true,
            ma_don_hang: true,
            so_tien: true,
            trang_thai: true,
          },
        },
        yeu_cau_doi_tra: true,
      },
      orderBy: {
        ngay_tao: "desc",
      },
    });

    return NextResponse.json(refunds);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hoàn tiền:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách hoàn tiền" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ma_giao_dich, so_tien, ma_yeu_cau_doi_tra } = body;

    if (!ma_giao_dich) {
      return NextResponse.json(
        { error: "Mã giao dịch là bắt buộc" },
        { status: 400 }
      );
    }

    if (!so_tien) {
      return NextResponse.json(
        { error: "Số tiền là bắt buộc" },
        { status: 400 }
      );
    }

    const refund = await prisma.lich_su_hoan_tien.create({
      data: {
        ma_giao_dich,
        so_tien,
        ma_yeu_cau_doi_tra: ma_yeu_cau_doi_tra || null,
      },
    });

    await prisma.giao_dich_thanh_toan.update({
      where: { id: ma_giao_dich },
      data: { trang_thai: "DA_HOAN_TIEN" },
    });

    return NextResponse.json(refund, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo bản ghi hoàn tiền:", error);
    return NextResponse.json(
      { error: "Không thể tạo bản ghi hoàn tiền" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, trang_thai } = body;

    if (!id || !trang_thai) {
      return NextResponse.json(
        { error: "ID và trạng thái là bắt buộc" },
        { status: 400 }
      );
    }

    const validStatuses = ["DANG_XU_LY", "DA_HOAN", "TU_CHOI"];
    if (!validStatuses.includes(trang_thai)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ. Các trạng thái hợp lệ: DANG_XU_LY, DA_HOAN, TU_CHOI" },
        { status: 400 }
      );
    }

    const updatedRefund = await prisma.lich_su_hoan_tien.update({
      where: { id },
      data: { trang_thai },
    });

    return NextResponse.json(updatedRefund);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái hoàn tiền:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái hoàn tiền" },
      { status: 500 }
    );
  }
}
