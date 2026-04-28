"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Захиалгын demo өгөгдөл.
const ORDERS = [
  {
    id: "#AUR-10234",
    customer: "Болормаа Д.",
    phone: "9900-1234",
    product: "Essence Noire Serum",
    total: 89000,
    status: "Хүргэсэн",
    date: "2025-03-15",
  },
  {
    id: "#AUR-10233",
    customer: "Наранцэцэг Б.",
    phone: "9911-5678",
    product: "Daily Hydration Cream",
    total: 72000,
    status: "Хүргэж байна",
    date: "2025-03-14",
  },
  {
    id: "#AUR-10232",
    customer: "Оюунчимэг Г.",
    phone: "9922-9012",
    product: "Lumina The Toner",
    total: 64000,
    status: "Боловсруулж байна",
    date: "2025-03-13",
  },
  {
    id: "#AUR-10231",
    customer: "Мөнхзул Э.",
    phone: "9933-3456",
    product: "Matte Shield SPF50",
    total: 68000,
    status: "Хүргэсэн",
    date: "2025-03-12",
  },
  {
    id: "#AUR-10230",
    customer: "Ундарма Б.",
    phone: "9944-7890",
    product: "Kaolin Detox Mask",
    total: 59000,
    status: "Цуцалсан",
    date: "2025-03-11",
  },
  {
    id: "#AUR-10229",
    customer: "Нарантуул С.",
    phone: "9955-1234",
    product: "Aqua Boost Essence",
    total: 84000,
    status: "Хүргэсэн",
    date: "2025-03-10",
  },
  {
    id: "#AUR-10228",
    customer: "Цэцэгмаа О.",
    phone: "9966-5678",
    product: "Rose Hip Eye Cream",
    total: 79000,
    status: "Боловсруулж байна",
    date: "2025-03-09",
  },
  {
    id: "#AUR-10227",
    customer: "Дэлгэрцэцэг М.",
    phone: "9977-9012",
    product: "Essence Noire Serum",
    total: 89000,
    status: "Хүргэсэн",
    date: "2025-03-08",
  },
];

const STATUS_STYLES = {
  Хүргэсэн: "bg-green-100 text-green-700",
  "Хүргэж байна": "bg-blue-100 text-blue-700",
  "Боловсруулж байна": "bg-yellow-100 text-yellow-700",
  Цуцалсан: "bg-red-100 text-red-600",
};

const ALL_STATUSES = [
  "Бүгд",
  "Хүргэсэн",
  "Хүргэж байна",
  "Боловсруулж байна",
  "Цуцалсан",
];

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");
  const [orders, setOrders] = useState(ORDERS);

  const filtered = orders.filter((o) => {
    const matchQ =
      !query.trim() ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.id.includes(query);
    const matchS = statusFilter === "Бүгд" || o.status === statusFilter;
    return matchQ && matchS;
  });

  function changeStatus(id, newStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === "Хүргэсэн")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Захиалгууд</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} нийт · Орлого:{" "}
            <span className="font-semibold text-foreground">
              {totalRevenue.toLocaleString("mn-MN")}₮
            </span>
          </p>
        </div>
        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Захиалгын ID эсвэл нэрээр хайх..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 rounded-xl h-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Захиалга
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Харилцагч
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Бараа
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Нийт
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Байдал
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Огноо
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Захиалга олдсонгүй
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-foreground font-medium">
                      {order.id}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {order.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.phone}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {order.product}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground text-right hidden sm:table-cell">
                      {order.total.toLocaleString("mn-MN")}₮
                    </td>
                    <td className="px-5 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${STATUS_STYLES[order.status]}`}
                          >
                            {order.status}
                            <ChevronDown size={10} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="rounded-xl w-48"
                        >
                          {ALL_STATUSES.filter(
                            (s) => s !== "Бүгд" && s !== order.status,
                          ).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => changeStatus(order.id, s)}
                              className="text-sm cursor-pointer"
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {order.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} / {orders.length} захиалга
          </div>
        )}
      </div>
    </div>
  );
}
