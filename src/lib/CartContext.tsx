"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string | number;
  ma_bien_the: number;
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
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("verdant_cart_guest");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const mergedRef = useRef(false);

  const cartKey = session?.user?.email
    ? `verdant_cart_${session.user.email}`
    : "verdant_cart_guest";

  // Khi session resolve: load cart đúng key + merge guest nếu cần
  useEffect(() => {
    if (status === "loading") return;
    try {
      const saved = localStorage.getItem(cartKey);
      let loadedCart: CartItem[] = saved ? JSON.parse(saved) : [];

      if (session?.user?.email && !mergedRef.current) {
        mergedRef.current = true;
        const guestData = localStorage.getItem("verdant_cart_guest");
        if (guestData) {
          const guestCart: CartItem[] = JSON.parse(guestData);
          for (const gItem of guestCart) {
            const idx = loadedCart.findIndex(
              (c) => c.id === gItem.id && c.phan_loai === gItem.phan_loai,
            );
            if (idx >= 0) {
              loadedCart[idx].so_luong += gItem.so_luong;
            } else {
              loadedCart = [...loadedCart, gItem];
            }
          }
          localStorage.removeItem("verdant_cart_guest");
          localStorage.setItem(cartKey, JSON.stringify(loadedCart));
        }
      }

      setCart(loadedCart);
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
