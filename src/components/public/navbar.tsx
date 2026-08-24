'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/public/brand-logo';
import { Button } from '@/components/ui/button';
import { Calculator, PhoneCall, Menu, X, ArrowRight } from 'lucide-react';

export function PublicNavbar({
  onOpenQuoteModal,
  transparentOverlay = false,
  lightTheme = false,
}: {
  onOpenQuoteModal?: () => void;
  transparentOverlay?: boolean;
  lightTheme?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (!transparentOverlay) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOverlay]);

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Calculator', href: '/calculator' },
    { label: 'Contact', href: '/contact' },
  ];

  const headerClass = transparentOverlay
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl py-0'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent text-white py-1'
      }`
    : 'sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800 text-white';

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Branding (Logo + nitish solar) — FAR LEFT */}
          <Link href="/" className="hover:opacity-95 transition-opacity shrink-0">
            <BrandLogo variant="light" />
          </Link>

          {/* Desktop Navigation Links — FAR RIGHT */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium ml-auto">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-xs xl:text-sm font-medium transition-colors duration-200 group ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Subtle Accent Underline Indicator */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-amber-400 transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}

            <Link href="/quote">
              <Button
                variant="accent"
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-0 shadow-lg shadow-amber-500/10 text-xs px-3.5 py-1.5 rounded-lg ml-2"
              >
                Get a Quote
              </Button>
            </Link>
          </nav>

          {/* Mobile Header Controls — FAR RIGHT */}
          <div className="lg:hidden flex items-center gap-3">
            <Link href="/quote">
              <Button variant="accent" size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-2.5">
                Quote
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0F17] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm transition-colors ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-amber-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="accent" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
