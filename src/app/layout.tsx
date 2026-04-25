import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "@/app/globals.css";
import { CartProvider } from "@/lib/CartContext";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-be-vietnam",
  display: "swap",
});

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
    <html lang="vi" className={beVietnamPro.variable}>
      <body style={{ fontFamily: "var(--font-be-vietnam), ui-sans-serif, system-ui, sans-serif" }}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
