import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Бүтээгдэхүүн',
  description: 'COSRX, La Roche-Posay, CeraVe зэрэг оригинал арьс арчилгааны бүтээгдэхүүнүүдийг ангилал, брэндээр шүүж харах.',
  path:        '/products',
});

export default function ProductsLayout({ children }) {
  return children;
}
