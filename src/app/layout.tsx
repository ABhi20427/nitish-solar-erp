import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { SolarStoreProvider } from '@/lib/store-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Display/headline face: a confident, editorial geometric-humanist sans used for
// large headlines and section titles — pairs with Inter (body copy) to move the
// site away from a dashboard/technical feel toward a premium technology brand.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
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
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen flex flex-col antialiased font-sans">
        <SolarStoreProvider>{children}</SolarStoreProvider>
      </body>
    </html>
  );
}
