import React from "react";
import Header from "@/components/store/layout/Header";
import Footer from "@/components/store/layout/Footer";
import Chatbot from "@/components/store/chatbot/ChatbotAI";
import { auth } from "@/lib/auth";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Cookie cũ bị corrupt → bỏ qua, coi như chưa login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header session={session} />

      <main className="grow flex flex-col w-full">{children}</main>

      <Chatbot />
      <Footer />
    </div>
  );
}
