// admin/page.js — Удирдлагын самбар.
// /api/admin/stats нэг endpoint-ээс бүх KPI өгөгдлийг татна (3 тусдаа call → 1 хурдан SQL).
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag, Users, Star, TrendingUp,
  ArrowUpRight, ArrowDownRight, Package, AlertCircle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const STATUS_COLOR = {
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABEL = {
  pending: "Хүлээгдэж буй", confirmed: "Баталгаажсан",
  shipped: "Илгээгдсэн",   delivered: "Хүргэгдсэн", cancelled: "Цуцлагдсан",
};

const chartConfig = { revenue: { label: "Орлого (₮)", color: "hsl(var(--primary))" } };

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Статистик татахад алдаа гарлаа"); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Сүүлийн 30 хоногийн орлогын графикийн өгөгдлийг тооцоолно — зөвхөн data өөрчлөгдөхөд
  const chartData = useMemo(() => {
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    (data?.revenueByDay ?? []).forEach(({ day, revenue }) => {
      const key = new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in days) days[key] = Number(revenue);
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
  }, [data]);

  // Орлогын өсөлт/бууралтыг тооцоолно — зөвхөн data өөрчлөгдөхөд
  const revGrowth = useMemo(() => {
    if (!data) return 0;
    const { revenueThisMonth: cur, revenueLastMonth: prev } = data;
    return prev > 0 ? ((cur - prev) / prev * 100).toFixed(1) : 0;
  }, [data]);

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  const kpis = [
    {
      label: "Нийт орлого",
      value: `${(data.totalRevenue ?? 0).toLocaleString("mn-MN")}₮`,
      icon: TrendingUp,
      change: `${revGrowth >= 0 ? "+" : ""}${revGrowth}% энэ сар`,
      up: Number(revGrowth) >= 0,
    },
    { label: "Захиалга",   value: fmt(data.totalOrders ?? 0),    icon: ShoppingBag, change: "Нийт захиалга" },
    { label: "Хэрэглэгч", value: fmt(data.totalCustomers ?? 0),  icon: Users,       change: "Бүртгэлтэй" },
    { label: "Бараа",     value: fmt(data.totalProducts ?? 0),   icon: Package,     change: "Нийт бараа" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Самбар</h1>
        <p className="text-sm text-muted-foreground">Дэлгүүрийн тойм мэдээлэл</p>
      </div>

      {data.pendingOrders > 0 && (
        <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
          <AlertTitle>Шинэ захиалга</AlertTitle>
          <AlertDescription>
            Танд хүлээгдэж буй <strong>{data.pendingOrders}</strong> шинэ захиалга байна.{" "}
            <Link href="/admin/orders" className="underline underline-offset-2">Захиалгын хэсэг рүү орох →</Link>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI картнууд */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, change, up }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Icon size={15} className="text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            <p className={`text-xs flex items-center gap-1 ${up === false ? "text-red-500" : up ? "text-green-600" : "text-muted-foreground"}`}>
              {up === true  && <ArrowUpRight size={12} />}
              {up === false && <ArrowDownRight size={12} />}
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* Орлогын 30 хоногийн Bar chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold">Орлогын тойм</h2>
          <p className="text-xs text-muted-foreground">Сүүлийн 30 хоногийн орлогын график</p>
        </div>
        <div className="h-64">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} className="text-xs text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Сүүлийн 8 захиалга */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Сүүлийн захиалгууд</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">Бүгдийг харах →</Link>
          </div>
          {!data.recentOrders?.length ? (
            <p className="text-sm text-muted-foreground p-5">Захиалга байхгүй байна</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Дугаар", "Нийт", "Статус", "Огноо"].map(h => (
                      <th key={h} className={`text-left px-5 py-3 text-xs text-muted-foreground font-medium${h === "Нийт" ? " hidden sm:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-5 py-3 font-medium hidden sm:table-cell">{Number(o.total).toLocaleString("mn-MN")}₮</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLOR[o.status] ?? ""}`}>
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("mn-MN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Шилдэг 5 бүтээгдэхүүн */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Онцлох бүтээгдэхүүн</h2>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">Бүгд →</Link>
          </div>
          {!data.topProducts?.length ? (
            <p className="text-sm text-muted-foreground p-5">Бараа байхгүй байна</p>
          ) : (
            <div className="divide-y divide-border/40">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name_mn ?? p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[11px] text-muted-foreground">
                        {p.rating ?? 0} ({p.reviews_count ?? 0} сэтгэгдэл)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold shrink-0">{Number(p.price).toLocaleString("mn-MN")}₮</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
