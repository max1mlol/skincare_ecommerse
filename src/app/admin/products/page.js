"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCTS as INITIAL_PRODUCTS } from "@/lib/products";

// Product management хуудасны жагсаалт, хайлт, delete confirm урсгал.
export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.nameMn.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  function handleDelete(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Бүтээгдэхүүн
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} бараа нийт
          </p>
        </div>
        <Button
          asChild
          className="rounded-full gap-2 h-9 text-sm"
          id="new-product-btn"
        >
          <Link href="/admin/products/new">
            <Plus size={15} />
            Шинэ бараа нэмэх
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="admin-product-search"
          placeholder="Бараа хайх..."
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
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground w-14">
                  Зураг
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Нэр
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Ангилал
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                  Үнэ
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Байдал
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Үнэлгээ
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package
                      size={28}
                      className="text-muted-foreground mx-auto mb-3 opacity-40"
                    />
                    <p className="text-sm text-muted-foreground">
                      Бараа олдсонгүй
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Image */}
                    <td className="px-5 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={product.image}
                          alt={product.nameMn}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground text-sm leading-snug">
                        {product.nameMn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.name}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      <Badge
                        variant="secondary"
                        className="rounded-full text-xs capitalize"
                      >
                        {product.category}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 text-right">
                      <p className="font-semibold text-foreground">
                        {product.price.toLocaleString("mn-MN")}₮
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString("mn-MN")}₮
                        </p>
                      )}
                    </td>

                    {/* Stock status */}
                    <td className="px-5 py-3 text-center hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.inStock ? "Байгаа" : "Дууссан"}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-3 text-center text-sm text-muted-foreground hidden lg:table-cell">
                      ★ {product.rating} ({product.reviews})
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <AlertDialog
                        open={deletingId === product.id}
                        onOpenChange={(o) => !o && setDeletingId(null)}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              aria-label="Үйлдэл"
                            >
                              <MoreHorizontal size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 rounded-xl"
                          >
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil size={13} />
                                Засах
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                ↗ Харах
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                                onSelect={() => setDeletingId(product.id)}
                              >
                                <Trash2 size={13} />
                                Устгах
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Устгах уу?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{product.nameMn}</strong> барааг устгах
                              гэж байна. Энэ үйлдлийг буцаах боломжгүй.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">
                              Болих
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                            >
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} / {products.length} бараа харагдаж байна
          </div>
        )}
      </div>
    </div>
  );
}
