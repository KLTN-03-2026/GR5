import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { ly_do, tao_phieu_tra, ghi_chu_cho_ncc } = body;
    const userId = 1;

    const phieu = await prisma.phieu_nhap_kho.findUnique({
      where: { id: Number(id) },
      include: { chi_tiet_phieu_nhap: true }
    });

    if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    if (phieu.trang_thai !== "DA_KIEM_TRA") {
      return NextResponse.json({ error: "Chỉ phiếu DA_KIEM_TRA mới được từ chối" }, { status: 400 });
    }

    let phieuTraId: number | undefined;
    let phieuXuatId: number | undefined;

    await prisma.$transaction(async (tx) => {
      const ghiChuAdd = `\n[TỪ CHỐI - ${new Date().toISOString()}]: ${ly_do}`;
      await tx.phieu_nhap_kho.update({
        where: { id: Number(id) },
        data: {
          trang_thai: "TU_CHOI",
          ghi_chu: phieu.ghi_chu ? phieu.ghi_chu + ghiChuAdd : ghiChuAdd
        }
      });

      if (tao_phieu_tra && phieu.ma_ncc && phieu.ma_kho) {
        const tong_tien_hoan = phieu.chi_tiet_phieu_nhap.reduce((sum, item) => {
          return sum + (item.so_luong_thuc_nhan || 0) * Number(item.don_gia);
        }, 0);

        const phieuTra = await tx.phieu_tra_nha_cung_cap.create({
          data: {
            ma_ncc: phieu.ma_ncc,
            ma_nguoi_tao: userId,
            tong_tien_hoan_du_kien: tong_tien_hoan,
            trang_thai: "DANG_XU_LY"
          }
        });
        phieuTraId = phieuTra.id;

        const phieuXuat = await tx.phieu_xuat_kho.create({
          data: {
            ma_kho: phieu.ma_kho,
            ma_nguoi_tao: userId,
            ma_phieu_tra_ncc: phieuTra.id,
            ly_do_xuat: "TRA_NCC",
            trang_thai: "CHO_XUAT"
          }
        });
        phieuXuatId = phieuXuat.id;

        for (const item of phieu.chi_tiet_phieu_nhap) {
          await tx.chi_tiet_phieu_xuat.create({
            data: {
              ma_phieu_xuat: phieuXuat.id,
              ma_bien_the: item.ma_bien_the,
              so_luong_yeu_cau: item.so_luong_thuc_nhan || 0,
              so_luong_thuc_xuat: 0
            }
          });
        }

        const existingCongNo = await tx.cong_no_ncc.findFirst({
          where: {
            ma_ncc: phieu.ma_ncc!,
            loai_giao_dich: "PHAT_SINH_NO",
            ghi_chu: { contains: `#${id}` }
          }
        });

        if (existingCongNo && existingCongNo.so_tien) {
          await tx.cong_no_ncc.create({
            data: {
              ma_ncc: phieu.ma_ncc,
              loai_giao_dich: "TRA_HANG_HOAN_TIEN",
              so_tien: -Number(existingCongNo.so_tien),
              nguoi_thuc_hien_id: userId,
              ghi_chu: `Hoàn nợ phiếu #${id} do từ chối`
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true, phieu_tra_id: phieuTraId, phieu_xuat_id: phieuXuatId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
