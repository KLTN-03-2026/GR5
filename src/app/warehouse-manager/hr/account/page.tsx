import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AccountClient from "./AccountClient";

export default async function WarehouseManagerAccountPage() {
  const session = await auth();

  const user = session?.user?.email
    ? await prisma.nguoi_dung.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          ho_so_nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } },
        },
      })
    : null;

  return (
    <AccountClient
      userId={user?.id ?? null}
      userName={user?.ho_so_nguoi_dung?.ho_ten ?? ""}
      userEmail={user?.email ?? ""}
      userPhone={user?.ho_so_nguoi_dung?.so_dien_thoai ?? ""}
    />
  );
}
