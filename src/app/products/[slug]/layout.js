import { PRODUCTS } from '@/lib/products';
import { pageMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    return pageMetadata({
      title:       'Бүтээгдэхүүн',
      description: 'Бүтээгдэхүүний дэлгэрэнгүй мэдээлэл.',
      path:        `/products/${slug}`,
    });
  }
  return pageMetadata({
    title:       product.nameMn,
    description: product.description?.slice(0, 160) ?? `${product.nameMn} — ${product.brand} брэндийн оригинал бүтээгдэхүүн.`,
    path:        `/products/${slug}`,
  });
}

export default function ProductDetailLayout({ children }) {
  return children;
}
