import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WarehouseService } from "@/services/admin/warehouse.service";

// ── PATCH: Người kiểm tra xác nhận / chuyển trạng thái phiếu ──
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, so_luong_thuc_nhan, ghi_chu_kiem_tra, ly_do_chenh_lech, ma_nguoi_kiem_tra } = body;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) },
      include: { chi_tiet: true },
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });

    // Action: SUBMIT — người tạo nộp phiếu lên CHO_KIEM_TRA
    if (action === "submit") {
      if (phieu.trang_thai !== "CHO_DUYET") {
        return NextResponse.json({ error: "Phiếu không ở trạng thái CHO_DUYET" }, { status: 400 });
      }
      const updated = await prisma.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: { trang_thai: "CHO_KIEM_TRA" },
      });
      return NextResponse.json({ message: "Đã nộp phiếu — đang chờ kiểm tra", phieu: updated });
    }

    // Action: APPROVE — người kiểm tra duyệt phiếu
    if (action === "approve") {
      if (phieu.trang_thai !== "CHO_KIEM_TRA") {
        return NextResponse.json({ error: "Phiếu chưa ở trạng thái CHO_KIEM_TRA" }, { status: 400 });
      }

      const chiTiet = phieu.chi_tiet[0];
      const soLuongYeuCau = chiTiet?.so_luong_yeu_cau || chiTiet?.so_luong_thung || 0;
      const soLuongThucNhan = Number(so_luong_thuc_nhan) || soLuongYeuCau;
      const chenh = soLuongYeuCau > 0
        ? Math.abs((soLuongThucNhan - soLuongYeuCau) / soLuongYeuCau) * 100
        : 0;

      if (chenh > 5 && !ly_do_chenh_lech) {
        return NextResponse.json({
          error: `Chênh lệch ${chenh.toFixed(1)}% > 5%. Bắt buộc nhập lý do chênh lệch.`,
          chenh_lech_pct: chenh,
        }, { status: 422 });
      }

      // Cập nhật số lượng thực nhận nếu khác yêu cầu
      if (soLuongThucNhan !== soLuongYeuCau && chiTiet) {
        await prisma.chi_tiet_phieu_nhap.update({
          where: { id: chiTiet.id },
          data: { so_luong_thung: soLuongThucNhan },
        });
      }

      // Cập nhật phiếu → DA_DUYET, ghi reviewer info
      await prisma.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: {
          trang_thai: "DA_DUYET",
          ngay_kiem_tra: new Date(),
          ghi_chu_kiem_tra: ghi_chu_kiem_tra || null,
          ly_do_chenh_lech: chenh > 5 ? ly_do_chenh_lech : null,
          ...(ma_nguoi_kiem_tra && { ma_nguoi_kiem_tra: Number(ma_nguoi_kiem_tra) }),
        },
      });

      // Duyệt phiếu: đẩy hàng vào kho + sinh QR
      const result = await WarehouseService.approveReceipt(Number(id));

      return NextResponse.json({
        message: `Đã duyệt! ${result.qrCodes?.length || 0} mã QR đã sinh.`,
        qrCodes: result.qrCodes,
        chenh_lech_pct: chenh,
      });
    }

    // Action: REJECT — từ chối phiếu
    if (action === "reject") {
      const updated = await prisma.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: {
          trang_thai: "DA_HUY",
          ghi_chu_kiem_tra: ghi_chu_kiem_tra || "Bị từ chối bởi người kiểm tra",
        },
      });
      return NextResponse.json({ message: "Đã từ chối phiếu", phieu: updated });
    }

    return NextResponse.json({ error: "Action không hợp lệ (submit|approve|reject)" }, { status: 400 });
  } catch (err: any) {
    console.error("[PATCH /api/admin/warehouse/import/[id]/review]", err);
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}

// ── GET: Lấy danh sách QR codes của phiếu để in ──
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) },
      include: {
        chi_tiet: {
          include: {
            bien_the_san_pham: { include: { san_pham: { select: { ten_san_pham: true } } } },
          },
        },
        nha_cung_cap: { select: { ten_ncc: true } },
        lo_hang_sinh_ra: {
          include: {
            kien_hang_chi_tiet: {
              where: { trang_thai: "TRONG_KHO" },
              include: { vi_tri_kho: true },
              take: 500,
            },
          },
        },
      },
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });

    const chiTiet = phieu.chi_tiet[0];
    const loHang = phieu.lo_hang_sinh_ra[0];

    const qrItems = loHang?.kien_hang_chi_tiet.map((k) => ({
      qr: k.ma_vach_quet,
      ma_lo: loHang.ma_lo_hang,
      san_pham:
        chiTiet?.bien_the_san_pham?.ten_bien_the ||
        chiTiet?.bien_the_san_pham?.san_pham?.ten_san_pham || "N/A",
      han_su_dung: loHang.han_su_dung?.toLocaleDateString("vi-VN") || "N/A",
      vi_tri:
        [k.vi_tri_kho?.khu_vuc, k.vi_tri_kho?.day, k.vi_tri_kho?.ke, k.vi_tri_kho?.tang]
          .filter(Boolean)
          .join(" - ") || "Chưa xác định",
      ncc: phieu.nha_cung_cap?.ten_ncc || "N/A",
    })) || [];

    return NextResponse.json({
      phieu: {
        id: phieu.id,
        ma_phieu: phieu.ma_phieu,
        trang_thai: phieu.trang_thai,
        ncc: phieu.nha_cung_cap?.ten_ncc,
        san_pham: chiTiet?.bien_the_san_pham?.ten_bien_the,
        so_luong_yeu_cau: chiTiet?.so_luong_yeu_cau,
        so_luong_thuc_nhan: chiTiet?.so_luong_thung,
        han_su_dung: loHang?.han_su_dung?.toLocaleDateString("vi-VN"),
        ngay_tao: phieu.ngay_tao?.toLocaleDateString("vi-VN"),
        ghi_chu_kiem_tra: phieu.ghi_chu_kiem_tra,
        ly_do_chenh_lech: phieu.ly_do_chenh_lech,
      },
      qrItems,
      total: qrItems.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
