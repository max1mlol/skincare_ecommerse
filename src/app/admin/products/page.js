"use client";
// admin/products/page.js — бүтээгдэхүүний удирдлага (API-аас бодит өгөгдөл)
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, Package, RefreshCw } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminProductsPage() {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [query,     setQuery]     = useState("");
  const [deleting,  setDeleting]  = useState(null);

  // DB-аас бүх бараа татах
  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/products?limit=200", { credentials: "include" });
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  // Бараа устгах
  async function deleteProduct(id) {
    setDeleting(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
      setProducts((p) => p.filter((x) => x.id !== id));
    } finally { setDeleting(null); }
  }

  // Хайлт
  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const totalStock = products.reduce((s, p) => s + (p.stock_qty ?? 0), 0);
  const outOfStock = products.filter((p) => !p.in_stock).length;

  return (
    <div className="space-y-6">
      {/* Гарчиг + товчлуурууд */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Бүтээгдэхүүн</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} бараа · {outOfStock} дууссан · {totalStock} нийт үлдэгдэл
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Шинэчлэх
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/admin/products/new"><Plus size={14} className="mr-1.5" />Шинэ бараа</Link>
          </Button>
        </div>
      </div>

      {/* Хайлт */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Бараа, брэнд, ангилал хайх..." className="pl-9 rounded-full" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Хүснэгт */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Бараа</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Ангилал</th>
              <th className="text-right px-4 py-3 font-medium">Үнэ</th>
              <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Рейтинг</th>
              <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Үлдэгдэл</th>
              <th className="text-center px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                <Package size={32} className="mx-auto mb-2 opacity-30" />Бараа олдсонгүй
              </td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                {/* Зураг + нэр */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                      {p.image && <Image src={getImageUrl(p.image)} alt={p.name} fill sizes="40px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[180px]">{p.name_mn ?? p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">{p.category_mn ?? p.category}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(p.price).toLocaleString("mn-MN")}₮</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="text-amber-500">★</span> {Number(p.rating ?? 0).toFixed(1)}
                  <span className="text-xs text-muted-foreground ml-1">({p.reviews_count ?? 0})</span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell text-muted-foreground">{p.stock_qty ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={p.in_stock ? "default" : "destructive"} className="text-[10px] px-2 py-0.5">
                    {p.in_stock ? "Байгаа" : "Дууссан"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link href={`/admin/products/${p.id}/edit`}><Pencil size={13} /></Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 size={13} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Бараа устгах уу?</AlertDialogTitle>
                          <AlertDialogDescription>&quot;{p.name_mn ?? p.name}&quot; барааг устгах бөгөөд буцаах боломжгүй.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Болих</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProduct(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting === p.id}>
                            {deleting === p.id ? "Устгаж байна..." : "Устгах"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
