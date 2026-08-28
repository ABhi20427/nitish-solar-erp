'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { DiscoverSolarExperience } from '@/components/public/discover-solar/discover-solar-experience';
import { Button } from '@/components/ui/button';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { useSolarStore } from '@/lib/store-context';
import {
  Zap,
  Building2,
  Factory,
  Home as HomeIcon,
  Award,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Send,
  ChevronDown,
  ArrowUpRight,
  Shield,
  Activity,
  Sun,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const TRUST_INDICATORS = [
  { val: '1,250+', label: 'Projects Delivered', desc: 'Turnkey rooftop and ground-mount installations across India.' },
  { val: '450+ MWp', label: 'Installed Solar Capacity', desc: 'High-power utility and commercial grid-tie solar systems.' },
  { val: '3,800+', label: 'Satisfied Clients', desc: 'Homeowners, corporate enterprises, and industrial facilities.' },
  { val: '12+ Years', label: 'Engineering Experience', desc: 'Pioneering solar EPC excellence and DISCOM net metering.' },
];

const PLANT_STAGES = [
  {
    id: 'solar',
    code: '01',
    title: '01 SOLAR',
    subtitle: 'Sunlight → DC Electricity',
    shortDesc: 'Solar cells convert sunlight directly into electrical energy.',
    icon: Sun,
    layers: [
      { id: 'frame', name: '01 — Frame', desc: 'Anodized aluminum structural frame protecting module edges.' },
      { id: 'glass', name: '02 — Tempered Glass', desc: 'Anti-reflective glass allowing 95%+ solar transmission.' },
      { id: 'eva1', name: '03 — Encapsulant EVA', desc: 'Ethylene-vinyl acetate layer cushioning PV cells.' },
      { id: 'cells', name: '04 — Solar Cells', desc: 'Monocrystalline N-Type TOPCon silicon cell matrix.' },
      { id: 'eva2', name: '05 — Rear EVA Sheet', desc: 'Moisture-barrier rear encapsulation layer.' },
      { id: 'backsheet', name: '06 — Backsheet & J-Box', desc: 'Protective insulating sheet with IP68 bypass diode box.' },
    ],
  },
  {
    id: 'dc',
    code: '02',
    title: '02 DC',
    subtitle: 'Power Collection',
    shortDesc: 'Power from multiple panels is combined into usable DC electricity.',
    icon: Zap,
    layers: [
      { id: 'modules', name: '01 — PV Module Chain', desc: 'Series string arrangement stacking voltage to 1500V DC.' },
      { id: 'mc4', name: '02 — MC4 Connectors', desc: 'Weatherproof locking DC connectors minimizing resistance.' },
      { id: 'cables', name: '03 — Solar DC Cables', desc: 'XLPO dual-insulated UV-resistant high-voltage copper cabling.' },
      { id: 'combiner', name: '04 — DC Combiner Box', desc: 'IP65 enclosure combining strings with 30A gPV surge protection.' },
    ],
  },
  {
    id: 'inverter',
    code: '03',
    title: '03 INVERTER',
    subtitle: 'DC → AC Conversion',
    shortDesc: 'Converts solar DC electricity into grid-ready AC power.',
    icon: Cpu,
    layers: [
      { id: 'cabinet', name: '01 — Weatherproof Cabinet', desc: 'Heavy-gauge steel enclosure with forced-air cooling.' },
      { id: 'mppt', name: '02 — MPPT Controllers', desc: '12 independent MPPT trackers optimizing peak solar yield.' },
      { id: 'power', name: '03 — Power Switching Stage', desc: 'High-frequency Silicon Carbide IGBT inversion bridge.' },
      { id: 'acfilter', name: '04 — AC Filter & Sync', desc: 'Sinusoidal filter outputting clean 800V 3-phase AC power.' },
    ],
  },
  {
    id: 'transformer',
    code: '04',
    title: '04 TRANSFORMER',
    subtitle: 'Voltage Step-Up',
    shortDesc: 'Raises voltage for efficient long-distance transmission.',
    icon: Activity,
    layers: [
      { id: 'tank', name: '01 — Transformer Tank', desc: 'ONAN oil-immersed steel tank with radiator cooling fins.' },
      { id: 'bushings', name: '02 — HV Bushings', desc: '33kV ceramic high-voltage insulation bushings.' },
      { id: 'windings', name: '03 — Copper Coils', desc: 'Primary & secondary electrolytic copper isolation windings.' },
      { id: 'core', name: '04 — Magnetic Core', desc: 'Low-loss grain-oriented silicon steel magnetic core.' },
    ],
  },
  {
    id: 'grid',
    code: '05',
    title: '05 GRID',
    subtitle: 'Power Delivered',
    shortDesc: 'Protected and synchronized power enters the electrical network.',
    icon: ShieldCheck,
    layers: [
      { id: 'gantry', name: '01 — Transmission Gantry', desc: '33kV overhead grid interconnection gantry tower.' },
      { id: 'meter', name: '02 — Net Metering System', desc: '0.2s class bi-directional ABT tariff meter.' },
      { id: 'switchgear', name: '03 — Vacuum Breakers', desc: 'HT vacuum circuit breaker switchgear panel.' },
      { id: 'relays', name: '04 — Protection Relays', desc: 'Numerical anti-islanding & statutory grid protection relays.' },
    ],
  },
];

// Deterministic Number Formatter to guarantee 100% hydration match between Node SSR and browser client
function formatIndianNumber(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

export default function HomePage() {
  const { addLead } = useSolarStore();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isDiscoverSolarOpen, setIsDiscoverSolarOpen] = useState(false);
  const [quickBill, setQuickBill] = useState(25000);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Deterministic Initial Scroll Step States
  const [solutionsStep, setSolutionsStep] = useState(0);
  const [solutionsProgress, setSolutionsProgress] = useState(0);
  const [plantStageIdx, setPlantStageIdx] = useState(0);
  const [plantLayerIdx, setPlantLayerIdx] = useState(0);
  const [impactStep, setImpactStep] = useState(0);

  // Section Refs
  const solutionsRef = useRef<HTMLDivElement>(null);
  const plantSectionRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);

  // Quote Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    location: '',
    propertyType: 'COMMERCIAL' as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL',
    requiredCapacity: 25,
    monthlyBill: 25000,
    message: '',
    website_hp: '',
  });

  const quickCalc = calculateSolarSystem({ monthlyBillAmount: quickBill });

  // Optimized Scroll progress handler with requestAnimationFrame throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Solutions Scroll Progress
          if (solutionsRef.current) {
            const rect = solutionsRef.current.getBoundingClientRect();
            const totalDist = solutionsRef.current.offsetHeight - window.innerHeight;
            if (totalDist > 0) {
              const progress = Math.max(0, Math.min(0.999, -rect.top / totalDist));
              setSolutionsProgress(progress);
              let nextStep = 0;
              if (progress < 0.35) nextStep = 0;
              else if (progress < 0.7) nextStep = 1;
              else nextStep = 2;

              setSolutionsStep((prev) => (prev !== nextStep ? nextStep : prev));
            }
          }

          // 2. Inside A Solar Plant Scroll Progress
          if (plantSectionRef.current) {
            const rect = plantSectionRef.current.getBoundingClientRect();
            const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;
            if (totalDist > 0 && rect.top <= 0 && rect.bottom >= 0) {
              const progress = Math.max(0, Math.min(0.999, -rect.top / totalDist));
              const computedStage = Math.min(4, Math.floor(progress * 5));
              setPlantStageIdx((prev) => {
                if (prev !== computedStage) {
                  setPlantLayerIdx(0);
                  return computedStage;
                }
                return prev;
              });
            }
          }

          // 3. Impact Scroll Progress
          if (impactRef.current) {
            const rect = impactRef.current.getBoundingClientRect();
            const totalDist = impactRef.current.offsetHeight - window.innerHeight;
            if (totalDist > 0) {
              const progress = Math.max(0, Math.min(0.99, -rect.top / totalDist));
              let nextStep = 0;
              if (progress < 0.25) nextStep = 0;
              else if (progress < 0.5) nextStep = 1;
              else if (progress < 0.75) nextStep = 2;
              else nextStep = 3;

              setImpactStep((prev) => (prev !== nextStep ? nextStep : prev));
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadErrorMessage, setLeadErrorMessage] = useState('');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    setIsSubmittingLead(true);
    setLeadErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          company: leadForm.company,
          phone: leadForm.phone,
          email: leadForm.email,
          location: leadForm.location,
          propertyType: leadForm.propertyType,
          requiredCapacity: Number(leadForm.requiredCapacity) || quickCalc.recommendedCapacityKw,
          monthlyBill: Number(quickBill),
          message: leadForm.message,
          website_hp: leadForm.website_hp,
          source: 'nitish solar Homepage Quick Form',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addLead({
          fullName: leadForm.name,
          companyName: leadForm.company,
          phone: leadForm.phone,
          email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          customerType: leadForm.propertyType,
          monthlyBillAmount: Number(quickBill),
          city: leadForm.location || 'Pune',
          state: 'Maharashtra',
          address: 'Web Inquiry Location',
          proposedCapacityKw: Number(leadForm.requiredCapacity) || quickCalc.recommendedCapacityKw,
          notes: leadForm.message || `Lead request submitted to nitish solar website homepage.`,
          source: 'nitish solar Homepage Form',
          priority: 'HIGH',
        });
        setFormSubmitted(true);
      } else {
        setLeadErrorMessage(data.error || "We couldn't send your enquiry. Please try again.");
      }
    } catch (err) {
      setLeadErrorMessage("We couldn't send your enquiry. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Solutions Stories Data
  const SOLUTIONS_STORIES = [
    {
      type: 'RESIDENTIAL SOLAR',
      heading: 'Solar designed around the way you live.',
      desc: 'Rooftop solar installations for luxury homes and housing societies. Reduce monthly electricity bills by up to 90% while benefiting from PM Surya Ghar government subsidy support.',
      image: '/images/residential_light.png',
      link: '/residential',
      cta: 'Explore Residential',
      bullets: ['Net metering & DISCOM approval assistance', '25-Year linear module performance warranty', 'Smart mobile app generation telemetry'],
      icon: HomeIcon,
    },
    {
      type: 'COMMERCIAL SOLAR INFRASTRUCTURE',
      heading: 'Energy infrastructure built for business.',
      desc: 'Engineered for commercial office buildings, hospitals, hotels, shopping complexes. Slash operational electricity overheads and capitalize on 40% accelerated tax depreciation.',
      image: '/images/industrial_light.png',
      link: '/commercial',
      cta: 'Explore Commercial',
      bullets: ['40% Accelerated tax depreciation benefit', 'Non-penetrative ballast mounting structures', 'High financial return on investment (IRR)'],
      icon: Building2,
    },
    {
      type: 'INDUSTRIAL & UTILITY MEGA PROJECTS',
      heading: 'Engineered for scale and performance.',
      desc: 'For factories, manufacturing plants, cold storage units, megawatt solar farms. High-power bifacial N-type TOPCon modules engineered for heavy 24/7 industrial loads.',
      image: '/images/hero_light.png',
      link: '/industrial',
      cta: 'Explore Industrial',
      bullets: ['11kV / 33kV HT grid synchronization', 'High-power bifacial solar modules', 'Open access & captive power procurement'],
      icon: Factory,
    },
  ];

  // Projects Stories Data
  const PROJECT_STORIES = [
    {
      title: '1.2 MWp Industrial Rooftop Installation',
      location: 'Chakan MIDC, Pune',
      capacity: '1,200 kWp',
      desc: 'Bifacial solar module installation powering continuous 24/7 manufacturing operations with 11kV grid synchronization.',
      image: '/images/industrial_light.png',
    },
    {
      title: '450 kWp Commercial HQ Rooftop System',
      location: 'GIDC Industrial Park, Ahmedabad',
      capacity: '450 kWp',
      desc: 'Non-penetrative ballast framework solar system reducing corporate head office grid power draw by 75%.',
      image: '/images/hero_light.png',
    },
    {
      title: '25 kWp Modern Luxury Villa System',
      location: 'Baner, Pune',
      capacity: '25 kWp',
      desc: 'Sleek dark solar rooftop array with smart lithium battery energy storage and zero grid interruption.',
      image: '/images/residential_light.png',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased">
      {/* Dynamic Scroll Navigation Header */}
      <PublicNavbar
        transparentOverlay
        lightTheme
        onOpenQuoteModal={() => setIsQuoteOpen(true)}
      />

      {/* 1. HERO BACKGROUND (100VH / 100SVH / 100DVH FULL-SCREEN CINEMATIC) */}
      <section className="relative w-full min-h-screen min-h-[100svh] min-h-[100dvh] h-screen h-[100svh] flex items-center justify-center overflow-hidden snap-major-scene">
        {/* Background Visual Layer (Video-ready container for future video asset) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/solar-vision-hero.jpg"
            alt="nitish solar clean energy infrastructure"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter contrast-105 saturate-[1.02]"
          />
          {/* Layered Dark Gradient Overlays for Legibility — restrained, no color wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16 sm:pt-20">
          <div className="max-w-3xl space-y-7 sm:space-y-9">
            {/* Tag Kicker — plain tracked label, no glow/pulse */}
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em] hero-animate-1">
              <span className="w-4 h-px bg-amber-400" />
              <span>Real Roofs. Real Geography. Real Energy Data.</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-semibold tracking-tight text-white leading-[1.06] hero-animate-2">
              Precision solar engineering, designed around{' '}
              <span className="text-amber-400">your roof</span>.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl text-white/75 font-light leading-relaxed max-w-xl hero-animate-3">
              We map your property, model its real geometry, and design a solar system built on data — not estimates.
            </p>

            {/* Primary CTA — single, strengthened action */}
            <div className="pt-2 sm:pt-4 hero-animate-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setIsDiscoverSolarOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-9 py-4 rounded-lg transition-all duration-300 group border-0 text-base sm:text-lg flex items-center gap-3"
                icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              >
                Discover Your Solar
              </Button>
            </div>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 text-[11px] font-medium hero-animate-4">
          <span className="uppercase tracking-[0.2em]">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* 2. SECTION 2 — EDITORIAL INTRODUCTION ("Energy that works for tomorrow.") */}
      <section className="py-20 bg-[#0F172A] text-slate-100 border-t border-slate-800/80 snap-natural">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Large Editorial Statement */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
                Editorial Overview
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                Energy that works for tomorrow.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                At <strong className="text-white font-semibold">nitish solar</strong>, we believe energy infrastructure should be built on uncompromised engineering precision, high-efficiency solar modules, and transparent financial returns.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Whether deploying residential rooftop solar installations, commercial net-metered arrays, or utility-scale megawatt projects, our end-to-end EPC workflow ensures optimal tilt geometry, 3D shadow modeling, DISCOM grid synchronization, and 30-year linear performance guarantees.
              </p>
              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors group">
                  <span>Discover nitish solar's Engineering Philosophy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/60 group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="/images/industrial_light.png"
                    alt="nitish solar architectural engineering"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.15em] block">Industrial Rooftop Installation</span>
                    <p className="text-sm font-semibold">1.2 MWp High-Efficiency Bifacial Solar System • Pune MIDC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3 — SOLAR SOLUTIONS (INTEGRATED CINEMATIC SCENE) */}
      <section ref={solutionsRef} className="hidden md:block relative w-full h-[280vh] bg-[#0B0F17] snap-major-scene scroll-mt-20">
        {/* Sticky Viewport Container (All scene layers contained within 100vh viewport) */}
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-6 bg-[#0B0F17] relative">
          
          {/* Ambient Depth (neutral vignette only — no colored glow blobs / motion lines) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/60 to-[#0B0F17]" />
            <div
              className="absolute left-1/2 top-1/2 w-[900px] h-[560px] rounded-full bg-slate-800/25 blur-[120px] transition-transform duration-300 ease-out"
              style={{
                transform: `translate(-50%, -50%) translateX(${(0.5 - solutionsProgress) * -30}vw)`,
                willChange: 'transform',
              }}
            />
          </div>

          {/* Anchored Section Heading (Always visible below fixed navbar) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-30 shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
              Our Solutions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              Solar engineered for every scale.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light max-w-xl mx-auto">
              From homes to businesses to industrial infrastructure.
            </p>
          </div>

          {/* Horizontal Card Conveyor Viewport Container */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto z-20">
            {SOLUTIONS_STORIES.map((story, idx) => {
              // Compute continuous relative position for card idx
              // When solutionsProgress = 0, idx 0 is at 0 (center), idx 1 is at 1 (peeking right), idx 2 is at 2 (far right)
              const relPos = idx - solutionsProgress * 2;
              const absPos = Math.abs(relPos);
              const isCentral = absPos < 0.35;

              let opacity = 1;
              let scale = 1;
              let brightness = 1;

              if (relPos < 0) {
                // Moving left towards / off the edge: opacity 1 -> 0.45 -> 0.05, scale 1 -> 0.94 -> 0.88
                const distLeft = absPos;
                opacity = Math.max(0.05, 1 - distLeft * 0.55);
                scale = Math.max(0.88, 1 - distLeft * 0.06);
                brightness = Math.max(0.5, 1 - distLeft * 0.25);
              } else if (relPos > 0) {
                // Positioned on the right / entering from the right edge
                const distRight = relPos;
                opacity = Math.max(0.1, 1 - distRight * 0.25);
                scale = Math.max(0.9, 1 - distRight * 0.04);
                brightness = Math.max(0.7, 1 - distRight * 0.15);
              }

              // Active/central card (relPos closest to 0) gets highest z-index
              const zIndex = 30 - Math.round(absPos * 10);
              const translateX = relPos * 52; // Horizontal translation in viewport width percentage

              // Clip-path reveal: the image crops in from its leading edge as the card
              // arrives and un-crops as it departs, so cards feel like they surface
              // through a mask rather than simply sliding past one another.
              const clipInset = Math.max(0, Math.min(40, absPos * 55));
              const clipPath = `inset(0 ${relPos > 0 ? clipInset : 0}% 0 ${relPos < 0 ? clipInset : 0}% round 1rem)`;

              return (
                <div
                  key={story.type}
                  className="absolute left-1/2 top-1/2 transition-all duration-150 ease-out w-[88vw] max-w-[920px]"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${translateX}vw) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: `brightness(${brightness})`,
                    willChange: 'transform, opacity',
                    pointerEvents: opacity < 0.2 ? 'none' : 'auto',
                  }}
                >
                  <div
                    className={`border transition-colors duration-500 rounded-3xl p-6 lg:p-7 shadow-2xl shadow-black/50 flex flex-col md:flex-row items-center gap-6 lg:gap-8 group relative z-20 overflow-hidden ${
                      isCentral
                        ? 'bg-[#131B2E] border-slate-700/70'
                        : 'bg-[#131B2E]/95 border-slate-800/70'
                    }`}
                  >
                    {/* LEFT SIDE — PHOTO WITH CLIP-PATH REVEAL + PARALLAX */}
                    <div
                      className="w-full md:w-5/12 lg:w-1/2 aspect-[4/3] md:h-[270px] lg:h-[310px] relative rounded-2xl overflow-hidden shrink-0 border border-slate-700/50 shadow-inner transition-[clip-path] duration-300 ease-out"
                      style={{ clipPath, willChange: 'clip-path' }}
                    >
                      <Image
                        src={story.image}
                        alt={story.heading}
                        fill
                        sizes="(max-width: 1024px) 50vw, 45vw"
                        style={{
                          transform: `scale(${isCentral ? 1.06 : 1.0}) translateX(${-relPos * 3.5}%)`,
                          filter: `brightness(${isCentral ? 1.0 : 0.85})`,
                          willChange: 'transform, filter',
                        }}
                        className="object-cover transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    </div>

                    {/* RIGHT SIDE — CONTENT WITH MICRO-PARALLAX */}
                    <div
                      className="w-full md:w-7/12 lg:w-1/2 space-y-3.5 text-left transition-transform duration-300 ease-out"
                      style={{
                        transform: `translateX(${relPos * -4}px)`,
                      }}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400/90 block">
                        {story.type}
                      </span>

                      <h3 className="font-display text-xl lg:text-3xl font-semibold text-white tracking-tight leading-snug">
                        {story.heading}
                      </h3>

                      <p className="text-slate-300 text-xs lg:text-sm font-light leading-relaxed">
                        {story.desc}
                      </p>

                      <ul className="space-y-1.5 pt-0.5">
                        {story.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-xs lg:text-sm text-slate-200 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-1.5">
                        <Link href={story.link}>
                          <Button
                            variant="accent"
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-6 py-2 rounded-lg text-xs lg:text-sm border-0 flex items-center gap-2 group/btn"
                            icon={<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                          >
                            {story.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solutions Scene Progress Indicator */}
          <div className="flex flex-col items-center gap-2.5 relative z-30 pb-3 shrink-0 max-w-md mx-auto w-full px-6">
            <div className="flex items-center justify-between w-full text-[11px] font-semibold uppercase tracking-[0.15em]">
              <span className={`transition-colors duration-300 ${solutionsStep === 0 ? 'text-white' : 'text-slate-500'}`}>Residential</span>
              <span className={`transition-colors duration-300 ${solutionsStep === 1 ? 'text-white' : 'text-slate-500'}`}>Commercial</span>
              <span className={`transition-colors duration-300 ${solutionsStep === 2 ? 'text-white' : 'text-slate-500'}`}>Industrial</span>
            </div>
            <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${Math.max(12, Math.min(100, (solutionsProgress + 0.1) * 88))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: Clean Vertically Readable Card Stack */}
      <section className="block md:hidden py-16 pt-24 bg-[#0B0F17] px-4 space-y-8 border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
            Our Solutions
          </span>
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
            Solar engineered for every scale.
          </h2>
          <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
            From homes to businesses to industrial infrastructure.
          </p>
        </div>

        <div className="space-y-6">
          {SOLUTIONS_STORIES.map((story) => (
            <div
              key={story.type}
              className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="w-full aspect-[16/10] relative rounded-xl overflow-hidden border border-slate-700/50">
                <Image
                  src={story.image}
                  alt={story.heading}
                  fill
                  sizes="100vw"
                  className="object-cover filter brightness-95"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400/90 block">
                  {story.type}
                </span>
                <h3 className="font-display text-xl font-semibold text-white tracking-tight leading-snug">
                  {story.heading}
                </h3>
                <p className="text-slate-300 text-xs font-light leading-relaxed">
                  {story.desc}
                </p>
                <ul className="space-y-2 pt-1">
                  {story.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Link href={story.link}>
                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs border-0 flex items-center justify-center gap-2"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      {story.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION 4 — INSIDE A SOLAR PLANT (HOMEPAGE 5-STAGE "FOLLOW THE ENERGY" EXPERIENCE) */}
      <section ref={plantSectionRef} className="hidden md:block relative w-full h-[360vh] bg-[#0B0F17] snap-major-scene">
        {/* Sticky Viewport Container (100vh full viewport) */}
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-6 bg-[#0B0F17] relative">
          
          {/* Soft Ambient Depth (single restrained tone, no rainbow color-shifting) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/80 to-[#0B0F17]" />
            <div
              className="absolute left-1/2 top-1/2 w-[700px] h-[450px] rounded-full bg-slate-800/25 blur-[110px] transition-transform duration-700 ease-out"
              style={{
                transform: `translate(-50%, -50%) translateX(${(2 - plantStageIdx) * 14}vw)`,
              }}
            />
          </div>

          {/* Main 2-Column Desktop Grid Layout (Guarantees Text Safe Zone vs Visual Stage) */}
          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1 grid grid-cols-12 gap-8 items-center relative z-20 my-auto">

            {/* LEFT 5-COL: Dedicated Text Safe Zone (Title + Stage Info + Layer Explanation) */}
            <div className="col-span-5 space-y-5 text-left shrink-0">

              {/* Section Eyebrow */}
              <div className="flex items-center gap-2 text-white/50 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="w-4 h-px bg-amber-400" />
                <span>Inside a Solar Plant</span>
              </div>

              {/* Headline */}
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-tight">
                See how sunlight becomes power.
              </h2>

              {/* Stage Badge & Title */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 tracking-wide">
                    Stage {PLANT_STAGES[plantStageIdx].code} / 05
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wide">
                    {PLANT_STAGES[plantStageIdx].subtitle}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-white tracking-tight">
                  {PLANT_STAGES[plantStageIdx].title}
                </h3>
              </div>

              {/* Stage Concise 1-Sentence Explanation */}
              <p className="text-slate-300 text-sm font-light leading-relaxed bg-[#131B2E]/90 p-4 rounded-2xl border border-slate-800/70">
                {PLANT_STAGES[plantStageIdx].shortDesc}
              </p>

              {/* Active Exploded Layer Detail Card */}
              <div className="bg-[#0F172A] border border-slate-800/70 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Active Layer:</span>
                  <span className="text-amber-400 font-semibold">
                    {PLANT_STAGES[plantStageIdx].layers[plantLayerIdx]?.name}
                  </span>
                </div>
                <p className="text-slate-200 font-light leading-snug">
                  {PLANT_STAGES[plantStageIdx].layers[plantLayerIdx]?.desc}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setPlantLayerIdx((prev) => Math.max(0, prev - 1))}
                    disabled={plantLayerIdx === 0}
                    className="text-[11px] text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev Layer
                  </button>
                  <button
                    onClick={() => setPlantLayerIdx((prev) => Math.min(PLANT_STAGES[plantStageIdx].layers.length - 1, prev + 1))}
                    disabled={plantLayerIdx === PLANT_STAGES[plantStageIdx].layers.length - 1}
                    className="text-[11px] text-amber-400 hover:text-amber-300 disabled:opacity-30 font-semibold flex items-center gap-1"
                  >
                    Next Layer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 7-COL: Interactive Five Cinematic Engineering SVG Gadgets Container */}
            <div className="col-span-7 relative min-h-[440px] lg:min-h-[480px] flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-800/70 bg-[#070A10]/95 shadow-2xl shadow-black/40 p-6">

              {/* 1. Continuous Infrastructure Journey Header */}
              <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/70 text-[11px] font-semibold z-20 shrink-0">
                {PLANT_STAGES.map((stg, i) => (
                  <React.Fragment key={stg.id}>
                    {i > 0 && <span className="text-slate-600">→</span>}
                    <span
                      onClick={() => {
                        setPlantStageIdx(i);
                        setPlantLayerIdx(0);
                        if (plantSectionRef.current) {
                          const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;
                          const targetScrollTop = plantSectionRef.current.offsetTop + (i / 4) * totalDist;
                          window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                        }
                      }}
                      className={`cursor-pointer transition-colors duration-300 ${
                        plantStageIdx === i ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {stg.title}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* 2. Main SVG Gadget Interactive Scene Container */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-3 z-10">
                
                {/* GADGET 01: SOLAR SVG GADGET */}
                {plantStageIdx === 0 && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in space-y-2">
                    <svg className="w-full max-w-[420px] h-[220px]" viewBox="0 0 420 220" fill="none">
                      {/* Sun Rays */}
                      <g className="text-amber-400/40 animate-pulse">
                        <circle cx="210" cy="25" r="16" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                        <line x1="210" y1="45" x2="210" y2="70" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="180" y1="35" x2="150" y2="70" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="240" y1="35" x2="270" y2="70" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                      </g>

                      {/* Solar Panel Frame */}
                      <rect x="70" y="75" width="280" height="110" rx="12" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.7" />
                      
                      {/* PV Cell Matrix Grid */}
                      {Array.from({ length: 18 }).map((_, idx) => {
                        const col = idx % 6;
                        const row = Math.floor(idx / 6);
                        const x = 85 + col * 43;
                        const y = 87 + row * 31;
                        return (
                          <rect
                            key={idx}
                            x={x}
                            y={y}
                            width="37"
                            height="25"
                            rx="3"
                            fill="#0B132B"
                            stroke="#38BDF8"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                          />
                        );
                      })}

                      {/* Busbar Photovoltaic Energy Flow Path */}
                      <path d="M 85 130 H 335" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse" />
                      <circle cx="335" cy="130" r="5" fill="#F59E0B" className="animate-ping" />

                      {/* Output DC Conduit Stream */}
                      <path d="M 335 130 Q 365 130 365 170" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <div className="text-[11px] font-mono font-bold text-amber-400">
                      SOLAR CELL MATRIX ➔ DC PHOTON ACTIVATION
                    </div>
                  </div>
                )}

                {/* GADGET 02: DC COLLECTION SVG GADGET */}
                {plantStageIdx === 1 && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in space-y-2">
                    <svg className="w-full max-w-[420px] h-[220px]" viewBox="0 0 420 220" fill="none">
                      {/* String Array Inputs */}
                      <rect x="30" y="30" width="80" height="35" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                      <text x="70" y="52" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STRING 01</text>
                      
                      <rect x="30" y="90" width="80" height="35" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                      <text x="70" y="112" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STRING 02</text>
                      
                      <rect x="30" y="150" width="80" height="35" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                      <text x="70" y="172" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STRING 03</text>

                      {/* Converging Copper String Streams */}
                      <path d="M 110 47 Q 200 47 240 107" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />
                      <path d="M 110 107 L 240 107" stroke="#F59E0B" strokeWidth="3" />
                      <path d="M 110 167 Q 200 167 240 107" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />

                      {/* Central IP65 Combiner Box GADGET */}
                      <rect x="240" y="70" width="120" height="75" rx="10" fill="#16223B" stroke="#F59E0B" strokeWidth="2" />
                      <text x="300" y="102" fill="#FFFFFF" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMBINER BOX</text>
                      <text x="300" y="122" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">1500V DC OUTPUT</text>

                      {/* Single Converged DC Flow */}
                      <path d="M 360 107 H 410" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                    </svg>
                    <div className="text-[11px] font-mono font-bold text-amber-400">
                      MULTIPLE STRINGS CONVERGING ➔ 1500V DC HIGH-VOLTAGE OUTPUT
                    </div>
                  </div>
                )}

                {/* GADGET 03: INVERTER SVG GADGET (DC -> AC Conversion) */}
                {plantStageIdx === 2 && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in space-y-2">
                    <svg className="w-full max-w-[420px] h-[220px]" viewBox="0 0 420 220" fill="none">
                      {/* DC Input Flow */}
                      <path d="M 10 110 H 90" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                      <text x="50" y="95" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DC STREAM</text>

                      {/* Inverter Cabinet Body */}
                      <rect x="90" y="40" width="240" height="140" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                      <rect x="105" y="55" width="210" height="110" rx="8" fill="#0B132B" stroke="#1E293B" strokeWidth="1" />
                      
                      {/* SiC IGBT Switching Bridge Graphics */}
                      <rect x="120" y="70" width="70" height="80" rx="6" fill="#16223B" stroke="#38BDF8" strokeWidth="1" />
                      <text x="155" y="105" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SiC IGBT</text>
                      <text x="155" y="120" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="middle">MPPT 98.9%</text>

                      {/* Animated Sinusoidal AC Waveform Output */}
                      <path
                        d="M 210 110 Q 225 80 240 110 T 270 110 T 300 110"
                        stroke="#38BDF8"
                        strokeWidth="3"
                        fill="none"
                        className="animate-pulse"
                      />
                      
                      {/* AC Output Wave */}
                      <path d="M 330 110 H 410" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
                      <text x="370" y="95" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AC 3-PHASE</text>
                    </svg>
                    <div className="text-[11px] font-mono font-bold text-sky-400">
                      STEADY DC IN ➔ INVERTER SWITCHING ➔ 50.0 Hz AC WAVEFORM OUT
                    </div>
                  </div>
                )}

                {/* GADGET 04: TRANSFORMER SVG GADGET (Voltage Step-Up) */}
                {plantStageIdx === 3 && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in space-y-2">
                    <svg className="w-full max-w-[420px] h-[220px]" viewBox="0 0 420 220" fill="none">
                      {/* 800V AC Input Stream */}
                      <path d="M 10 110 H 80" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                      <text x="45" y="95" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">800V AC</text>

                      {/* Transformer Substation Body */}
                      <rect x="80" y="45" width="260" height="130" rx="14" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
                      
                      {/* Primary Winding Coil */}
                      <rect x="100" y="65" width="70" height="90" rx="8" fill="#16223B" stroke="#38BDF8" strokeWidth="1.5" />
                      <text x="135" y="115" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PRIMARY</text>

                      {/* Magnetic Core & Step-up Flux */}
                      <path d="M 170 110 H 250" stroke="#818CF8" strokeWidth="4" strokeDasharray="4 2" className="animate-pulse" />

                      {/* Secondary High-Voltage Coil */}
                      <rect x="250" y="65" width="70" height="90" rx="8" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" />
                      <text x="285" y="115" fill="#818CF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SECONDARY</text>

                      {/* Ceramic HV Bushing */}
                      <path d="M 285 65 V 25" stroke="#818CF8" strokeWidth="3" />
                      <circle cx="285" cy="20" r="6" fill="#818CF8" className="animate-ping" />

                      {/* High Voltage 33kV Output Beam */}
                      <path d="M 340 110 H 410" stroke="#818CF8" strokeWidth="5" strokeLinecap="round" />
                      <text x="375" y="95" fill="#818CF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">33kV TRANSMISSION</text>
                    </svg>
                    <div className="text-[11px] font-mono font-bold text-indigo-400">
                      800V LOW VOLTAGE ➔ ELECTROMAGNETIC STEP-UP ➔ 33kV HIGH VOLTAGE
                    </div>
                  </div>
                )}

                {/* GADGET 05: GRID SVG GADGET (Power Delivered to Network) */}
                {plantStageIdx === 4 && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative animate-fade-in space-y-2">
                    <svg className="w-full max-w-[420px] h-[220px]" viewBox="0 0 420 220" fill="none">
                      {/* Grid Transmission Tower Pylon SVG */}
                      <path d="M 40 180 L 70 30 L 100 180 M 50 80 H 90 M 45 120 H 95" stroke="#34D399" strokeWidth="2" />
                      <circle cx="70" cy="30" r="4" fill="#34D399" className="animate-ping" />

                      {/* Overhead Power Line Stream */}
                      <path d="M 70 30 Q 150 70 230 40" stroke="#34D399" strokeWidth="3" strokeDasharray="6 3" />
                      <path d="M 70 80 Q 150 120 230 90" stroke="#34D399" strokeWidth="2.5" />

                      {/* City Destinations: Home, Business, Industry */}
                      <g fill="#0F172A" stroke="#34D399" strokeWidth="1.5">
                        {/* Home */}
                        <rect x="230" y="120" width="45" height="40" rx="4" />
                        <path d="M 225 120 L 252.5 95 L 280 120 Z" />
                        <text x="252.5" y="145" fill="#34D399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">HOME</text>

                        {/* Business */}
                        <rect x="290" y="90" width="45" height="70" rx="4" />
                        <text x="312.5" y="130" fill="#34D399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">OFFICE</text>

                        {/* Industry */}
                        <rect x="350" y="70" width="55" height="90" rx="4" />
                        <text x="377.5" y="120" fill="#34D399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">FACTORY</text>
                      </g>
                    </svg>
                    
                    <div className="text-center space-y-0.5">
                      <div className="text-amber-400 font-black text-xs tracking-tight">
                        "From sunlight to power."
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono">
                        Engineered for every scale.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Bottom Energy Stream Status Bar */}
              <div className="w-full bg-slate-900/90 border border-slate-800/70 rounded-xl p-2.5 flex items-center justify-between text-xs z-20 shrink-0">
                <span className="text-slate-500 font-medium">Gadget State</span>
                <span className="font-semibold text-amber-400 font-mono text-[11px]">
                  {plantStageIdx === 0 && '01 SOLAR — Photon Activation'}
                  {plantStageIdx === 1 && '02 DC — 1500V String Convergence'}
                  {plantStageIdx === 2 && '03 Inverter — 50.0 Hz AC Inversion'}
                  {plantStageIdx === 3 && '04 Transformer — 33kV Step-Up'}
                  {plantStageIdx === 4 && '05 Grid — Power Delivered'}
                </span>
              </div>
            </div>
          </div>

          {/* Continuous 5-Stage Journey Progress Navigation Bar (Synchronized Click + Scroll State) */}
          <div className="max-w-4xl mx-auto w-full px-6 pt-3 pb-1 relative z-30 shrink-0">
            <div className="flex items-center justify-between bg-[#131B2E]/95 border border-slate-800/70 rounded-2xl p-2 shadow-xl shadow-black/30">
              {PLANT_STAGES.map((stage, idx) => {
                const isSelected = idx === plantStageIdx;
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      setPlantStageIdx(idx);
                      setPlantLayerIdx(0);
                      if (plantSectionRef.current) {
                        const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;
                        const targetScrollTop = plantSectionRef.current.offsetTop + (idx / 4) * totalDist;
                        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors duration-300 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/70'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold tracking-tight">
                      {stage.code} {stage.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 6 — IMPACT SECTION (COMPACT PINNED PROGRESSIVE NUMBERS) */}
      <section ref={impactRef} className="relative w-full h-[140vh] bg-[#070A10] text-white border-t border-slate-800/80 snap-major-scene">
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero_light.png"
              alt="nitish solar energy impact"
              fill
              sizes="100vw"
              className="object-cover object-center filter brightness-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A10]/95 via-[#070A10]/60 to-[#070A10]/90" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 w-full">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block mb-6">Proven Turnkey Track Record</span>
            {TRUST_INDICATORS.map((metric, idx) => {
              const isActive = impactStep === idx;
              return (
                <div
                  key={metric.label}
                  className={`transition-all duration-700 ease-out space-y-4 ${isActive ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute pointer-events-none'
                    }`}
                >
                  <span className="font-display text-5xl sm:text-8xl font-semibold text-white tracking-tight block tabular-nums">
                    {metric.val}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-semibold text-amber-400 tracking-tight">{metric.label}</h3>
                  <p className="text-slate-300 text-sm sm:text-base font-light max-w-lg mx-auto">{metric.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. SECTION 7 — SOLAR CALCULATOR & PROPOSAL REQUEST */}
      <section className="py-20 bg-[#0F172A] text-slate-100 border-t border-slate-800/80 snap-natural">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#0B0F17]/90 rounded-3xl p-8 sm:p-12 border border-slate-800/70 shadow-2xl shadow-black/40">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">Financial ROI Estimator</span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                See what solar can do for your facility.
              </h2>
              <p className="text-slate-300 text-sm font-light leading-relaxed">
                Adjust the interactive monthly electric bill slider to estimate system capacity sizing, annual financial savings, and subsidy eligibility for your <strong className="text-white font-semibold">nitish solar</strong> installation.
              </p>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-300">Monthly Electric Bill</span>
                    <span className="text-xl font-semibold text-amber-400 tabular-nums">₹{formatIndianNumber(quickBill)}</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={250000}
                    step={5000}
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#131B2E] p-4 rounded-2xl border border-slate-800/70 text-xs">
                  <div>
                    <span className="text-slate-400 block">Recommended Capacity:</span>
                    <span className="text-lg font-semibold text-white">{quickCalc.recommendedCapacityKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Annual Savings:</span>
                    <span className="text-lg font-semibold text-emerald-400">₹{formatIndianNumber(quickCalc.annualSavingsEst)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Subsidy / Benefit:</span>
                    <span className="text-sm font-semibold text-amber-400">₹{formatIndianNumber(quickCalc.subsidyEstimate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payback Horizon:</span>
                    <span className="text-sm font-semibold text-white">{quickCalc.paybackPeriodYears} Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-6 bg-[#131B2E] p-6 sm:p-8 rounded-2xl border border-slate-800/70 space-y-4 shadow-xl shadow-black/30">
              <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" /> Request Custom System Proposal
              </h3>
              <p className="text-xs text-slate-400">
                Receive a detailed engineering quote proposal backed by site survey evaluation from <strong className="text-slate-200">nitish solar</strong>.
              </p>

              {formSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Enquiry Received</h4>
                  <p className="text-xs text-slate-300">Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.</p>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white" onClick={() => setFormSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  {/* Honeypot Field */}
                  <input
                    type="text"
                    name="website_hp"
                    value={leadForm.website_hp}
                    onChange={(e) => setLeadForm({ ...leadForm, website_hp: e.target.value })}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {leadErrorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
                      {leadErrorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Patil"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
                      <select
                        value={leadForm.propertyType}
                        onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value as any })}
                        className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400 font-medium"
                      >
                        <option value="COMMERCIAL" className="bg-[#0B0F17]">Commercial</option>
                        <option value="INDUSTRIAL" className="bg-[#0B0F17]">Industrial</option>
                        <option value="RESIDENTIAL" className="bg-[#0B0F17]">Residential</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    variant="accent"
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-0 py-3 mt-2 disabled:opacity-50"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {isSubmittingLead ? 'Sending Proposal Request...' : 'Submit Proposal Request'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 8 — FINAL CINEMATIC CONCLUSION CTA */}
      <section className="relative w-full min-h-screen min-h-[100svh] min-h-[100dvh] h-screen h-[100svh] flex items-center justify-center py-20 lg:py-0 overflow-hidden border-t border-slate-800/80 snap-major-scene">
        {/* Full-width Daylight Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar clean energy future"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-black/60 to-[#070A10]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <h2 className="font-display text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-tight">
            Let's build a cleaner energy future.
          </h2>
          <p className="text-slate-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Partner with <strong className="text-white font-semibold">nitish solar</strong> to transition your home, enterprise, or industrial complex to turnkey solar power.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/quote">
              <Button
                variant="accent"
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-8 py-4 rounded-lg text-base transition-all border-0"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get a Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white/25 bg-black/30 backdrop-blur-sm text-white hover:bg-white/10 px-8 py-4 rounded-lg text-base font-medium"
              >
                Speak with an Engineer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
      <DiscoverSolarExperience isOpen={isDiscoverSolarOpen} onClose={() => setIsDiscoverSolarOpen(false)} />
    </div>
  );
}
