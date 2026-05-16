import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const FACE_MATCH_THRESHOLD = 0.5;

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, descriptor, anh } = body;

    if (!ma_nguoi_dung || isNaN(Number(ma_nguoi_dung))) {
      return NextResponse.json({ success: false, message: 'Mã người dùng không hợp lệ' }, { status: 400 });
    }

    if (!Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu xác thực khuôn mặt' },
        { status: 400 },
      );
    }

    const userId = Number(ma_nguoi_dung);

    const faceRow = await prisma.du_lieu_khuon_mat.findFirst({
      where: { ma_nguoi_dung: userId },
      select: { vector_khuon_mat: true },
    });
    if (!faceRow) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng ký FaceID. Vui lòng đăng ký trước.' },
        { status: 400 },
      );
    }

    let saved: number[];
    try {
      saved = JSON.parse(faceRow.vector_khuon_mat);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu khuôn mặt không hợp lệ' },
        { status: 500 },
      );
    }

    const dist = euclideanDistance(descriptor as number[], saved);
    if (dist >= FACE_MATCH_THRESHOLD) {
      return NextResponse.json(
        { success: false, message: 'Khuôn mặt không khớp tài khoản đăng nhập' },
        { status: 401 },
      );
    }

    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Tìm bản ghi chấm công vào gần nhất trong ngày chưa có giờ ra
    const activeLog = await prisma.lich_su_cham_cong.findFirst({
      where: {
        ma_nguoi_dung: userId,
        gio_vao: { gte: startOfDay, lte: endOfDay },
        gio_ra: null,
      },
      orderBy: { gio_vao: 'desc' },
    });

    if (!activeLog) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy dữ liệu chấm công vào hoặc bạn đã chấm ra rồi'
      }, { status: 404 });
    }

    const updatedLog = await prisma.lich_su_cham_cong.update({
      where: { id: activeLog.id },
      data: {
        gio_ra: now,
        anh_ra: typeof anh === "string" && anh.startsWith("data:image") ? anh : null,
      },
    });

    const workedMs = now.getTime() - new Date(updatedLog.gio_vao!).getTime();
    const workedMinutes = Math.floor(workedMs / 60000);

    return NextResponse.json({
      success: true,
      data: { ...updatedLog, workedMinutes }
    }, { status: 200 });

  } catch (error) {
    console.error('[API_CHAM_CONG_RA] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi chấm công ra' }, { status: 500 });
  }
}
