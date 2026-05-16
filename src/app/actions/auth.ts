"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

// ── 1. Đăng nhập bằng Email + Password ──────────────────────────────────────
export async function handleLogin(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = rateLimit(`login:${ip}`, 5, 60_000);
  if (!allowed) {
    return { error: "Bạn đã thử quá nhiều lần. Vui lòng đợi 1 phút." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // callbackUrl được truyền từ trang login qua hidden input
  const callbackUrl = (formData.get("callbackUrl") as string | null) || "/";

  let redirectTo = "/";

  try {
    // 1. Kiểm tra ROLE trước khi gọi signIn để điều hướng cho đúng
    const user = await prisma.nguoi_dung.findUnique({
      where: { email },
      include: { vai_tro_nguoi_dung: { include: { vai_tro: true } } }
    });

    if (user && user.vai_tro_nguoi_dung) {
      const roles = user.vai_tro_nguoi_dung.map(r => r.vai_tro.ten_vai_tro);
      if (roles.includes("ADMIN")) {
        redirectTo = "/admin/overview";
      } else if (roles.includes("STAFF")) {
        redirectTo = "/staff";
      } else if (roles.includes("THU_KHO")) {
        redirectTo = "/warehouse-manager";
      } else {
        // CUSTOMER hoặc role khác → dùng callbackUrl nếu có, fallback "/"
        redirectTo = callbackUrl.startsWith("/") ? callbackUrl : "/";
      }
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!" };
        default:
          return { error: "Đã xảy ra lỗi xác thực. Vui lòng thử lại." };
      }
    }
    throw error; // Bắt buộc throw để Next.js thực hiện redirect
  }
}

// ── 2. Đăng nhập bằng Google ─────────────────────────────────────────────────
export async function handleGoogleLogin(callbackUrl: string = "/") {
  await signIn("google", { redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/" });
}

// ── 3. Đăng nhập bằng Facebook ───────────────────────────────────────────────
export async function handleFacebookLogin(callbackUrl: string = "/") {
  await signIn("facebook", { redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/" });
}
