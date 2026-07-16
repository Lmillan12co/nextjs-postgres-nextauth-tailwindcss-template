import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Cobros LATAM',
  description:
    'Plataforma de cobranza LATAM con Next.js, PostgreSQL, Auth.js y Mercado Pago México.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
