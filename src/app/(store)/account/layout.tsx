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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar user={user} />
      <main style={{
        flex: 1,
        padding: "2.5rem 3rem",
        overflowY: "auto",
        background: "var(--color-bg)",
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}
