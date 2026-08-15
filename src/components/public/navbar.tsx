'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/public/brand-logo';
import { Button } from '@/components/ui/button';
import { Calculator, PhoneCall, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';

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
    { label: 'Solutions', href: '/solutions' },
    { label: 'Products', href: '/products' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isTopOverHero = transparentOverlay && !scrolled;

  const headerClass = transparentOverlay
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-[#111827] shadow-sm py-0'
          : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent border-b border-transparent text-white py-1'
      }`
    : 'sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-slate-800 text-white';

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - nitish solar */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <BrandLogo variant={isTopOverHero ? 'light' : 'dark'} />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-300 ${
                    isTopOverHero
                      ? isActive
                        ? 'text-amber-400 font-extrabold'
                        : 'text-white hover:text-amber-300 font-semibold'
                      : isActive
                      ? 'text-brand-purple font-extrabold'
                      : 'text-[#111827] hover:text-brand-purple font-semibold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/calculator"
              className={`transition-colors duration-300 flex items-center gap-1 font-semibold ${
                isTopOverHero ? 'text-amber-400 hover:text-amber-300' : 'text-brand-purple hover:text-brand-blue'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calculator
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/erp">
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-300 ${
                  isTopOverHero
                    ? 'border-white/30 bg-black/30 backdrop-blur-md text-white hover:bg-white/20 font-semibold'
                    : 'border-slate-300 bg-white text-[#111827] hover:bg-slate-100 font-semibold'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${isTopOverHero ? 'text-amber-400' : 'text-brand-purple'}`} />
                ERP Login
              </Button>
            </Link>
            <Link href="/quote">
              <Button
                variant="accent"
                size="sm"
                className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold hover:opacity-95 border-0 shadow-brand"
                icon={<PhoneCall className="w-4 h-4" />}
              >
                Request a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/quote">
              <Button variant="accent" size="sm" className="bg-amber-500 text-navy-950 text-xs px-2.5">
                Quote
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-dark border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-amber-400 font-medium text-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-amber-400 font-bold flex items-center gap-2 text-sm"
          >
            <Calculator className="w-4 h-4" />
            Solar Calculator
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="accent" className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white">
                Request a Quote
              </Button>
            </Link>
            <Link href="/erp" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-slate-700 bg-slate-900 text-slate-300">
                ERP Login Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
