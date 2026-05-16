import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getAuthUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

// [GET] Lấy thông báo
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const unreadOnly = searchParams.get("unread") === "true";

  const where: any = { ma_nguoi_dung: userId };
  if (unreadOnly) where.da_doc = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.thong_bao.findMany({
      where,
      orderBy: { ngay_tao: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.thong_bao.count({ where }),
    prisma.thong_bao.count({ where: { ma_nguoi_dung: userId, da_doc: false } }),
  ]);

  return NextResponse.json({
    notifications,
    meta: { total, page, limit, unreadCount },
  });
}

// [PUT] Đánh dấu đã đọc
export async function PUT(req: Request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await req.json();

  if (action === "read-all") {
    await prisma.thong_bao.updateMany({
      where: { ma_nguoi_dung: userId, da_doc: false },
      data: { da_doc: true },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "read" && id) {
    const notification = await prisma.thong_bao.findUnique({
      where: { id: Number(id) },
      select: { ma_nguoi_dung: true },
    });
    if (notification?.ma_nguoi_dung !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.thong_bao.update({
      where: { id: Number(id) },
      data: { da_doc: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
