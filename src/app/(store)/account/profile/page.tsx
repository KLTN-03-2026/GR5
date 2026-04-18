import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/store/account/ProfileForm";

export default async function ProfilePage() {
  // 1. Kiểm tra "thẻ bài"
  const session = await auth();

  // 2. Nếu là khách, mời ra ngoài
  if (!session) redirect("/login");

  // 3. Lấy thông tin mới nhất từ Database theo Email của session
  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user)
    return (
      <div className="p-20 text-center">Không tìm thấy dữ liệu người dùng.</div>
    );

  return (
    <div className="w-full">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#007A33] uppercase italic tracking-tight">
          Hồ sơ của tôi
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Quản lý thông tin cá nhân để bảo mật tài khoản
        </p>
      </div>

      {/* Phần Form nhập liệu */}
      <div className="bg-white rounded-[2rem] border border-emerald-50 shadow-sm overflow-hidden">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
