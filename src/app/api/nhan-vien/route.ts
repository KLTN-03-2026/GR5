import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Lấy danh sách nhân viên + Trạng thái làm việc hôm nay
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Chỉ lấy nhân viên nội bộ (STAFF hoặc THU_KHO), loại bỏ ADMIN và CUSTOMER
    const where: any = {
      trang_thai: 1,
      ho_so_nguoi_dung: search
        ? { is: { ho_ten: { contains: search } } }
        : { isNot: null },
      vai_tro_nguoi_dung: {
        some: {
          vai_tro: {
            ten_vai_tro: { in: ['STAFF', 'THU_KHO'] },
          },
        },
      },
    };

    const [total, danhSachNhanVien] = await Promise.all([
      prisma.nguoi_dung.count({ where }),
      prisma.nguoi_dung.findMany({
        where,
        include: {
          ho_so_nguoi_dung: true,
          lich_phan_cong_ca: {
            where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } },
            include: { ca_lam_viec: true },
          },
          lich_su_cham_cong: {
            where: { gio_vao: { gte: startOfDay, lte: endOfDay } },
          },
          don_xin_nghi_tao: {
            where: {
              ngay_bat_dau: { lte: endOfDay },
              ngay_ket_thuc: { gte: startOfDay },
              trang_thai: 'DA_DUYET',
            },
          },
          vai_tro_nguoi_dung: {
            include: { vai_tro: { select: { ten_vai_tro: true } } },
          },
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const ketQua = danhSachNhanVien.map((nv) => {
      const lichHomNay = nv.lich_phan_cong_ca[0];
      const chamCongHomNay = nv.lich_su_cham_cong[0];
      const dangNghiPhep = nv.don_xin_nghi_tao.length > 0;

      let trangThai = 'KHONG_CO_CA';
      let caHomNay = 'N/A';

      if (dangNghiPhep) {
        trangThai = 'NGHI_PHEP';
      } else if (lichHomNay) {
        caHomNay = lichHomNay.ca_lam_viec?.ten_ca || 'N/A';
        if (chamCongHomNay) {
          trangThai = chamCongHomNay.gio_ra ? 'DA_VE' : 'DANG_LAM_VIEC';
        } else if (lichHomNay.ca_lam_viec?.gio_bat_dau) {
          const caStart = new Date(lichHomNay.ca_lam_viec.gio_bat_dau);
          const targetTime = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            caStart.getUTCHours(), caStart.getUTCMinutes()
          );
          trangThai = now > targetTime ? 'VANG_MAT' : 'CHUA_VAO_CA';
        }
      }

      const roles = nv.vai_tro_nguoi_dung.map((r) => r.vai_tro.ten_vai_tro);

      return {
        id: nv.id,
        email: nv.email,
        ho_ten: nv.ho_so_nguoi_dung?.ho_ten || 'N/A',
        sdt: nv.ho_so_nguoi_dung?.so_dien_thoai || 'N/A',
        chuc_vu: nv.ho_so_nguoi_dung?.chuc_vu || 'N/A',
        bo_phan: nv.ho_so_nguoi_dung?.bo_phan || 'N/A',
        anh_dai_dien: nv.ho_so_nguoi_dung?.anh_dai_dien,
        ca_hom_nay: caHomNay,
        trang_thai: trangThai,
        hop_dong_het_han: nv.ho_so_nguoi_dung?.hop_dong_het_han,
        roles,
      };
    });

    return NextResponse.json({
      success: true,
      data: ketQua,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[API_GET_NHAN_VIEN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi lấy danh sách nhân viên' },
      { status: 500 }
    );
  }
}

// POST: Tạo mới nhân viên
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email, mat_khau, ho_ten, so_dien_thoai, cccd,
      ngay_vao_lam, chuc_vu, bo_phan, loai_hop_dong,
      hop_dong_het_han, luong_theo_gio,
      vai_tro = 'STAFF', // STAFF | THU_KHO | CUSTOMER
    } = body;

    // 1. Validate
    if (!email || !mat_khau || !ho_ten || !cccd) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc (email, mật khẩu, họ tên, CCCD)' },
        { status: 400 }
      );
    }
    if (mat_khau.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // 2. Kiểm tra trùng lặp
    const existingUser = await prisma.nguoi_dung.findFirst({ where: { email } });
    if (existingUser)
      return NextResponse.json({ success: false, message: 'Email đã tồn tại trong hệ thống' }, { status: 400 });

    const existingProfile = await prisma.ho_so_nguoi_dung.findFirst({ where: { cccd } });
    if (existingProfile)
      return NextResponse.json({ success: false, message: 'CCCD đã được đăng ký trước đó' }, { status: 400 });

    // 3. Tìm vai trò trong DB
    const roleRecord = await prisma.vai_tro.findFirst({
      where: { ten_vai_tro: vai_tro },
    });
    if (!roleRecord) {
      return NextResponse.json(
        { success: false, message: `Vai trò "${vai_tro}" không tồn tại trong hệ thống` },
        { status: 400 }
      );
    }

    // 4. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    // 5. Transaction: tạo user + hồ sơ + gán vai trò
    const newEmployee = await prisma.$transaction(async (tx) => {
      const user = await tx.nguoi_dung.create({
        data: {
          email,
          mat_khau: hashedPassword,
          trang_thai: 1,
        },
      });

      const profile = await tx.ho_so_nguoi_dung.create({
        data: {
          ma_nguoi_dung: user.id,
          ho_ten,
          so_dien_thoai: so_dien_thoai || null,
          cccd,
          chuc_vu: chuc_vu || null,
          bo_phan: bo_phan || null,
          loai_hop_dong: loai_hop_dong || null,
          ngay_vao_lam: ngay_vao_lam ? new Date(ngay_vao_lam) : null,
          hop_dong_het_han: hop_dong_het_han ? new Date(hop_dong_het_han) : null,
          luong_theo_gio: luong_theo_gio ? Number(luong_theo_gio) : 0,
        },
      });

      // Gán vai trò
      await tx.vai_tro_nguoi_dung.create({
        data: {
          ma_nguoi_dung: user.id,
          ma_vai_tro: roleRecord.id,
        },
      });

      return { user: { id: user.id, email: user.email }, profile };
    });

    return NextResponse.json(
      { success: true, message: 'Tạo nhân viên thành công', data: newEmployee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API_POST_NHAN_VIEN] Error:', error);

    // Lỗi unique constraint (email hoặc CCCD bị duplicate race condition)
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.includes('email') ? 'Email' : 'CCCD';
      return NextResponse.json(
        { success: false, message: `${field} đã tồn tại` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống khi tạo nhân viên' },
      { status: 500 }
    );
  }
}