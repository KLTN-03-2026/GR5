"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateProfile(
  formData: FormData,
): Promise<{ success: string; anh_dai_dien?: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Phiên đăng nhập hết hạn!" };
  }

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Không tìm thấy tài khoản!" };

  const ho_ten = formData.get("ho_ten") as string;
  const so_dien_thoai = formData.get("so_dien_thoai") as string;
  const gioi_tinh = formData.get("gioi_tinh") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let anh_dai_dien: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 2 * 1024 * 1024)
      return { error: "Ảnh quá lớn! Tối đa 2MB." };
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(avatarFile.type))
      return { error: "Chỉ chấp nhận JPG, PNG, GIF!" };

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const ext = avatarFile.name.split(".").pop();
    const fileName = `avatar_${user.id}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
    anh_dai_dien = `/uploads/avatars/${fileName}`;
  }

  try {
    await prisma.ho_so_nguoi_dung.upsert({
      where: { ma_nguoi_dung: user.id },
      update: {
        ho_ten,
        so_dien_thoai,

        ...(anh_dai_dien && { anh_dai_dien }),
      },
      create: {
        ma_nguoi_dung: user.id,
        ho_ten,
        so_dien_thoai,
        ...(anh_dai_dien && { anh_dai_dien }),
      },
    });

    revalidatePath("/account/profile");
    revalidatePath("/");

    return {
      success: "Cập nhật thành công!",
      ...(anh_dai_dien && { anh_dai_dien }),
    };
  } catch (error: any) {
    console.error("CHI TIET LOI:", error.message);
    return { error: "Lỗi khi lưu vào Database!" };
  }
}
