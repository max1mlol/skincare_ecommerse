import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Нэвтрэх',
  description: 'AURA SKIN дэлгүүрт нэвтэрч захиалга, профайл, сагсаа удирдана уу.',
  path:        '/login',
});

export default function LoginLayout({ children }) {
  return children;
}
