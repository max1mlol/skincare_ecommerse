"use client";
// CartContext: Сагсны төлөвийг вэбсайт даяар удирдах хувилбар.
// Хэрэглэгчийн сагсны өгөгдлийг серверээс уншиж, нэмэх, хасах, тоо ширхэг засах үйлдлийг гүйцэтгэнэ.
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "./SessionContext";
import { useRouter } from "next/navigation";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useSession(); // Хэрэглэгчийн сессийн төлөв
  const router = useRouter();
  const [items, setItems] = useState([]); // Сагсанд буй бараануудын жагсаалт
  const [loading, setLoading] = useState(true); // Сагсыг уншиж буй төлөв
  const [prevUserId, setPrevUserId] = useState(user?.id); // Хэрэглэгч солигдож буйг хянах ID

  // Хэрэглэгч нэвтрэх эсвэл гарах үед сагсны төлөвийг шинэчлэнэ
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setItems([]);
    setLoading(!!user); // Гарах үед ачаалалт байхгүй, харин нэвтрэх үед серверээс өгөгдөл авч дуустал ачаална
  }

  // fetchCart: Сагсанд байгаа өгөгдлийг серверээс татах функц
  const fetchCart = useCallback(async () => {
    if (!user) return; // Нэвтрээгүй бол сервер лүү хүсэлт илгээхгүй
    
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // Серверээс ирсэн өгөгдлийг UI-д ашиглахад хялбар бүтэцтэй болгон хөрвүүлнэ
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
      console.error("Сагсны өгөгдлийг уншихад алдаа гарлаа:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await fetchCart();
    })();
  }, [fetchCart]);

  // requireLogin: Сагстай ажиллахаас өмнө нэвтрэхийг шаардах функц
  const requireLogin = () => {
    if (!user) {
      alert("Та сагсанд бараа нэмэхийн тулд эхлээд нэвтэрнэ үү.");
      router.push("/login");
      return false;
    }
    return true;
  };

  // addItem: Сагсанд бараа нэмэх функц
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
        await fetchCart(); // Амжилттай нэмэгдвэл серверээс дахин хамгийн сүүлийн үеийн сагсны мэдээллийг татна
      }
    } catch (err) { console.error(err); }
  };

  // removeItem: Сагснаас бүтээгдэхүүнийг ID-аар нь устгах функц
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

  // setQty: Сагсан дахь бүтээгдэхүүний тоо ширхгийг шинэчлэх функц
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

  // clearCart: Сагсыг бүхэлд нь хоослох функц
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

  const totalItems = items.reduce((s, i) => s + i.qty, 0); // Нийт барааны ширхэг
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0); // Нийт үнийн дүн

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clearCart, totalItems, subtotal, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart context нь CartProvider дотор ашиглагдах ёстой");
  return ctx;
}
