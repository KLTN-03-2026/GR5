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
        },
      },
    },
  });

  return <ProfileForm user={user} />;
}
