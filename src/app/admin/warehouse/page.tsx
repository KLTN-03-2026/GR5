import React from "react";
import prisma from "@/lib/prisma";
import WarehouseClient from "./WarehouseClient";

export const dynamic = "force-dynamic"; // Ép Next.js luôn lấy data mới nhất

export default async function WarehousePage() {
  // 1. LẤY THỐNG KÊ (Xử lý DB)
  const totalBoxes = await prisma.kien_hang_chi_tiet.count({
    where: { trang_thai: "TRONG_KHO" },
  });
  const warningStats = await prisma.canh_bao_lo_hang.groupBy({
    by: ["loai_canh_bao"],
    where: { da_xu_ly: false },
    _count: { ma_lo_hang: true },
  });

  const soonExpire = warningStats
    .filter((w) =>
      ["CON_1_NGAY", "CON_2_NGAY", "CON_3_NGAY"].includes(w.loai_canh_bao),
    )
    .reduce((a, b) => a + b._count.ma_lo_hang, 0);
  const expired =
    warningStats.find((w) => w.loai_canh_bao === "DA_HET_HAN")?._count
      .ma_lo_hang || 0;

  // 2. LẤY SƠ ĐỒ KHO (Xử lý DB)
  const viTriList = await prisma.vi_tri_kho.findMany({
    include: {
      ton_kho_tong: {
        include: {
          lo_hang: {
            include: {
              bien_the_san_pham: { include: { san_pham: true } },
              canh_bao_lo_hang: { where: { da_xu_ly: false } },
            },
          },
        },
      },
    },
  });

  const zonesMap: Record<string, any> = {};
  viTriList.forEach((vt) => {
    const khu = vt.khu_vuc || "Khu Khác";
    const day = vt.day || "Dãy chung";
    const ke = vt.ke || "Kệ chung";
    if (!zonesMap[khu]) zonesMap[khu] = { id: khu, name: khu, rowsMap: {} };
    if (!zonesMap[khu].rowsMap[day])
      zonesMap[khu].rowsMap[day] = { id: day, name: day, shelves: [] };

    const tonKho = vt.ton_kho_tong[0];
    const product =
      tonKho?.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham || "";
    const qty = tonKho?.so_luong || 0;

    let status = "empty";
    if (qty > 0) {
      status = "normal";
      const hasWarning = (tonKho?.lo_hang?.canh_bao_lo_hang?.length ?? 0) > 0;
      const isExpired =
        tonKho?.lo_hang?.canh_bao_lo_hang?.some(
          (c: any) => c.loai_canh_bao === "DA_HET_HAN",
        ) ?? false;
      if (hasWarning) status = isExpired ? "error" : "warning";
    }
    zonesMap[khu].rowsMap[day].shelves.push({
      id: vt.id.toString(),
      name: ke,
      product,
      qty,
      status,
    });
  });

  const mapData = Object.values(zonesMap).map((z: any) => ({
    ...z,
    rows: Object.values(z.rowsMap),
  }));

  // 3. LẤY CẢNH BÁO (Xử lý DB)
  const rawWarnings = await prisma.canh_bao_lo_hang.findMany({
    include: {
      lo_hang: {
        include: {
          bien_the_san_pham: { include: { san_pham: true } },
          ton_kho_tong: { include: { vi_tri_kho: true } },
        },
      },
    },
    orderBy: { da_xu_ly: "asc" },
  });

  const warningsData = rawWarnings.map((w: any) => {
    const tonKho = w.lo_hang?.ton_kho_tong[0];
    return {
      id: w.id,
      da_xu_ly: w.da_xu_ly,
      loai_canh_bao: w.loai_canh_bao,
      ma_lo_hang: w.lo_hang?.ma_lo_hang,
      product: w.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham || "---",
      qty: tonKho?.so_luong || 0,
      han_su_dung: w.lo_hang?.han_su_dung
        ? new Date(w.lo_hang.han_su_dung).toLocaleDateString("vi-VN")
        : "---",
      viTri: tonKho?.vi_tri_kho
        ? `${tonKho.vi_tri_kho.khu_vuc} - ${tonKho.vi_tri_kho.day} - ${tonKho.vi_tri_kho.ke}`
        : "Chưa xếp kệ",
    };
  });

  const statsData = {
    totalBoxes,
    soonExpire,
    expired,
    alertCount: rawWarnings.filter((w: any) => !w.da_xu_ly).length,
  };

  // 4. TRUYỀN HẾT DATA CHO CLIENT RENDER
  return (
    <WarehouseClient
      mapData={mapData}
      warningsData={warningsData}
      statsData={statsData}
    />
  );
}
