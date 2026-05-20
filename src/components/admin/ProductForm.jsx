"use client";
// ProductForm — Шинэ бүтээгдэхүүн нэмэх болон засахад ашиглагдах форм компонент.
// Энэ компонент нь зургуудыг FormData ашиглан сервер рүү олон файлаар хуулж (Upload), дараа нь бүтээгдэхүүний өгөгдлийг JSON-оор хадгалдаг.
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link    from "next/link";
import Image   from "next/image";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch }    from "@/components/ui/switch";
import { getImageUrl } from "@/lib/utils";

// CATEGORIES: Бүтээгдэхүүний системийн ангиллын утгууд
const CATEGORIES    = ["serum","moisturizer","cleanser","toner","mask","suncare","eye-care","treatment"];
// CATEGORIES_MN: Системийн ангиллыг дэлгэцэнд Монгол хэлээр харуулах хөрвүүлэгч
const CATEGORIES_MN = { serum:"Сэрум", moisturizer:"Чийгшүүлэгч", cleanser:"Цэвэрлэгч",
  toner:"Тоник", mask:"Маск", suncare:"Нарнаас хамгаалах", "eye-care":"Нүдний арчилгаа", treatment:"Тусгай арчилгаа" };

export default function ProductForm({ product, isEdit }) {
  const router   = useRouter(); // Хадгалж дууссаны дараа жагсаалт руу буцахад ашиглана
  const fileRef  = useRef(null); // File Input-ийг програмчлалаар дарах заагч (Ref)
  
  const [saving, setSaving] = useState(false); // Хадгалж буй loading төлөв
  const [error,  setError]  = useState(""); // Алдааны мэдээлэл хадгалах төлөв
  
  // previews: Зургуудын preview харах URL-уудын стэйт (Засаж байгаа бол хуучин зургуудыг оруулна)
  const [previews, setPreviews] = useState(product?.images?.length ? product.images : (product?.image ? [product.image] : []));

  // form: Бүтээгдэхүүний бүх оролтын утгыг хадгалах стэйт объект
  const [form, setForm] = useState({
    name:          product?.name          ?? "",
    name_mn:       product?.name_mn       ?? product?.nameMn ?? "",
    brand:         product?.brand         ?? "",
    description:   product?.description   ?? "",
    price:         product?.price         ?? "",
    original_price: product?.original_price ?? product?.originalPrice ?? "",
    category:      product?.category      ?? "serum",
    badge:         product?.badge         ?? "",
    tags:          (product?.tags ?? []).join(", "), // Тэгүүдийг таслалаар тусгаарласан string болгоно
    in_stock:      product?.in_stock      ?? product?.inStock ?? true,
    stock_qty:     product?.stock_qty     ?? 0,
    how_to_use:    product?.how_to_use    ?? "",
    ingredients:   product?.ingredients   ?? "",
  });
  
  // imageFiles: Хэрэглэгчийн шинээр сонгосон зургийн File объектуудыг хадгалах массив
  const [imageFiles, setImageFiles] = useState([]);

  // update: Оролтын утга өөрчлөгдөх бүрд form стэйтийг шинэчлэх функц
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // onFileChange: Зураг сонгоход дуудагдах функц (Preview үүсгэнэ)
  function onFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Сонгосон файлуудаа стэйт рүү нэмнэ
    setImageFiles(prev => [...prev, ...files]);
    
    // Файл бүрд түр зуурын URL (Object URL) үүсгэж previews стэйт рүү нэмнэ
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }
  
  // removeImage: Сонгосон зургийг жагсаалтаас устгах функц
  function removeImage(index) {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // Хэрэв тухайн зураг нь шинээр оруулсан файл байвал imageFiles-аас хасна
    if (index >= (previews.length - imageFiles.length)) {
       const fileIndex = index - (previews.length - imageFiles.length);
       setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  }

  // handleSubmit: Хадгалах товч дарагдах үед дуудагдах функц
  async function handleSubmit(e) {
    e.preventDefault(); // Хуудас дахин ачаалагдахаас сэргийлнэ
    setSaving(true); 
    setError("");
    
    try {
      // previews-ээс хасагдаагүй үлдсэн хуучин зургуудын жагсаалт
      const oldPreviewsCount = previews.length - imageFiles.length;
      let allImages = previews.slice(0, oldPreviewsCount);
      
      // 1. Хэрэв шинээр сонгосон зургийн файл байвал эхлээд тэднийг upload хийнэ
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(file => fd.append("images", file));
        
        const up = await fetch("/api/products/upload", { method: "POST", credentials: "include", body: fd });
        if (!up.ok) throw new Error("Зураг хуулахад алдаа гарлаа");
        const upData = await up.json();
        // Серверээс ирсэн зургийн хаягуудыг allImages-д нэмнэ
        allImages = [...allImages, ...upData.paths];
      }
      
      // Гол нүүр зургийг жагсаалтын эхний зургаар сонгоно
      const mainImage = allImages.length > 0 ? allImages[0] : null;

      // 2. Бүтээгдэхүүний өгөгдлийг бэлдэх
      const body = {
        ...form,
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock_qty:      Number(form.stock_qty),
        // Шошго буюу тагуудыг таслалаар салгаж, хоосон зайг арилган массив болгоно
        tags:           form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        category_mn:    CATEGORIES_MN[form.category] ?? form.category,
        image:          mainImage,
        images:         allImages,
      };

      // Шинээр үүсгэх эсвэл засахаас хамаарч API хаяг болон HTTP Метод өөр байна
      const url    = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      
      const res    = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Бүтээгдэхүүн хадгалахад алдаа гарлаа");

      // Хадгалалт амжилттай бол жагсаалтын хуудас руу шилжинэ
      router.push("/admin/products");
    } catch (err) { 
      setError(err.message); 
      setSaving(false); 
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Толгой хэсэг */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg">
          <Link href="/admin/products"><ArrowLeft size={15} /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{isEdit ? "Бараа засах" : "Шинэ бараа нэмэх"}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? `#${product?.id} засварлаж байна` : "Шинэ бараа бүртгэх"}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Хэсэг 1: Үндсэн мэдээлэл */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold">Үндсэн мэдээлэл</h2>
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_mn">Монгол нэр *</Label>
              <Input id="name_mn" required value={form.name_mn} onChange={update("name_mn")} placeholder="COSRX Snail Эссенс" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Англи нэр *</Label>
              <Input id="name" required value={form.name} onChange={update("name")} placeholder="COSRX Snail Mucin Essence" className="rounded-xl" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brand">Брэнд *</Label>
            <Input id="brand" required value={form.brand} onChange={update("brand")} placeholder="COSRX" className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <textarea id="description" rows={4} value={form.description} onChange={update("description")}
              placeholder="Бүтээгдэхүүний товч тайлбар..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Шошго (таслалаар тусгаарлана)</Label>
            <Input id="tags" value={form.tags} onChange={update("tags")} placeholder="snail, чийглэлт, K-Beauty" className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="how_to_use">Хэрхэн хэрэглэх</Label>
            <textarea id="how_to_use" rows={3} value={form.how_to_use} onChange={update("how_to_use")}
              placeholder="Арьсанд тогтмол хэрэглэх заавар..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ingredients">Найрлага</Label>
            <textarea id="ingredients" rows={3} value={form.ingredients} onChange={update("ingredients")}
              placeholder="Snail Secretion Filtrate 96%, Betaine..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>

        {/* Хэсэг 2: Үнэ ба ангилал */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold">Үнэ ба ангилал</h2>
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Борлуулах үнэ (₮) *</Label>
              <Input id="price" type="number" required min="0" value={form.price} onChange={update("price")} placeholder="89000" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">Анхны үнэ (₮)</Label>
              <Input id="original_price" type="number" min="0" value={form.original_price} onChange={update("original_price")} placeholder="112000" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_qty">Нөөцийн тоо</Label>
              <Input id="stock_qty" type="number" min="0" value={form.stock_qty} onChange={update("stock_qty")} placeholder="50" className="rounded-xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Ангилал *</Label>
              <select id="category" value={form.category} onChange={update("category")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIES_MN[c] ?? c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Шошго тэмдэг</Label>
              <select id="badge" value={form.badge} onChange={update("badge")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10">
                <option value="">—</option>
                <option value="Шинэ">Шинэ</option>
                <option value="Бестселлер">Бестселлер</option>
                <option value="Хямдрал">Хямдрал</option>
                <option value="Онцлох">Онцлох</option>
              </select>
            </div>
          </div>
        </div>

        {/* Хэсэг 3: Зураг upload */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold">Бүтээгдэхүүний зураг</h2>
          <Separator />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-full aspect-square border border-border rounded-xl overflow-hidden">
                <Image src={src.startsWith("blob:") ? src : getImageUrl(src)} alt="preview" fill className="object-cover" unoptimized={src.startsWith("blob:")} />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:opacity-80">
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* Шинэ зураг нэмэх товч */}
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl aspect-square flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors cursor-pointer">
              <Upload size={20} className="text-muted-foreground opacity-50" />
              <p className="text-xs font-medium text-muted-foreground">Нэмэх</p>
            </div>
          </div>
          {/* Нууцлагдмал файл сонгох input */}
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
        </div>

        {/* Хэсэг 4: Нөөцийн төлөв (Switch) */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Нөөцөд байгаа</p>
              <p className="text-xs text-muted-foreground mt-0.5">Идэвхгүй болгосон бараа хэрэглэгчийн дэлгэцэнд харагдахгүй</p>
            </div>
            <Switch id="in_stock" checked={form.in_stock} onCheckedChange={(v) => setForm((f) => ({ ...f, in_stock: v }))} />
          </div>
        </div>

        {/* Доод товчлуурууд */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild className="rounded-full">
            <Link href="/admin/products">Болих</Link>
          </Button>
          <Button type="submit" disabled={saving} className="rounded-full px-8 gap-2" id="save-product-btn">
            {saving ? "Хадгалж байна..." : <><Save size={14} /> Хадгалах</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
