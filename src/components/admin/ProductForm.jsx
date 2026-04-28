"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Admin form дотор ашиглах ангиллын key-үүд.
const CATEGORIES = [
  "serum",
  "moisturizer",
  "cleanser",
  "toner",
  "mask",
  "suncare",
  "eye-care",
  "treatment",
];
const CATEGORIES_MN = {
  serum: "Сэрум",
  moisturizer: "Чийгшүүлэгч",
  cleanser: "Цэвэрлэгч",
  toner: "Тоник",
  mask: "Маск",
  suncare: "Нарнаас хамгаалах",
  "eye-care": "Нүдний арчилгаа",
  treatment: "Тусгай арчилгаа",
};

// Нэмэх болон засах хоёр урсгалыг нэг form-оор ажиллуулах компонент.
export default function ProductForm({ product, isEdit }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nameMn: product?.nameMn ?? "",
    name: product?.name ?? "",
    price: product?.price ?? "",
    originalPrice: product?.originalPrice ?? "",
    category: product?.category ?? "serum",
    description: product?.description ?? "",
    inStock: product?.inStock ?? true,
    badge: product?.badge ?? "",
    tags: product?.tags?.join(", ") ?? "",
    rating: product?.rating ?? "4.8",
    reviews: product?.reviews ?? "0",
  });

  // Input бүрт тусдаа onChange бичихээс зайлсхийж key-ээр шинэчилнэ.
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    // Backend холболт хараахан хийгдээгүй тул хадгалалтыг түр mock байдлаар дуурайлгана.
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 800);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 rounded-lg"
        >
          <Link href="/admin/products">
            <ArrowLeft size={15} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEdit ? "Бараа засах" : "Шинэ бараа нэмэх"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `#${product?.id} засварлаж байна` : "Шинэ бараа бүртгэх"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">
            Үндсэн мэдээлэл
          </h2>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameMn">Монгол нэр *</Label>
              <Input
                id="nameMn"
                required
                value={form.nameMn}
                onChange={update("nameMn")}
                placeholder="Essence Noire Сэрум"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Англи нэр *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Essence Noire Serum"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={update("description")}
              placeholder="Бүтээгдэхүүний товч тайлбар..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Шошго (таслалаар тусгаарлана)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={update("tags")}
              placeholder="Hyaluronic Acid, Нарийн атираа, Гэрэлтүүлэх"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">
            Үнэ ба ангилал
          </h2>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Борлуулах үнэ (₮) *</Label>
              <Input
                id="price"
                type="number"
                required
                min="0"
                value={form.price}
                onChange={update("price")}
                placeholder="89000"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Анхны үнэ (₮)</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={update("originalPrice")}
                placeholder="120000"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Ангилал *</Label>
              <select
                id="category"
                value={form.category}
                onChange={update("category")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES_MN[c] ?? c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge">Шошго тэмдэг</Label>
              <select
                id="badge"
                value={form.badge}
                onChange={update("badge")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10"
              >
                <option value="">—</option>
                <option value="Шинэ">Шинэ</option>
                <option value="Бестселлер">Бестселлер</option>
                <option value="Хямдрал">Хямдрал</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Үнэлгээ</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={update("rating")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews">Сэтгэгдлийн тоо</Label>
              <Input
                id="reviews"
                type="number"
                min="0"
                value={form.reviews}
                onChange={update("reviews")}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Зураг</h2>
          <Separator />
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3 hover:border-foreground/30 transition-colors cursor-pointer">
            <Upload size={24} className="text-muted-foreground opacity-50" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Зураг оруулах
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP — 5MB хүртэл
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full mt-1 text-xs"
            >
              Файл сонгох
            </Button>
          </div>
          {product?.image && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt="preview"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Одоогийн зураг
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {product.image}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Нөөцөд байгаа
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Идэвхгүй болгосон бараа худалдан авах боломжгүй болно
              </p>
            </div>
            <Switch
              id="inStock"
              checked={form.inStock}
              onCheckedChange={(v) => setForm({ ...form, inStock: v })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-full"
          >
            <Link href="/admin/products">Болих</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving || saved}
            className="rounded-full px-8 gap-2"
            id="save-product-btn"
          >
            {saved ? (
              "✓ Хадгалагдлаа"
            ) : saving ? (
              "Хадгалж байна..."
            ) : (
              <>
                <Save size={14} /> Хадгалах
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
