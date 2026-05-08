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
  const ngay_sinh_raw = formData.get("ngay_sinh") as string;
  const ngay_sinh = ngay_sinh_raw ? new Date(ngay_sinh_raw) : null;
  const avatarFile = formData.get("avatar") as File | null;

  let anh_dai_dien: string | undefined;

  console.log("avatarFile:", avatarFile?.name, "size:", avatarFile?.size, "type:", avatarFile?.type);

  if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > 2 * 1024 * 1024)
      return { error: "Ảnh quá lớn! Tối đa 2MB." };
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(avatarFile.type))
      return { error: "Chỉ chấp nhận JPG, PNG, GIF, WebP!" };

    try {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const fileName = `avatar_${user.id}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      console.log("Saving to:", uploadDir, fileName);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      anh_dai_dien = `/uploads/avatars/${fileName}`;
      console.log("Saved avatar:", anh_dai_dien);
    } catch (fileErr: any) {
      console.error("File save error:", fileErr.message);
      return { error: "Lỗi khi lưu ảnh: " + fileErr.message };
    }
  }

  try {
    await prisma.ho_so_nguoi_dung.upsert({
      where: { ma_nguoi_dung: user.id },
      update: {
        ho_ten,
        so_dien_thoai,
        gioi_tinh,
        ngay_sinh,
        ...(anh_dai_dien && { anh_dai_dien }),
      },
      create: {
        ma_nguoi_dung: user.id,
        ho_ten,
        so_dien_thoai,
        gioi_tinh,
        ngay_sinh,
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
    console.error("CHI TIET LOI code:", error.code);
    console.error("CHI TIET LOI message:", error.message);
    console.error("CHI TIET LOI meta:", JSON.stringify(error.meta));
    return { error: "Lỗi khi lưu vào Database! " + error.message };
  }
}
