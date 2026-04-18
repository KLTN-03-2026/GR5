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
  const session = await auth(); // <--- 2. Lấy session ở đây

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        {/* 3. Truyền session vào Header */}
        <Header session={session} />

        <main className="grow pt-24">{children}</main>

        <Chatbot />
        <Footer />
      </div>
    </CartProvider>
  );
}
