import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lấy danh sách nhân viên + Trạng thái làm việc hôm nay
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Lấy danh sách nhân viên (kèm hồ sơ và lịch làm việc/chấm công hôm nay)
    const danhSachNhanVien = await prisma.nguoi_dung.findMany({
      where: {
        trang_thai: 1, // Bỏ qua những người đã bị soft delete (nghỉ việc)
        ho_so_nguoi_dung: search 
          ? { 
              is: { ho_ten: { contains: search } } 
            } 
          : { 
              isNot: null 
            }
      },
      include: {
        ho_so_nguoi_dung: true,
        lich_phan_cong_ca: {
          where: { ngay_lam_viec: { gte: startOfDay, lte: endOfDay } },
          include: { ca_lam_viec: true }
        },
        lich_su_cham_cong: {
          where: { gio_vao: { gte: startOfDay, lte: endOfDay } }
        },
        don_xin_nghi_tao: {
          where: {
            ngay_bat_dau: { lte: endOfDay },
            ngay_ket_thuc: { gte: startOfDay },
            trang_thai: 'DA_DUYET'
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 2. Map dữ liệu và tính toán trạng thái Real-time
    const ketQua = danhSachNhanVien.map(nv => {
      const lichHomNay = nv.lich_phan_cong_ca[0]; // Giả sử 1 người 1 ca/ngày
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
          const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), caStart.getUTCHours(), caStart.getUTCMinutes());
          
          trangThai = now > targetTime ? 'VANG_MAT' : 'CHUA_VAO_CA';
        }
      }

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
        hop_dong_het_han: nv.ho_so_nguoi_dung?.hop_dong_het_han
      };
    });

    return NextResponse.json({ success: true, data: ketQua }, { status: 200 });

  } catch (error) {
    console.error('[API_GET_NHAN_VIEN] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách nhân viên' }, { status: 500 });
  }
}

// POST: Tạo mới nhân viên
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, mat_khau, ho_ten, so_dien_thoai, cccd, 
      ngay_vao_lam, chuc_vu, bo_phan, loai_hop_dong, 
      hop_dong_het_han, luong_theo_gio 
    } = body;

    // 1. Validate cơ bản
    if (!email || !mat_khau || !ho_ten || !cccd) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // 2. Kiểm tra trùng lặp Email hoặc CCCD
    const existingUser = await prisma.nguoi_dung.findFirst({ where: { email } });
    if (existingUser) return NextResponse.json({ success: false, message: 'Email đã tồn tại' }, { status: 400 });

    const existingProfile = await prisma.ho_so_nguoi_dung.findFirst({ where: { cccd } });
    if (existingProfile) return NextResponse.json({ success: false, message: 'CCCD đã tồn tại' }, { status: 400 });

    // 3. Sử dụng Transaction để đảm bảo tạo NguoiDung và HoSo đồng thời
    const newEmployee = await prisma.$transaction(async (tx) => {
      // Tạo User account
      const user = await tx.nguoi_dung.create({
        data: {
          email,
          mat_khau, // Lưu ý: Ở môi trường thật cần dùng bcrypt để hash mật khẩu trước khi lưu
          trang_thai: 1
        }
      });

      // Gán vai trò (Giả định ID vai trò nhân viên kho là 2, bạn cần điều chỉnh theo DB thực tế)
      // await tx.vai_tro_nguoi_dung.create({ data: { ma_nguoi_dung: user.id, ma_vai_tro: 2 } });

      // Tạo Profile
      const profile = await tx.ho_so_nguoi_dung.create({
        data: {
          ma_nguoi_dung: user.id,
          ho_ten,
          so_dien_thoai,
          cccd,
          chuc_vu,
          bo_phan,
          loai_hop_dong,
          ngay_vao_lam: ngay_vao_lam ? new Date(ngay_vao_lam) : null,
          hop_dong_het_han: hop_dong_het_han ? new Date(hop_dong_het_han) : null,
          luong_theo_gio: luong_theo_gio ? Number(luong_theo_gio) : 0
        }
      });

      return { user, profile };
    });

    return NextResponse.json({ success: true, message: 'Tạo nhân viên thành công', data: newEmployee }, { status: 201 });

  } catch (error) {
    console.error('[API_POST_NHAN_VIEN] Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi tạo nhân viên' }, { status: 500 });
  }
}