import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ma_ncc = parseInt(id);

    if (isNaN(ma_ncc)) {
      return NextResponse.json(
        { error: "ID nhà cung cấp không hợp lệ" },
        { status: 400 }
      );
    }

    const products = await prisma.ncc_san_pham.findMany({
      where: { ma_ncc },
      include: {
        san_pham: {
          select: {
            id: true,
            ten_san_pham: true,
          },
        },
      },
      orderBy: { ngay_cap_nhat_gia: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching NCC products:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách sản phẩm của NCC" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ma_ncc = parseInt(id);

    if (isNaN(ma_ncc)) {
      return NextResponse.json(
        { error: "ID nhà cung cấp không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      ma_san_pham,
      gia_nhap_gan_nhat,
      don_vi_tinh,
      so_luong_toi_thieu,
      thoi_gian_giao_hang_ngay,
      ghi_chu,
    } = body;

    if (!ma_san_pham) {
      return NextResponse.json(
        { error: "Mã sản phẩm là bắt buộc" },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await prisma.ncc_san_pham.findUnique({
      where: {
        ma_ncc_ma_san_pham: {
          ma_ncc,
          ma_san_pham: parseInt(ma_san_pham),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Sản phẩm này đã được liên kết với nhà cung cấp" },
        { status: 409 }
      );
    }

    const created = await prisma.ncc_san_pham.create({
      data: {
        ma_ncc,
        ma_san_pham: parseInt(ma_san_pham),
        gia_nhap_gan_nhat: gia_nhap_gan_nhat ?? null,
        don_vi_tinh: don_vi_tinh ?? null,
        so_luong_toi_thieu: so_luong_toi_thieu ?? 1,
        thoi_gian_giao_hang_ngay: thoi_gian_giao_hang_ngay ?? 1,
        ghi_chu: ghi_chu ?? null,
        ngay_cap_nhat_gia: new Date(),
      },
      include: {
        san_pham: {
          select: {
            id: true,
            ten_san_pham: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating NCC product:", error);
    return NextResponse.json(
      { error: "Lỗi khi thêm sản phẩm cho NCC" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ma_ncc = parseInt(id);

    if (isNaN(ma_ncc)) {
      return NextResponse.json(
        { error: "ID nhà cung cấp không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      ncc_san_pham_id,
      gia_nhap_gan_nhat,
      don_vi_tinh,
      so_luong_toi_thieu,
      thoi_gian_giao_hang_ngay,
      ghi_chu,
    } = body;

    if (!ncc_san_pham_id) {
      return NextResponse.json(
        { error: "ID bản ghi NCC sản phẩm là bắt buộc" },
        { status: 400 }
      );
    }

    const updated = await prisma.ncc_san_pham.update({
      where: { id: parseInt(ncc_san_pham_id) },
      data: {
        ...(gia_nhap_gan_nhat !== undefined && { gia_nhap_gan_nhat }),
        ...(don_vi_tinh !== undefined && { don_vi_tinh }),
        ...(so_luong_toi_thieu !== undefined && { so_luong_toi_thieu }),
        ...(thoi_gian_giao_hang_ngay !== undefined && { thoi_gian_giao_hang_ngay }),
        ...(ghi_chu !== undefined && { ghi_chu }),
        ngay_cap_nhat_gia: new Date(),
      },
      include: {
        san_pham: {
          select: {
            id: true,
            ten_san_pham: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating NCC product:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật sản phẩm NCC" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ma_ncc = parseInt(id);

    if (isNaN(ma_ncc)) {
      return NextResponse.json(
        { error: "ID nhà cung cấp không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ncc_san_pham_id } = body;

    if (!ncc_san_pham_id) {
      return NextResponse.json(
        { error: "ID bản ghi NCC sản phẩm là bắt buộc" },
        { status: 400 }
      );
    }

    await prisma.ncc_san_pham.delete({
      where: { id: parseInt(ncc_san_pham_id) },
    });

    return NextResponse.json({ message: "Xóa sản phẩm khỏi NCC thành công" });
  } catch (error) {
    console.error("Error deleting NCC product:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa sản phẩm khỏi NCC" },
      { status: 500 }
    );
  }
}
