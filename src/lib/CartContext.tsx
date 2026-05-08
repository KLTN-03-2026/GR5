"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface CartItem {
  id: string | number;
  ten_san_pham: string;
  gia_ban: number;
  anh_chinh: string;
  phan_loai: string;
  so_luong: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, phan_loai: string) => void;
  updateQuantity: (
    id: string | number,
    phan_loai: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Key localStorage theo email user
  const cartKey = session?.user?.email
    ? `verdant_cart_${session.user.email}`
    : null;

  // Load giỏ hàng chỉ khi session đã xác định (không còn loading)
  useEffect(() => {
    if (status === "loading") return;
    if (!cartKey) {
      setCart([]);
      return;
    }
    try {
      const saved = localStorage.getItem(cartKey);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [cartKey, status]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(newCart));
    }
  };

  const addToCart = (newItem: CartItem) => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    const existingIndex = cart.findIndex(
      (item) => item.id === newItem.id && item.phan_loai === newItem.phan_loai,
    );
    let updatedCart;
    if (existingIndex >= 0) {
      updatedCart = [...cart];
      updatedCart[existingIndex].so_luong += newItem.so_luong;
    } else {
      updatedCart = [...cart, newItem];
    }
    saveCart(updatedCart);
  };

  const removeFromCart = (id: string | number, phan_loai: string) => {
    saveCart(cart.filter(
      (item) => !(item.id === id && item.phan_loai === phan_loai),
    ));
  };

  const updateQuantity = (
    id: string | number,
    phan_loai: string,
    quantity: number,
  ) => {
    saveCart(cart.map((item) =>
      item.id === id && item.phan_loai === phan_loai
        ? { ...item, so_luong: quantity }
        : item,
    ));
  };

  const clearCart = () => {
    setCart([]);
    if (cartKey) localStorage.removeItem(cartKey);
  };

  // Đếm số loại sản phẩm khác nhau trong giỏ
  const totalItems = cart.length;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart error");
  return context;
}
