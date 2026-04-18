"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();

  // Kiểm tra xem ông này đã login chưa
  if (!session?.user?.email) {
    return { error: "Phiên đăng nhập hết hạn, vui lòng login lại!" };
  }

  const ho_ten = formData.get("ho_ten") as string;
  const so_dien_thoai = formData.get("so_dien_thoai") as string;
  const dia_chi = formData.get("dia_chi") as string;

  try {
    await prisma.nguoi_dung.update({
      where: { email: session.user.email },
      data: {
        ho_ten: ho_ten,
        so_dien_thoai: so_dien_thoai,
        dia_chi: dia_chi,
      },
    });

    // Làm mới trang Profile để cập nhật tên mới trên Header ngay lập tức
    revalidatePath("/account/profile");
    revalidatePath("/");

    return { success: "Cập nhật thông tin thành công rồi Phú ơi!" };
  } catch (error) {
    console.error(error);
    return { error: "Có lỗi khi lưu vào Database!" };
  }
}
