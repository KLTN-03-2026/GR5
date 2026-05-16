import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: Lấy hồ sơ chi tiết + lịch sử chấm công + lịch sử lương
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const maNhanVien = Number(id);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    const nhanVien = await prisma.nguoi_dung.findUnique({
      where: { id: maNhanVien },
      include: {
        ho_so_nguoi_dung: true,
        vai_tro_nguoi_dung: {
          include: { vai_tro: { select: { ten_vai_tro: true } } }
        },
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
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Bạn chưa đăng nhập' }, { status: 401 });
    }
    const callerRoles: string[] = (session.user as any).roles ?? [];
    const isAdmin = callerRoles.includes('ADMIN');
    const isThuKho = callerRoles.includes('THU_KHO');
    if (!isAdmin && !isThuKho) {
      return NextResponse.json({ success: false, message: 'Không có quyền chỉnh sửa' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const maNhanVien = Number(idParam);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    // Nếu thủ kho: kiểm tra target phải là STAFF
    if (!isAdmin && isThuKho) {
      const targetRoles = await prisma.vai_tro_nguoi_dung.findMany({
        where: { ma_nguoi_dung: maNhanVien },
        include: { vai_tro: { select: { ten_vai_tro: true } } },
      });
      const targetRoleNames = targetRoles.map((r) => r.vai_tro.ten_vai_tro);
      if (!targetRoleNames.includes('STAFF') || targetRoleNames.includes('ADMIN') || targetRoleNames.includes('THU_KHO')) {
        return NextResponse.json(
          { success: false, message: 'Thủ kho chỉ được chỉnh sửa nhân viên vận hành (STAFF)' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { 
      ho_ten, so_dien_thoai, cccd, 
      ngay_vao_lam, chuc_vu, bo_phan, loai_hop_dong, 
      hop_dong_het_han, luong_theo_gio, anh_dai_dien,
      vai_tro, // chỉ Admin mới được đổi
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

    // 3. Cập nhật trong transaction
    await prisma.$transaction(async (tx) => {
      // 3a. Cập nhật hồ sơ
      await tx.ho_so_nguoi_dung.update({
        where: { ma_nguoi_dung: maNhanVien },
        data: {
          ...(ho_ten && { ho_ten }),
          ...(so_dien_thoai !== undefined && { so_dien_thoai }),
          ...(cccd && { cccd }),
          ...(chuc_vu !== undefined && { chuc_vu }),
          ...(bo_phan !== undefined && { bo_phan }),
          ...(loai_hop_dong && { loai_hop_dong }),
          ...(anh_dai_dien && { anh_dai_dien }),
          ...(ngay_vao_lam ? { ngay_vao_lam: new Date(ngay_vao_lam) } : {}),
          ...(hop_dong_het_han ? { hop_dong_het_han: new Date(hop_dong_het_han) } : {}),
          ...(luong_theo_gio !== undefined && { luong_theo_gio: Number(luong_theo_gio) }),
        }
      });

      // 3b. Đổi vai trò (chỉ Admin được đổi)
      if (isAdmin && vai_tro) {
        const newRole = await tx.vai_tro.findFirst({ where: { ten_vai_tro: vai_tro } });
        if (!newRole) throw new Error(`Vai trò "${vai_tro}" không tồn tại`);
        // Xoá hết roles cũ rồi gán mới
        await tx.vai_tro_nguoi_dung.deleteMany({ where: { ma_nguoi_dung: maNhanVien } });
        await tx.vai_tro_nguoi_dung.create({ data: { ma_nguoi_dung: maNhanVien, ma_vai_tro: newRole.id } });
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật thành công' }, { status: 200 });

  } catch (error) {
    console.error('[API_PUT_NHAN_VIEN] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi cập nhật' }, { status: 500 });
  }
}

// DELETE: Xóa mềm nhân viên (Nghỉ việc)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Bạn chưa đăng nhập' }, { status: 401 });
    }
    const callerRoles: string[] = (session.user as any).roles ?? [];
    const isAdmin = callerRoles.includes('ADMIN');
    const isThuKho = callerRoles.includes('THU_KHO');
    if (!isAdmin && !isThuKho) {
      return NextResponse.json({ success: false, message: 'Không có quyền thực hiện' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const maNhanVien = Number(idParam);
    if (isNaN(maNhanVien)) {
      return NextResponse.json({ success: false, message: 'ID không hợp lệ' }, { status: 400 });
    }

    // Nếu thủ kho: chỉ được cho STAFF nghỉ việc
    if (!isAdmin && isThuKho) {
      const targetRoles = await prisma.vai_tro_nguoi_dung.findMany({
        where: { ma_nguoi_dung: maNhanVien },
        include: { vai_tro: { select: { ten_vai_tro: true } } },
      });
      const targetRoleNames = targetRoles.map((r) => r.vai_tro.ten_vai_tro);
      if (!targetRoleNames.includes('STAFF') || targetRoleNames.includes('ADMIN') || targetRoleNames.includes('THU_KHO')) {
        return NextResponse.json(
          { success: false, message: 'Thủ kho chỉ được cho nghỉ việc nhân viên vận hành (STAFF)' },
          { status: 403 }
        );
      }
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