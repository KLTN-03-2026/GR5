import React from "react";
import Header from "@/components/store/layout/Header";
import Footer from "@/components/store/layout/Footer";
import Chatbot from "@/components/store/chatbot/ChatbotAI";
import { CartProvider } from "@/lib/CartContext";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen pt-24">{children}</main>
      {/* Bọc thêm div này kết hợp với flex-grow ở main để Footer luôn nằm ở đáy */}
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* pt-24 (khoảng 96px) để tránh nội dung bị Header che khuất */}
        <main className="grow pt-10">{children}</main>

        <Chatbot />
        <Footer />
      </div>
    </CartProvider>
  );
}
