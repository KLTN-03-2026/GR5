import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/store/account/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      ho_so_nguoi_dung: {
        select: {
          ho_ten: true,
          so_dien_thoai: true,
          anh_dai_dien: true,
          gioi_tinh: true,
          ngay_sinh: true,
        },
      },
    },
  });

  const flatUser = {
    id: user?.id,
    email: user?.email,
    ho_ten: user?.ho_so_nguoi_dung?.ho_ten ?? null,
    so_dien_thoai: user?.ho_so_nguoi_dung?.so_dien_thoai ?? null,
    anh_dai_dien: user?.ho_so_nguoi_dung?.anh_dai_dien ?? null,
    gioi_tinh: user?.ho_so_nguoi_dung?.gioi_tinh ?? null,
    ngay_sinh: user?.ho_so_nguoi_dung?.ngay_sinh ?? null,
  };

  return <ProfileForm user={flatUser} />;
}
