import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/store/account/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  // Lấy dữ liệu Phú từ Database
  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session?.user?.email as string },
  });

  return (
    <div className="py-6">
      {/* Gọi Form ra đây để nó hết trắng màn hình */}
      <ProfileForm user={user} />
    </div>
  );
}
