"use client";
// admin/products/[id]/edit/page.js: Бүтээгдэхүүний мэдээлэл засах хуудас.
// Энд сонгосон бүтээгдэхүүний ID-аар серверээс мэдээллийг татаж аваад ProductForm компонент руу дамжуулна.
import { use, useEffect, useState } from "react";
import { notFound }  from "next/navigation";
import ProductForm   from "@/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  // Next.js App Router-ийн params-ийг React-ийн use() hook-ээр задалж авна
  const { id }                      = use(params);
  const [product, setProduct]       = useState(null); // Барааны өгөгдөл хадгалах төлөв
  const [loading, setLoading]       = useState(true); // Ачаалалтын төлөв
  const [missing, setMissing]       = useState(false); // Бараа олдоогүй эсэх

  useEffect(() => {
    // Бүтээгдэхүүний өгөгдлийг серверээс татах хүсэлт
    fetch(`/api/products/${id}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setProduct(d.product ?? d))
      .catch(() => setMissing(true)) // Алдаа гарвал эсвэл олдохгүй бол missing төлөвийг идэвхжүүлнэ
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-muted-foreground text-sm animate-pulse">Ачааллаж байна...</div>;
  if (missing) return notFound(); // Олдоогүй тохиолдолд 404 хуудас руу шилжүүлнэ

  return <ProductForm product={product} isEdit />;
}
