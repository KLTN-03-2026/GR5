import React from "react";
import Header from "@/components/store/layout/Header";
import Footer from "@/components/store/layout/Footer";
import Chatbot from "@/components/store/chatbot/ChatbotAI";
import { CartProvider } from "@/lib/CartContext";
import { auth } from "@/lib/auth"; // <--- 1. Import hàm check

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
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        {/* 3. Truyền session vào Header */}
        <Header session={session} />

        <main className="grow pt-24 flex flex-col w-full">{children}</main>

        <Chatbot />
        <Footer />
      </div>
    </CartProvider>
  );
}
