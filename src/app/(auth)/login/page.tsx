"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ScanFace, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebookF } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { handleLogin, handleGoogleLogin, handleFacebookLogin } from "@/app/actions/auth";
import toast from "react-hot-toast";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "facebook" | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function clientAction(formData: FormData) {
    setError("");
    setIsPending(true);
    try {
      const res = await handleLogin(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        setIsPending(false);
      }
    } catch {
      // Auth.js redirect sẽ throw — trình duyệt tự chuyển trang
    }
  }

  async function onGoogleLogin() {
    setSocialPending("google");
    try {
      await handleGoogleLogin(callbackUrl);
    } catch {
      setSocialPending(null);
    }
  }

  async function onFacebookLogin() {
    setSocialPending("facebook");
    try {
      await handleFacebookLogin(callbackUrl);
    } catch {
      setSocialPending(null);
    }
  }

  return (
    <div className="flex items-center justify-center w-full p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden border border-[#e5e7eb]"
      >
        <div className="px-10 py-9">
          <header className="text-center mb-8">
            <div className="text-[13px] font-medium text-[#16a34a] mb-2">
              🌿 Verdant Harvest
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-4">
              Đăng nhập
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100"
              >
                ⚠ {error}
              </motion.div>
            )}
          </header>

          <form action={clientAction} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#374151] ml-1">Email</label>
              <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                <Mail className="w-4 h-4 text-[#9ca3af] mr-2" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@nongsan.vn"
                  className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-medium text-[#374151]">Mật khẩu</label>
                <Link href="/forgot-password" className="text-[13px] font-normal text-[#16a34a] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="flex items-center bg-white rounded-lg px-3 h-11 border border-[#d1d5db] focus-within:border-[#16a34a] focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] transition-all">
                <Lock className="w-4 h-4 text-[#9ca3af] mr-2" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="bg-transparent w-full outline-none text-sm text-[#111827] placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#9ca3af] hover:text-[#16a34a]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Hidden: callbackUrl */}
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            {/* Remember me */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-[#d1d5db] text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 focus:ring-2"
              />
              <label htmlFor="remember" className="text-[13px] text-[#6b7280] cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>

            <div className="space-y-4">
              <button
                disabled={isPending}
                type="submit"
                className="w-full bg-[#16a34a] text-white h-11 rounded-lg font-medium text-[15px] hover:bg-[#15803d] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? <><Loader2 className="animate-spin" size={18} /> Đang kiểm tra...</> : "Đăng nhập"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login/face-id")}
                className="w-full flex items-center justify-center gap-2 h-11 bg-white text-[#374151] border border-[#d1d5db] rounded-lg font-medium text-sm hover:border-[#16a34a] hover:text-[#16a34a] transition-all"
              >
                <ScanFace size={18} />
                Đăng nhập bằng FaceID
              </button>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-[#e5e7eb] w-full"></div>
              <span className="bg-white px-4 text-xs text-[#9ca3af] absolute">
                Hoặc đăng nhập với
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={socialPending !== null}
                className="flex items-center justify-center gap-2 h-10 border border-[#e5e7eb] bg-white rounded-lg hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all font-medium text-[13px] text-[#374151] disabled:opacity-60"
              >
                {socialPending === "google" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[18px] h-[18px]" alt="google" />
                )}
                Google
              </button>
              <button
                type="button"
                onClick={onFacebookLogin}
                disabled={socialPending !== null}
                className="flex items-center justify-center gap-2 h-10 border border-[#e5e7eb] bg-white rounded-lg hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all font-medium text-[13px] text-[#374151] disabled:opacity-60"
              >
                {socialPending === "facebook" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FaFacebookF size={18} className="text-[#1877F2]" />
                )}
                Facebook
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#f9fafb] p-6 text-center border-t border-[#e5e7eb]">
          <p className="text-sm text-[#6b7280]">
            Chưa có tài khoản?
            <Link href="/register" className="text-[#16a34a] font-medium ml-2 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
