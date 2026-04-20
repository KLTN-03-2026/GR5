import prisma from "@/lib/prisma";

type WarehouseMapFloor = {
  id: number;
  tang: string;
  capacity: number;
  current: number;
  percent: number;
  expiringSoon: boolean;
  so_luong_ton: number;
  batches: Array<{
    id: number;
    ma_lo_hang: string;
    san_pham: string;
    so_luong: number;
    han_su_dung: string;
    days_left: number | null;
    warning: boolean;
    vi_tri: string;
    ncc: string | null;
    ma_bien_the: number | null;
  }>;
};

function getDaysLeft(hanSuDung?: Date | null) {
  if (!hanSuDung) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hsd = new Date(hanSuDung);
  hsd.setHours(0, 0, 0, 0);
  return Math.ceil((hsd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date?: Date | null) {
  return date ? date.toLocaleDateString("vi-VN") : "N/A";
}

function parseHistoryLines(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\[(.*?)\]\s*(.*)$/);
      return {
        at: match?.[1] ?? "",
        text: match?.[2] ?? line,
      };
    });
}

function buildHistoryLine(label: string, content: string) {
  return `[${new Date().toLocaleString("vi-VN")}] ${label}: ${content}`;
}

function buildReasonTrail(previous?: string | null, next?: string | null) {
  const parts = [previous?.trim(), next?.trim()].filter(Boolean);
  return parts.join("\n");
}

function getThresholdColor(percent: number) {
  if (percent > 90) return "red";
  if (percent > 75) return "amber";
  return "green";
}

export const WarehouseAdminService = {
  async getMapData() {
    const positions = await prisma.vi_tri_kho.findMany({
      include: {
        ton_kho_tong: {
          where: { so_luong: { gt: 0 } },
          include: {
            lo_hang: {
              include: {
                bien_the_san_pham: { include: { san_pham: { select: { id: true, ten_san_pham: true } } } },
                nha_cung_cap: { select: { id: true, ten_ncc: true } },
              },
            },
          },
        },
        _count: {
          select: { kien_hang_chi_tiet: { where: { trang_thai: "TRONG_KHO" } } },
        },
      },
      orderBy: [{ khu_vuc: "asc" }, { day: "asc" }, { ke: "asc" }, { tang: "asc" }],
    });

    const today30 = new Date();
    today30.setDate(today30.getDate() + 30);

    const tree: Record<string, any> = {};

    for (const position of positions) {
      const khu = position.khu_vuc || "Khu khác";
      const day = position.day || "D1";
      const ke = position.ke || "K1";

      if (!tree[khu]) {
        tree[khu] = { name: khu, days: {}, totalCapacity: 0, totalCurrent: 0, expiringSoon: 0 };
      }
      if (!tree[khu].days[day]) {
        tree[khu].days[day] = { name: day, shelves: {} };
      }
      if (!tree[khu].days[day].shelves[ke]) {
        tree[khu].days[day].shelves[ke] = { name: ke, floors: [] };
      }

      const floorBatches = position.ton_kho_tong.map((entry) => {
        const hsd = entry.lo_hang?.han_su_dung ? new Date(entry.lo_hang.han_su_dung) : null;
        const daysLeft = getDaysLeft(hsd);
        const warning = daysLeft !== null && daysLeft <= 30;

        return {
          id: entry.id,
          ma_lo_hang: entry.lo_hang?.ma_lo_hang ?? `LO-${entry.ma_lo_hang}`,
          san_pham:
            entry.lo_hang?.bien_the_san_pham?.ten_bien_the ||
            entry.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham ||
            "N/A",
          so_luong: entry.so_luong ?? 0,
          han_su_dung: formatDate(hsd),
          days_left: daysLeft,
          warning,
          vi_tri: [khu, day, ke, position.tang || "T1"].filter(Boolean).join(" / "),
          ncc: entry.lo_hang?.nha_cung_cap?.ten_ncc ?? null,
          ma_bien_the: entry.lo_hang?.ma_bien_the ?? null,
        };
      });

      const current = position._count.kien_hang_chi_tiet;
      const capacity = position.suc_chua_toi_da ?? 100;
      const totalQty = floorBatches.reduce((sum, batch) => sum + batch.so_luong, 0);
      const expiringSoon = floorBatches.some((batch) => batch.warning);
      const percent = capacity > 0 ? Math.round((current / capacity) * 100) : 0;

      const floor: WarehouseMapFloor = {
        id: position.id,
        tang: position.tang || "T1",
        capacity,
        current,
        percent,
        expiringSoon,
        so_luong_ton: totalQty,
        batches: floorBatches,
      };

      tree[khu].days[day].shelves[ke].floors.push(floor);
      tree[khu].totalCapacity += capacity;
      tree[khu].totalCurrent += current;
      tree[khu].expiringSoon += floorBatches.filter((batch) => batch.warning).length;
    }

    const zones = Object.values(tree).map((zone: any) => ({
      ...zone,
      days: Object.values(zone.days).map((day: any) => ({
        ...day,
        shelves: Object.values(day.shelves),
      })),
    }));

    const totalBoxes = positions.reduce((sum, position) => sum + position._count.kien_hang_chi_tiet, 0);
    const expiringBoxes = positions.reduce((sum, position) => {
      const soonCount = position.ton_kho_tong.filter((entry) => {
        const daysLeft = getDaysLeft(entry.lo_hang?.han_su_dung);
        return daysLeft !== null && daysLeft <= 7;
      }).length;
      return sum + soonCount;
    }, 0);

    return {
      zones,
      stats: {
        totalBoxes,
        expiringBoxes,
        zonesCount: zones.length,
      },
    };
  },

  async getReceiptList(status: string) {
    const normalizedStatus = status || "pending";
    const where =
      normalizedStatus === "all"
        ? {}
        : normalizedStatus === "pending"
          ? { trang_thai: { in: ["CHO_DUYET", "CHO_KIEM_TRA"] as any } }
          : { trang_thai: normalizedStatus as any };

    const receipts = await prisma.phieu_nhap_kho.findMany({
      where,
      orderBy: { ngay_tao: "desc" },
      take: 100,
      include: {
        nha_cung_cap: { select: { ten_ncc: true } },
        nguoi_dung: { select: { email: true, ho_so_nguoi_dung: { select: { ho_ten: true } } } },
        chi_tiet_phieu_nhap: {
          include: {
            bien_the_san_pham: { select: { ten_bien_the: true } },
          },
        },
      },
    });

    return receipts.map((receipt) => ({
      id: receipt.id,
      ma_phieu: `PN-${receipt.id}`,
      ncc_ten: receipt.nha_cung_cap?.ten_ncc || "N/A",
      ngay_tao: receipt.ngay_tao?.toISOString() ?? null,
      trang_thai: receipt.trang_thai,
      nguoi_tao: receipt.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || receipt.nguoi_dung?.email || "N/A",
      tong_san_pham: receipt.chi_tiet_phieu_nhap.length,
      tong_so_luong: receipt.chi_tiet_phieu_nhap.reduce((sum, item) => sum + Number(item.so_luong_yeu_cau ?? 0), 0),
      co_chenh_lech: receipt.chi_tiet_phieu_nhap.some((item) => Number(item.so_luong_thuc_nhan ?? 0) !== Number(item.so_luong_yeu_cau ?? 0)),
    }));
  },

  async getReceiptDetail(receiptId: number) {
    const receipt = await prisma.phieu_nhap_kho.findUnique({
      where: { id: receiptId },
      include: {
        nha_cung_cap: true,
        nguoi_dung: { select: { email: true, ho_so_nguoi_dung: { select: { ho_ten: true } } } },
        chi_tiet_phieu_nhap: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: { select: { id: true, ten_san_pham: true } } },
            },
          },
        },
      },
    });

    if (!receipt) return null;

    const lineItems = receipt.chi_tiet_phieu_nhap.map((item) => {
      const requested = Number(item.so_luong_yeu_cau ?? 0);
      const received = Number(item.so_luong_thuc_nhan ?? 0);
      return {
        id: item.id,
        san_pham: item.bien_the_san_pham?.ten_bien_the || item.bien_the_san_pham?.san_pham?.ten_san_pham || "N/A",
        ma_bien_the: item.ma_bien_the,
        yeu_cau: requested,
        thuc_nhan: received,
        chenh_lech: received - requested,
        ly_do_chenh_lech: receipt.ly_do_chenh_lech ?? null,
        ghi_chu: receipt.ghi_chu_kiem_tra ?? null,
      };
    });

    const history = parseHistoryLines(receipt.ghi_chu_kiem_tra);

    return {
      phieu: {
        id: receipt.id,
        ma_phieu: `PN-${receipt.id}`,
        ncc: receipt.nha_cung_cap?.ten_ncc || "N/A",
        ngay_tao: receipt.ngay_tao?.toISOString() ?? null,
        trang_thai: receipt.trang_thai,
        nguoi_tao: receipt.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || receipt.nguoi_dung?.email || "N/A",
      },
      items: lineItems,
      history,
    };
  },

  async approveReceipt(receiptId: number) {
    const receipt = await prisma.phieu_nhap_kho.findUnique({
      where: { id: receiptId },
      include: {
        nha_cung_cap: true,
        chi_tiet_phieu_nhap: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: { select: { ten_san_pham: true } } },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new Error("Không tìm thấy phiếu nhập");
    }

    if (!["CHO_DUYET", "CHO_KIEM_TRA"].includes(String(receipt.trang_thai ?? ""))) {
      throw new Error("Phiếu không ở trạng thái có thể duyệt");
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalCreatedQr = 0;
      let totalQuantity = 0;
      let totalDebt = 0;

      const approvalLines: string[] = [];

      for (const detail of receipt.chi_tiet_phieu_nhap) {
        const requested = Number(detail.so_luong_yeu_cau ?? 0);
        const received = Number(detail.so_luong_thuc_nhan ?? requested);
        if (received <= 0) {
          throw new Error(`Phiếu PN-${receipt.id} có dòng hàng không hợp lệ`);
        }

        const lotCode = `LO-${receipt.id}-${detail.id}-${Date.now().toString().slice(-5)}`;
        const lot = await tx.lo_hang.create({
          data: {
            ma_lo_hang: lotCode,
            ma_bien_the: detail.ma_bien_the,
            ma_ncc: receipt.ma_ncc,
            ma_phieu_nhap: receipt.id,
            ngay_thu_hoach: null,
            ngay_nhap_kho: new Date(),
            han_su_dung: new Date(),
          },
        });

        let viTri = await tx.vi_tri_kho.findFirst({
          where: {
            khu_vuc: "Khu mặc định",
            day: "D1",
            ke: "K1",
            tang: "T1",
          },
        });

        if (!viTri) {
          viTri = await tx.vi_tri_kho.create({
            data: {
              khu_vuc: "Khu mặc định",
              day: "D1",
              ke: "K1",
              tang: "T1",
            },
          });
        }

        await tx.ton_kho_tong.create({
          data: {
            ma_lo_hang: lot.id,
            ma_vi_tri: viTri.id,
            so_luong: received,
          },
        });

        const qrRows = Array.from({ length: received }, (_, index) => ({
          ma_lo_hang: lot.id,
          ma_vi_tri: viTri!.id,
          ma_vach_quet: `QR-${lotCode}-${String(index + 1).padStart(4, "0")}`,
          trang_thai: "TRONG_KHO",
        }));

        if (qrRows.length > 0) {
          await tx.kien_hang_chi_tiet.createMany({ data: qrRows });
        }

        const lineTotal = Number(detail.don_gia ?? 0) * received;
        totalCreatedQr += qrRows.length;
        totalQuantity += received;
        totalDebt += lineTotal;

        approvalLines.push(`${detail.bien_the_san_pham?.ten_bien_the || detail.bien_the_san_pham?.san_pham?.ten_san_pham || "N/A"}: ${received}/${requested}`);
      }

      const lastDebt = await tx.cong_no_ncc.findFirst({
        where: { ma_ncc: receipt.ma_ncc ?? undefined },
        orderBy: { ngay_giao_dich: "desc" },
        select: { so_du_sau: true },
      });
      const debtBefore = Number(lastDebt?.so_du_sau ?? 0);
      const debtAfter = debtBefore + totalDebt;

      await tx.cong_no_ncc.create({
        data: {
          ma_ncc: receipt.ma_ncc || 0,
          ma_phieu_nhap: receipt.id,
          loai_giao_dich: "PHAT_SINH_NO",
          so_tien: totalDebt,
          so_du_sau: debtAfter,
          phuong_thuc: "CHUYEN_KHOAN",
          nguoi_thuc_hien_id: receipt.ma_nguoi_tao ?? null,
          ghi_chu: `Phát sinh công nợ từ phiếu PN-${receipt.id}`,
        },
      });

      const updatedNote = buildReasonTrail(receipt.ghi_chu_kiem_tra, buildHistoryLine("Duyệt", approvalLines.join(" | ")));

      await tx.phieu_nhap_kho.update({
        where: { id: receipt.id },
        data: {
          trang_thai: "DA_DUYET" as any,
          ngay_duyet: new Date(),
          ghi_chu_kiem_tra: updatedNote,
          ly_do_chenh_lech: receipt.ly_do_chenh_lech ?? null,
        },
      });

      return {
        qrCount: totalCreatedQr,
        totalQuantity,
        debtAfter,
        supplierName: receipt.nha_cung_cap?.ten_ncc || "N/A",
        receiptCode: `PN-${receipt.id}`,
      };
    });

    await prisma.thong_bao.createMany({
      data: [
        {
          ma_nguoi_dung: receipt.ma_nguoi_tao ?? null,
          tieu_de: "Vào in mã QR",
          noi_dung: `Phiếu ${result.receiptCode} đã duyệt. Vào in ${result.qrCount} mã QR để nhập kho.`,
          loai_thong_bao: "NHAP_KHO_QR",
        },
      ],
    });

    return result;
  },

  async rejectReceipt(receiptId: number, reason: string) {
    const receipt = await prisma.phieu_nhap_kho.findUnique({
      where: { id: receiptId },
      select: { id: true, ghi_chu_kiem_tra: true, ma_nguoi_tao: true },
    });

    if (!receipt) {
      throw new Error("Không tìm thấy phiếu nhập");
    }

    const historyLine = buildHistoryLine("Từ chối", reason);
    const updated = await prisma.phieu_nhap_kho.update({
      where: { id: receiptId },
      data: {
        trang_thai: "CHO_KIEM_TRA" as any,
        ghi_chu_kiem_tra: buildReasonTrail(receipt.ghi_chu_kiem_tra, historyLine),
        ly_do_chenh_lech: reason,
      },
    });

    await prisma.thong_bao.createMany({
      data: [
        {
          ma_nguoi_dung: receipt.ma_nguoi_tao ?? null,
          tieu_de: "Phiếu nhập bị từ chối",
          noi_dung: `Phiếu PN-${receipt.id} bị từ chối: ${reason}`,
          loai_thong_bao: "NHAP_KHO_TU_CHOI",
        },
      ],
    });

    return { receipt: updated };
  },

  async getAlerts(filter: string) {
    const rawWarnings = await prisma.canh_bao_lo_hang.findMany({
      orderBy: [{ da_xu_ly: "asc" }, { ngay_tao: "desc" }],
      include: {
        lo_hang: {
          include: {
            bien_the_san_pham: {
              include: { san_pham: { select: { id: true, ten_san_pham: true } } },
            },
            nha_cung_cap: { select: { id: true, ten_ncc: true } },
            ton_kho_tong: {
              where: { so_luong: { gt: 0 } },
              include: {
                vi_tri_kho: true,
              },
            },
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mapped = rawWarnings.map((warning) => {
      const hsd = warning.lo_hang?.han_su_dung ? new Date(warning.lo_hang.han_su_dung) : null;
      const daysLeft = getDaysLeft(hsd);
      const tonKho = warning.lo_hang?.ton_kho_tong || [];
      const totalQty = tonKho.reduce((sum, item) => sum + (item.so_luong ?? 0), 0);
      const viTri = tonKho
        .map((item) => [item.vi_tri_kho?.khu_vuc, item.vi_tri_kho?.day, item.vi_tri_kho?.ke, item.vi_tri_kho?.tang].filter(Boolean).join("-"))
        .filter(Boolean)
        .join(", ");

      const proposedAction = warning.phuong_thuc_xu_ly || (warning.ghi_chu_xu_ly ? "DE_XUAT" : null);
      const evidence = warning.ghi_chu_xu_ly && warning.ghi_chu_xu_ly.includes("http")
        ? warning.ghi_chu_xu_ly.split(/\s+/).filter((token) => token.startsWith("http"))
        : [];

      return {
        id: warning.id,
        ma_lo_hang_id: warning.lo_hang?.id ?? null,
        ma_lo: warning.lo_hang?.ma_lo_hang ?? `LO-${warning.ma_lo_hang}`,
        san_pham:
          warning.lo_hang?.bien_the_san_pham?.ten_bien_the ||
          warning.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham ||
          "N/A",
        san_pham_id: warning.lo_hang?.bien_the_san_pham?.san_pham?.id ?? null,
        ma_bien_the: warning.lo_hang?.ma_bien_the ?? null,
        ncc_id: warning.lo_hang?.nha_cung_cap?.id ?? null,
        ncc_ten: warning.lo_hang?.nha_cung_cap?.ten_ncc ?? null,
        so_luong: totalQty,
        vi_tri: viTri || "Chưa xác định",
        han_su_dung: formatDate(hsd),
        days_left: daysLeft,
        loai_canh_bao: warning.loai_canh_bao,
        da_xu_ly: warning.da_xu_ly,
        phuong_thuc_xu_ly: warning.phuong_thuc_xu_ly ?? null,
        ghi_chu_xu_ly: warning.ghi_chu_xu_ly ?? null,
        proposed_action: proposedAction,
        evidence_images: evidence,
        ton_kho: tonKho.map((item) => ({
          id: item.id,
          so_luong: item.so_luong,
          vi_tri_id: item.ma_vi_tri,
        })),
      };
    });

    const sorted = mapped.sort((a, b) => {
      const leftA = a.days_left ?? 9999;
      const leftB = b.days_left ?? 9999;
      return leftA - leftB;
    });

    const filtered =
      filter === "pending"
        ? sorted.filter((item) => !item.da_xu_ly && item.proposed_action)
        : filter === "action-needed"
          ? sorted.filter((item) => !item.da_xu_ly && !item.proposed_action)
          : sorted;

    return {
      items: filtered,
      grouped: {
        actionNeeded: sorted.filter((item) => !item.da_xu_ly && !item.proposed_action),
        pendingReview: sorted.filter((item) => !item.da_xu_ly && item.proposed_action),
      },
    };
  },

  async approveDestroy(alertId: number) {
    const alert = await prisma.canh_bao_lo_hang.findUnique({
      where: { id: alertId },
      include: { lo_hang: true },
    });

    if (!alert?.lo_hang) {
      throw new Error("Không tìm thấy cảnh báo");
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.lo_hang.update({
        where: { id: alert.lo_hang.id },
        data: { trang_thai: "CHO_TIEU_HUY" },
      });

      return tx.canh_bao_lo_hang.update({
        where: { id: alertId },
        data: {
          da_xu_ly: true,
          ngay_xu_ly: new Date(),
          phuong_thuc_xu_ly: "CHO_TIEU_HUY",
          ghi_chu_xu_ly: buildReasonTrail(alert.ghi_chu_xu_ly, buildHistoryLine("Duyệt tiêu hủy", alert.lo_hang.ma_lo_hang)),
        },
      });
    });

    await prisma.thong_bao.createMany({
      data: [
        {
          ma_nguoi_dung: null,
          tieu_de: "Duyệt tiêu hủy lô hàng",
          noi_dung: `Lô ${alert.lo_hang.ma_lo_hang} đã được duyệt tiêu hủy. Nhân viên kho vui lòng thực hiện bước xác nhận cuối cùng trên màn hình staff.`,
          loai_thong_bao: "TIEU_HUY_CAN_THUC_HIEN",
        },
      ],
    });

    return { updated };
  },

  async approveClearance(alertId: number, discountPercent: number, endDate: Date) {
    const alert = await prisma.canh_bao_lo_hang.findUnique({
      where: { id: alertId },
      include: {
        lo_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } },
        },
      },
    });

    if (!alert?.lo_hang) {
      throw new Error("Không tìm thấy cảnh báo");
    }

    const lotCode = `PROMO-${alert.lo_hang.id}-${Date.now().toString().slice(-6)}`;

    const promo = await prisma.ma_giam_gia.create({
      data: {
        ma_code: lotCode,
        loai_giam_gia: "PHAN_TRAM",
        gia_tri_giam: discountPercent,
        don_toi_thieu: 0,
        ngay_bat_dau: new Date(),
        ngay_ket_thuc: endDate,
        // @ts-ignore
        ma_bien_the_ap_dung: alert.lo_hang.ma_bien_the,
      },
    });

    await prisma.canh_bao_lo_hang.update({
      where: { id: alertId },
      data: {
        da_xu_ly: true,
        ngay_xu_ly: new Date(),
        phuong_thuc_xu_ly: "CHO_XA_KHO",
        ghi_chu_xu_ly: buildReasonTrail(alert.ghi_chu_xu_ly, buildHistoryLine("Duyệt xả kho", `${discountPercent}% -> ${promo.ma_code}`)),
      },
    });

    await prisma.lo_hang.update({
      where: { id: alert.lo_hang.id },
      data: { trang_thai: "CHO_XA_KHO" },
    });

    await prisma.thong_bao.createMany({
      data: [
        {
          ma_nguoi_dung: null,
          tieu_de: "Tạo chương trình xả kho",
          noi_dung: `Đã tạo mã khuyến mãi ${promo.ma_code} cho lô ${alert.lo_hang.ma_lo_hang}.`,
          loai_thong_bao: "XA_KHO_KHUYEN_MAI",
        },
      ],
    });

    return { promoId: promo.id, promoCode: promo.ma_code };
  },
};