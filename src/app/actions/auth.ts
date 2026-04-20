"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

// ── 1. Đăng nhập bằng Email + Password ──────────────────────────────────────
export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
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
export async function handleGoogleLogin() {
  await signIn("google", { redirectTo: "/" });
}

// ── 3. Đăng nhập bằng Facebook ───────────────────────────────────────────────
export async function handleFacebookLogin() {
  await signIn("facebook", { redirectTo: "/" });
}
