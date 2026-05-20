"use client";
// CartContext — Сагсны глобал төлөв.
// fetchCart нь sessionLoading дуустал хүлээж, дараа нь user-д тулгуурлан ажилладаг.
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "./SessionContext";
import { useRouter }  from "next/navigation";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Серверээс сагсны өгөгдлийг татах — user өөрчлөгдөх бүрт дахин дуудагдана
  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const { items: raw } = await res.json();
        setItems(raw.map(i => ({
          id:         i.product_id,
          name:       i.name,
          nameMn:     i.name_mn,
          price:      i.price,
          image:      i.image,
          category:   i.category,
          categoryMn: i.category_mn,
          qty:        i.qty,
        })));
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // sessionLoading дуустал хүлээж, дараа fetchCart дуудна.
  // async IIFE хэрэглэнэ шаардлага тохиолдолд рендер дотор setState шуухаан дуудахгүй (React Compiler ESLint rule)
  useEffect(() => {
    if (sessionLoading) return;
    (async () => { await fetchCart(); })();
  }, [fetchCart, sessionLoading]);

  // Нэвтрээгүй хэрэглэгчийг нэвтрэх хуудас руу шилжүүлнэ (alert()-гүйгээр)
  const requireLogin = () => {
    if (!user) { router.push("/login"); return false; }
    return true;
  };

  // Сагсанд бараа нэмэх
  const addItem = async (item, qty = 1) => {
    if (!requireLogin()) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, qty }),
      });
      if (res.ok) await fetchCart();
    } catch (err) { console.error(err); }
  };

  // Сагснаас бараа хасах — оптимистик UI шинэчлэлт
  const removeItem = async (id) => {
    if (!requireLogin()) return;
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  // Барааны тоо ширхгийг шинэчлэх — оптимистик UI шинэчлэлт
  const setQty = async (id, qty) => {
    if (!requireLogin() || qty < 1) return;
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    } catch (err) { console.error(err); }
  };

  // Сагсыг бүхэлд нь хоослох
  const clearCart = async () => {
    if (!requireLogin()) return;
    try {
      const res = await fetch("/api/cart", { method: "DELETE", credentials: "include" });
      if (res.ok) setItems([]);
    } catch (err) { console.error(err); }
  };

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clearCart, totalItems, subtotal, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart нь CartProvider дотор байх ёстой");
  return ctx;
}
