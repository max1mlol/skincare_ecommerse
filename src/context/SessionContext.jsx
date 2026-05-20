"use client";
// SessionContext: Хэрэглэгчийн нэвтрэлт болон бүртгэлийн төлөвийг (Authentication state) систем даяар удирдах Provider.
// Express сервертэй холбогдон одоогийн хэрэглэгчийг унших, нэвтрэх, бүртгүүлэх болон гарах үйлдлүүдийг хариуцна.
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const Ctx = createContext(null);

export function SessionProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // Хэрэглэгчийн төлөв: undefined нь ачаалж байгаа, null нь нэвтрээгүй, объект нь нэвтэрсэн хэрэглэгч
  const [loading, setLoading] = useState(true); // Ачаалалтын төлөв

  // refetch: Сервер дэх /api/auth/me хаягаас одоогийн session доторх хэрэглэгчийг унших функц
  const refetch = useCallback(async () => {
    try {
      const res  = await fetch("/api/auth/me", { credentials: "include" }); // credentials: include нь session cookie дамжуулна
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refetch();
    })();
  }, [refetch]);

  // login: Хэрэглэгч нэвтрэх функц
  const login = useCallback(async (identifier, password) => {
    const res  = await fetch("/api/auth/login", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Нэвтрэх үйлдэл амжилтгүй боллоо");
    setUser(data.user);
    return data.user;
  }, []);

  // register: Шинэ хэрэглэгч бүртгүүлэх функц
  const register = useCallback(async (firstName, lastName, phone, email, password) => {
    const res  = await fetch("/api/auth/register", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ firstName, lastName, phone, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.msg ?? data.error ?? "Бүртгэл амжилтгүй боллоо");
    setUser(data.user);
    return data.user;
  }, []);

  // logout: Системээс гарах үйлдэл
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refetch }}>
      {children}
    </Ctx.Provider>
  );
}

// useSession: Компонентууд дотроос хэрэглэгчийн сессийн мэдээллийг хялбар унших custom hook
export const useSession = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession hook нь SessionProvider дотор ашиглагдах ёстой");
  return ctx;
};
