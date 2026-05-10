import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/store/reviews?product_id=xxx&page=1&limit=10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = parseInt(searchParams.get("product_id") || "0");
  const page      = parseInt(searchParams.get("page")       || "1");
  const limit     = parseInt(searchParams.get("limit")      || "5");
  const starFilter = searchParams.get("star") ? parseInt(searchParams.get("star")!) : null;

  if (!productId) return NextResponse.json({ error: "Thiếu product_id" }, { status: 400 });

  const where: any = { ma_san_pham: productId, trang_thai: "DA_DUYET" };
  if (starFilter) where.so_sao = starFilter;

  const [total, data, aggregate] = await Promise.all([
    prisma.danh_gia_san_pham.count({ where }),
    prisma.danh_gia_san_pham.findMany({
      where,
      include: {
        nguoi_dung: {
          select: {
            email: true,
            ho_so_nguoi_dung: { select: { ho_ten: true, anh_dai_dien: true } },
          },
        },
        anh_danh_gia: { select: { duong_dan_anh: true } },
      },
      orderBy: { ngay_tao: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    // tổng hợp sao
    prisma.danh_gia_san_pham.groupBy({
      by: ["so_sao"],
      where: { ma_san_pham: productId, trang_thai: "DA_DUYET" },
      _count: { id: true },
    }),
  ]);

  const avgRow = await prisma.danh_gia_san_pham.aggregate({
    where: { ma_san_pham: productId, trang_thai: "DA_DUYET" },
    _avg: { so_sao: true },
  });

  const reviews = data.map(r => ({
    ...r,
    ten_nguoi_dung: r.nguoi_dung?.ho_so_nguoi_dung?.ho_ten
      || r.nguoi_dung?.email?.split("@")[0]
      || "Khách hàng",
    anh_dai_dien: r.nguoi_dung?.ho_so_nguoi_dung?.anh_dai_dien || null,
    phan_hoi_admin: r.phan_hoi_admin || null,
  }));

  const byStar = Object.fromEntries([1,2,3,4,5].map(s => [s, 0]));
  aggregate.forEach(a => { if (a.so_sao) byStar[a.so_sao] = a._count.id; });

  return NextResponse.json({
    data: reviews,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    stats: {
      total,
      avg: Number(avgRow._avg.so_sao?.toFixed(1) || 0),
      byStar,
    },
  });
}

// POST /api/store/reviews
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const { ma_san_pham, so_sao, noi_dung } = body;

  if (!ma_san_pham || !so_sao || so_sao < 1 || so_sao > 5) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  // Kiểm tra đã mua sản phẩm này chưa (đơn DA_GIAO hoặc HOAN_THANH)
  const daMua = await prisma.chi_tiet_don_hang.findFirst({
    where: {
      bien_the_san_pham: { ma_san_pham },
      don_hang: {
        ma_nguoi_dung: user.id,
        trang_thai: { in: ["DA_GIAO", "HOAN_THANH"] },
      },
    },
  });
  if (!daMua) {
    return NextResponse.json({ error: "Bạn cần mua và nhận sản phẩm trước khi đánh giá" }, { status: 403 });
  }

  // Kiểm tra đã đánh giá chưa
  const daCoReview = await prisma.danh_gia_san_pham.findFirst({
    where: { ma_san_pham, ma_nguoi_dung: user.id },
  });
  if (daCoReview) {
    return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này rồi" }, { status: 409 });
  }

  const review = await prisma.danh_gia_san_pham.create({
    data: {
      ma_san_pham,
      ma_nguoi_dung: user.id,
      so_sao,
      noi_dung: noi_dung?.trim() || null,
      trang_thai: "DA_DUYET",
    },
  });

  return NextResponse.json(review, { status: 201 });
}
