import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// POST — Xử lý cảnh báo theo 5 hướng
// ==========================================
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { huong, ...data } = body;

    const canhBao = await prisma.canh_bao_lo_hang.findUnique({
      where: { id: Number(id) },
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: true,
            ton_kho_tong: { where: { so_luong: { gt: 0 } } },
          },
        },
      },
    });
    if (!canhBao) return NextResponse.json({ error: "Không tìm thấy cảnh báo" }, { status: 404 });

    const loHang = canhBao.lo_hang;
    const totalStock = loHang?.ton_kho_tong.reduce((s, t) => s + (t.so_luong ?? 0), 0) ?? 0;

    let maPhieuXuLy: number | null = null;
    let phuongThuc = "";

    // ────────────────────────────────────────────────────────
    // HƯỚNG 1: GIẢM GIÁ KHẨN CẤP
    // ────────────────────────────────────────────────────────
    if (huong === "GIAM_GIA") {
      const { phan_tram_giam, ghi_chu } = data;
      phuongThuc = "GIAM_GIA";

      if (!phan_tram_giam || Number(phan_tram_giam) <= 0 || Number(phan_tram_giam) > 100) {
        return NextResponse.json({ error: "Phần trăm giảm giá không hợp lệ (1-100)" }, { status: 400 });
      }

      // Tạo mã giảm giá Flash Sale
      const maCode = `FLASH_${loHang?.ma_lo_hang}_${Date.now()}`;
      const maGiamGia = await prisma.ma_giam_gia.create({
        data: {
          ma_code: maCode,
          loai_giam_gia: "PHAN_TRAM",
          gia_tri_giam: Number(phan_tram_giam),
          don_toi_thieu: 0,
          ngay_bat_dau: new Date(),
          ngay_ket_thuc: loHang?.han_su_dung ?? new Date(),
        },
      });
      maPhieuXuLy = maGiamGia.id;

      // Gửi thông báo cho nhân viên (lấy tất cả user có vai trò BAN_HANG)
      const allUsers = await prisma.nguoi_dung.findMany({
        where: { trang_thai: 1 },
        select: { id: true },
        take: 20,
      });
      await prisma.thong_bao.createMany({
        data: allUsers.map((u) => ({
          ma_nguoi_dung: u.id,
          tieu_de: "⚡ Flash Sale khẩn cấp!",
          noi_dung: `Lô hàng ${loHang?.ma_lo_hang} (${loHang?.bien_the_san_pham?.ten_bien_the}) đang được giảm ${phan_tram_giam}% — HSD: ${loHang?.han_su_dung?.toLocaleDateString("vi-VN")}`,
          loai_thong_bao: "FLASH_SALE",
        })),
      });
    }

    // ────────────────────────────────────────────────────────
    // HƯỚNG 2: XUẤT NỘI BỘ
    // ────────────────────────────────────────────────────────
    else if (huong === "XUAT_NOI_BO") {
      const { so_luong, bo_phan, muc_dich } = data;
      phuongThuc = "XUAT_NOI_BO";

      const qty = Number(so_luong);
      if (!qty || qty <= 0 || qty > totalStock) {
        return NextResponse.json({ error: `Số lượng không hợp lệ (tối đa ${totalStock})` }, { status: 400 });
      }

      // Tạo phiếu xuất kho nội bộ
      const phieuXuat = await prisma.phieu_xuat_kho.create({
        data: {
          ly_do_xuat: `XUAT_NOI_BO: ${bo_phan || "Nội bộ"} — ${muc_dich || ""}`,
          trang_thai: "HOAN_THANH",
          ngay_tao: new Date(),
        },
      });
      maPhieuXuLy = phieuXuat.id;

      // Trừ tồn kho theo FEFO
      let conLai = qty;
      for (const tk of loHang?.ton_kho_tong || []) {
        if (conLai <= 0) break;
        const tru = Math.min(conLai, tk.so_luong ?? 0);
        await prisma.ton_kho_tong.update({
          where: { id: tk.id },
          data: { so_luong: { decrement: tru } },
        });
        conLai -= tru;
      }
    }

    // ────────────────────────────────────────────────────────
    // HƯỚNG 3: TRẢ NHÀ CUNG CẤP
    // ────────────────────────────────────────────────────────
    else if (huong === "TRA_NCC") {
      const { so_luong, ly_do } = data;
      phuongThuc = "TRA_NCC";

      if (!loHang?.ma_ncc) {
        return NextResponse.json({ error: "Lô hàng không có nhà cung cấp" }, { status: 400 });
      }

      const phieuTra = await prisma.phieu_tra_nha_cung_cap.create({
        data: {
          ma_ncc: loHang.ma_ncc,
          trang_thai: "DANG_XU_LY",
          ngay_tao: new Date(),
        },
      });
      maPhieuXuLy = phieuTra.id;

      // Trừ tồn kho
      const qty = Number(so_luong) || totalStock;
      let conLai = qty;
      for (const tk of loHang?.ton_kho_tong || []) {
        if (conLai <= 0) break;
        const tru = Math.min(conLai, tk.so_luong ?? 0);
        await prisma.ton_kho_tong.update({
          where: { id: tk.id },
          data: { so_luong: { decrement: tru } },
        });
        conLai -= tru;
      }

      // Cập nhật trạng thái lô
      await prisma.lo_hang.update({ where: { id: loHang.id }, data: { trang_thai: "TRA_NCC" } });
    }

    // ────────────────────────────────────────────────────────
    // HƯỚNG 4: TIÊU HỦY
    // ────────────────────────────────────────────────────────
    else if (huong === "TIEU_HUY") {
      const { ly_do, nguoi_chung_kien, phuong_thuc_tieu_huy } = data;
      phuongThuc = "TIEU_HUY";

      // Tạo phiếu xuất tiêu hủy
      const phieuXuat = await prisma.phieu_xuat_kho.create({
        data: {
          ly_do_xuat: `TIEU_HUY: ${phuong_thuc_tieu_huy || "Không rõ"} — ${ly_do || ""}`,
          trang_thai: "HOAN_THANH",
          ngay_tao: new Date(),
        },
      });
      maPhieuXuLy = phieuXuat.id;

      // Xóa toàn bộ tồn kho của lô này
      await prisma.ton_kho_tong.updateMany({
        where: { ma_lo_hang: loHang?.id },
        data: { so_luong: 0 },
      });

      // Cập nhật trạng thái lô
      if (loHang) {
        await prisma.lo_hang.update({
          where: { id: loHang.id },
          data: { trang_thai: "DA_TIEU_HUY" },
        });
      }

      // Thông báo thiệt hại (ghi nhận)
      const giaNhap = loHang?.bien_the_san_pham?.gia_goc;
      const thietHai = giaNhap ? Number(giaNhap) * totalStock : null;
      if (thietHai) {
        await prisma.thong_bao.create({
          data: {
            tieu_de: "📋 Báo cáo tiêu hủy hàng hóa",
            noi_dung: `Lô ${loHang?.ma_lo_hang} đã tiêu hủy ${totalStock} thùng. Thiệt hại ước tính: ${thietHai.toLocaleString("vi-VN")}đ. Người chứng kiến: ${nguoi_chung_kien || "N/A"}`,
            loai_thong_bao: "BAO_CAO_TIEU_HUY",
          },
        });
      }
    }

    // ────────────────────────────────────────────────────────
    // HƯỚNG 5: XỬ LÝ LẠI (chỉ cho HANG_HONG)
    // ────────────────────────────────────────────────────────
    else if (huong === "XU_LY_LAI") {
      const { phuong_an } = data;
      phuongThuc = "XU_LY_LAI";

      if (canhBao.loai_canh_bao !== "HANG_HONG") {
        return NextResponse.json({ error: "Hướng xử lý này chỉ áp dụng cho hàng hỏng" }, { status: 400 });
      }

      // Cập nhật trạng thái lô sang "đang xử lý"
      if (loHang) {
        await prisma.lo_hang.update({
          where: { id: loHang.id },
          data: { trang_thai: "DANG_XU_LY" },
        });
      }
    }

    else {
      return NextResponse.json({ error: "Hướng xử lý không hợp lệ" }, { status: 400 });
    }

    // ────────────────────────────────────────────────────────
    // Đánh dấu cảnh báo đã xử lý
    // ────────────────────────────────────────────────────────
    const updated = await prisma.canh_bao_lo_hang.update({
      where: { id: Number(id) },
      data: {
        da_xu_ly: true,
        ngay_xu_ly: new Date(),
        phuong_thuc_xu_ly: phuongThuc,
        ghi_chu_xu_ly: data.ghi_chu || data.ly_do || data.phuong_an || null,
        ...(maPhieuXuLy && { ma_phieu_xu_ly: maPhieuXuLy }),
      },
    });

    return NextResponse.json({
      message: "Xử lý thành công",
      phuong_thuc: phuongThuc,
      canh_bao: updated,
    });
  } catch (err) {
    console.error("[POST /api/admin/warehouse/warnings/[id]/resolve]", err);
    return NextResponse.json({ error: "Lỗi server: " + String(err) }, { status: 500 });
  }
}
