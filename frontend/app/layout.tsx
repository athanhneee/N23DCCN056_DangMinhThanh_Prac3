import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import Providers from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Quản lý sản phẩm Fullstack',
  description: 'Bài lab tích hợp Next.js App Router và Express',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
