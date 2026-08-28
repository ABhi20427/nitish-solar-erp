'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/public/brand-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Calculator', href: '/calculator' },
  { label: 'Contact', href: '/contact' },
];

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

  // Sliding pill indicator — tracks whichever link is hovered, and falls back
  // to the current page's link when the pointer leaves the nav. Positioned by
  // measuring real DOM rects rather than guessing widths from text length, so
  // it's exact for every link at every breakpoint/font.
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const movePillTo = useCallback(
    (href: string | null) => {
      const targetHref = href ?? pathname;
      const el = linkRefs.current[targetHref];
      const nav = navRef.current;
      if (!el || !nav) {
        setPillStyle((s) => ({ ...s, opacity: 0 }));
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({ left: elRect.left - navRect.left, width: elRect.width, opacity: 1 });
    },
    [pathname]
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => movePillTo(hoveredHref));
    return () => cancelAnimationFrame(raf);
  }, [pathname, hoveredHref, movePillTo]);

  useEffect(() => {
    const onResize = () => movePillTo(hoveredHref);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [hoveredHref, movePillTo]);

  useEffect(() => {
    if (!transparentOverlay) return;
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOverlay]);

  // Lock background scroll while the full-screen mobile menu is open, and
  // let Escape close it like any other overlay.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  const isCompact = scrolled || !transparentOverlay;

  const headerClass = transparentOverlay
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 text-white shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent border-b border-transparent text-white'
      }`
    : 'sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 text-white';

  return (
    <header className={headerClass}>
      <div className="w-full px-5 sm:px-8 lg:px-12">
        <div className={`flex items-center justify-between transition-[height] duration-500 ease-out ${isCompact ? 'h-16' : 'h-20'}`}>
          {/* Branding — subtle lift on hover, far left */}
          <Link
            href="/"
            className="shrink-0 transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.97]"
          >
            <BrandLogo variant="light" />
          </Link>

          {/* Desktop Navigation — sliding pill hover/active indicator, far right */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredHref(null)}
            className="hidden lg:flex items-center gap-1 text-sm font-medium ml-auto relative"
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-white/[0.07] border border-white/10 transition-all duration-300 ease-out pointer-events-none"
              style={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.opacity }}
            />
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    linkRefs.current[link.href] = el;
                  }}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  className={`relative z-10 px-4 py-2 text-xs xl:text-sm font-medium rounded-full transition-colors duration-200 ${
                    isActive ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Controls — morphing hamburger/X, far right */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-100 hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="relative w-5 h-3.5 block">
                <span
                  className={`absolute left-0 w-full h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out ${
                    mobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1.5px] bg-current rounded-full transition-opacity duration-200 ease-out ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out ${
                    mobileMenuOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : 'bottom-0'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Mobile Menu — backdrop fade + staggered link entrance,
          rather than a flat dropdown list. Stays mounted (not conditionally
          rendered) so the closing transition can play instead of the panel
          just vanishing. */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-[#070A10]/95 backdrop-blur-xl transition-opacity duration-[400ms] ease-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="h-full w-full flex flex-col items-center justify-center gap-1 px-6" onClick={(e) => e.stopPropagation()}>
          {NAV_LINKS.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-display text-3xl font-semibold py-3 transition-all duration-500 ease-out ${
                  isActive ? 'text-amber-400' : 'text-white'
                } ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: mobileMenuOpen ? `${i * 60 + 120}ms` : '0ms' }}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            className={`pt-8 w-full max-w-xs transition-all duration-500 ease-out ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: mobileMenuOpen ? `${NAV_LINKS.length * 60 + 160}ms` : '0ms' }}
          >
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="accent"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold border-0 py-3.5"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
