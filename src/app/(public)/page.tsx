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
  Calculator,
  ArrowRight,
  CheckCircle2,
  Send,
  ArrowUpRight,
  Shield,
  Activity,
  Sun,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Layers,
  IndianRupee,
  Clock,
  Compass,
  FileCheck2,
  Wrench,
  Headset,
} from 'lucide-react';



const PLANT_STAGES = [
  {
    id: 'solar',
    code: '01',
    name: 'SOLAR',
    title: '01 SOLAR',
    subtitle: 'Photovoltaic Energy Capture',
    desc: 'Solar panels capture sunlight and produce DC electricity.',
    icon: Sun,
    image: '/images/plant/solar.png',
    detailBadge: 'Photovoltaic Capture',
    specs: ['N-Type TOPCon PV Silicon Cells', '22.8% Peak Module Efficiency', 'Anti-Reflective Tempered Glass'],
  },
  {
    id: 'dc',
    code: '02',
    name: 'DC',
    title: '02 DC',
    subtitle: 'Direct Current Flow',
    desc: 'Direct current flows from the solar panels through the system.',
    icon: Zap,
    image: '/images/plant/dc.png',
    detailBadge: 'Power Combining',
    specs: ['1500V DC Series String Cabling', 'IP65 Weatherproof Combiner Box', 'MC4 Low-Resistance Connectors'],
  },
  {
    id: 'inverter',
    code: '03',
    name: 'INVERTER',
    title: '03 INVERTER',
    subtitle: 'DC to AC Conversion',
    desc: 'The inverter converts DC electricity into usable AC electricity.',
    icon: Cpu,
    image: '/images/plant/inverter.png',
    detailBadge: 'Sinusoidal Inversion',
    specs: ['Silicon Carbide IGBT Power Stage', '99.4% Inversion Efficiency', '12 Independent MPPT Trackers'],
  },
  {
    id: 'transformer',
    code: '04',
    name: 'TRANSFORMER',
    title: '04 TRANSFORMER',
    subtitle: 'Voltage Step-Up',
    desc: 'The transformer adjusts voltage for efficient electrical distribution.',
    icon: Activity,
    image: '/images/plant/transformer.png',
    detailBadge: 'Voltage Regulation',
    specs: ['ONAN Oil-Immersed Steel Core', '11kV / 33kV Step-Up Synchronization', 'Primary Copper Isolation Coils'],
  },
  {
    id: 'grid',
    code: '05',
    name: 'GRID',
    title: '05 GRID',
    subtitle: 'Power Delivery & Synchronization',
    desc: 'Electricity reaches the property or flows into the wider grid.',
    icon: ShieldCheck,
    image: '/images/plant/grid.png',
    detailBadge: 'Net-Metered Dispatch',
    specs: ['Bi-Directional ABT Smart Net Meter', 'HT Vacuum Circuit Breakers', 'DISCOM Grid Compliance'],
  },
];

// Ambient exploded solar-panel visual: 5 physically-ordered module layers,
// bottom to top (backsheet → encapsulant → cell matrix → glass → frame).
// `depth` drives each layer's own separation distance in the CSS animation
// (see .animate-panel-layer / --depth in globals.css) — a plain data array,
// not component state, so it never triggers re-renders.
const PANEL_LAYERS = [
  { id: 'backsheet', depth: 0, extra: 'bg-[#131f3d] border-slate-600/80' },
  { id: 'back-eva', depth: 12, extra: 'bg-sky-400/10 border-sky-300/25 backdrop-blur-[1px]' },
  { id: 'cells', depth: 26, extra: 'bg-[#0d1a3a] border-blue-700/90 shadow-[0_0_18px_rgba(59,130,246,0.45)]' },
  { id: 'front-eva', depth: 40, extra: 'bg-white/10 border-white/25 backdrop-blur-[1px]' },
  { id: 'glass', depth: 54, extra: 'bg-gradient-to-br from-sky-100/35 via-white/15 to-transparent border-sky-100/50 shadow-inner' },
  { id: 'frame', depth: 68, extra: 'bg-transparent border-[2px] border-slate-100/90 shadow-lg' },
] as const;

// Closing-section value strip — what we actually promise, not fabricated
// track-record numbers (this is a young company; false stats would be a
// credibility risk the moment anyone asks). Presented as a connected,
// animated row instead, echoing the site's "energy flowing through the
// system" visual motif one last time.
const VALUE_PROPS = [
  { icon: Compass, label: 'Engineering-Led Design', desc: 'Every system modeled and sized before a panel is ordered.' },
  { icon: FileCheck2, label: 'Transparent Documentation', desc: 'Full DISCOM paperwork and net-metering support, handled for you.' },
  { icon: Wrench, label: 'Turnkey Installation', desc: 'One team, start to finish — survey, design, install, commissioning.' },
  { icon: Headset, label: 'Direct Engineer Access', desc: 'Talk to the person who designed your system, not a call center.' },
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

  // Closing value-strip scroll reveal — fires once when the strip enters view,
  // driving a single staggered CSS entrance for all four items.
  const valueStripRef = useRef<HTMLDivElement>(null);
  const [valueStripInView, setValueStripInView] = useState(false);
  useEffect(() => {
    const el = valueStripRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setValueStripInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Deterministic Initial Scroll Step States
  const [solutionsStep, setSolutionsStep] = useState(0);
  const [solutionsProgress, setSolutionsProgress] = useState(0);
  const [plantStageIdx, setPlantStageIdx] = useState(0);
  // Continuous scroll position (0..1) across the Solar Plant journey's 5
  // stages, smoothed the same way as solutionsProgress — drives the stage
  // image crossfade and the connecting-line width every frame, while
  // plantStageIdx (above) stays the discrete "nearest stage" used for the
  // text/label/node-highlight, which can't meaningfully blend.
  const [plantProgress, setPlantProgress] = useState(0);

  // Section Refs
  const solutionsRef = useRef<HTMLDivElement>(null);
  // Raw scroll-derived progress for the Solutions conveyor (0..1), updated every
  // scroll tick. solutionsProgress (state, below) chases this target once per
  // frame via a critically-damped lerp so the cards glide instead of snapping
  // to each discrete scroll/wheel event.
  const solutionsTargetProgress = useRef(0);
  const plantSectionRef = useRef<HTMLDivElement>(null);
  const plantVideoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedPlantVideo = useRef(false);
  // Raw scroll-derived target for plantProgress, and a synchronous mirror of
  // its current smoothed value (read+written directly in the lerp loop, since
  // the discrete plantStageIdx needs to be derived from it within the same
  // frame rather than waiting a render cycle).
  const plantTargetProgress = useRef(0);
  const plantProgressRef = useRef(0);

  const jumpToPlantStage = (idx: number) => {
    if (plantSectionRef.current) {
      const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;
      // idx/5 (not idx/4) lands exactly on that stage's full-opacity scroll
      // position — the 5 stages occupy 5 equal scroll buckets ([0,.2), [.2,.4)…),
      // so stage idx is centered at progress = idx/5.
      const targetScrollTop = plantSectionRef.current.offsetTop + (idx / 5) * totalDist;
      window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

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

  // Continuous 0..4 position across the Solar Plant journey's 5 stages,
  // derived from the smoothed plantProgress (0..1) each render — drives the
  // stage-image crossfade and connecting-line width so both track the
  // scrollbar continuously rather than jumping at each of the 5 thresholds.
  const plantStagePos = Math.max(0, Math.min(4, plantProgress * 5));

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
              solutionsTargetProgress.current = progress;
              let nextStep = 0;
              if (progress < 0.35) nextStep = 0;
              else if (progress < 0.7) nextStep = 1;
              else nextStep = 2;

              setSolutionsStep((prev) => (prev !== nextStep ? nextStep : prev));
            }
          }

          // 2. Inside A Solar Plant Scroll Progress & Non-Loop Video Trigger
          if (plantSectionRef.current) {
            const rect = plantSectionRef.current.getBoundingClientRect();
            const totalDist = plantSectionRef.current.offsetHeight - window.innerHeight;

            // Trigger video play once when user scrolls into Section 4 from top
            const isSectionVisible = rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0;
            if (isSectionVisible) {
              if (!hasPlayedPlantVideo.current) {
                hasPlayedPlantVideo.current = true;
                if (plantVideoRef.current) {
                  plantVideoRef.current.currentTime = 0;
                  plantVideoRef.current.play().catch(() => {});
                }
              }
            } else if (rect.top > window.innerHeight) {
              // Reset trigger when user scrolls back above Section 4
              hasPlayedPlantVideo.current = false;
              if (plantVideoRef.current) {
                plantVideoRef.current.pause();
              }
            }

            if (totalDist > 0 && rect.top <= 0 && rect.bottom >= 0) {
              const progress = Math.max(0, Math.min(0.999, -rect.top / totalDist));
              plantTargetProgress.current = progress;
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

  // Continuous lerp loop: eases solutionsProgress toward solutionsTargetProgress
  // every animation frame using a time-constant (frame-rate independent) decay,
  // rather than snapping straight to the raw scroll value. This is what makes
  // the Solutions card conveyor read as fluid motion instead of chasing each
  // wheel/trackpad tick — especially on fast flicks where scroll deltas arrive
  // in large, uneven jumps.
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    const TAU_MS = 120; // lower = snappier, higher = silkier/more lag

    const tick = (now: number) => {
      const dt = Math.min(1000, now - lastTime);
      lastTime = now;
      const smoothing = 1 - Math.exp(-dt / TAU_MS);

      setSolutionsProgress((prev) => {
        const target = solutionsTargetProgress.current;
        const next = prev + (target - prev) * smoothing;
        return Math.abs(next - target) < 0.0005 ? target : next;
      });

      // Solar Plant journey — mirrored in a ref (rather than a functional
      // setState) because the discrete "nearest stage" below needs this
      // frame's settled value synchronously, not on the next render.
      const plantTarget = plantTargetProgress.current;
      const plantPrev = plantProgressRef.current;
      const plantNext = plantPrev + (plantTarget - plantPrev) * smoothing;
      const plantSettled = Math.abs(plantNext - plantTarget) < 0.0005 ? plantTarget : plantNext;
      plantProgressRef.current = plantSettled;
      setPlantProgress(plantSettled);

      const nearestStage = Math.max(0, Math.min(4, Math.round(plantSettled * 5)));
      setPlantStageIdx((prev) => (prev !== nearestStage ? nearestStage : prev));

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
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
          city: leadForm.location || 'Chennai',
          state: 'Tamil Nadu',
          address: 'Chromepet, Chennai',
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
      range: '3–15 kW',
      statValue: '90%',
      statLabel: 'Avg. bill reduction',
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
      range: '20–250 kW',
      statValue: '40%',
      statLabel: 'Accelerated tax depreciation',
      heading: 'Energy infrastructure built for business.',
      desc: 'Engineered for commercial office buildings, hospitals, hotels, shopping complexes. Slash operational electricity overheads and capitalize on 40% accelerated tax depreciation.',
      image: '/images/commercial_light.png',
      link: '/commercial',
      cta: 'Explore Commercial',
      bullets: ['40% Accelerated tax depreciation benefit', 'Non-penetrative ballast mounting structures', 'High financial return on investment (IRR)'],
      icon: Building2,
    },
    {
      type: 'INDUSTRIAL & UTILITY MEGA PROJECTS',
      range: '500 kW – 10 MW',
      statValue: '25%',
      statLabel: 'Bifacial energy gain',
      heading: 'Engineered for scale and performance.',
      desc: 'For factories, manufacturing plants, cold storage units, megawatt solar farms. High-power bifacial N-type TOPCon modules engineered for heavy 24/7 industrial loads.',
      image: '/images/hero_light.png',
      link: '/industrial',
      cta: 'Explore Industrial',
      bullets: ['11kV / 33kV HT grid synchronization', 'High-power bifacial solar modules', 'Open access & captive power procurement'],
      icon: Factory,
    },
  ];

  // Jump the sticky Solutions conveyor directly to a given story by scrolling the
  // section to the scroll-fraction that centers it (mirrors the click-to-jump
  // pattern used by the Inside-a-Solar-Plant stage nav below).
  const jumpToSolutionStory = (idx: number) => {
    if (!solutionsRef.current) return;
    const totalDist = solutionsRef.current.offsetHeight - window.innerHeight;
    const targetScrollTop = solutionsRef.current.offsetTop + (idx / 2) * totalDist;
    window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  };

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
      image: '/images/commercial_light.png',
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
            className="object-cover object-[85%_center]"
          />
          {/* Layered Dark Gradient Overlays preserving glowing sun on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
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

        {/* Scroll Indicator — a small current of light traveling down a thin
            wire instead of a generic bouncing chevron, echoing the "energy
            flowing through the system" motif used elsewhere on the page. */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-white/60 text-[11px] font-medium hero-animate-4">
          <span className="uppercase tracking-[0.2em]">Scroll to explore</span>
          <div className="relative h-9 w-px bg-white/15 overflow-hidden rounded-full">
            <span className="animate-scroll-current absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_2px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
      </section>

      {/* 2. SECTION 2 — EDITORIAL INTRODUCTION ("Energy engineered for precision, returns & longevity.") */}
      <section className="relative py-20 bg-[#0F172A] text-slate-100 border-t border-slate-800/80 snap-natural overflow-hidden">
        {/* Decorative Background: faint engineering blueprint grid + warm ambient glow +
            a large sun-ray emblem watermark — thematically tied to "solar engineering",
            kept extremely low-opacity/stroke-only so it reads as texture, not neon. */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full bg-amber-500/[0.06] blur-[150px]" />
          <svg className="absolute -top-28 -right-28 w-[600px] h-[600px] opacity-[0.08]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="46" stroke="#F59E0B" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="2 4" />
            {Array.from({ length: 16 }).map((_, i) => {
              const rad = (i * 360 * Math.PI) / (16 * 180);
              const x1 = 100 + Math.cos(rad) * 58;
              const y1 = 100 + Math.sin(rad) * 58;
              const x2 = 100 + Math.cos(rad) * 96;
              const y2 = 100 + Math.sin(rad) * 96;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="1" />;
            })}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Large Editorial Statement */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
                Editorial Overview & Philosophy
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                Energy engineered for precision, returns & longevity.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                At <strong className="text-white font-semibold">nitish solar</strong>, we believe energy infrastructure must be built on uncompromised engineering precision, high-efficiency solar modules, and transparent financial performance.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Whether deploying residential rooftop solar systems, commercial net-metered arrays, or utility-scale megawatt power plants, our end-to-end EPC workflow ensures exact tilt geometry, 3D shadow analysis, DISCOM grid synchronization, and 25-year linear performance guarantees.
              </p>
              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors group">
                  <span>Discover nitish solar's Engineering Philosophy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Engineering & Financial Performance Panel */}
            <div className="lg:col-span-6">
              <div className="bg-[#0B0F17] rounded-3xl border border-slate-800/70 p-6 sm:p-8 space-y-7">
                <div className="flex items-center justify-between border-b border-slate-800/70 pb-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 block">
                      Engineering Performance
                    </span>
                    <h3 className="font-display text-xl font-semibold text-white">Built on measurable outcomes</h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 shrink-0 pl-4">
                    Tier-1 Certified
                  </span>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1">
                    <span className="font-display text-2xl font-semibold text-white block tabular-nums">99.4%</span>
                    <span className="text-xs text-slate-300 block">Generation efficiency</span>
                    <span className="text-[11px] text-slate-500 block">N-Type TOPCon PV cells</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-display text-2xl font-semibold text-emerald-400 block tabular-nums">3.2 yrs</span>
                    <span className="text-xs text-slate-300 block">Average ROI payback</span>
                    <span className="text-[11px] text-slate-500 block">With DISCOM net-metering</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-display text-2xl font-semibold text-white block tabular-nums">25 yrs</span>
                    <span className="text-xs text-slate-300 block">Performance warranty</span>
                    <span className="text-[11px] text-slate-500 block">Linear output protection</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-display text-2xl font-semibold text-amber-400 block tabular-nums">40%</span>
                    <span className="text-xs text-slate-300 block">Tax depreciation</span>
                    <span className="text-[11px] text-slate-500 block">Accelerated commercial benefit</span>
                  </div>
                </div>

                {/* Key Engineering Pillars List */}
                <div className="space-y-4 pt-1 border-t border-slate-800/70">
                  <div className="flex items-start gap-3 pt-5">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Geographic 3D roof modeling</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-light mt-0.5">
                        Every property is mapped using high-resolution satellite imagery and shadow vector tracing to optimize azimuth tilt and panel layout.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Turnkey DISCOM net-metering</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-light mt-0.5">
                        Complete statutory regulatory approvals, bi-directional ABT meter synchronization, and DISCOM grid interconnection.
                      </p>
                    </div>
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
          
          {/* Ambient Depth: neutral vignette + faint blueprint grid (no colored glow blobs / motion lines) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/60 to-[#0B0F17]" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 w-[900px] h-[560px] rounded-full bg-slate-800/25 blur-[120px]"
              style={{
                transform: `translate(-50%, -50%) translateX(${(0.5 - solutionsProgress) * -30}vw)`,
                willChange: 'transform',
              }}
            />
          </div>

          {/* Giant Index Numeral — crossfades with the active story, giving the scene
              a sense of chapter/depth behind the cards rather than a flat backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5] overflow-hidden">
            {SOLUTIONS_STORIES.map((story, idx) => {
              const distFromActive = Math.abs(idx - solutionsProgress * 2);
              const numOpacity = Math.max(0, 1 - distFromActive * 1.4) * 0.06;
              return (
                <span
                  key={story.type}
                  className="absolute font-display text-[38vw] leading-none font-bold text-white select-none"
                  style={{ opacity: numOpacity, willChange: 'opacity' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
              );
            })}
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
                  onClick={() => !isCentral && jumpToSolutionStory(idx)}
                  className={`absolute left-1/2 top-1/2 w-[88vw] max-w-[920px] ${
                    !isCentral ? 'cursor-pointer' : ''
                  }`}
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
                      className="w-full md:w-5/12 lg:w-1/2 aspect-[4/3] md:h-[270px] lg:h-[310px] relative rounded-2xl overflow-hidden shrink-0 border border-slate-700/50 shadow-inner"
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
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                      {/* Capacity Spec Chip */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white tracking-wide">
                        <story.icon className="w-3 h-3 text-amber-400" />
                        <span>{story.range}</span>
                      </div>
                    </div>

                    {/* RIGHT SIDE — CONTENT WITH MICRO-PARALLAX */}
                    <div
                      className="w-full md:w-7/12 lg:w-1/2 space-y-3.5 text-left"
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

                      <div className="flex items-center gap-4 pt-1.5">
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
                        <div className="shrink-0">
                          <span className="font-display text-xl lg:text-2xl font-semibold text-white block leading-none tabular-nums">
                            {story.statValue}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{story.statLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solutions Scene Progress Indicator — clickable, numbered index nav */}
          <div className="flex flex-col items-center gap-2.5 relative z-30 pb-3 shrink-0 max-w-md mx-auto w-full px-6">
            <div className="flex items-center justify-between w-full text-[11px] font-semibold uppercase tracking-[0.15em]">
              {SOLUTIONS_STORIES.map((story, idx) => {
                const label = ['Residential', 'Commercial', 'Industrial'][idx];
                const isActive = solutionsStep === idx;
                return (
                  <button
                    key={story.type}
                    onClick={() => jumpToSolutionStory(idx)}
                    className={`flex items-center gap-1.5 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className={isActive ? 'text-amber-400' : 'text-slate-600'}>{String(idx + 1).padStart(2, '0')}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-amber-400 rounded-full"
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
      <section ref={plantSectionRef} className="relative w-full h-[360vh] bg-[#0B0F17] snap-major-scene">
        {/* Sticky Viewport Container (100vh full viewport) */}
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-6 bg-[#0B0F17] relative">
          
          {/* Full-Screen Video Background for "Inside a Solar Plant" (Bright & High Visibility) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0F17]">
            <video
              ref={plantVideoRef}
              src="/videos/backgroundvid1.mp4"
              muted
              playsInline
              loop={false}
              className="w-full h-full object-cover filter brightness-90 contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17]/60 via-transparent to-[#0B0F17]/60" />
            <div className="absolute inset-0 bg-black/15" />
          </div>

          {/* Main 2-Column Desktop Grid Layout (Guarantees Text Safe Zone vs Visual Stage) */}
          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1 grid grid-cols-12 gap-8 items-center relative z-20 my-auto">

            {/* LEFT 5-COL: Dedicated Text Safe Zone (Title + Stage Info + Description + Specs) */}
            <div className="col-span-12 lg:col-span-5 space-y-6 text-left shrink-0">

              {/* Section Eyebrow */}
              <div className="flex items-center gap-2.5 text-amber-400 text-xs font-mono font-bold uppercase tracking-[0.2em]">
                <span className="w-5 h-0.5 bg-amber-400 rounded-full" />
                <span>Inside a Solar Plant</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">
                See how sunlight becomes power.
              </h2>

              {/* Active Stage Header & Badge */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                    STAGE {PLANT_STAGES[plantStageIdx].code} / 05
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {PLANT_STAGES[plantStageIdx].detailBadge}
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {PLANT_STAGES[plantStageIdx].title}
                </h3>
              </div>

              {/* Stage Concise Description */}
              <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed bg-slate-950/45 p-5 rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-md transition-all duration-500">
                {PLANT_STAGES[plantStageIdx].desc}
              </p>

              {/* Active Stage Specs Pill List */}
              <div className="bg-slate-950/45 border border-slate-700/50 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  TECHNICAL SPECIFICATIONS & INFRASTRUCTURE
                </span>
                <div className="space-y-1.5">
                  {PLANT_STAGES[plantStageIdx].specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT 7-COL: Seamless Integrated Stage Visual & Journey Nodes */}
            <div className="col-span-12 lg:col-span-7 relative flex flex-col justify-between bg-[#0B0F17]/80 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-auto overflow-hidden space-y-6">
              
              {/* Ambient Background Glow behind active stage */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] transition-all duration-700" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>

              {/* Active Stage Cinematic Visual Frame — all 5 stage images are
                  stacked and cross-faded by scroll position (plantStagePos),
                  instead of hard-swapping the src at each threshold, so the
                  visual tracks the scrollbar continuously like the Solutions
                  conveyor above. */}
              <div className="relative w-full aspect-[16/9] sm:h-[250px] lg:h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 group">
                {PLANT_STAGES.map((stg, idx) => (
                  <Image
                    key={stg.id}
                    src={stg.image}
                    alt={stg.name}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center filter brightness-105 contrast-105"
                    style={{ opacity: Math.max(0, 1 - Math.abs(plantStagePos - idx)), willChange: 'opacity' }}
                  />
                ))}

                {/* Dark Gradient Vignette Overlay to blend image edges into glass panel */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/40 via-transparent to-transparent pointer-events-none" />

                {/* Stage Indicator Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F17]/80 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>{PLANT_STAGES[plantStageIdx].code} — {PLANT_STAGES[plantStageIdx].subtitle.toUpperCase()}</span>
                </div>

                {/* Stage Title Overlay on image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest block font-semibold">STAGE INFRASTRUCTURE</span>
                    <h4 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">
                      {PLANT_STAGES[plantStageIdx].name}
                    </h4>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                    <span>EFFICIENCY OPTIMIZED</span>
                  </div>
                </div>
              </div>

              {/* 5 Horizontal Connected Stage Nodes */}
              <div className="relative z-10 space-y-3">
                {/* Flow Connecting Line */}
                <div className="relative flex items-center justify-between">
                  <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-white/10 -translate-y-1/2 pointer-events-none z-0">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                      style={{ width: `${(plantStagePos / 4) * 100}%` }}
                    />
                  </div>

                  {/* 5 Stage Discs */}
                  <div className="w-full grid grid-cols-5 gap-2 sm:gap-3 relative z-10">
                    {PLANT_STAGES.map((stg, idx) => {
                      const isActive = idx === plantStageIdx;
                      const IconComp = stg.icon;
                      return (
                        <button
                          key={stg.id}
                          onClick={() => jumpToPlantStage(idx)}
                          className={`group flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-2xl transition-all duration-500 relative select-none ${
                            isActive
                              ? 'bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] -translate-y-1'
                              : 'bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10'
                          }`}
                        >
                          {/* Thumbnail Disc Container with smooth gradient mask */}
                          <div className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border transition-all duration-500 ${
                            isActive ? 'border-amber-400 shadow-md' : 'border-white/10 opacity-70 group-hover:opacity-100'
                          }`}>
                            <Image
                              src={stg.image}
                              alt={stg.name}
                              fill
                              sizes="60px"
                              className={`object-cover transition-all duration-500 ${
                                isActive ? 'scale-110 brightness-110' : 'scale-100 group-hover:scale-105'
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/80 via-transparent to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                              <IconComp className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                                isActive ? 'text-amber-400' : 'text-white/80 group-hover:text-amber-300'
                              }`} />
                            </div>
                          </div>

                          {/* Stage Code & Label */}
                          <div className="text-center space-y-0.5">
                            <span className={`text-[9px] font-mono font-bold block ${
                              isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                            }`}>
                              {stg.code}
                            </span>
                            <span className={`text-[10px] sm:text-xs font-bold tracking-tight block truncate max-w-[55px] sm:max-w-[75px] ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            }`}>
                              {stg.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continuous 5-Stage Journey Progress Navigation Bar */}
          <div className="max-w-4xl mx-auto w-full px-6 pt-3 pb-1 relative z-30 shrink-0">
            <div className="flex items-center justify-between bg-slate-950/50 border border-slate-700/50 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
              {PLANT_STAGES.map((stage, idx) => {
                const isSelected = idx === plantStageIdx;
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => jumpToPlantStage(idx)}
                    className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold tracking-wider ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{stage.code} {stage.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 7 — SOLAR CALCULATOR & PROPOSAL REQUEST */}
      <section className="relative py-20 bg-[#0F172A] text-slate-100 border-t border-slate-800/80 snap-natural overflow-hidden">
        {/* Same engineering-blueprint atmosphere used in the Editorial section —
            faint grid + a soft amber glow anchored behind the estimator panel. */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#0B0F17]/90 rounded-3xl p-8 sm:p-12 border border-slate-800/70 shadow-2xl shadow-black/40">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Financial ROI Estimator</span>
              </div>
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

                {/* Live Capacity Gauge + Stat Readout — the ring fills in real time
                    as the slider moves, giving the estimator a genuine "instrument"
                    feel instead of a static number grid. Pure SVG stroke-dashoffset,
                    GPU-cheap, no extra libraries. */}
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 bg-[#131B2E] p-5 rounded-2xl border border-slate-800/70">
                  <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="7" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1, (quickBill - 5000) / (250000 - 5000)))}
                        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-xl sm:text-2xl font-semibold text-white tabular-nums leading-none">
                        {quickCalc.recommendedCapacityKw}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1">kWp system</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 sm:gap-y-3.5 text-xs flex-1 min-w-0 w-full">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        <span>Annual Savings</span>
                      </div>
                      <span className="text-base font-semibold text-emerald-400 tabular-nums">₹{formatIndianNumber(quickCalc.annualSavingsEst)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>Subsidy / Benefit</span>
                      </div>
                      <span className="text-base font-semibold text-amber-400 tabular-nums">₹{formatIndianNumber(quickCalc.subsidyEstimate)}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Payback Horizon</span>
                      </div>
                      <span className="text-base font-semibold text-white tabular-nums">{quickCalc.paybackPeriodYears} Years</span>
                    </div>
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
            className="object-cover object-center filter brightness-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-black/60 to-[#070A10]" />
          {/* Same faint engineering-grid texture used throughout the page, for
              visual continuity right up to the last section. */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-9">
          <div className="space-y-6">
            <h2 className="font-display text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-tight">
              Let's build a cleaner energy future.
            </h2>
            <p className="text-slate-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Partner with <strong className="text-white font-semibold">nitish solar</strong> to transition your home, enterprise, or industrial complex to turnkey solar power.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/quote">
              <Button
                variant="accent"
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-10 py-5 rounded-lg text-base sm:text-lg transition-all border-0 hover:scale-[1.02]"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get a Quote
              </Button>
            </Link>
            <p className="text-xs text-slate-400">Free site assessment. No obligation.</p>
          </div>

          {/* Closing Value Strip — what we actually commit to, not invented
              numbers. A connected row echoing the "energy flowing through the
              system" motif: a line links each value, with a small light
              continuously travelling it, and the icons settle into place with
              a staggered reveal the first time this comes into view. */}
          <div ref={valueStripRef} className="pt-8 max-w-3xl mx-auto border-t border-white/10">
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 pt-8">
              <div className="hidden sm:block absolute top-[42px] left-[12.5%] right-[12.5%] h-px bg-white/10">
                <div className="relative w-full h-full">
                  <div className="animate-value-flow absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(251,191,36,0.45)]" />
                </div>
              </div>
              {VALUE_PROPS.map((item, i) => (
                <div
                  key={item.label}
                  className={`relative flex flex-col items-center gap-2 text-center transition-all duration-700 ease-out ${
                    valueStripInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <span className="relative z-10 w-11 h-11 rounded-full bg-[#0F172A] border border-white/15 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-amber-400" />
                  </span>
                  <span className="text-xs font-semibold text-white leading-tight">{item.label}</span>
                  <span className="text-[11px] text-slate-400 leading-snug hidden sm:block">{item.desc}</span>
                </div>
              ))}
            </div>
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
