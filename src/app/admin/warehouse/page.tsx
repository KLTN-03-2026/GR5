import React from "react";
import prisma from "@/lib/prisma";
import WarehouseClient from "./WarehouseClient";

export default async function WarehousePage() {
  // ==========================================
  // 1. LẤY THỐNG KÊ TỔNG QUAN
  // ==========================================
  const totalBoxes = await prisma.kien_hang_chi_tiet.count({
    where: { trang_thai: "TRONG_KHO" },
  });

  const statsData = {
    totalBoxes: totalBoxes,
    exportedBoxes: 120,
    expiringBoxes: 5,
  };

  // ==========================================
  // 2. LẤY DỮ LIỆU CẢNH BÁO (đầy đủ cho MODULE 2)
  // ==========================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawWarnings = await prisma.canh_bao_lo_hang.findMany({
    orderBy: [{ da_xu_ly: "asc" }, { ngay_tao: "desc" }],
    include: {
      lo_hang: {
        include: {
          bien_the_san_pham: {
            include: { san_pham: { select: { ten_san_pham: true } } },
          },
          nha_cung_cap: { select: { id: true, ten_ncc: true } },
          ton_kho_tong: {
            include: { vi_tri_kho: true },
            where: { so_luong: { gt: 0 } },
          },
        },
      },
    },
  });

  const warningsData = rawWarnings.map((w) => {
    const hsd = w.lo_hang?.han_su_dung ? new Date(w.lo_hang.han_su_dung) : null;
    const daysLeft = hsd
      ? Math.ceil((hsd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    let loai_hien_tai = w.loai_canh_bao;
    if (hsd && !w.da_xu_ly) {
      if (daysLeft !== null && daysLeft < 0) loai_hien_tai = "HET_HAN";
      else if (daysLeft !== null && daysLeft <= 3) loai_hien_tai = "SAP_HET_HAN_3";
      else if (daysLeft !== null && daysLeft <= 7) loai_hien_tai = "SAP_HET_HAN_7";
      else if (daysLeft !== null && daysLeft <= 30) loai_hien_tai = "SAP_HET_HAN_30";
    }

    const tonKho = w.lo_hang?.ton_kho_tong || [];
    const totalQty = tonKho.reduce((s, t) => s + (t.so_luong ?? 0), 0);
    const viTri = tonKho
      .map((t) =>
        [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke].filter(Boolean).join("-")
      )
      .filter(Boolean)
      .join(", ");

    return {
      id: w.id,
      ma_lo_hang_id: w.lo_hang?.id,
      ma_lo: w.lo_hang?.ma_lo_hang,
      san_pham:
        w.lo_hang?.bien_the_san_pham?.ten_bien_the ||
        w.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham ||
        "N/A",
      ncc_id: w.lo_hang?.nha_cung_cap?.id ?? null,
      ncc_ten: w.lo_hang?.nha_cung_cap?.ten_ncc ?? null,
      so_luong: totalQty,
      vi_tri: viTri || "Chưa xác định",
      han_su_dung: hsd ? hsd.toLocaleDateString("vi-VN") : "N/A",
      han_su_dung_raw: hsd?.toISOString() ?? null,
      days_left: daysLeft,
      loai_canh_bao: loai_hien_tai,
      loai_goc: w.loai_canh_bao,
      da_xu_ly: w.da_xu_ly,
      phuong_thuc_xu_ly: w.phuong_thuc_xu_ly ?? null,
      ghi_chu_xu_ly: w.ghi_chu_xu_ly ?? null,
      ngay_xu_ly: w.ngay_xu_ly?.toISOString() ?? null,
      lo_hang_trang_thai: w.lo_hang?.trang_thai ?? null,
      ma_bien_the: w.lo_hang?.ma_bien_the ?? null,
      ton_kho: tonKho.map((t) => ({ id: t.id, so_luong: t.so_luong, vi_tri_id: t.ma_vi_tri })),
    };
  });

  // ==========================================
  // 3. LẤY DATA CHO FORM NHẬP KHO (Dropdown)
  // ==========================================
  const nccList = await prisma.nha_cung_cap.findMany({
    select: { id: true, ten_ncc: true },
  });
  const spList = await prisma.bien_the_san_pham.findMany({
    select: { id: true, ten_bien_the: true },
  });

  const formOptions = {
    ncc: nccList.map((n) => ({ id: n.id, name: n.ten_ncc })),
    sp: spList.map((s) => ({ id: s.id, name: s.ten_bien_the })),
  };

  // ==========================================
  // 4. LẤY DỮ LIỆU LỊCH SỬ XUẤT KHO
  // ==========================================
  const rawHistory = await prisma.kien_hang_da_xuat.findMany({
    orderBy: { ngay_xuat: "desc" },
    take: 50,
    include: { phieu_xuat_kho: true },
  });

  const historyData = rawHistory.map((item) => ({
    id: item.id,
    ngay_xuat: item.ngay_xuat.toLocaleString("vi-VN"),
    qr: item.ma_vach_quet,
    san_pham:
      spList.find((sp) => sp.id === item.ma_bien_the)?.ten_bien_the ||
      "Sản phẩm không xác định",
    phieu: item.phieu_xuat_kho?.id ? `PX-${item.phieu_xuat_kho.id}` : "Bán lẻ / Khác",
    nguoi_xuat: item.nguoi_xuat_id ? `NV-${item.nguoi_xuat_id}` : "Admin",
  }));

  // ==========================================
  // 4.5 LẤY DỮ LIỆU LỊCH SỬ NHẬP KHO
  // ==========================================
  const rawImportHistory = await prisma.phieu_nhap_kho.findMany({
    orderBy: { ngay_tao: "desc" },
    take: 50,
    include: {
      nha_cung_cap: true,
      chi_tiet: { include: { bien_the_san_pham: true } },
    },
  });

  const importHistoryData = rawImportHistory.map((p) => ({
    id: p.id,
    ma_phieu: p.ma_phieu || `PN-${p.id}`,
    ngay_nhap: p.ngay_tao ? p.ngay_tao.toLocaleString("vi-VN") : "N/A",
    ncc: p.nha_cung_cap?.ten_ncc || "N/A",
    san_pham: p.chi_tiet?.[0]?.bien_the_san_pham?.ten_bien_the || "Nhiều sản phẩm",
    so_luong: p.chi_tiet?.[0]?.so_luong_yeu_cau || p.chi_tiet?.[0]?.so_luong_thung || 0,
    trang_thai: p.trang_thai,
  }));

  // ==========================================
  // 5. TÍNH TOÁN SƠ ĐỒ KHO
  // ==========================================
  const allViTri = await prisma.vi_tri_kho.findMany({
    include: {
      _count: {
        select: { kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } } },
      },
      ton_kho_tong: {
        where: { so_luong: { gt: 0 } },
        include: { lo_hang: { select: { han_su_dung: true } } },
      },
    },
    orderBy: [{ khu_vuc: "asc" }, { day: "asc" }, { ke: "asc" }, { tang: "asc" }],
  });

  // legacy mapData (backward compat)
  const khuVucMap = new Map<string, any>();
  allViTri.forEach((vt) => {
    const khu = vt.khu_vuc || "Khu vực khác";
    if (!khuVucMap.has(khu)) khuVucMap.set(khu, { name: khu, capacity: 0, current: 0 });
    const d = khuVucMap.get(khu);
    d.capacity += vt.suc_chua_toi_da ?? 50;
    d.current += vt._count.kien_hang_chi_tiet;
  });
  const mapData = Array.from(khuVucMap.values());

  // ==========================================
  // 5.5. BUILD ZONES RAW TREE (cho bản đồ tương tác)
  // ==========================================
  const today30 = new Date();
  today30.setDate(today30.getDate() + 30);

  const tree: Record<string, any> = {};
  for (const pos of allViTri) {
    const khu = pos.khu_vuc || "Khu khác";
    const day = pos.day || "D1";
    const ke = pos.ke || "K1";
    if (!tree[khu]) tree[khu] = { name: khu, days: {}, totalCapacity: 0, totalCurrent: 0, expiringSoon: 0 };
    if (!tree[khu].days[day]) tree[khu].days[day] = { name: day, shelves: {} };
    if (!tree[khu].days[day].shelves[ke]) tree[khu].days[day].shelves[ke] = { name: ke, floors: [] };

    const current = pos._count.kien_hang_chi_tiet;
    const capacity = pos.suc_chua_toi_da ?? 100;
    const expiring = pos.ton_kho_tong.filter(
      (t) => t.lo_hang?.han_su_dung && new Date(t.lo_hang.han_su_dung) <= today30
    ).length;

    tree[khu].days[day].shelves[ke].floors.push({
      id: pos.id,
      tang: pos.tang || "T1",
      capacity,
      current,
      expiring,
      suc_chua_toi_da: pos.suc_chua_toi_da,
      ghi_chu: pos.ghi_chu,
      so_luong_ton: pos.ton_kho_tong.reduce((s, t) => s + (t.so_luong ?? 0), 0),
    });
    tree[khu].totalCapacity += capacity;
    tree[khu].totalCurrent += current;
    tree[khu].expiringSoon += expiring;
  }

  const zonesRaw = Object.values(tree).map((khu: any) => ({
    ...khu,
    days: Object.values(khu.days).map((day: any) => ({
      ...day,
      shelves: Object.values(day.shelves),
    })),
  }));

  // ==========================================
  // 5.6. LẤY CHI TIẾT TỒN KHO TỪNG MẶT HÀNG
  // ==========================================
  const rawInventory = await prisma.ton_kho_tong.findMany({
    where: { so_luong: { gt: 0 } },
    include: {
      lo_hang: { include: { bien_the_san_pham: true } },
      vi_tri_kho: true,
    },
    orderBy: { ngay_cap_nhat: "desc" },
  });

  const inventoryData = rawInventory.map((item) => ({
    id: item.id,
    san_pham: item.lo_hang?.bien_the_san_pham?.ten_bien_the || "Sản phẩm không xác định",
    ma_lo: item.lo_hang?.ma_lo_hang || "N/A",
    so_luong: item.so_luong,
    vi_tri: `${item.vi_tri_kho?.khu_vuc} - Dãy ${item.vi_tri_kho?.day} - Kệ ${item.vi_tri_kho?.ke}`,
    han_su_dung: item.lo_hang?.han_su_dung
      ? item.lo_hang.han_su_dung.toLocaleDateString("vi-VN")
      : "N/A",
  }));

  // ==========================================
  // 6. TRUYỀN DATA XUỐNG GIAO DIỆN CLIENT
  // ==========================================
  return (
    <WarehouseClient
      mapData={mapData}
      warningsData={warningsData}
      statsData={statsData}
      formOptions={formOptions}
      historyData={historyData}
      inventoryData={inventoryData}
      importHistoryData={importHistoryData}
      zonesRaw={zonesRaw}
    />
  );
}
