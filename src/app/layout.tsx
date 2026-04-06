import type { Metadata } from "next";
// Dùng @/app/ để tự động trỏ từ thư mục gốc, không bao giờ lỗi đường dẫn
import "@/app/globals.css";
import { CartProvider } from "@/lib/CartContext";

export const metadata: Metadata = {
  title: "NôngSản Dashboard",
  description: "Hệ thống quản lý nông sản",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
