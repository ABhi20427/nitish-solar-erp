'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Stethoscope,
  Hotel,
  Warehouse,
  ClipboardCheck,
  Wrench,
  FileCheck2,
  PlugZap,
} from 'lucide-react';

// Scroll-triggered reveal used across the site's editorial sections — starts
// slightly offset and settles into place as it enters the viewport.
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

const VERTICALS = [
  { icon: Building2, label: 'Corporate IT & Office Hubs', desc: 'High daytime load offices and tech campuses.' },
  { icon: GraduationCap, label: 'Educational Campuses', desc: 'Schools, colleges, and residential campuses.' },
  { icon: Stethoscope, label: 'Hospitals & Healthcare', desc: 'Continuous, mission-critical power demand.' },
  { icon: Hotel, label: 'Hotels, Resorts & Retail', desc: 'Hospitality and shopping complex rooftops.' },
  { icon: Warehouse, label: 'Warehouses & Logistics', desc: 'Large flat-roof industrial storage facilities.' },
];

const PROCESS = [
  { code: '01', icon: ClipboardCheck, title: 'Site Survey', desc: 'Engineers assess your roof, shading, and load profile on-site.' },
  { code: '02', icon: FileCheck2, title: 'Design & Engineering', desc: 'Custom system sizing, structural design, and DISCOM documentation.' },
  { code: '03', icon: Wrench, title: 'Installation', desc: 'Turnkey mounting, wiring, and safety-certified commissioning.' },
  { code: '04', icon: PlugZap, title: 'Net Metering & Go-Live', desc: 'Grid synchronization and live generation monitoring.' },
];

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function CommercialSolarPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO */}
      <section className="relative w-full min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/industrial_light.png"
            alt="Commercial rooftop solar installation"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-16 pt-32">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-amber-400" />
              <span>Business & Enterprise Solar</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              Cut operating costs. <span className="text-amber-400">Own your power.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-xl">
              Turnkey commercial rooftop systems for offices, hotels, hospitals, schools, and warehouses — engineered to match daytime load and pay for themselves in years, not decades.
            </p>
            <div className="pt-2">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setIsQuoteOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 py-4 rounded-lg text-base border-0"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Commercial Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STATS */}
      <section className="py-20 bg-[#0F172A] border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-6 space-y-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
                Commercial Solar Power Plants
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                20 kW to 250 kW, sized to your daytime load.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                Commercial buildings spend heavily on daytime grid power and air conditioning. <strong className="text-white font-semibold">nitish solar</strong> designs turnkey rooftop systems that match consumption peaks, maximizing self-consumption and financial return.
              </p>
              <div className="pt-1">
                <Link href="/solutions" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors group">
                  <span>See all solar solutions</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-6">
              <div className="bg-[#0B0F17] rounded-3xl border border-slate-800/70 p-6 sm:p-8 grid grid-cols-2 gap-x-6 gap-y-7">
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-amber-400 block tabular-nums">40%</span>
                  <span className="text-xs text-slate-300 block">Tax depreciation benefit</span>
                  <span className="text-[11px] text-slate-500 block">Section 32, Income Tax Act</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-emerald-400 block tabular-nums">3.5 yrs</span>
                  <span className="text-xs text-slate-300 block">Typical ROI payback</span>
                  <span className="text-[11px] text-slate-500 block">Followed by 20+ years free power</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-white block tabular-nums">CapEx / PPA</span>
                  <span className="text-xs text-slate-300 block">Flexible financing</span>
                  <span className="text-[11px] text-slate-500 block">Own outright or zero-investment PPA</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-white block tabular-nums">CEIG</span>
                  <span className="text-xs text-slate-300 block">Safety clearance</span>
                  <span className="text-[11px] text-slate-500 block">Full electrical inspectorate compliance</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROPERTY VERTICALS */}
      <section className="py-20 bg-[#0B0F17] border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
              Property Verticals
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Engineered for every kind of business.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {VERTICALS.map((v) => (
              <Reveal key={v.label}>
                <div className="h-full bg-[#131B2E] border border-slate-800/70 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <v.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug">{v.label}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 bg-[#0F172A] border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
              How It Works
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              From site survey to grid-live power.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {PROCESS.map((step, i) => (
              <Reveal key={step.code} className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#0B0F17] border border-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="font-display text-2xl font-semibold text-slate-700 tabular-nums">{step.code}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{step.desc}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-[22px] left-[calc(100%-8px)] w-[calc(100%-28px)] h-px bg-slate-800" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 overflow-hidden border-t border-slate-800/70">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar commercial energy future"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-black/60 to-[#070A10]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
            Ready to lower your business's power costs?
          </h2>
          <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto">
            Get a free site assessment and a custom commercial solar proposal from our engineering team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="accent"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 py-4 rounded-lg text-base border-0"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Request a Site Assessment
            </Button>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="!border-white/25 !bg-black/30 backdrop-blur-sm !text-white hover:!bg-white/10 px-8 py-4 rounded-lg text-base font-medium"
              >
                Speak with an Engineer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
