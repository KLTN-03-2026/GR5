// src/app/(store)/layout.tsx
import Footer from "@/components/store/layout/Footer"; // Giả sử bạn có Footer
import Header from "@/components/store/layout/Header";
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
    </CartProvider>
  );
}
