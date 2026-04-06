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

<<<<<<< HEAD
export default function StoreLayout({ children }: { children: React.ReactNode }) {
=======
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
>>>>>>> main
  return (
    <CartProvider>
      <Header />
<<<<<<< HEAD
      
      {/* 1. flex-grow: Giúp phần nội dung giãn ra hết mức có thể, đẩy Footer sát xuống đáy màn hình.
        2. pt-[100px]: Đẩy toàn bộ nội dung xuống 100px để nhường chỗ cho Header fixed. 
           (Bạn hãy đo xem Header của bạn cao bao nhiêu pixel rồi tự thay số 100 này nhé!)
      */}
      <main className="flex-grow pt-[10px]">
        {children} 
      </main>
=======
<<<<<<< HEAD
      {/* Các trang con (như Trang chủ, Sản phẩm, Thanh toán) sẽ tự động chui vào đây */}
      {children} 
>>>>>>> main

      <Chatbot />
      <Footer />
    </div>
=======
      <main className="min-h-screen pt-24">{children}</main>
    </CartProvider>
>>>>>>> bbf13b23c67c23b12ecbcdb72ec4e83741181833
  );
}
