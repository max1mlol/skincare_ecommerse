import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Сагс',
  description: 'Таны сагсанд байгаа бүтээгдэхүүнүүдийг харах, тоо ширхэг өөрчлөх.',
  path:        '/cart',
});

export default function CartLayout({ children }) {
  return children;
}
