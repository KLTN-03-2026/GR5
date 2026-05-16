import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_STATUSES = ["CHO_THANH_TOAN", "DA_THANH_TOAN", "THAT_BAI", "DA_HOAN_TIEN"];

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "ID thanh toán không hợp lệ" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Trạng thái không hợp lệ. Giá trị cho phép: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.giao_dich_thanh_toan.update({
      where: { id: numericId },
      data: { trang_thai: status },
    });

    return NextResponse.json({ success: true, data: updatedPayment });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy giao dịch thanh toán" },
        { status: 404 }
      );
    }

    console.error("Lỗi cập nhật thanh toán:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật thanh toán" },
      { status: 500 }
    );
  }
}
