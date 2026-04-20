import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HRClient from "./HRClient";

export default async function StaffHRPage() {
  const session = await auth();

  // Lấy ID số từ DB qua email (auth chỉ lưu email trong session)
  const user = session?.user?.email
    ? await prisma.nguoi_dung.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  return <HRClient userId={user?.id ?? null} />;
}
