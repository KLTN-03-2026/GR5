import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ anh_dai_dien: null });

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: {
      ho_so_nguoi_dung: {
        select: { anh_dai_dien: true },
      },
    },
  });

  return NextResponse.json({
    anh_dai_dien: user?.ho_so_nguoi_dung?.anh_dai_dien || null,
  });
}
