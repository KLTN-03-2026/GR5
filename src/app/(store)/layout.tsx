import React from 'react';
import Header from '@/components/store/layout/Header';
import Footer from '@/components/store/layout/Footer';
import Chatbot from '@/components/store/chatbot/ChatbotAI';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* 1. flex-grow: Giúp phần nội dung giãn ra hết mức có thể, đẩy Footer sát xuống đáy màn hình.
        2. pt-[100px]: Đẩy toàn bộ nội dung xuống 100px để nhường chỗ cho Header fixed. 
           (Bạn hãy đo xem Header của bạn cao bao nhiêu pixel rồi tự thay số 100 này nhé!)
      */}
      <main className="flex-grow pt-[10px]">
        {children} 
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}