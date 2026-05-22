import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title:       'Захиалга баталгаажуулах',
  description: 'Хүргэлтийн хаяг, төлбөрийн мэдээллээ оруулж захиалгаа баталгаажуулна уу.',
  path:        '/checkout',
});

export default function CheckoutLayout({ children }) {
  return children;
}
