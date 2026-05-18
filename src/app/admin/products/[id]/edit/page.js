"use client";
// admin/products/[id]/edit/page.js — DB-аас барааг татаж засах form руу дамжуулна
import { use, useEffect, useState } from "react";
import { notFound }  from "next/navigation";
import ProductForm   from "@/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  const { id }                      = use(params);
  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [missing, setMissing]       = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setProduct(d.product ?? d))
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-muted-foreground text-sm animate-pulse">Ачааллаж байна...</div>;
  if (missing) return notFound();

  return <ProductForm product={product} isEdit />;
}
