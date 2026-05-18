"use client";
// admin/users/page.js — хэрэглэгчийн удирдлага (API-аас бодит өгөгдөл)
import { useState, useEffect, useMemo } from "react";
import { useSession } from "@/context/SessionContext";
import { Search, UserCheck, UserX, Shield, Trash2, RefreshCw } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ROLE_LABEL = { admin: "Admin", customer: "Хэрэглэгч" };

export default function AdminUsersPage() {
  const { user: currentUser } = useSession();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/users", { credentials: "include" });
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  // Хэрэглэгчийн role солих
  async function toggleRole(user) {
    const newRole = user.role === "admin" ? "customer" : "admin";
    await fetch(`/api/users/${user.id}`, {
      method:  "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: newRole }),
    });
    setUsers((us) => us.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
  }

  // Хэрэглэгч устгах
  async function deleteUser(id) {
    await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
    setUsers((us) => us.filter((u) => u.id !== id));
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, query]);

  const admins    = users.filter((u) => u.role === "admin").length;
  const customers = users.filter((u) => u.role === "customer").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Хэрэглэгчид</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} нийт · {admins} admin · {customers} хэрэглэгч
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Шинэчлэх
        </Button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Хэрэглэгч хайх..." className="pl-9 rounded-full" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Хэрэглэгч</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Утас</th>
              <th className="text-center px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Бүртгэлийн огноо</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Хэрэглэгч олдсонгүй</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                {/* Нэр + имэйл */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar initials */}
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.phone ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px] px-2">
                    {u.role === "admin" && <Shield size={9} className="mr-1" />}
                    {ROLE_LABEL[u.role] ?? u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                  {new Date(u.created_at).toLocaleDateString("mn-MN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Role toggle */}
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={u.role === "admin" ? "Admin эрхийг хасах" : "Admin болгох"} onClick={() => toggleRole(u)} disabled={currentUser?.id === u.id}>
                      {u.role === "admin" ? <UserX size={13} /> : <UserCheck size={13} />}
                    </Button>
                    {/* Устгах */}
                    {currentUser?.id === u.id ? (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-50 cursor-not-allowed" disabled>
                        <Trash2 size={13} />
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 size={13} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Хэрэглэгч устгах уу?</AlertDialogTitle>
                            <AlertDialogDescription>&quot;{u.name}&quot; ({u.email})-г системээс бүрмөсөн устгана.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Болих</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(u.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
