import { PRODUCTS } from '@/lib/products';

// Вэбсайтын үндсэн хаяг (Домэйн)
const BASE = 'https://auraskin.mn';

// sitemap: Хайлтын системүүдэд (Google, Bing гэх мэт) вэбсайтын бүтцийг таниулах sitemap.xml үүсгэх функц.
export default function sitemap() {
  // Статик хуудсуудын жагсаалт
  const staticPages = [
    { url: BASE,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/login`,    lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Бүтээгдэхүүний динамик хуудсуудыг slug-аар нь үүсгэн нэмэх
  const productPages = PRODUCTS.map((p) => ({
    url:             `${BASE}/products/${p.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.8,
  }));

  // Статик болон динамик хуудсуудын холбоосыг нэгтгэж буцаана
  return [...staticPages, ...productPages];
}
