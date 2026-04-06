"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("verdant_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (error) {
      console.error("Lỗi đọc giỏ:", error);
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("verdant_cart", JSON.stringify(newCart));
  };

  const addToCart = (newItem: CartItem) => {
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
    const updatedCart = cart.filter(
      (item) => !(item.id === id && item.phan_loai === phan_loai),
    );
    saveCart(updatedCart);
  };

  const updateQuantity = (
    id: string | number,
    phan_loai: string,
    quantity: number,
  ) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id && item.phan_loai === phan_loai) {
        return { ...item, so_luong: quantity };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  // ĐÃ SỬA THEO SHOPEE: Đếm số loại sản phẩm khác nhau trong giỏ thay vì đếm tổng số lượng
  const totalItems = cart.length;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, totalItems }}
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
