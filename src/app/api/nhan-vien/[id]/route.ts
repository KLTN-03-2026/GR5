import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Định nghĩa kiểu cho params
interface RouteContext {
  params: {
    id: string;
  };
}

// GET: Lấy hồ sơ chi tiết + lịch sử chấm công + lịch sử lương
export async function GET(req: Request, context: RouteContext) {
  try {
    const maNhanVien = Number(context.params.id);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    const nhanVien = await prisma.nguoi_dung.findUnique({
      where: { id: maNhanVien },
      include: {
        ho_so_nguoi_dung: true,
        // Lấy 30 ngày chấm công gần nhất
        lich_su_cham_cong: {
          orderBy: { gio_vao: 'desc' },
          take: 30,
          include: { ca_lam_viec: true }
        },
        // Lấy lịch sử 12 tháng lương gần nhất
        bang_luong_thang: {
          orderBy: [{ nam: 'desc' }, { thang: 'desc' }],
          take: 12
        },
        // Đơn xin nghỉ gần đây
        don_xin_nghi_tao: {
          orderBy: { ngay_tao: 'desc' },
          take: 10
        }
      }
    });

    if (!nhanVien || nhanVien.trang_thai === 0) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy nhân viên hoặc đã nghỉ việc' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: nhanVien }, { status: 200 });

  } catch (error) {
    console.error('[API_GET_CHI_TIET_NV] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin hồ sơ
export async function PUT(req: Request, context: RouteContext) {
  try {
    const maNhanVien = Number(context.params.id);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      ho_ten, so_dien_thoai, cccd, 
      ngay_vao_lam, chuc_vu, bo_phan, loai_hop_dong, 
      hop_dong_het_han, luong_theo_gio, anh_dai_dien
    } = body;

    // 1. Kiểm tra tồn tại
    const existingProfile = await prisma.ho_so_nguoi_dung.findUnique({
      where: { ma_nguoi_dung: maNhanVien }
    });

    if (!existingProfile) {
      return NextResponse.json({ success: false, message: 'Hồ sơ nhân viên không tồn tại' }, { status: 404 });
    }

    // 2. Chống trùng CCCD với người khác (trừ chính nó)
    if (cccd && cccd !== existingProfile.cccd) {
      const checkCccd = await prisma.ho_so_nguoi_dung.findFirst({ where: { cccd } });
      if (checkCccd) {
        return NextResponse.json({ success: false, message: 'CCCD này đã được sử dụng' }, { status: 400 });
      }
    }

    // 3. Cập nhật dữ liệu
    const updatedProfile = await prisma.ho_so_nguoi_dung.update({
      where: { ma_nguoi_dung: maNhanVien },
      data: {
        ...(ho_ten && { ho_ten }),
        ...(so_dien_thoai && { so_dien_thoai }),
        ...(cccd && { cccd }),
        ...(chuc_vu && { chuc_vu }),
        ...(bo_phan && { bo_phan }),
        ...(loai_hop_dong && { loai_hop_dong }),
        ...(anh_dai_dien && { anh_dai_dien }),
        ...(ngay_vao_lam && { ngay_vao_lam: new Date(ngay_vao_lam) }),
        ...(hop_dong_het_han && { hop_dong_het_han: new Date(hop_dong_het_han) }),
        ...(luong_theo_gio !== undefined && { luong_theo_gio: Number(luong_theo_gio) })
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật thành công', data: updatedProfile }, { status: 200 });

  } catch (error) {
    console.error('[API_PUT_NHAN_VIEN] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi cập nhật' }, { status: 500 });
  }
}

// DELETE: Xóa mềm nhân viên (Nghỉ việc)
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const maNhanVien = Number(context.params.id);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    // SOFT DELETE: Chỉ đổi trạng thái = 0 (nghỉ việc), không xóa cứng để giữ lịch sử chấm công, tính lương
    await prisma.nguoi_dung.update({
      where: { id: maNhanVien },
      data: { trang_thai: 0 } 
    });

    return NextResponse.json({ success: true, message: 'Đã cập nhật trạng thái nhân viên thành Nghỉ việc' }, { status: 200 });

  } catch (error) {
    console.error('[API_DELETE_NHAN_VIEN] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi xóa nhân viên' }, { status: 500 });
  }
}