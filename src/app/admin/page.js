"use client";
// admin/page.js — админ самбар: бодит өгөгдлийг Express API-аас авна
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Users, Star, TrendingUp, ArrowUpRight, ArrowDownRight, Package, AlertCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Захиалгын статусын өнгө
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

// Тоог товч форматаар харуулна (12500 → 12.5K)
function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Графикт зориулсан бүх захиалгыг түр хадгалах стэйт
  const [allOrdersData, setAllOrdersData] = useState([]);

  useEffect(() => {
    // Захиалга, бараа, хэрэглэгч — бүгдийг зэрэг авна (Promise.all)
    Promise.all([
      fetch("/api/orders",   { credentials: "include" }).then((r) => r.json()),
      fetch("/api/products", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/users",    { credentials: "include" }).then((r) => r.json()),
    ]).then(([ordersData, productsData, usersData]) => {
      const allOrders   = ordersData.orders   ?? [];
      const allProducts = productsData.products ?? [];
      const allUsers    = usersData.users     ?? [];

      setAllOrdersData(allOrders);

      // KPI тоонуудыг бодит өгөгдлөөс тооцоолно
      const revenue  = allOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
      const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
      const lastMonth = new Date(thisMonth); lastMonth.setMonth(lastMonth.getMonth() - 1);

      const revenueThisMonth = allOrders
        .filter((o) => new Date(o.created_at) >= thisMonth && o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
      const revenueLastMonth = allOrders
        .filter((o) => new Date(o.created_at) >= lastMonth && new Date(o.created_at) < thisMonth && o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
      const revGrowth = revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
        : 0;

      setStats({
        revenue:  `${revenue.toLocaleString("mn-MN")}₮`,
        orders:   fmt(allOrders.length),
        pendingOrdersCount: allOrders.filter(o => o.status === "pending").length,
        customers: fmt(allUsers.filter((u) => u.role === "customer").length),
        products: fmt(allProducts.length),
        revGrowth: `${revGrowth > 0 ? "+" : ""}${revGrowth}% энэ сар`,
        revUp:    revGrowth >= 0,
      });

      // Сүүлийн 8 захиалга — хуудасны доод хэсэгт харуулна
      setOrders(allOrders.slice(0, 8));

      // Хамгийн олон сэтгэгдэлтэй бараануудыг эхэнд гаргана
      setProducts([...allProducts].sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0)).slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Сүүлийн 30 хоногийн захиалгын өдөр тус бүрийн дүнг тооцоолно (shadcn Chart-д зориулсан)
  const chartData = (() => {
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days[key] = 0;
    }
    allOrdersData.forEach((o) => {
      if (o.status === "cancelled") return; // Цуцлагдсан орлогыг хасах
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (days[key] !== undefined) days[key] += o.total;
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
  })();

  const chartConfig = {
    revenue: {
      label: "Орлого (₮)",
      color: "hsl(var(--primary))",
    },
  };

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Самбар</h1>
        <p className="text-sm text-muted-foreground">Дэлгүүрийн тойм</p>
      </div>

      {/* Alert for Pending Orders */}
      {stats && stats.pendingOrdersCount > 0 && (
        <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
          <AlertTitle>Анхааруулга</AlertTitle>
          <AlertDescription>
            Танд хүлээгдэж буй <strong>{stats.pendingOrdersCount}</strong> шинэ захиалга байна. Захиалгын хэсэг рүү орж шалгана уу.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI карт — бодит тоо */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Нийт орлого",    value: stats.revenue,   icon: TrendingUp, change: stats.revGrowth, up: stats.revUp },
            { label: "Захиалга",       value: stats.orders,    icon: ShoppingBag, change: "Нийт захиалга" },
            { label: "Хэрэглэгч",     value: stats.customers, icon: Users,       change: "Бүртгэлтэй хэрэглэгч" },
            { label: "Бараа",         value: stats.products,  icon: Package,     change: "Нийт бараа" },
          ].map(({ label, value, icon: Icon, change, up }) => (
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
      )}

      {/* Орлогын график — shadcn chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold">Орлогын тойм</h2>
            <p className="text-xs text-muted-foreground">Сүүлийн 30 хоног</p>
          </div>
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

      {/* Сүүлийн захиалга + шилдэг бараа */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Захиалгын хүснэгт */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Сүүлийн захиалгууд</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">Бүгдийг харах →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">Захиалга байхгүй байна</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Дугаар</th>
                    <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Нийт</th>
                    <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Статус</th>
                    <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Огноо</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-5 py-3 font-medium hidden sm:table-cell">{o.total.toLocaleString("mn-MN")}₮</td>
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

        {/* Шилдэг бараа — сэтгэгдлийн тоогоор жагсаасан */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Шилдэг бараа</h2>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">Бүгд →</Link>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">Бараа байхгүй байна</p>
          ) : (
            <div className="divide-y divide-border/40">
              {products.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name_mn ?? p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[11px] text-muted-foreground">{p.rating ?? 0} ({p.reviews_count ?? 0} сэтгэгдэл)</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold shrink-0">{p.price.toLocaleString("mn-MN")}₮</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
