import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const alertId = parseInt(id);
    const body = await req.json();
    const { action, imageUrls = [], note = "" } = body;

    const actionLabel = action === "TIEU_HUY"
      ? "[ĐỀ XUẤT] Nhân viên kho đề xuất TIÊU HỦY"
      : "[ĐỀ XUẤT] Nhân viên kho đề xuất XẢ KHO (-50%)";

    const noteText = note ? `\nGhi chú: ${note}` : "";
    // Admin service parses URLs out of ghi_chu_xu_ly by splitting on whitespace and checking startsWith("http")
    // We store full public URLs (host-prefixed) so they're accessible
    const imageText = imageUrls.length > 0 ? `\n${imageUrls.join(" ")}` : "";
    const ghiChu = `${actionLabel}${noteText}${imageText}`;

    await prisma.canh_bao_lo_hang.update({
      where: { id: alertId },
      data: {
        phuong_thuc_xu_ly: action,
        ghi_chu_xu_ly: ghiChu,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/staff/warehouse/alerts/[id]/propose]", error);
    return NextResponse.json({ error: "Lỗi gửi đề xuất" }, { status: 500 });
  }
}
