import ProductForm from "@/components/admin/ProductForm";

// Шинэ бүтээгдэхүүн үүсгэхдээ form-ийг create mode-оор ачаална.
export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
