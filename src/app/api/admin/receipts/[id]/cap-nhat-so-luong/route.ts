import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { chi_tiet, ghi_chu_kiem_tra, ly_do_chenh_lech, anh_bang_chung, han_su_dung_thuc_te, ngay_thu_hoach_tt, chat_luong, ma_vi_tri_cat } = body;

    const userId = 1;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) }
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    if (phieu.da_xac_nhan_kiem_tra) {
      return NextResponse.json({ error: "Không thể sửa sau khi đã xác nhận" }, { status: 403 });
    }
    if (!["CHO_KIEM_TRA", "DANG_KIEM_TRA_LAI"].includes(phieu.trang_thai || "")) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ để cập nhật" }, { status: 400 });
    }

    if (!han_su_dung_thuc_te) return NextResponse.json({ error: "Hạn sử dụng thực tế là bắt buộc" }, { status: 400 });
    if (new Date(han_su_dung_thuc_te) <= new Date(phieu.ngay_tao || new Date())) {
      return NextResponse.json({ error: "HSD phải sau ngày nhập kho" }, { status: 400 });
    }
    if (ngay_thu_hoach_tt && new Date(ngay_thu_hoach_tt) > new Date()) {
      return NextResponse.json({ error: "Ngày thu hoạch không thể là tương lai" }, { status: 400 });
    }
    if (chat_luong === "KHONG_DAT" && !ly_do_chenh_lech) {
      return NextResponse.json({ error: "Cần nhập lý do khi chất lượng Không đạt" }, { status: 400 });
    }

    let tong_so_luong_thuc_nhan = 0;
    for (const item of chi_tiet) {
       const ct = await prisma.chi_tiet_phieu_nhap.findUnique({ where: { id: item.id }});
       if (ct) {
         const pct = Math.abs((item.so_luong_thuc_nhan - ct.so_luong_yeu_cau) / ct.so_luong_yeu_cau * 100);
         if (pct > 20 && (!anh_bang_chung || anh_bang_chung.length === 0)) {
           return NextResponse.json({ error: "Chênh lệch > 20% cần upload ảnh bằng chứng", require_evidence: true, chenh_lech_pct: pct }, { status: 400 });
         }
         tong_so_luong_thuc_nhan += item.so_luong_thuc_nhan;
       }
    }

    if (ma_vi_tri_cat) {
      const viTri = await prisma.vi_tri_kho.findUnique({ where: { id: ma_vi_tri_cat }});
      if (viTri) {
        const tonKhoList = await prisma.ton_kho_tong.findMany({ where: { ma_vi_tri: ma_vi_tri_cat }});
        const used = tonKhoList.reduce((sum, tk) => sum + (tk.so_luong || 0), 0);
        const available = (viTri.suc_chua_toi_da || 100) - used;
        if (available < tong_so_luong_thuc_nhan) {
          return NextResponse.json({ error: "Vị trí không đủ sức chứa", available, required: tong_so_luong_thuc_nhan }, { status: 400 });
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of chi_tiet) {
        const ct = await tx.chi_tiet_phieu_nhap.findUnique({ where: { id: item.id }});
        if (ct) {
          const pct = Math.abs((item.so_luong_thuc_nhan - ct.so_luong_yeu_cau) / ct.so_luong_yeu_cau * 100);
          await tx.chi_tiet_phieu_nhap.update({
            where: { id: item.id },
            data: { so_luong_thuc_nhan: item.so_luong_thuc_nhan, chenh_lech_pct: pct }
          });
        }
      }
      
      await tx.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: {
          ghi_chu_kiem_tra,
          ly_do_chenh_lech,
          anh_bang_chung: anh_bang_chung && anh_bang_chung.length > 0 ? anh_bang_chung : undefined,
          ma_nguoi_kiem_tra: userId,
          ngay_kiem_tra: new Date(),
          han_su_dung_thuc_te: new Date(han_su_dung_thuc_te),
          ngay_thu_hoach_tt: ngay_thu_hoach_tt ? new Date(ngay_thu_hoach_tt) : null,
          chat_luong: chat_luong || "DAT",
          ma_vi_tri_cat: ma_vi_tri_cat || null
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
