"use client";
// SessionContext — Express сервертэй хэрэглэгчийн нэвтрэлтийг удирдана.
// /api/auth/me endpoint-оос session унших, login/register/logout хийх.
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const Ctx = createContext(null);

export function SessionProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // undefined = ачааллаж байна
  const [loading, setLoading] = useState(true);

  // Хуудас нээгдэхэд server-ээс одоогийн session уншина
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

  useEffect(() => {
    (async () => {
      await refetch();
    })();
  }, [refetch]);

  const login = useCallback(async (identifier, password) => {
    const res  = await fetch("/api/auth/login", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Нэвтрэх амжилтгүй боллоо");
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (firstName, lastName, phone, email, password) => {
    const res  = await fetch("/api/auth/register", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ firstName, lastName, phone, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.msg ?? data.error ?? "Бүртгэл амжилтгүй");
    setUser(data.user);
    return data.user;
  }, []);

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

// useSession — компонент дотроос session уншихад ашиглах hook
export const useSession = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
};
