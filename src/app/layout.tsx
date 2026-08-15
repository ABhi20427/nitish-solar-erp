import type { Metadata } from 'next';
import './globals.css';
import { SolarStoreProvider } from '@/lib/store-context';

export const metadata: Metadata = {
  title: 'nitish solar — Reliable Solar Energy Solutions',
  description: 'nitish solar provides engineering-driven solar energy solutions for residential homes, commercial enterprises, and heavy industrial facilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-navy-900 min-h-screen flex flex-col antialiased">
        <SolarStoreProvider>{children}</SolarStoreProvider>
      </body>
    </html>
  );
}
