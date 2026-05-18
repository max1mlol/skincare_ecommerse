import { PRODUCTS } from '@/lib/products';

const BASE = 'https://auraskin.mn';

export default function sitemap() {
  const staticPages = [
    { url: BASE,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/login`,    lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productPages = PRODUCTS.map((p) => ({
    url:             `${BASE}/products/${p.slug}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly',
    priority:        0.8,
  }));

  return [...staticPages, ...productPages];
}
