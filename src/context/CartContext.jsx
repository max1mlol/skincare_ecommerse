"use client";
// CartContext — сагсны төлөвийг вэбсайт даяар удирдана.
// localStorage-д хадгалдаг тул хуудас шинэчлэлт хийсэн ч сагс хэвээр байна.
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "./SessionContext";
import { useRouter } from "next/navigation";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevUserId, setPrevUserId] = useState(user?.id);

  // Sync state during render when user changes (e.g., logs in or logs out)
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setItems([]);
    setLoading(!!user); // If user logs out, loading is false. If user logs in, loading is true until fetch completes.
  }

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) return; // Do not fetch, state is already reset during render
    
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // map db items to ui expected format
        const mapped = data.items.map(i => ({
          id: i.product_id,
          name: i.name,
          nameMn: i.name_mn,
          price: i.price,
          image: i.image,
          category: i.category,
          categoryMn: i.category_mn,
          qty: i.qty
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await fetchCart();
    })();
  }, [fetchCart]);

  const requireLogin = () => {
    if (!user) {
      alert("Та сагсанд бараа нэмэхийн тулд эхлээд нэвтэрнэ үү.");
      router.push("/login");
      return false;
    }
    return true;
  };

  const addItem = async (item, qty = 1) => {
    if (!requireLogin()) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, qty })
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) { console.error(err); }
  };

  const removeItem = async (id) => {
    if (!requireLogin()) return;
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const setQty = async (id, qty) => {
    if (!requireLogin()) return;
    if (qty < 1) return;
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty })
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
      }
    } catch (err) { console.error(err); }
  };

  const clearCart = async () => {
    if (!requireLogin()) return;
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setItems([]);
      }
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
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
