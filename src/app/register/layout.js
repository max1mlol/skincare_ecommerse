import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Бүртгүүлэх',
  description: 'AURA SKIN-д шинээр бүртгүүлж оригинал арьс арчилгааны бүтээгдэхүүн захиалаарай.',
  path:        '/register',
});

export default function RegisterLayout({ children }) {
  return children;
}
