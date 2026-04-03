import { z } from 'zod';

// Xác thực form Nhập kho
export const ImportGoodsSchema = z.object({
  ma_ncc: z.coerce.number({ message: "Vui lòng chọn nhà cung cấp hợp lệ" }).min(1, "Vui lòng chọn nhà cung cấp"),
  ma_bien_the: z.coerce.number({ message: "Vui lòng chọn sản phẩm hợp lệ" }).min(1, "Vui lòng chọn sản phẩm"),
  
  ngay_thu_hoach: z.string().min(1, "Thiếu ngày thu hoạch"),
  ngay_nhap_kho: z.string().min(1, "Thiếu ngày nhập kho"),
  han_su_dung: z.string().min(1, "Thiếu hạn sử dụng"),
  
  vi_tri: z.object({
    khu: z.string(),
    day: z.string(),
    ke: z.string(),
    tang: z.string(),
  }),
  
  so_luong_thung: z.coerce.number({ message: "Số lượng không hợp lệ" }).min(1, "Số lượng phải lớn hơn 0"),
});

// Xác thực quét mã vạch
export const ScanGoodsSchema = z.object({
  scannedQR: z.string().min(1, "Mã QR không hợp lệ"),
  expectedQR: z.string().min(1, "Thiếu mã QR chỉ định"),
});