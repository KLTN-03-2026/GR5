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
    <div className="flex min-h-screen bg-white">
      <Sidebar user={user} />
      <main className="flex-1 p-12 bg-slate-50/30 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
