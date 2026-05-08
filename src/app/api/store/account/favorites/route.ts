import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getUser(email: string) {
  return prisma.nguoi_dung.findUnique({ where: { email }, select: { id: true } });
}

// GET /api/store/account/favorites?page=1&limit=12&sort=newest|oldest|price_asc|price_desc
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  || "1"));
  const limit = Math.min(48, parseInt(searchParams.get("limit") || "12"));
  const sort  = searchParams.get("sort") || "newest";

  const orderBy: any =
    sort === "oldest"     ? { ngay_them: "asc"  } :
    sort === "price_asc"  ? { san_pham: { bien_the_san_pham: { _min: { gia_ban: "asc"  } } } } :
    sort === "price_desc" ? { san_pham: { bien_the_san_pham: { _min: { gia_ban: "desc" } } } } :
    { ngay_them: "desc" };

  const [total, items] = await Promise.all([
    prisma.san_pham_yeu_thich.count({ where: { ma_nguoi_dung: user.id } }),
    prisma.san_pham_yeu_thich.findMany({
      where: { ma_nguoi_dung: user.id },
      orderBy: { ngay_them: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        san_pham: {
          include: {
            anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
            bien_the_san_pham: { orderBy: { gia_ban: "asc" }, take: 1 },
            danh_muc: { select: { ten_danh_muc: true } },
            danh_gia_san_pham: {
              where: { trang_thai: "DA_DUYET" },
              select: { so_sao: true },
            },
          },
        },
      },
    }),
  ]);

  const data = items.map((item) => {
    const sp = item.san_pham;
    const bt = sp.bien_the_san_pham[0];
    const ratings = sp.danh_gia_san_pham;
    const avgRating = ratings.length
      ? ratings.reduce((s, r) => s + (r.so_sao || 0), 0) / ratings.length
      : 0;

    return {
      favoriteId: item.id,
      ngay_them: item.ngay_them,
      id: sp.id,
      ten_san_pham: sp.ten_san_pham,
      trang_thai: sp.trang_thai,
      xuat_xu: sp.xuat_xu,
      danh_muc: sp.danh_muc?.ten_danh_muc || null,
      anh_chinh: sp.anh_san_pham[0]?.duong_dan_anh || null,
      gia_ban: bt ? Number(bt.gia_ban) : null,
      gia_goc: bt?.gia_goc ? Number(bt.gia_goc) : null,
      don_vi_tinh: bt?.don_vi_tinh || null,
      so_sao: parseFloat(avgRating.toFixed(1)),
      luot_danh_gia: ratings.length,
    };
  });

  // Sort by price client-friendly (since Prisma nested orderBy on relation is limited)
  if (sort === "price_asc")  data.sort((a, b) => (a.gia_ban ?? 0) - (b.gia_ban ?? 0));
  if (sort === "price_desc") data.sort((a, b) => (b.gia_ban ?? 0) - (a.gia_ban ?? 0));

  return NextResponse.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/store/account/favorites  { ma_san_pham }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { ma_san_pham } = await req.json();
  if (!ma_san_pham) return NextResponse.json({ error: "Thiếu ma_san_pham" }, { status: 400 });

  // Check product exists
  const sp = await prisma.san_pham.findUnique({ where: { id: ma_san_pham }, select: { id: true } });
  if (!sp) return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });

  try {
    const fav = await prisma.san_pham_yeu_thich.create({
      data: { ma_nguoi_dung: user.id, ma_san_pham },
    });
    return NextResponse.json(fav, { status: 201 });
  } catch {
    // Unique constraint → already favorited
    return NextResponse.json({ error: "Đã có trong danh sách yêu thích" }, { status: 409 });
  }
}

// DELETE /api/store/account/favorites?ma_san_pham=xxx
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const ma_san_pham = parseInt(searchParams.get("ma_san_pham") || "0");
  if (!ma_san_pham) return NextResponse.json({ error: "Thiếu ma_san_pham" }, { status: 400 });

  await prisma.san_pham_yeu_thich.deleteMany({
    where: { ma_nguoi_dung: user.id, ma_san_pham },
  });

  return NextResponse.json({ ok: true });
}
