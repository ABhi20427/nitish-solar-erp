'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Home, Building2, Factory, ArrowRight, CheckCircle2 } from 'lucide-react';

// Scroll-triggered spatial reveal: each solution block starts slightly scaled down,
// clipped, and offset, then settles into place as it enters the viewport — a single
// continuous-feeling entrance rather than a plain fade, echoing the "emerging from
// the story" motion used elsewhere on the site.
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

function SolutionBlock({
  id,
  reverse,
  eyebrow,
  icon: Icon,
  heading,
  desc,
  bullets,
  image,
  imageAlt,
  cta,
  href,
}: {
  id: string;
  reverse?: boolean;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  desc: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  cta: string;
  href: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      id={id}
      ref={ref}
      className="bg-[#131B2E] rounded-3xl border border-slate-800/70 p-8 sm:p-12 shadow-xl shadow-black/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-colors duration-500 hover:border-slate-700"
    >
      <div
        className={`lg:col-span-7 space-y-6 transition-all duration-700 ease-out ${reverse ? 'lg:order-2' : ''} ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">
          <Icon className="w-4 h-4" /> {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-semibold text-white">{heading}</h2>
        <p className="text-slate-300 text-sm leading-relaxed font-light">{desc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-light">
          {bullets.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0" /> {b}
            </div>
          ))}
        </div>
        <div className="pt-2">
          <Link href={href}>
            <Button variant="accent" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
              {cta}
            </Button>
          </Link>
        </div>
      </div>

      <div
        className={`lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/70 transition-all duration-700 ease-out ${reverse ? 'lg:order-1' : ''} ${
          inView ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.06]'
        }`}
        style={{
          clipPath: inView ? 'inset(0% round 1rem)' : 'inset(6% round 1rem)',
          transitionProperty: 'opacity, transform, clip-path',
        }}
      >
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover filter brightness-95" />
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO — same cinematic full-bleed treatment as the homepage and
          Commercial page, with the navbar fading in over it on scroll. */}
      <section className="relative w-full min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar turnkey solar solutions"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-16 pt-32">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-amber-400" />
              <span>Turnkey Engineering Solutions</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              Solar solutions, <span className="text-amber-400">engineered for every scale.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-xl">
              From residential rooftops under national subsidy schemes to multi-megawatt industrial captive plants — one engineering team, three scales of turnkey solar power.
            </p>
          </div>
        </div>
      </section>

      {/* Main Solutions Overview Section — same engineering-blueprint atmosphere
          used across the homepage's editorial, calculator, and closing sections. */}
      <main className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute right-[10%] top-1/3 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          <SolutionBlock
            id="residential"
            eyebrow="Residential Solar Rooftop (3 kW – 15 kW)"
            icon={Home}
            heading="Residential Solar Solutions by nitish solar"
            desc="Transform your home terrace into a solar power station. Our residential packages include high-efficiency 540W N-type TOPCon panels, bi-directional net meters, hot-dip galvanized mounting structures, and complete DISCOM approval documentation."
            bullets={[
              'Central Govt Subsidy up to ₹78,000',
              'Up to 90% Electricity Bill Reduction',
              '25-Year Linear Panel Performance Guarantee',
              'Mobile App Generation Telemetry',
            ]}
            image="/images/residential_light.png"
            imageAlt="nitish solar residential solar rooftop"
            cta="Explore Residential Solar"
            href="/residential"
          />

          <SolutionBlock
            id="commercial"
            reverse
            eyebrow="Commercial Buildings & Offices (20 kW – 250 kW)"
            icon={Building2}
            heading="Commercial Solar Solutions by nitish solar"
            desc="Drastically cut operating expenses for office complexes, hospitals, private schools, and retail hubs. Capitalize on 40% accelerated tax depreciation and achieve complete financial payback within 3.5 years."
            bullets={[
              '40% Accelerated Tax Depreciation',
              'CapEx & PPA Financial Models',
              'Non-Penetrative Ballast Frames',
              'Statutory CEIG Electrical Safety Compliance',
            ]}
            image="/images/industrial_light.png"
            imageAlt="nitish solar commercial rooftop array"
            cta="Explore Commercial Solar"
            href="/commercial"
          />

          <SolutionBlock
            id="industrial"
            eyebrow="Industrial Captive Power Plants (500 kW – 10 MW)"
            icon={Factory}
            heading="Industrial Solar Solutions by nitish solar"
            desc="High-capacity solar installations designed for heavy manufacturing facilities, textile mills, cold storages, and automotive factories. Bifacial glass-glass solar panels combined with 11kV/33kV high tension grid synchronization."
            bullets={[
              'Up to 25% Bifacial Gain',
              'SCADA Remote Telemetry Systems',
              '11kV / 33kV Substation Interconnection',
              'Dedicated 24/7 O&M Technical Support',
            ]}
            image="/images/hero_light.png"
            imageAlt="nitish solar industrial mega solar farm"
            cta="Explore Industrial Solar"
            href="/industrial"
          />
        </div>
      </main>

      {/* Closing CTA — full-bleed image + single strong CTA, matching the
          homepage and Commercial page's closing sections. */}
      <section className="relative py-24 overflow-hidden border-t border-slate-800/70">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sunset.png"
            alt="nitish solar clean energy future"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-black/60 to-[#070A10]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
            Not sure which solution fits your property?
          </h2>
          <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto">
            Tell us about your site and we'll recommend the right system, sizing, and financing model — no guesswork.
          </p>
          <div className="space-y-3 pt-2">
            <Button
              variant="accent"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-10 py-5 rounded-lg text-base sm:text-lg transition-all border-0 hover:scale-[1.02]"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Request a Custom Proposal
            </Button>
            <p className="text-xs text-slate-400">Free site assessment. No obligation.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
