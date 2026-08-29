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
  ClipboardCheck,
  Wrench,
  FileCheck2,
  PlugZap,
  Shirt,
  Car,
  Snowflake,
  FlaskConical,
  Factory,
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

const VERTICALS = [
  { icon: Shirt, label: 'Textile Mills & Spinning', desc: 'Continuous shift-load manufacturing facilities.' },
  { icon: Car, label: 'Automotive & Tooling', desc: 'Parts fabrication and heavy assembly plants.' },
  { icon: Snowflake, label: 'Cold Storage & Food', desc: 'Refrigeration-heavy processing facilities.' },
  { icon: FlaskConical, label: 'Chemical & Pharma', desc: 'Regulated, high-uptime industrial units.' },
  { icon: Factory, label: 'Steel & Heavy Engineering', desc: 'Large-scale fabrication and machining plants.' },
];

const PROCESS = [
  { code: '01', icon: ClipboardCheck, title: 'Site Survey', desc: 'Engineers assess your load profile, structure, and available grid capacity.' },
  { code: '02', icon: FileCheck2, title: 'Design & Engineering', desc: 'HT synchronization design, structural analysis, and DISCOM documentation.' },
  { code: '03', icon: Wrench, title: 'Installation', desc: 'Turnkey mounting, HT cabling, and safety-certified commissioning.' },
  { code: '04', icon: PlugZap, title: 'Grid Sync & Go-Live', desc: '11kV/33kV substation interconnection and SCADA monitoring go-live.' },
];

export default function IndustrialSolarPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO */}
      <section className="relative w-full min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="nitish solar industrial captive power plant"
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
              <span>Heavy Industry & Megawatt Solar</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              Power your plant. <span className="text-amber-400">At industrial scale.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-xl">
              High-capacity captive power plants for factories, manufacturing facilities, and large-scale industrial sites — engineered for 24/7 heavy machinery loads.
            </p>
            <div className="pt-2">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setIsQuoteOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 py-4 rounded-lg text-base border-0"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Inquire MW Industrial Project
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
                Industrial Captive Power Plants
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                500 kW to 10 MW, built for heavy load.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                <strong className="text-white font-semibold">nitish solar</strong> delivers heavy-duty industrial solar infrastructure with bifacial N-Type TOPCon panels, high-tension grid synchronization, and real-time SCADA remote monitoring.
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
                  <span className="font-display text-3xl font-semibold text-amber-400 block tabular-nums">25%</span>
                  <span className="text-xs text-slate-300 block">Bifacial rear-side gain</span>
                  <span className="text-[11px] text-slate-500 block">Dual-glass module irradiance</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-emerald-400 block tabular-nums">11 / 33 kV</span>
                  <span className="text-xs text-slate-300 block">HT grid synchronization</span>
                  <span className="text-[11px] text-slate-500 block">Substation interconnection</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-white block tabular-nums">SCADA</span>
                  <span className="text-xs text-slate-300 block">Real-time telemetry</span>
                  <span className="text-[11px] text-slate-500 block">Inverter control, weather sensors</span>
                </div>
                <div className="space-y-1">
                  <span className="font-display text-3xl font-semibold text-white block tabular-nums">24/7</span>
                  <span className="text-xs text-slate-300 block">Technical O&M support</span>
                  <span className="text-[11px] text-slate-500 block">Zero-penetration mounting</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INDUSTRIAL VERTICALS */}
      <section className="py-20 bg-[#0B0F17] border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
              Industrial Verticals Served
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Engineered for heavy industry.
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
            alt="nitish solar industrial clean energy future"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-black/60 to-[#070A10]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
            Ready to power your facility with solar?
          </h2>
          <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto">
            Get a free engineering assessment and a custom MW-scale proposal from our industrial team.
          </p>
          <div className="pt-2">
            <Button
              variant="accent"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-10 py-5 rounded-lg text-base sm:text-lg border-0 hover:scale-[1.02] transition-all"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Get a Quote
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
