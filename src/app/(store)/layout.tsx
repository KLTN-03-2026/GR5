<<<<<<< HEAD
import React from 'react';
import Header from '@/components/store/layout/Header';
import Footer from '@/components/store/layout/Footer';
import Chatbot from '@/components/store/chatbot/ChatbotAI';
=======
// src/app/(store)/layout.tsx
import Footer from "@/components/store/layout/Footer"; // Giả sử bạn có Footer
import Header from "@/components/store/layout/Header";
import { CartProvider } from "@/lib/CartContext";
>>>>>>> bbf13b23c67c23b12ecbcdb72ec4e83741181833

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
<<<<<<< HEAD
      {/* Các trang con (như Trang chủ, Sản phẩm, Thanh toán) sẽ tự động chui vào đây */}
      {children} 

      <Chatbot></Chatbot>
      <Footer />
    </div>
=======
      <main className="min-h-screen pt-24">{children}</main>
    </CartProvider>
>>>>>>> bbf13b23c67c23b12ecbcdb72ec4e83741181833
  );
}
