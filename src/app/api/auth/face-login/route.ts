import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const FACE_LOGIN_SECRET = process.env.AUTH_SECRET + "_face";

// Tính khoảng cách Euclidean giữa 2 vector
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// POST – So sánh descriptor với DB, trả về short-lived token nếu khớp
export async function POST(req: NextRequest) {
  const { descriptor } = await req.json();
  if (!descriptor || !Array.isArray(descriptor)) {
    return NextResponse.json({ success: false, message: "Dữ liệu khuôn mặt không hợp lệ" }, { status: 400 });
  }

  // Lấy toàn bộ face data từ DB
  const allFaceData = await prisma.du_lieu_khuon_mat.findMany({
    select: { ma_nguoi_dung: true, vector_khuon_mat: true },
  });

  if (allFaceData.length === 0) {
    return NextResponse.json({ success: false, message: "Chưa có tài khoản nào đăng ký FaceID" }, { status: 404 });
  }

  let bestMatch: { userId: number; distance: number } | null = null;

  for (const row of allFaceData) {
    try {
      const savedDescriptor: number[] = JSON.parse(row.vector_khuon_mat);
      const distance = euclideanDistance(descriptor, savedDescriptor);

      if (distance < 0.5 && (!bestMatch || distance < bestMatch.distance)) {
        bestMatch = { userId: row.ma_nguoi_dung!, distance };
      }
    } catch {
      // skip invalid data
    }
  }

  if (!bestMatch) {
    return NextResponse.json({ success: false, message: "Khuôn mặt không khớp với bất kỳ tài khoản nào" }, { status: 401 });
  }

  // Lấy email và roles để trả về
  const user = await prisma.nguoi_dung.findUnique({
    where: { id: bestMatch.userId },
    select: { 
      id: true, 
      email: true,
      vai_tro_nguoi_dung: { include: { vai_tro: true } }
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "Tài khoản không tồn tại" }, { status: 404 });
  }

  const roles = user.vai_tro_nguoi_dung.map((r) => r.vai_tro.ten_vai_tro);

  // Tạo short-lived token (30 giây)
  const faceToken = jwt.sign(
    { userId: user.id, email: user.email },
    FACE_LOGIN_SECRET,
    { expiresIn: "30s" }
  );

  return NextResponse.json({ success: true, faceToken, email: user.email, roles });
}

// GET – Verify token (dùng bởi NextAuth)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const payload = jwt.verify(token, FACE_LOGIN_SECRET) as { userId: number; email: string };
    return NextResponse.json({ success: true, userId: payload.userId, email: payload.email });
  } catch {
    return NextResponse.json({ success: false, message: "Token hết hạn hoặc không hợp lệ" }, { status: 401 });
  }
}
