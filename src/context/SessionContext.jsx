"use client";
// SessionContext — Хэрэглэгчийн нэвтрэлтийн глобал төлөв (Authentication state).
// login / register / logout / refetch функцуудыг бүх компонентод нэгдсэн байдлаар ашиглуулна.
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { announce } from "@/lib/announcer";

const Ctx = createContext(null);

export function SessionProvider({ children }) {
  // undefined → ачаалж байна | null → нэвтрээгүй | object → нэвтэрсэн хэрэглэгч
  const [user,    setUser]    = useState(undefined);
  const [loading, setLoading] = useState(true);

  // Серверээс одоогийн session хэрэглэгчийг унших
  const refetch = useCallback(async () => {
    try {
      const res  = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // App эхлэхэд нэг удаа дуудна — async IIFE хэрэглэнэ шаардлага тохиолдолд рендер дотор setState шуухаан дуудахгүй
  useEffect(() => {
    (async () => { await refetch(); })();
  }, [refetch]);

  // Хэрэглэгч нэвтрэх
  const login = useCallback(async (identifier, password) => {
    const res  = await fetch("/api/auth/login", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      announce(data.error || "Нэвтрэх үйлдэл амжилтгүй боллоо", "assertive");
      throw new Error(data.error || "Нэвтрэх үйлдэл амжилтгүй боллоо");
    }
    setUser(data.user);
    announce(`Тавтай морил, ${data.user.name || data.user.email}`);
    return data.user;
  }, []);

  // Шинэ хэрэглэгч бүртгүүлэх
  const register = useCallback(async (firstName, lastName, phone, email, password) => {
    const res  = await fetch("/api/auth/register", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, phone, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.errors?.[0]?.msg ?? data.error ?? "Бүртгэл амжилтгүй боллоо";
      announce(errMsg, "assertive");
      throw new Error(errMsg);
    }
    setUser(data.user);
    announce("Бүртгэл амжилттай. Тавтай морил!");
    return data.user;
  }, []);

  // Системээс гарах
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    announce("Системээс амжилттай гарлаа");
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refetch }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSession = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession нь SessionProvider дотор байх ёстой");
  return ctx;
};
