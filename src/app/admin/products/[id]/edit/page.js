"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { PRODUCTS } from "@/lib/products";

// URL-ээс ирсэн id-аар тохирох барааг олж form руу edit mode-оор дамжуулна.
export default function EditProductPage({ params }) {
  const { id } = use(params);
  const product = PRODUCTS.find((p) => p.id === Number(id));
  if (!product) notFound();
  return <ProductForm product={product} isEdit />;
}
