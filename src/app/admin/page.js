"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Star,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";

// Dashboard дээр харуулах гол тоон үзүүлэлтүүд.
const STATS = [
  {
    label: "Нийт бараа",
    value: `${PRODUCTS.length}`,
    icon: Package,
    change: "+2 энэ сард",
    up: true,
  },
  {
    label: "Захиалгууд",
    value: "128",
    icon: ShoppingCart,
    change: "+18% өмнөх сараас",
    up: true,
  },
  { label: "Сэтгэгдэл", value: "94", icon: Star, change: "+5 шинэ", up: true },
  {
    label: "Хэрэглэгчид",
    value: "1,240",
    icon: Users,
    change: "-3% өмнөх сараас",
    up: false,
  },
];

const RECENT_ORDERS = [
  {
    id: "#AUR-10234",
    customer: "Болормаа Д.",
    product: "Essence Noire Serum",
    total: "89,000₮",
    status: "Хүргэсэн",
  },
  {
    id: "#AUR-10233",
    customer: "Наранцэцэг Б.",
    product: "Daily Hydration Cream",
    total: "52,000₮",
    status: "Хүргэж байна",
  },
  {
    id: "#AUR-10232",
    customer: "Оюунчимэг Г.",
    product: "Brightening Toner",
    total: "38,000₮",
    status: "Боловсруулж байна",
  },
  {
    id: "#AUR-10231",
    customer: "Мөнхзул Э.",
    product: "Sun Shield SPF50",
    total: "45,000₮",
    status: "Хүргэсэн",
  },
  {
    id: "#AUR-10230",
    customer: "Ундарма Б.",
    product: "Deep Cleansing Oil",
    total: "62,000₮",
    status: "Цуцалсан",
  },
];

const STATUS_COLORS = {
  Хүргэсэн: "bg-green-100 text-green-700",
  "Хүргэж байна": "bg-blue-100 text-blue-700",
  "Боловсруулж байна": "bg-yellow-100 text-yellow-700",
  Цуцалсан: "bg-red-100 text-red-700",
};

// Admin dashboard нь KPI, сүүлийн үйлдэл, хурдан холбоосуудыг нэгтгэнэ.
export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Самбар</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AURA SKIN — Нийт тойм
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, change, up }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Icon size={15} className="text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            <p
              className={`text-xs flex items-center gap-1 ${up ? "text-green-600" : "text-red-500"}`}
            >
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Орлогын тойм
            </h2>
            <p className="text-xs text-muted-foreground">Сүүлийн 30 хоног</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">+24.5%</span>
          </div>
        </div>
        {/* Bar chart visualization */}
        <div className="flex items-end gap-1.5 h-28">
          {[
            40, 65, 55, 80, 60, 90, 75, 85, 70, 95, 88, 100, 78, 92, 65, 75, 88,
            70, 82, 95, 60, 78, 84, 90, 72, 88, 75, 93, 80, 97,
          ].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-foreground/10 hover:bg-foreground/30 rounded-t transition-colors cursor-default"
              style={{ height: `${h}%` }}
              title={`${(h * 250).toLocaleString("mn-MN")}₮`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
          <span>1-р сар</span>
          <span>Өнөөдөр</span>
        </div>
      </div>

      {/* Recent orders + Top products side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Сүүлийн захиалгууд
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Бүгдийг харах →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">
                    Захиалга
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">
                    Харилцагч
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                    Нийт
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">
                    Байдал
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-foreground">
                      {order.id}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">
                      {order.customer}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground hidden sm:table-cell">
                      {order.total}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Шилдэг бараа
            </h2>
            <Link
              href="/admin/products"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Бүгд →
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs text-muted-foreground w-4 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {p.nameMn}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.reviews} сэтгэгдэл
                  </p>
                </div>
                <p className="text-xs font-semibold text-foreground shrink-0">
                  {p.price.toLocaleString("mn-MN")}₮
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
