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

  // (Tạm thời mock số lượng đã xuất và sắp hết hạn để test UI, có thể thay bằng hàm count sau)
  const statsData = {
    totalBoxes: totalBoxes,
    exportedBoxes: 120,
    expiringBoxes: 5,
  };

  // ==========================================
  // 2. LẤY DỮ LIỆU CẢNH BÁO HẾT HẠN
  // ==========================================
  const rawWarnings = await prisma.canh_bao_lo_hang.findMany({
    where: { da_xu_ly: false },
    include: { lo_hang: { include: { bien_the_san_pham: true } } },
  });

  const warningsData = rawWarnings.map((w) => ({
    id: w.id,
    san_pham:
      w.lo_hang?.bien_the_san_pham?.ten_bien_the || "Sản phẩm không xác định",
    lo_hang: w.lo_hang?.ma_lo_hang,
    han_su_dung: w.lo_hang?.han_su_dung?.toISOString().split("T")[0],
    muc_do: w.loai_canh_bao,
  }));

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
    phieu: item.phieu_xuat_kho?.id
      ? `PX-${item.phieu_xuat_kho.id}`
      : "Bán lẻ / Khác",
    nguoi_xuat: item.nguoi_xuat_id ? `NV-${item.nguoi_xuat_id}` : "Admin",
  }));

  // ==========================================
  // 5. TÍNH TOÁN SƠ ĐỒ KHO (Bản đồ sức chứa)
  // ==========================================
  const allViTri = await prisma.vi_tri_kho.findMany({
    include: {
      _count: {
        select: { kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } } },
      },
    },
  });

  const khuVucMap = new Map();
  allViTri.forEach((vt) => {
    const khu = vt.khu_vuc || "Khu vực khác";
    if (!khuVucMap.has(khu)) {
      // Giả định: Mỗi 1 vị trí (1 ô trên kệ) chứa được tối đa 50 thùng
      khuVucMap.set(khu, { name: khu, capacity: 0, current: 0 });
    }
    const data = khuVucMap.get(khu);
    data.capacity += 50; // Cộng dồn sức chứa
    data.current += vt._count.kien_hang_chi_tiet; // Cộng dồn số thùng thực tế
  });

  const mapData = Array.from(khuVucMap.values());

  // ==========================================
  // 5.5. LẤY CHI TIẾT TỒN KHO TỪNG MẶT HÀNG
  // ==========================================
  const rawInventory = await prisma.ton_kho_tong.findMany({
    where: { so_luong: { gt: 0 } }, // Chỉ lấy lô nào còn hàng
    include: {
      lo_hang: { include: { bien_the_san_pham: true } },
      vi_tri_kho: true,
    },
    orderBy: { ngay_cap_nhat: "desc" },
  });

  const inventoryData = rawInventory.map((item) => ({
    id: item.id,
    san_pham:
      item.lo_hang?.bien_the_san_pham?.ten_bien_the ||
      "Sản phẩm không xác định",
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
      inventoryData={inventoryData} // BƠM THÊM CÁI NÀY XUỐNG
    />
  );
}
