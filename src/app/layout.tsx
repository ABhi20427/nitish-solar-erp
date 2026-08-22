import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SolarStoreProvider } from '@/lib/store-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen flex flex-col antialiased font-sans">
        <SolarStoreProvider>{children}</SolarStoreProvider>
      </body>
    </html>
  );
}
