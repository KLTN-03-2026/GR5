// components/Chatbot.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingBag } from "react-icons/fa";
import Link from "next/link"; // Dùng Link của Next để điều hướng nhanh

// 1. Định nghĩa Type cho tin nhắn (Hứng full data từ Backend)
interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  hasProduct?: boolean;
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Khởi tạo tin nhắn chào mừng
  const [messages, setMessages] = useState<Message[]>([
    { 
        id: 1,
        sender: "bot", 
        text: "Chào bạn! Mình là Freshy 🥦, trợ lý AI của FreshFood. Hôm nay bạn muốn mua thực phẩm gì nhỉ?" 
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Xử lý gửi tin nhắn
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMsgId = Date.now();

    // Thêm tin nhắn của user vào UI ngay lập tức
    setMessages(prev => [...prev, { id: userMsgId, sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      // Gọi API Route nội bộ của Next.js
      const res = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ message: userText })
      });

      if (!res.ok) throw new Error("Lỗi kết nối server.");

      // Nhận cục JSON đã được Gemini chuẩn hóa
      const aiData = await res.json();
      
      // Thêm tin nhắn của Bot vào UI
      setMessages(prev => [...prev, { 
          id: Date.now() + 1,
          sender: "bot", 
          text: aiData.text || "Mình chưa hiểu ý bạn lắm.",
          hasProduct: aiData.hasProduct,
          productName: aiData.productName,
          productPrice: aiData.productPrice,
          productImage: aiData.productImage
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        sender: "bot", 
        text: "Hệ thống của mình đang bận, bạn đợi xíu nhé! 😢" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fixed container ở góc màn hình
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* NÚT BẤM MỞ CHAT (Floating Button) */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)} 
            className="bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 hover:scale-110 transition-all duration-300 animate-bounce active:scale-95"
            aria-label="Mở chat với AI"
        >
          <FaRobot size={28} />
        </button>
      )}

      {/* CỬA SỔ CHAT */}
      {isOpen && (
        <div className="w-[360px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-slideUp origin-bottom-right">
          
          {/* HEADER CHAT */}
          <div className="bg-linear-to-r from-green-600 to-emerald-700 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 text-white p-2.5 rounded-full backdrop-blur-sm shadow-inner">
                    <FaRobot size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-base">Trợ lý FreshFood AI</h3>
                    <p className="text-[11px] text-green-100 flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-lime-400 inline-block animate-pulse"></span> Sẵn sàng tư vấn
                    </p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition hover:rotate-90">
                 <FaTimes size={20} />
              </button>
          </div>

          {/* NỘI DUNG TIN NHẮN (Body) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Bong bóng chat text */}
                <div className="flex items-end max-w-[85%]">
                    {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mb-1 shrink-0 shadow-sm border border-green-200">
                          <FaRobot size={14}/>
                        </div>
                    )}
                    <div className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-green-600 text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                </div>

                {/* 👇 RENDER THẺ SẢN PHẨM NẾU CÓ DATA */}
                {msg.sender === 'bot' && msg.hasProduct && msg.productName && (
                    <div className="mt-2.5 ml-9 w-64 bg-white border border-green-100 rounded-xl overflow-hidden shadow-lg transition hover:border-green-300 animate-fadeIn">
                        {msg.productImage && (
                            <div className="h-36 bg-gray-100 relative overflow-hidden">
                                {/* Dùng img thường cho đơn giản, hoặc thay bằng Next Image nếu muốn tối ưu */}
                                <img 
                                  src={msg.productImage} 
                                  alt={msg.productName} 
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[40px]">{msg.productName}</h4>
                            <div className="flex justify-between items-end mt-2">
                                <p className="text-green-600 font-extrabold text-base">
                                   {msg.productPrice ? msg.productPrice.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ'}
                                </p>
                            </div>
                            
                            {/* Nút xem chi tiết/mua hàng */}
                            {/* Bạn cần thay đường dẫn /product/[id] tương ứng với route của bạn */}
                            <Link 
                                href="/products" // Ví dụ trỏ về trang danh sách sản phẩm
                                className="mt-4 w-full bg-green-50 text-green-700 border border-green-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition active:scale-95"
                            >
                               <FaShoppingBag size={13} /> Xem chi tiết
                            </Link>
                        </div>
                    </div>
                )}

              </div>
            ))}
            
            {/* Loading Animation (Ba chấm) */}
            {isLoading && (
              <div className="flex justify-start items-center">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 shrink-0">
                    <FaRobot size={14}/>
                  </div>
                 <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                 </div>
              </div>
            )}
            {/* Dummy div để scroll down */}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM (Ô nhập liệu) */}
          <div className="p-3 bg-white border-t border-gray-100 z-10">
             <form onSubmit={handleSend} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi Freshy về giá rau, củ hôm nay..."
                  className="flex-1 bg-gray-100 border-none rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-400 text-gray-900"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shrink-0 shadow-md"
                >
                   <FaPaperPlane size={16} className="-ml-0.5 mt-px" />
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}