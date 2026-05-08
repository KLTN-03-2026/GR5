import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  price: z.number().min(1, "Giá không hợp lệ"),
  quantity: z.number().min(0, "Số lượng không được âm"),
  origin: z.string().min(1, "Vui lòng nhập nguồn gốc"),
  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;