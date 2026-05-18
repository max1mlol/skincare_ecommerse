"use client";
// admin/orders/page.js — захиалгын жагсаалт, статус удирдах
import { useEffect, useState } from "react";

const STATUS_OPTIONS = ["pending","confirmed","shipped","delivered","cancelled"];
const STATUS_COLOR = {
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_MN = {
  pending:"Хүлээгдэж буй", confirmed:"Баталгаажсан",
  shipped:"Илгээгдсэн",    delivered:"Хүргэгдсэн", cancelled:"Цуцлагдсан",
};

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Статус шинэчлэх — сонгогчоор дарж шууд хадгална
  async function updateStatus(id, status) {
    const res  = await fetch(`/api/orders/${id}/status`, {
      method:      "PATCH",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    }
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-4 md:p-6 max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Захиалгууд</h1>
          <p className="text-sm text-muted-foreground">{orders.length} нийт захиалга</p>
        </div>
        {/* Статусаар шүүх */}
        <div className="flex flex-wrap gap-1.5">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {s === "all" ? "Бүгд" : STATUS_MN[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Захиалга байхгүй байна</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Дугаар</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Хэрэглэгч</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Нийт</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Огноо</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.order_number}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs font-medium">{o.user_name ?? "Зочин"}</p>
                      <p className="text-[11px] text-muted-foreground">{o.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{o.total.toLocaleString("mn-MN")}₮</td>
                    <td className="px-4 py-3">
                      {/* Статус шууд өөрчлөх dropdown */}
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLOR[o.status] ?? ""}`}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_MN[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(o.created_at).toLocaleDateString("mn-MN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
