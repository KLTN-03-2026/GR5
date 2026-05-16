"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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
  updateQuantity: (id: string | number, phan_loai: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isCartLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_KEY = "verdant_cart_guest";

const getKey = (email: string | null | undefined) =>
  email ? `verdant_cart_${email}` : GUEST_KEY;

const readLS = (key: string): CartItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const writeLS = (key: string, data: CartItem[]) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const email = session?.user?.email ?? null;
  const userId = (session?.user as any)?.id ?? null;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const keyRef = useRef<string>(GUEST_KEY);
  const syncingRef = useRef(false);

  const syncToServer = useCallback(async (action: string, payload: any) => {
    if (!userId) return;
    try {
      await fetch("/api/cart/items", {
        method: action,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (status === "loading") return;

    const newKey = getKey(email);
    const prevKey = keyRef.current;
    keyRef.current = newKey;

    // User logged out: clear cart state and guest localStorage
    if (!email && prevKey !== GUEST_KEY) {
      setCart([]);
      try { localStorage.removeItem(GUEST_KEY); } catch {}
      setIsCartLoaded(true);
      return;
    }

    if (newKey === prevKey && cart.length > 0) return;

    let loaded = readLS(newKey);

    if (email && prevKey === GUEST_KEY) {
      const guestCart = readLS(GUEST_KEY);
      if (guestCart.length > 0) {
        for (const gItem of guestCart) {
          const idx = loaded.findIndex(
            (c) => c.id === gItem.id && c.phan_loai === gItem.phan_loai
          );
          if (idx >= 0) {
            loaded[idx] = { ...loaded[idx], so_luong: loaded[idx].so_luong + gItem.so_luong };
          } else {
            loaded = [...loaded, gItem];
          }
        }
        localStorage.removeItem(GUEST_KEY);
        writeLS(newKey, loaded);

        fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: guestCart }),
        }).catch(() => {});
      }
    }

    setCart(loaded);
    setIsCartLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, status]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== keyRef.current) return;
      if (syncingRef.current) return;
      const newCart = e.newValue ? JSON.parse(e.newValue) : [];
      setCart(newCart);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const save = useCallback((newCart: CartItem[]) => {
    syncingRef.current = true;
    setCart(newCart);
    writeLS(keyRef.current, newCart);
    setTimeout(() => { syncingRef.current = false; }, 100);
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    if (status === "loading") return;
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === newItem.id && item.phan_loai === newItem.phan_loai
      );
      const updated = idx >= 0
        ? prev.map((item, i) => i === idx ? { ...item, so_luong: item.so_luong + newItem.so_luong } : item)
        : [...prev, newItem];
      syncingRef.current = true;
      writeLS(keyRef.current, updated);
      setTimeout(() => { syncingRef.current = false; }, 100);
      return updated;
    });
    syncToServer("POST", { ma_bien_the: newItem.ma_bien_the, so_luong: newItem.so_luong });
  }, [status, syncToServer]);

  const removeFromCart = useCallback((id: string | number, phan_loai: string) => {
    setCart((prev) => {
      const removed = prev.find((item) => item.id === id && item.phan_loai === phan_loai);
      const updated = prev.filter((item) => !(item.id === id && item.phan_loai === phan_loai));
      syncingRef.current = true;
      writeLS(keyRef.current, updated);
      setTimeout(() => { syncingRef.current = false; }, 100);
      if (removed) {
        syncToServer("DELETE", { ma_bien_the: removed.ma_bien_the });
      }
      return updated;
    });
  }, [syncToServer]);

  const updateQuantity = useCallback((id: string | number, phan_loai: string, quantity: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id && i.phan_loai === phan_loai);
      const updated = prev.map((i) =>
        i.id === id && i.phan_loai === phan_loai ? { ...i, so_luong: quantity } : i
      );
      syncingRef.current = true;
      writeLS(keyRef.current, updated);
      setTimeout(() => { syncingRef.current = false; }, 100);
      if (item) {
        syncToServer("PUT", { ma_bien_the: item.ma_bien_the, so_luong: quantity });
      }
      return updated;
    });
  }, [syncToServer]);

  const clearCart = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(keyRef.current); } catch {}
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems: cart.length, isCartLoaded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within CartProvider");
  return context;
}
