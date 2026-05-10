"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: number;
  name: string;
  image: string | null;
  price: number | null;
  unit: string;
}

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  products?: Product[];
  navigate?: string | null;
}

function formatBotText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
  return parts.map((part, i) => {
    if (part === "\n") return <br key={i} />;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export default function ChatbotAI() {
  const router = useRouter();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Chào bạn! Mình là Freshy 🥦, trợ lý AI của NôngSản Việt. Bạn muốn tìm mua gì hôm nay?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.sender === "user" || m.sender === "bot")
        .slice(-10)
        .map((m) => ({ role: m.sender === "user" ? "user" : "model", text: m.text }));

      const cartSummary = cart.length > 0 ? {
        totalItems: cart.reduce((sum, item) => sum + item.so_luong, 0),
        totalWeight: cart.reduce((sum, item) => sum + item.so_luong * 500, 0),
      } : null;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history, cart: cartSummary }),
      });

      if (!res.ok) throw new Error("Lỗi kết nối");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.text || "Mình chưa hiểu ý bạn lắm.",
          products: data.products || [],
          navigate: data.navigate || null,
        },
      ]);

      if (data.navigate) {
        setTimeout(() => {
          router.push(data.navigate);
        }, 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Hệ thống đang bận, bạn thử lại sau nhé! 😢",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-110 transition-all duration-300 active:scale-95"
          style={{ animation: "bounce-gentle 2s infinite" }}
        >
          <FaRobot size={26} />
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] h-[580px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
          style={{ animation: "slideUp 0.3s ease-out" }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-full">
                <FaRobot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[15px]">Freshy - Trợ lý AI</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 inline-block animate-pulse" />
                  Sẵn sàng tư vấn
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition hover:rotate-90 duration-200"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end max-w-[88%]">
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2 mb-1 shrink-0">
                      <FaRobot size={13} />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.sender === "bot" ? formatBotText(msg.text) : msg.text}
                  </div>
                </div>

                {/* Navigation button */}
                {msg.sender === "bot" && msg.navigate && (
                  <div className="ml-9 mt-2">
                    <Link
                      href={msg.navigate}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
                    >
                      <span>👉</span>
                      <span>Đi đến trang</span>
                      <span className="text-emerald-500">→</span>
                    </Link>
                  </div>
                )}

                {/* Product cards */}
                {msg.sender === "bot" && msg.products && msg.products.length > 0 && (
                  <div className="ml-9 mt-2 flex flex-col gap-2 w-full max-w-[280px]">
                    {msg.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-3 p-2.5 bg-white border border-emerald-100 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingCart size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[13px] font-bold text-emerald-600 mt-0.5">
                            {product.price
                              ? `${product.price.toLocaleString("vi-VN")}đ/${product.unit}`
                              : "Liên hệ"}
                          </p>
                        </div>
                        <div className="text-[10px] text-emerald-500 font-medium shrink-0">
                          Xem →
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2 shrink-0">
                  <FaRobot size={13} />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi Freshy về nông sản, giá cả..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition text-gray-900 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95 shrink-0 shadow-md"
              >
                <FaPaperPlane size={14} className="-ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
