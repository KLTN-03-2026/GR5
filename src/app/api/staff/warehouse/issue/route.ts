import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncProductStatusFromStock } from "@/lib/product-stock-status";

// Phân loại đơn theo khoảng cách (hỗ trợ cả mã hành chính VN lẫn mã GHN)
function classifyOrder(provinceId: number): "GAN" | "TRUNG" | "XA" {
  if (provinceId === 48 || provinceId === 203) return "GAN";
  const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45, 223, 243, 218, 219, 221, 224, 225];
  if (mienTrung.includes(provinceId)) return "TRUNG";
  return "XA";
}

function getMinDaysLeft(loaiDon: "GAN" | "TRUNG" | "XA"): number {
  switch (loaiDon) {
    case "GAN": return 1;
    case "TRUNG": return 3;
    case "XA": return 5;
  }
}

function getPackingWarning(loaiDon: "GAN" | "TRUNG" | "XA"): string | null {
  switch (loaiDon) {
    case "TRUNG": return "Khuyến nghị đóng gói túi giữ nhiệt";
    case "XA": return "BẮT BUỘC đóng gói lạnh — túi giữ nhiệt + đá khô";
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// GET — Lấy thông tin phiếu xuất + gợi ý lô FEFO theo khoảng cách
// GET /api/staff/warehouse/issue?ma_don_hang=X
// ═══════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const maDonHang = Number(req.nextUrl.searchParams.get("ma_don_hang"));
    if (!maDonHang) {
      return NextResponse.json({ error: "Thiếu ma_don_hang" }, { status: 400 });
    }

    // Lấy đơn hàng
    const donHang = await prisma.don_hang.findUnique({
      where: { id: maDonHang },
      include: {
        chi_tiet_don_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } },
        },
      },
    });
    if (!donHang) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Lấy phiếu xuất
    const phieuXuat = await prisma.phieu_xuat_kho.findFirst({
      where: { ma_don_hang: maDonHang },
      include: {
        chi_tiet_phieu_xuat: {
          include: {
            bien_the_san_pham: { include: { san_pham: true } },
            kien_hang_da_xuat: true,
          },
        },
      },
      orderBy: { ngay_tao: "desc" },
    });

    if (!phieuXuat) {
      return NextResponse.json({ error: "Chưa có phiếu xuất cho đơn này" }, { status: 404 });
    }

    // Phân loại
    const loaiDon = classifyOrder(donHang.ma_tinh_ghn ?? 0);
    const minDaysLeft = getMinDaysLeft(loaiDon);
    const canhBaoDongGoi = getPackingWarning(loaiDon);

    // Gợi ý FEFO cho từng chi tiết phiếu xuất
    const today = new Date();
    const suggestions = await Promise.all(
      phieuXuat.chi_tiet_phieu_xuat.map(async (ct) => {
        const tonKho = await prisma.ton_kho_tong.findMany({
          where: {
            so_luong: { gt: 0 },
            lo_hang: {
              ma_bien_the: ct.ma_bien_the,
              trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
            },
          },
          include: {
            lo_hang: true,
            vi_tri_kho: true,
          },
          orderBy: { lo_hang: { han_su_dung: "asc" } },
        });

        // Lọc theo min_days_left, fallback sang tất cả nếu không đủ hàng
        const filtered = tonKho.filter((tk) => {
          if (!tk.lo_hang?.han_su_dung) return true;
          const hsd = new Date(tk.lo_hang.han_su_dung);
          const daysLeft = Math.ceil((hsd.getTime() - today.getTime()) / 86400000);
          return daysLeft >= minDaysLeft;
        });

        const totalAll = tonKho.reduce((s, t) => s + (t.so_luong ?? 0), 0);
        const daXuat = ct.kien_hang_da_xuat?.length ?? 0;
        const conCanXuat = ct.so_luong_yeu_cau - daXuat;

        // Nếu lô đủ điều kiện không đủ hàng, fallback sang tất cả lô còn hàng
        const usedList = filtered.reduce((s, t) => s + (t.so_luong ?? 0), 0) >= conCanXuat ? filtered : tonKho;
        const totalFiltered = usedList.reduce((s, t) => s + (t.so_luong ?? 0), 0);

        let conLai = conCanXuat;
        const loList = usedList.slice(0, 5).map((tk, idx) => {
          const hsd = tk.lo_hang?.han_su_dung ? new Date(tk.lo_hang.han_su_dung) : null;
          const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / 86400000) : null;
          const canXuat = Math.min(tk.so_luong ?? 0, conLai);
          conLai = Math.max(0, conLai - canXuat);

          return {
            ton_kho_id: tk.id,
            lo_hang_id: tk.lo_hang?.id,
            ma_lo_hang: tk.lo_hang?.ma_lo_hang,
            han_su_dung: hsd?.toLocaleDateString("vi-VN"),
            days_left: daysLeft,
            so_luong_ton: tk.so_luong,
            so_luong_xuat_goi_y: canXuat,
            vi_tri: [tk.vi_tri_kho?.khu_vuc, tk.vi_tri_kho?.day, tk.vi_tri_kho?.ke, tk.vi_tri_kho?.tang].filter(Boolean).join(" — "),
            la_uu_tien: idx === 0,
            urgent: daysLeft !== null && daysLeft <= 7,
          };
        });

        return {
          chi_tiet_id: ct.id,
          ma_bien_the: ct.ma_bien_the,
          ten_san_pham: ct.bien_the_san_pham?.san_pham?.ten_san_pham ?? "",
          ten_bien_the: ct.bien_the_san_pham?.ten_bien_the ?? "",
          so_luong_yeu_cau: ct.so_luong_yeu_cau,
          so_luong_da_xuat: daXuat,
          total_ton_phu_hop: totalFiltered,
          total_ton_tat_ca: totalAll,
          du_hang: totalFiltered >= (ct.so_luong_yeu_cau - daXuat),
          lo_list: loList,
        };
      })
    );

    // Tổng tiến độ
    const tongYeuCau = phieuXuat.chi_tiet_phieu_xuat.reduce((s, ct) => s + ct.so_luong_yeu_cau, 0);
    const tongDaXuat = phieuXuat.chi_tiet_phieu_xuat.reduce((s, ct) => s + (ct.kien_hang_da_xuat?.length ?? 0), 0);

    return NextResponse.json({
      phieu_xuat: {
        id: phieuXuat.id,
        trang_thai: phieuXuat.trang_thai,
        ngay_tao: phieuXuat.ngay_tao,
        ly_do_xuat: phieuXuat.ly_do_xuat,
      },
      don_hang: {
        id: donHang.id,
        ma_hien_thi: `DH${String(donHang.id).padStart(4, "0")}`,
        ho_ten_nguoi_nhan: donHang.ho_ten_nguoi_nhan,
        sdt_nguoi_nhan: donHang.sdt_nguoi_nhan,
        dia_chi_giao_hang: donHang.dia_chi_giao_hang,
        trang_thai: donHang.trang_thai,
      },
      loai_don: loaiDon,
      min_days_left: minDaysLeft,
      canh_bao_dong_goi: canhBaoDongGoi,
      tien_do: { da_xuat: tongDaXuat, tong: tongYeuCau },
      suggestions,
    });
  } catch (err: any) {
    console.error("[GET /api/staff/warehouse/issue]", err);
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST — Thao tác xuất kho: SCAN, COMPLETE, FORCE_COMPLETE
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ─── SCAN: Quét QR 1 kiện ─────────────────────────────────
    if (action === "SCAN") {
      const { qrCode, ma_phieu_xuat } = body;
      if (!qrCode || !ma_phieu_xuat) {
        return NextResponse.json({ error: "Thiếu qrCode hoặc ma_phieu_xuat" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Tìm kiện hàng
        const kienHang = await tx.kien_hang_chi_tiet.findFirst({
          where: { ma_vach_quet: qrCode, trang_thai: "TRONG_KHO" },
          include: { lo_hang: true, vi_tri_kho: true },
        });
        if (!kienHang) {
          throw new Error("Kiện hàng không tồn tại hoặc đã xuất");
        }
        if (!kienHang.lo_hang) {
          throw new Error("Dữ liệu lỗi: kiện hàng thiếu thông tin lô");
        }

        // Tìm chi tiết phiếu xuất tương ứng
        const chiTietXuat = await tx.chi_tiet_phieu_xuat.findFirst({
          where: {
            ma_phieu_xuat: Number(ma_phieu_xuat),
            ma_bien_the: kienHang.lo_hang.ma_bien_the!,
          },
          include: { kien_hang_da_xuat: true },
        });
        if (!chiTietXuat) {
          throw new Error("Kiện hàng không thuộc phiếu xuất này (sai sản phẩm)");
        }

        // Kiểm tra đã xuất đủ chưa
        const daXuat = chiTietXuat.kien_hang_da_xuat.length;
        if (daXuat >= chiTietXuat.so_luong_yeu_cau) {
          throw new Error("Đã xuất đủ số lượng cho sản phẩm này");
        }

        // FEFO validation: check HSD
        const phieuXuat = await tx.phieu_xuat_kho.findUnique({
          where: { id: Number(ma_phieu_xuat) },
          include: { don_hang: true },
        });
        let fefoWarning: string | null = null;
        if (phieuXuat?.don_hang) {
          const loaiDon = classifyOrder(phieuXuat.don_hang.ma_tinh_ghn ?? 0);
          const minDays = getMinDaysLeft(loaiDon);
          if (kienHang.lo_hang.han_su_dung) {
            const hsd = new Date(kienHang.lo_hang.han_su_dung);
            const daysLeft = Math.ceil((hsd.getTime() - Date.now()) / 86400000);
            if (daysLeft < minDays) {
              fefoWarning = `Cảnh báo: Kiện có HSD còn ${daysLeft} ngày, đơn ${loaiDon} yêu cầu tối thiểu ${minDays} ngày`;
            }
          }

          // FEFO order check
          const oldestInStock = await tx.kien_hang_chi_tiet.findFirst({
            where: {
              trang_thai: "TRONG_KHO",
              lo_hang: { ma_bien_the: kienHang.lo_hang.ma_bien_the },
            },
            include: { lo_hang: true },
            orderBy: { lo_hang: { han_su_dung: "asc" } },
          });
          if (oldestInStock?.lo_hang?.han_su_dung && kienHang.lo_hang.han_su_dung) {
            if (kienHang.lo_hang.han_su_dung > oldestInStock.lo_hang.han_su_dung) {
              fefoWarning = (fefoWarning ? fefoWarning + " | " : "") +
                `FEFO: Còn kiện cũ hơn (HSD: ${oldestInStock.lo_hang.han_su_dung.toLocaleDateString("vi-VN")})`;
            }
          }
        }

        // Đánh dấu kiện DA_XUAT
        await tx.kien_hang_chi_tiet.update({
          where: { id: kienHang.id },
          data: { trang_thai: "DA_XUAT" },
        });

        // Tạo record kien_hang_da_xuat
        await tx.kien_hang_da_xuat.create({
          data: {
            ma_chi_tiet_xuat: chiTietXuat.id,
            ma_kien_hang: kienHang.id,
          },
        });

        // Cập nhật so_luong_thuc_xuat
        await tx.chi_tiet_phieu_xuat.update({
          where: { id: chiTietXuat.id },
          data: { so_luong_thuc_xuat: daXuat + 1 },
        });

        // Sync tồn kho
        if (kienHang.ma_lo_hang && kienHang.ma_vi_tri) {
          const count = await tx.kien_hang_chi_tiet.count({
            where: {
              ma_lo_hang: kienHang.ma_lo_hang,
              ma_vi_tri: kienHang.ma_vi_tri,
              trang_thai: "TRONG_KHO",
            },
          });
          await tx.ton_kho_tong.updateMany({
            where: {
              ma_lo_hang: kienHang.ma_lo_hang,
              ma_vi_tri: kienHang.ma_vi_tri,
            },
            data: { so_luong: count },
          });
        }

        await syncProductStatusFromStock(tx, [kienHang.lo_hang.ma_bien_the]);

        return {
          message: `Đã quét kiện ${qrCode}`,
          kien_hang_id: kienHang.id,
          ma_lo: kienHang.lo_hang.ma_lo_hang,
          fefo_warning: fefoWarning,
        };
      });

      return NextResponse.json({ success: true, ...result });
    }

    // ─── COMPLETE: Hoàn thành phiếu xuất ──────────────────────
    if (action === "COMPLETE") {
      const { ma_phieu_xuat } = body;
      if (!ma_phieu_xuat) {
        return NextResponse.json({ error: "Thiếu ma_phieu_xuat" }, { status: 400 });
      }

      const phieu = await prisma.phieu_xuat_kho.findUnique({
        where: { id: Number(ma_phieu_xuat) },
        include: { chi_tiet_phieu_xuat: { include: { kien_hang_da_xuat: true } } },
      });
      if (!phieu) {
        return NextResponse.json({ error: "Không tìm thấy phiếu xuất" }, { status: 404 });
      }

      // Kiểm tra đã xuất đủ chưa
      const chuaDu = phieu.chi_tiet_phieu_xuat.some(
        (ct) => (ct.kien_hang_da_xuat?.length ?? 0) < ct.so_luong_yeu_cau
      );
      if (chuaDu) {
        return NextResponse.json({ error: "Chưa xuất đủ số lượng. Dùng FORCE_COMPLETE nếu muốn xuất thiếu." }, { status: 400 });
      }

      await prisma.phieu_xuat_kho.update({
        where: { id: Number(ma_phieu_xuat) },
        data: { trang_thai: "HOAN_THANH" },
      });

      return NextResponse.json({ success: true, message: "Phiếu xuất hoàn thành" });
    }

    // ─── FORCE_COMPLETE: Xuất thiếu + ghi lý do ──────────────
    if (action === "FORCE_COMPLETE") {
      const { ma_phieu_xuat, ly_do } = body;
      if (!ma_phieu_xuat) {
        return NextResponse.json({ error: "Thiếu ma_phieu_xuat" }, { status: 400 });
      }

      await prisma.phieu_xuat_kho.update({
        where: { id: Number(ma_phieu_xuat) },
        data: {
          trang_thai: "HOAN_THANH",
          ly_do_xuat: `XUAT_THEO_DON_HANG (thiếu: ${ly_do || "không rõ"})`,
        },
      });

      return NextResponse.json({ success: true, message: "Phiếu xuất hoàn thành (xuất thiếu)" });
    }

    // ─── QUICK_ISSUE: Xuất nhanh từ lô gợi ý (không cần quét QR) ──
    if (action === "QUICK_ISSUE") {
      const { ma_phieu_xuat, ma_bien_the, lo_hang_id, so_luong } = body;
      if (!ma_phieu_xuat || !ma_bien_the || !lo_hang_id || !so_luong) {
        return NextResponse.json({ error: "Thiếu thông tin (ma_phieu_xuat, ma_bien_the, lo_hang_id, so_luong)" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const chiTietXuat = await tx.chi_tiet_phieu_xuat.findFirst({
          where: { ma_phieu_xuat: Number(ma_phieu_xuat), ma_bien_the: Number(ma_bien_the) },
          include: { kien_hang_da_xuat: true },
        });
        if (!chiTietXuat) throw new Error("Không tìm thấy chi tiết phiếu xuất");

        const daXuat = chiTietXuat.kien_hang_da_xuat.length;
        const conCanXuat = chiTietXuat.so_luong_yeu_cau - daXuat;
        if (conCanXuat <= 0) throw new Error("Đã xuất đủ cho sản phẩm này");

        const soLuongXuat = Math.min(Number(so_luong), conCanXuat);

        // Lấy kiện hàng TRONG_KHO thuộc lô này
        const kienHangs = await tx.kien_hang_chi_tiet.findMany({
          where: { ma_lo_hang: Number(lo_hang_id), trang_thai: "TRONG_KHO" },
          take: soLuongXuat,
        });

        let actualXuat = 0;

        if (kienHangs.length > 0) {
          actualXuat = kienHangs.length;
          for (const kh of kienHangs) {
            await tx.kien_hang_chi_tiet.update({
              where: { id: kh.id },
              data: { trang_thai: "DA_XUAT" },
            });
            await tx.kien_hang_da_xuat.create({
              data: { ma_chi_tiet_xuat: chiTietXuat.id, ma_kien_hang: kh.id },
            });
          }

          // Sync tồn kho theo kiện
          const firstKh = kienHangs[0];
          if (firstKh.ma_vi_tri) {
            const count = await tx.kien_hang_chi_tiet.count({
              where: { ma_lo_hang: Number(lo_hang_id), ma_vi_tri: firstKh.ma_vi_tri, trang_thai: "TRONG_KHO" },
            });
            await tx.ton_kho_tong.updateMany({
              where: { ma_lo_hang: Number(lo_hang_id), ma_vi_tri: firstKh.ma_vi_tri },
              data: { so_luong: count },
            });
          }
        } else {
          // Fallback: không có kiện hàng chi tiết, trừ trực tiếp tồn kho tổng
          const tonKho = await tx.ton_kho_tong.findFirst({
            where: { ma_lo_hang: Number(lo_hang_id), so_luong: { gt: 0 } },
          });
          const available = tonKho?.so_luong ?? 0;
          if (!tonKho || available < soLuongXuat) {
            throw new Error("Không đủ tồn kho trong lô này");
          }

          actualXuat = soLuongXuat;

          // Trừ tồn kho
          await tx.ton_kho_tong.update({
            where: { id: tonKho.id },
            data: { so_luong: available - actualXuat },
          });

          // Tạo record xuất (không link kiện hàng)
          for (let i = 0; i < actualXuat; i++) {
            await tx.kien_hang_da_xuat.create({
              data: { ma_chi_tiet_xuat: chiTietXuat.id, ma_kien_hang: null },
            });
          }
        }

        await tx.chi_tiet_phieu_xuat.update({
          where: { id: chiTietXuat.id },
          data: { so_luong_thuc_xuat: daXuat + actualXuat },
        });

        await syncProductStatusFromStock(tx, [Number(ma_bien_the)]);

        return { message: `Đã xuất ${actualXuat} kiện từ lô`, so_luong_xuat: actualXuat };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Action không hợp lệ (SCAN|COMPLETE|FORCE_COMPLETE|QUICK_ISSUE)" }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/staff/warehouse/issue]", err);
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
