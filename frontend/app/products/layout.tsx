import type { ReactNode } from 'react';

type ProductsLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return <>{children}</>;
}
