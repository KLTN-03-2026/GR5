import Sidebar from "@/components/store/account/Sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user?.email as string },
  });

  return (
    <div style={{
      display: "flex",
      width: "100%",
      flex: 1,
      minHeight: "calc(100vh - 64px)",
      background: "#f7f8f6",
      alignItems: "stretch",
    }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, padding: 0, background: "#f7f8f6", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
