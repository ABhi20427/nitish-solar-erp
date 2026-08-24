'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
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
  Sparkles,
} from 'lucide-react';

const TRUST_INDICATORS = [
  { val: '1,250+', label: 'Projects Delivered', desc: 'Turnkey rooftop and ground-mount installations across India.' },
  { val: '450+ MWp', label: 'Installed Solar Capacity', desc: 'High-power utility and commercial grid-tie solar systems.' },
  { val: '3,800+', label: 'Satisfied Clients', desc: 'Homeowners, corporate enterprises, and industrial facilities.' },
  { val: '12+ Years', label: 'Engineering Experience', desc: 'Pioneering solar EPC excellence and DISCOM net metering.' },
];

const PLANT_STAGES = [
  {
    id: 'panel',
    code: '01',
    title: 'SOLAR PANEL',
    subtitle: 'Photons → DC Electricity',
    shortDesc: 'Captures sunlight photons and converts them into Direct Current (DC) electricity.',
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
    id: 'string',
    code: '02',
    title: 'STRING / DC COLLECTION',
    subtitle: 'Series Voltage Stacking',
    shortDesc: 'Multiple solar modules connected in series to build high-voltage DC power.',
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
    title: 'INVERTER STATION',
    subtitle: 'DC → 3-Phase AC Inversion',
    shortDesc: 'Converts solar DC electricity into grid-ready 3-phase AC power.',
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
    title: 'STEP-UP TRANSFORMER',
    subtitle: 'Voltage Step-Up (800V → 33kV)',
    shortDesc: 'Raises AC voltage to 11kV or 33kV for efficient long-distance grid transmission.',
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
    title: 'UTILITY GRID TIE-IN',
    subtitle: 'Grid Export & Net Metering',
    shortDesc: 'Synchronizes clean electricity with the regional grid for utility distribution and net metering.',
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
      <PublicNavbar transparentOverlay lightTheme onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* 1. HERO BACKGROUND (100VH / 100SVH / 100DVH FULL-SCREEN CINEMATIC) */}
      <section className="relative w-full min-h-screen min-h-[100svh] min-h-[100dvh] h-screen h-[100svh] flex items-center justify-center overflow-hidden snap-major-scene">
        {/* Background Visual Layer (Video-ready container for future video asset) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar clean energy infrastructure"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter contrast-105 saturate-105"
          />
          {/* Layered Sophisticated Dark Gradient Overlays for Video/Image Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16 sm:pt-20">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            {/* Tag Kicker */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest hero-animate-1 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Generation Clean Energy Infrastructure</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.05] drop-shadow-lg hero-animate-2">
              Powering a <span className="text-amber-400">Cleaner Future</span>.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl lg:text-2xl text-slate-200 font-light leading-relaxed max-w-2xl drop-shadow-sm hero-animate-3">
              Reliable solar solutions for homes, businesses, and industry.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2 sm:pt-4 hero-animate-4">
              <Link href="/quote">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-2xl shadow-amber-500/20 transition-all duration-300 group border-0 text-base flex items-center gap-2.5"
                  icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                >
                  Get a Quote
                </Button>
              </Link>
              <Link href="/solutions">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-black/40 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/60 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-base"
                >
                  Explore Solar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-300 text-xs font-mono font-medium drop-shadow-md hero-animate-4">
          <span className="uppercase tracking-widest text-[10px] text-slate-400">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
        </div>
      </section>

      {/* 2. SECTION 2 — EDITORIAL INTRODUCTION ("Energy that works for tomorrow.") */}
      <section className="py-20 bg-[#0F172A] text-slate-100 border-t border-slate-800/80 snap-natural">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Large Editorial Statement */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
                Editorial Overview
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Energy that works for tomorrow.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                At <strong className="text-white font-semibold">nitish solar</strong>, we believe energy infrastructure should be built on uncompromised engineering precision, high-efficiency solar modules, and transparent financial returns.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Whether deploying residential rooftop solar installations, commercial net-metered arrays, or utility-scale megawatt projects, our end-to-end EPC workflow ensures optimal tilt geometry, 3D shadow modeling, DISCOM grid synchronization, and 30-year linear performance guarantees.
              </p>
              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                  <span>Discover nitish solar's Engineering Philosophy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
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
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">Industrial Rooftop Installation</span>
                    <p className="text-sm font-bold">1.2 MWp High-Efficiency Bifacial Solar System • Pune MIDC</p>
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
          
          {/* Integrated Ambient Energy Atmosphere (Inside sticky viewport) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Soft gradient blend ensuring seamless transition with surrounding sections */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/60 to-[#0B0F17]" />
            
            {/* Background Parallax Energy Flow Streams (Slow Movement: -solutionsProgress * 14vw) */}
            <div
              className="absolute inset-0 opacity-20 transition-transform duration-150 ease-out"
              style={{
                transform: `translateX(${-solutionsProgress * 14}vw)`,
                willChange: 'transform',
              }}
            >
              <div className="absolute top-1/4 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-energy-flow" />
              <div className="absolute top-1/2 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600/25 to-transparent animate-energy-flow" style={{ animationDelay: '-14s' }} />
              <div className="absolute top-3/4 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/15 to-transparent animate-energy-flow" style={{ animationDelay: '-7s' }} />
            </div>

            {/* Dynamic Active Card Spotlight Glow (Moves smoothly with solutionsProgress) */}
            <div
              className="absolute left-1/2 top-1/2 w-[620px] h-[400px] rounded-full bg-gradient-to-r from-amber-500/12 via-blue-600/8 to-amber-400/12 blur-3xl transition-transform duration-300 ease-out opacity-75"
              style={{
                transform: `translate(-50%, -50%) translateX(${(0.5 - solutionsProgress) * -52}vw)`,
                willChange: 'transform',
              }}
            />
          </div>

          {/* Anchored Section Heading (Always visible below fixed navbar) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2 relative z-30 shrink-0">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block drop-shadow-sm">
              OUR SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
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
              const isCentral = Math.abs(relPos) < 0.35;

              let opacity = 1;
              let scale = 1;
              let brightness = 1;

              if (relPos < 0) {
                // Moving Left towards / off left edge: opacity 1 -> 0.45 -> 0.05, scale 1 -> 0.94 -> 0.88
                const distLeft = Math.abs(relPos);
                opacity = Math.max(0.05, 1 - distLeft * 0.55);
                scale = Math.max(0.88, 1 - distLeft * 0.06);
                brightness = Math.max(0.5, 1 - distLeft * 0.25);
              } else if (relPos > 0) {
                // Positioned on the right / entering from right edge
                const distRight = relPos;
                opacity = Math.max(0.1, 1 - distRight * 0.25);
                scale = Math.max(0.9, 1 - distRight * 0.04);
                brightness = Math.max(0.7, 1 - distRight * 0.15);
              }

              // Active/central card (relPos closest to 0) gets highest z-index
              const zIndex = 30 - Math.round(Math.abs(relPos) * 10);
              const translateX = relPos * 52; // Horizontal translation in viewport width percentage

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
                  {/* Subtle Light Motion Trail Behind Cards Moving Left */}
                  {relPos < 0.3 && relPos > -1.5 && (
                    <div
                      className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-3/4 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent blur-2xl rounded-full pointer-events-none transition-opacity duration-300"
                      style={{ opacity: Math.max(0, Math.min(0.2, (0.3 - relPos) * 0.25)) }}
                    />
                  )}

                  <div
                    className={`border transition-all duration-500 rounded-3xl p-6 lg:p-7 shadow-2xl flex flex-col md:flex-row items-center gap-6 lg:gap-8 group relative z-20 overflow-hidden ${
                      isCentral
                        ? 'bg-gradient-to-br from-[#18233C] via-[#131B2E] to-[#0F172A] border-amber-400/40 shadow-amber-500/10'
                        : 'bg-[#131B2E]/95 border-slate-800/90 shadow-black/90'
                    }`}
                  >
                    {/* LEFT SIDE — PHOTO WITH IMAGE PARALLAX */}
                    <div className="w-full md:w-5/12 lg:w-1/2 aspect-[4/3] md:h-[270px] lg:h-[310px] relative rounded-2xl overflow-hidden shrink-0 border border-slate-700/50 shadow-inner">
                      <Image
                        src={story.image}
                        alt={story.heading}
                        fill
                        sizes="(max-width: 1024px) 50vw, 45vw"
                        style={{
                          transform: `scale(${isCentral ? 1.04 : 1.0}) translateX(${-relPos * 3.5}%)`,
                          filter: `brightness(${isCentral ? 1.02 : 0.88})`,
                          willChange: 'transform, filter',
                        }}
                        className="object-cover transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* RIGHT SIDE — CONTENT WITH MICRO-PARALLAX */}
                    <div
                      className="w-full md:w-7/12 lg:w-1/2 space-y-3.5 text-left transition-transform duration-300 ease-out"
                      style={{
                        transform: `translateX(${relPos * -4}px)`,
                      }}
                    >
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
                        {story.type}
                      </span>

                      <h3 className="text-xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                        {story.heading}
                      </h3>

                      <p className="text-slate-300 text-xs lg:text-sm font-light leading-relaxed">
                        {story.desc}
                      </p>

                      <ul className="space-y-1.5 pt-0.5">
                        {story.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-xs lg:text-sm text-slate-200 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-1.5">
                        <Link href={story.link}>
                          <Button
                            variant="accent"
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs lg:text-sm border-0 shadow-lg shadow-amber-500/10 flex items-center gap-2 group/btn"
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

          {/* Premium Solutions Scene Progress Indicator: 01 ━━━━━ [Line] ━━━━━ 03 */}
          <div className="flex flex-col items-center gap-2 relative z-30 pb-3 shrink-0 max-w-md mx-auto w-full px-6">
            <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold tracking-widest">
              <span className={`transition-colors duration-300 ${solutionsStep === 0 ? 'text-amber-400' : 'text-slate-500'}`}>01 RESIDENTIAL</span>
              <span className={`transition-colors duration-300 ${solutionsStep === 1 ? 'text-amber-400' : 'text-slate-500'}`}>02 COMMERCIAL</span>
              <span className={`transition-colors duration-300 ${solutionsStep === 2 ? 'text-amber-400' : 'text-slate-500'}`}>03 INDUSTRIAL</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-200 ease-out shadow-sm shadow-amber-400/50"
                style={{ width: `${Math.max(12, Math.min(100, (solutionsProgress + 0.1) * 88))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: Clean Vertically Readable Card Stack */}
      <section className="block md:hidden py-16 pt-24 bg-[#0B0F17] px-4 space-y-8 border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
            OUR SOLUTIONS
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
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
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                  {story.type}
                </span>
                <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                  {story.heading}
                </h3>
                <p className="text-slate-300 text-xs font-light leading-relaxed">
                  {story.desc}
                </p>
                <ul className="space-y-2 pt-1">
                  {story.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Link href={story.link}>
                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs border-0 flex items-center justify-center gap-2"
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

      {/* 4. SECTION 4 — INSIDE A SOLAR PLANT (IMMERSIVE HOMEPAGE 5-STAGE 3D SCROLL JOURNEY) */}
      <section ref={plantSectionRef} className="hidden md:block relative w-full h-[320vh] bg-[#0B0F17] snap-major-scene">
        {/* Sticky Viewport Container (100vh viewport) */}
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-6 bg-[#0B0F17] relative">
          
          {/* Soft Ambient Background Energy Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/80 to-[#0B0F17]" />
            <div
              className="absolute left-1/2 top-1/2 w-[650px] h-[420px] rounded-full bg-gradient-to-r from-amber-500/15 via-sky-600/10 to-amber-400/15 blur-3xl transition-transform duration-700 ease-out opacity-80"
              style={{
                transform: `translate(-50%, -50%) translateX(${(2 - plantStageIdx) * 16}vw)`,
              }}
            />
          </div>

          {/* Section Header */}
          <div className="max-w-4xl mx-auto px-4 text-center space-y-1.5 relative z-30 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>INSIDE A SOLAR PLANT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              See how sunlight becomes power.
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
              Explore the 5-stage engineering journey from photovoltaic generation to grid energy.
            </p>
          </div>

          {/* 3D Exploded Visual Stage */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto z-20">
            <div
              className="relative w-[280px] sm:w-[380px] lg:w-[440px] h-[180px] sm:h-[240px] lg:h-[270px] transition-all duration-700 ease-out animate-[float_6s_ease-in-out_infinite]"
              style={{
                perspective: '1200px',
                perspectiveOrigin: '50% 40%',
              }}
            >
              <div
                className="w-full h-full relative transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(52deg) rotateZ(-28deg)',
                }}
              >
                {PLANT_STAGES[plantStageIdx].layers.map((layer, idx) => {
                  const isActive = idx === plantLayerIdx;
                  const totalLayers = PLANT_STAGES[plantStageIdx].layers.length;
                  const explosionSpread = 48;
                  const zOffset = ((totalLayers - 1) / 2 - idx) * explosionSpread + (isActive ? 35 : 0);
                  const opacity = isActive ? 1.0 : Math.abs(idx - plantLayerIdx) === 1 ? 0.75 : 0.45;
                  const scale = isActive ? 1.05 : 1.0;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setPlantLayerIdx(idx)}
                      className="absolute inset-0 cursor-pointer transition-all duration-500 ease-out group"
                      style={{
                        transform: `translateZ(${zOffset}px) scale(${scale})`,
                        opacity,
                        willChange: 'transform, opacity',
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-2xl border transition-all duration-300 shadow-2xl relative overflow-hidden backdrop-blur-md ${
                          isActive
                            ? 'border-amber-400 bg-[#16223B]/90 ring-4 ring-amber-400/30 shadow-amber-500/25'
                            : 'border-slate-700/80 bg-[#0F172A]/70 group-hover:border-slate-400'
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
                        
                        {/* Custom Graphic Overlay per Stage */}
                        {plantStageIdx === 0 && layer.id === 'cells' && (
                          <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-1 p-2">
                            {Array.from({ length: 24 }).map((_, c) => (
                              <div key={c} className="bg-sky-950 border border-amber-400/50 rounded-sm" />
                            ))}
                          </div>
                        )}

                        {plantStageIdx === 1 && (
                          <div className="w-full h-full flex items-center justify-around px-4">
                            <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">DC</div>
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-amber-300 mx-2" />
                            <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">1500V</div>
                          </div>
                        )}

                        {plantStageIdx === 2 && (
                          <div className="w-full h-full flex flex-col justify-between p-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span>DC INPUT</span>
                              <span className="text-amber-400 font-bold">MPPT ACTIVE</span>
                              <span>AC OUTPUT</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 w-3/4 rounded-full animate-pulse" />
                            </div>
                          </div>
                        )}

                        {plantStageIdx === 3 && (
                          <div className="w-full h-full flex items-center justify-center gap-6">
                            <div className="w-12 h-12 rounded-full border-4 border-amber-400/80 flex items-center justify-center text-xs font-bold text-amber-400">800V</div>
                            <div className="text-amber-400 font-extrabold text-sm">➔➔➔</div>
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-400/80 flex items-center justify-center text-xs font-bold text-emerald-400">33kV</div>
                          </div>
                        )}

                        {plantStageIdx === 4 && (
                          <div className="w-full h-full flex items-center justify-between px-6 text-xs font-mono font-bold text-emerald-400">
                            <span>50.0 Hz SYNC</span>
                            <span className="text-amber-400 animate-ping">● LIVE EXPORT</span>
                            <span>NET METER</span>
                          </div>
                        )}
                      </div>

                      <div
                        className={`absolute -right-28 sm:-right-36 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs font-mono font-bold transition-all duration-300 whitespace-nowrap shadow-lg ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold scale-110'
                            : 'bg-slate-950/90 text-slate-400 border-slate-800 group-hover:text-white'
                        }`}
                      >
                        {layer.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Short 1-Sentence Explanation Card */}
          <div className="max-w-xl mx-auto w-full px-4 relative z-30 shrink-0">
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-center space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  {PLANT_STAGES[plantStageIdx].code} — {PLANT_STAGES[plantStageIdx].title}
                </span>
                <span className="text-slate-500">{PLANT_STAGES[plantStageIdx].layers[plantLayerIdx]?.name}</span>
              </div>

              <p className="text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
                {PLANT_STAGES[plantStageIdx].layers[plantLayerIdx]?.desc}
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setPlantLayerIdx((prev) => Math.max(0, prev - 1))}
                  disabled={plantLayerIdx === 0}
                  className="text-[11px] font-mono text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Layer
                </button>

                <button
                  onClick={() => setPlantLayerIdx((prev) => Math.min(PLANT_STAGES[plantStageIdx].layers.length - 1, prev + 1))}
                  disabled={plantLayerIdx === PLANT_STAGES[plantStageIdx].layers.length - 1}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 disabled:opacity-30 flex items-center gap-1 font-bold"
                >
                  Next Layer <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Continuous 5-Stage Journey Progress Navigation Bar */}
          <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-1 relative z-30 shrink-0">
            <div className="flex items-center justify-between bg-[#131B2E]/90 border border-slate-800 rounded-2xl p-2 shadow-xl">
              {PLANT_STAGES.map((stage, idx) => {
                const isSelected = idx === plantStageIdx;
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      if (plantSectionRef.current) {
                        const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;
                        const targetScrollTop = plantSectionRef.current.offsetTop + (idx / 4) * totalDist;
                        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight hidden sm:inline">
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
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block mb-6">Proven Turnkey Track Record</span>
            {TRUST_INDICATORS.map((metric, idx) => {
              const isActive = impactStep === idx;
              return (
                <div
                  key={metric.label}
                  className={`transition-all duration-700 ease-out space-y-4 ${isActive ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute pointer-events-none'
                    }`}
                >
                  <span className="text-5xl sm:text-8xl font-black text-white tracking-tight drop-shadow-lg block font-mono">
                    {metric.val}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-bold text-amber-400 tracking-tight">{metric.label}</h3>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#0B0F17]/90 rounded-3xl p-8 sm:p-12 border border-slate-800/90 shadow-2xl">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">Financial ROI Estimator</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                See what solar can do for your facility.
              </h2>
              <p className="text-slate-300 text-sm font-light leading-relaxed">
                Adjust the interactive monthly electric bill slider to estimate system capacity sizing, annual financial savings, and subsidy eligibility for your <strong className="text-white font-semibold">nitish solar</strong> installation.
              </p>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-300">Monthly Electric Bill</span>
                    <span className="text-xl font-black text-amber-400 font-mono">₹{formatIndianNumber(quickBill)}</span>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#131B2E] p-4 rounded-2xl border border-slate-800/80 text-xs shadow-md">
                  <div>
                    <span className="text-slate-400 block">Recommended Capacity:</span>
                    <span className="text-lg font-black text-white">{quickCalc.recommendedCapacityKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Annual Savings:</span>
                    <span className="text-lg font-black text-emerald-400">₹{formatIndianNumber(quickCalc.annualSavingsEst)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Subsidy / Benefit:</span>
                    <span className="text-sm font-bold text-amber-400">₹{formatIndianNumber(quickCalc.subsidyEstimate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payback Horizon:</span>
                    <span className="text-sm font-bold text-white">{quickCalc.paybackPeriodYears} Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-6 bg-[#131B2E] p-6 sm:p-8 rounded-2xl border border-slate-800/80 space-y-4 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
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
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Let’s build a cleaner energy future.
          </h2>
          <p className="text-slate-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            Partner with <strong className="text-white font-semibold">nitish solar</strong> to transition your home, enterprise, or industrial complex to turnkey solar power.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/quote">
              <Button
                variant="accent"
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-2xl transition-all border-0"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get a Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-black/40 backdrop-blur-md text-white hover:bg-white/20 px-8 py-4 rounded-xl text-base font-semibold shadow-lg"
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
    </div>
  );
}
