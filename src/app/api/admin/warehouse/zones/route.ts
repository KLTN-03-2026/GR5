import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// GET — Lấy toàn bộ cây vị trí kho
// ==========================================
export async function GET() {
  try {
    const allPositions = await prisma.vi_tri_kho.findMany({
      include: {
        ton_kho_tong: {
          where: { so_luong: { gt: 0 } },
          include: {
            lo_hang: { select: { han_su_dung: true } },
          },
        },
        _count: {
          select: {
            kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } },
          },
        },
      },
      orderBy: [{ khu_vuc: "asc" }, { day: "asc" }, { ke: "asc" }, { tang: "asc" }],
    });

    // Gom theo cây khu → dãy → kệ → tầng
    const tree: Record<string, any> = {};

    for (const pos of allPositions) {
      const khu = pos.khu_vuc || "Khu khác";
      const day = pos.day || "Dãy 1";
      const ke = pos.ke || "Kệ 1";

      if (!tree[khu]) tree[khu] = { name: khu, days: {}, totalCapacity: 0, totalCurrent: 0, expiringSoon: 0 };
      if (!tree[khu].days[day]) tree[khu].days[day] = { name: day, shelves: {} };
      if (!tree[khu].days[day].shelves[ke]) tree[khu].days[day].shelves[ke] = { name: ke, floors: [] };

      const current = pos._count.kien_hang_chi_tiet;
      const capacity = pos.suc_chua_toi_da ?? 100;

      // Tìm lô sắp hết hạn (< 30 ngày)
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      const expiring = pos.ton_kho_tong.filter(
        (t) => t.lo_hang?.han_su_dung && new Date(t.lo_hang.han_su_dung) <= soon
      ).length;

      const floor = {
        id: pos.id,
        tang: pos.tang || "Tầng 1",
        capacity,
        current,
        expiring,
        suc_chua_toi_da: pos.suc_chua_toi_da,
        ghi_chu: pos.ghi_chu,
        so_luong_ton: pos.ton_kho_tong.reduce((s, t) => s + (t.so_luong ?? 0), 0),
      };

      tree[khu].days[day].shelves[ke].floors.push(floor);
      tree[khu].totalCapacity += capacity;
      tree[khu].totalCurrent += current;
      tree[khu].expiringSoon += expiring;
    }

    // Chuyển sang array
    const zones = Object.values(tree).map((khu: any) => ({
      ...khu,
      days: Object.values(khu.days).map((day: any) => ({
        ...day,
        shelves: Object.values(day.shelves).map((ke: any) => ({
          ...ke,
          floors: ke.floors,
        })),
      })),
    }));

    return NextResponse.json({ zones });
  } catch (err) {
    console.error("[GET /api/admin/warehouse/zones]", err);
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}

// ==========================================
// POST — Tạo khu vực mới (auto-generate vị trí)
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ten_khu, so_day, so_ke, so_tang, suc_chua_toi_da, ma_kho, ghi_chu } = body;

    if (!ten_khu || !so_day || !so_ke || !so_tang) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra khu vực đã tồn tại chưa
    const existing = await prisma.vi_tri_kho.findFirst({ where: { khu_vuc: ten_khu } });
    if (existing) {
      return NextResponse.json({ error: `Khu "${ten_khu}" đã tồn tại` }, { status: 409 });
    }

    // Auto-generate tất cả các bản ghi con
    const records = [];
    for (let d = 1; d <= Number(so_day); d++) {
      for (let k = 1; k <= Number(so_ke); k++) {
        for (let t = 1; t <= Number(so_tang); t++) {
          records.push({
            ma_kho: ma_kho ? Number(ma_kho) : null,
            khu_vuc: ten_khu,
            day: `D${d}`,
            ke: `K${k}`,
            tang: `T${t}`,
            suc_chua_toi_da: suc_chua_toi_da ? Number(suc_chua_toi_da) : 100,
            ghi_chu: ghi_chu || null,
          });
        }
      }
    }

    await prisma.vi_tri_kho.createMany({ data: records });

    return NextResponse.json({ message: `Đã tạo khu "${ten_khu}" với ${records.length} vị trí`, count: records.length }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/warehouse/zones]", err);
    return NextResponse.json({ error: "Lỗi tạo khu vực" }, { status: 500 });
  }
}
