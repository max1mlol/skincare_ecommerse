import { pageMetadata } from '@/lib/metadata';
import AdminShell from './AdminShell';

export const metadata = pageMetadata({
  title:       'Админ самбар',
  description: 'AURA SKIN дэлгүүрийн удирдлагын самбар — бараа, захиалга, хэрэглэгч.',
  path:        '/admin',
  noIndex:     true,
});

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
