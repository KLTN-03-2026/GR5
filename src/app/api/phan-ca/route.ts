import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lấy lịch phân ca trong một khoảng thời gian (Tuần/Tháng)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tu_ngay = searchParams.get('tu_ngay');
    const den_ngay = searchParams.get('den_ngay');

    if (!tu_ngay || !den_ngay) {
      return NextResponse.json({ success: false, message: 'Thiếu tham số tu_ngay hoặc den_ngay' }, { status: 400 });
    }

    const startDate = new Date(tu_ngay);
    const endDate = new Date(den_ngay);
    endDate.setHours(23, 59, 59, 999);

    const lichPhanCa = await prisma.lich_phan_cong_ca.findMany({
      where: {
        ngay_lam_viec: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_so_nguoi_dung: {
              select: { ho_ten: true, anh_dai_dien: true, chuc_vu: true }
            }
          }
        },
        ca_lam_viec: true,
      },
      orderBy: { ngay_lam_viec: 'asc' },
    });

    // Lấy thêm danh sách ca làm việc (để FE dùng làm bộ lọc/dropdown)
    const danhSachCa = await prisma.ca_lam_viec.findMany();

    return NextResponse.json({ 
      success: true, 
      data: lichPhanCa,
      ca_lam_viec: danhSachCa
    }, { status: 200 });

  } catch (error) {
    console.error('[API_GET_PHAN_CA] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lấy lịch phân ca' }, { status: 500 });
  }
}

// POST: Tạo phân ca mới (Hỗ trợ chọn nhiều nhân viên cùng lúc)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { danh_sach_nhan_vien, ma_ca_lam, ngay_lam_viec } = body; 
    // danh_sach_nhan_vien là mảng các ID: [1, 2, 5, ...]

    if (!danh_sach_nhan_vien || !Array.isArray(danh_sach_nhan_vien) || !ma_ca_lam || !ngay_lam_viec) {
      return NextResponse.json({ success: false, message: 'Dữ liệu đầu vào không hợp lệ' }, { status: 400 });
    }

    const targetDate = new Date(ngay_lam_viec);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    // 1. Kiểm tra xem có nhân viên nào đang trong kỳ nghỉ phép ĐÃ ĐƯỢC DUYỆT không
    const nghiPhep = await prisma.don_xin_nghi.findMany({
      where: {
        ma_nguoi_dung: { in: danh_sach_nhan_vien },
        trang_thai: 'DA_DUYET',
        ngay_bat_dau: { lte: endOfDay },
        ngay_ket_thuc: { gte: startOfDay },
      }
    });

    if (nghiPhep.length > 0) {
      const idsNghiPhep = nghiPhep.map(np => np.ma_nguoi_dung);
      return NextResponse.json({ 
        success: false, 
        message: 'Có nhân viên đang nghỉ phép trong ngày này', 
        conflict_ids: idsNghiPhep 
      }, { status: 409 });
    }

    // 2. Kiểm tra xem có nhân viên nào đã được xếp ca trong ngày đó chưa (chống trùng lịch)
    const lichDaCo = await prisma.lich_phan_cong_ca.findMany({
      where: {
        ma_nguoi_dung: { in: danh_sach_nhan_vien },
        ngay_lam_viec: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (lichDaCo.length > 0) {
      const idsDaCoLich = lichDaCo.map(l => l.ma_nguoi_dung);
      return NextResponse.json({ 
        success: false, 
        message: 'Có nhân viên đã được xếp lịch trong ngày này', 
        conflict_ids: idsDaCoLich 
      }, { status: 409 });
    }

    // 3. Tiến hành insert hàng loạt (Bulk Insert)
    const dataToInsert = danh_sach_nhan_vien.map((ma_nv: number) => ({
      ma_nguoi_dung: ma_nv,
      ma_ca_lam: ma_ca_lam,
      ngay_lam_viec: targetDate
    }));

    const result = await prisma.lich_phan_cong_ca.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Prisma hỗ trợ bỏ qua lỗi nếu lỡ đâm trùng DB ở mức thấp
    });

    return NextResponse.json({ success: true, message: `Đã phân ca thành công cho ${result.count} nhân viên` }, { status: 201 });

  } catch (error) {
    console.error('[API_POST_PHAN_CA] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi phân ca' }, { status: 500 });
  }
}