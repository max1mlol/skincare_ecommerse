import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Миний бүртгэл',
  description: 'Профайл, захиалгын түүх, нууц үг болон аватар зураг тохируулах.',
  path:        '/account',
});

export default function AccountLayout({ children }) {
  return children;
}
