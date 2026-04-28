"use client";

import { useState } from "react";
import { Search, UserCheck, UserX, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Admin user management дээр харагдах demo хэрэглэгчид.
const USERS = [
  {
    id: 1,
    name: "Болормаа Дамдин",
    email: "bolormaa@mail.mn",
    phone: "9900-1234",
    orders: 7,
    spent: 423000,
    joined: "2024-01-15",
    role: "user",
    active: true,
  },
  {
    id: 2,
    name: "Наранцэцэг Батаа",
    email: "naraa@gmail.com",
    phone: "9911-5678",
    orders: 12,
    spent: 780000,
    joined: "2023-11-20",
    role: "user",
    active: true,
  },
  {
    id: 3,
    name: "Оюунчимэг Гантөмөр",
    email: "oyun@mail.mn",
    phone: "9922-9012",
    orders: 3,
    spent: 189000,
    joined: "2024-03-08",
    role: "user",
    active: false,
  },
  {
    id: 4,
    name: "Мөнхзул Эрдэнэ",
    email: "munkh@gmail.com",
    phone: "9933-3456",
    orders: 21,
    spent: 1250000,
    joined: "2023-06-12",
    role: "vip",
    active: true,
  },
  {
    id: 5,
    name: "Ундарма Батсайхан",
    email: "undarmaa@mail.mn",
    phone: "9944-7890",
    orders: 1,
    spent: 59000,
    joined: "2025-02-01",
    role: "user",
    active: true,
  },
  {
    id: 6,
    name: "Нарантуул Сандаг",
    email: "narantul@mail.mn",
    phone: "9955-1234",
    orders: 5,
    spent: 312000,
    joined: "2024-07-22",
    role: "user",
    active: true,
  },
  {
    id: 7,
    name: "Админ",
    email: "admin@auraskin.mn",
    phone: "9999-0000",
    orders: 0,
    spent: 0,
    joined: "2023-01-01",
    role: "admin",
    active: true,
  },
];

const ROLE_STYLES = {
  admin: "bg-foreground text-background",
  vip: "bg-amber-100 text-amber-700",
  user: "bg-muted text-muted-foreground",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState(USERS);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()),
      )
    : users;

  function toggleActive(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }
  function changeRole(id, role) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  const activeCount = users.filter((u) => u.active).length;
  const totalSpent = users.reduce((s, u) => s + u.spent, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Хэрэглэгчид
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} нийт · {activeCount} идэвхтэй · Нийт зарцуулалт:{" "}
            <span className="font-semibold text-foreground">
              {totalSpent.toLocaleString("mn-MN")}₮
            </span>
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Нэр эсвэл имэйлээр хайх..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 rounded-xl h-9 text-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Хэрэглэгч
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Утас
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Захиалга
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Нийт зарцуулалт
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground">
                  Эрх
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground">
                  Байдал
                </th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                        {user.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {user.phone}
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-foreground font-medium hidden sm:table-cell">
                    {user.orders}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-foreground hidden lg:table-cell">
                    {user.spent.toLocaleString("mn-MN")}₮
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${ROLE_STYLES[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.active ? (
                        <UserCheck size={10} />
                      ) : (
                        <UserX size={10} />
                      )}
                      {user.active ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-44"
                      >
                        <DropdownMenuItem
                          onClick={() => toggleActive(user.id)}
                          className="cursor-pointer gap-2"
                        >
                          {user.active ? (
                            <>
                              <UserX size={13} /> Хаах
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} /> Нээх
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {["user", "vip", "admin"]
                          .filter((r) => r !== user.role)
                          .map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => changeRole(user.id, r)}
                              className="cursor-pointer capitalize gap-2"
                            >
                              → {r} эрх өгөх
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          {filtered.length} / {users.length} хэрэглэгч
        </div>
      </div>
    </div>
  );
}
