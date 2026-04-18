"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth"; // Import hàm signIn của Auth.js
import { AuthError } from "next-auth";

// --- 1. ACTION ĐĂNG KÝ (Tự viết logic lưu DB) ---
export async function handleRegister(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Băm mật khẩu bằng Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào bảng nguoi_dung của Phú
    await prisma.nguoi_dung.create({
      data: {
        email,
        mat_khau: hashedPassword,
        trang_thai: 1,
      },
    });
    return { success: "Đăng ký thành công!" };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Email này đã tồn tại!" };
    return { error: "Lỗi hệ thống khi đăng ký." };
  }
}

// --- 2. ACTION ĐĂNG NHẬP (Dùng hàm của Auth.js) ---
export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Auth.js sẽ tự gọi cái authorize trong file config để check pass
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/", // Đăng nhập xong đẩy về trang chủ
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Sai email hoặc mật khẩu Phú ơi!" };
        default:
          return { error: "Đã xảy ra lỗi xác thực." };
      }
    }
    throw error; // Bắt buộc phải throw để Next.js thực hiện redirect
  }
}
