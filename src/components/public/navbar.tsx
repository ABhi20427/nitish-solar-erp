'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/public/brand-logo';
import { Button } from '@/components/ui/button';
import { Calculator, PhoneCall, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';

export function PublicNavbar({ onOpenQuoteModal }: { onOpenQuoteModal?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Products', href: '/products' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - nitish solar */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <BrandLogo variant="light" />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    isActive ? 'text-amber-400 font-bold' : 'hover:text-amber-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/calculator" className="hover:text-amber-300 transition-colors flex items-center gap-1 text-amber-400 font-semibold">
              <Calculator className="w-4 h-4" />
              Calculator
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/erp">
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white">
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
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
