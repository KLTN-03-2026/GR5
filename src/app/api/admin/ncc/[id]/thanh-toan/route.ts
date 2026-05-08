import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ✅ Helper: Tính công nợ bằng SUM (chuẩn kế toán)
async function calcCongNo(ma_ncc: number): Promise<number> {
  const [phatSinh, thanhToan, traHang] = await Promise.all([
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "PHAT_SINH_NO" },
    }),
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "THANH_TOAN" },
    }),
    prisma.cong_no_ncc.aggregate({
      _sum: { so_tien: true },
      where: { ma_ncc, loai_giao_dich: "TRA_HANG_HOAN_TIEN" },
    }),
  ]);
  return (
    Number(phatSinh._sum.so_tien ?? 0) -
    Number(thanhToan._sum.so_tien ?? 0) -
    Number(traHang._sum.so_tien ?? 0)
  );
}

// GET /api/admin/ncc/[id]/thanh-toan — Lấy lịch sử công nợ
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lichSu = await prisma.cong_no_ncc.findMany({
    where: { ma_ncc: Number(id) },
    orderBy: { ngay_giao_dich: "desc" },
  });

  // ✅ FIX ĐIỂM 4: Tính số dư bằng SUM
  const congNoHienTai = await calcCongNo(Number(id));

  return NextResponse.json({
    cong_no_hien_tai: congNoHienTai,
    lich_su: lichSu,
  });
}

// POST /api/admin/ncc/[id]/thanh-toan — Ghi nhận thanh toán
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const body = await req.json();

  // ✅ FIX ĐIỂM 5: Idempotency key — chặn double-submit
  if (body.idempotency_key) {
    const existing = await prisma.cong_no_ncc.findFirst({
      where: { ma_giao_dich: `IDEMPOTENT_${body.idempotency_key}` },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Giao dịch này đã được ghi nhận trước đó", tx: existing },
        { status: 200 }
      );
    }
  }

  if (!body.so_tien || Number(body.so_tien) <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  // ✅ FIX ĐIỂM 4: Tính số dư bằng SUM
  const congNoHienTai = await calcCongNo(Number(id));

  if (Number(body.so_tien) > congNoHienTai) {
    return NextResponse.json(
      {
        error: `Số tiền thanh toán (${Number(body.so_tien).toLocaleString("vi-VN")}đ) vượt quá công nợ hiện tại (${congNoHienTai.toLocaleString("vi-VN")}đ)`,
      },
      { status: 400 }
    );
  }

  const soDuMoi = congNoHienTai - Number(body.so_tien);

  const tx = await prisma.cong_no_ncc.create({
    data: {
      ma_ncc: Number(id),
      loai_giao_dich: "THANH_TOAN",
      so_tien: body.so_tien,
      so_du_sau: soDuMoi, // ✅ FIX ĐIỂM 7: so_du_sau tại thời điểm giao dịch (audit snapshot)
      phuong_thuc: body.phuong_thuc,
      // ✅ FIX ĐIỂM 5: Lưu idempotency key vào ma_giao_dich
      ma_giao_dich: body.idempotency_key
        ? `IDEMPOTENT_${body.idempotency_key}`
        : body.ma_giao_dich,
      // ✅ FIX ĐIỂM 7: Ghi audit – người thực hiện từ session
      nguoi_thuc_hien_id: body.nguoi_thuc_hien_id ?? (session?.user as any)?.id ?? null,
      ghi_chu: body.ghi_chu,
    },
  });

  return NextResponse.json(tx, { status: 201 });
}
