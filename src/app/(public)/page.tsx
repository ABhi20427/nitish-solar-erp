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
} from 'lucide-react';

const TRUST_INDICATORS = [
  { val: '1,250+', label: 'Projects Delivered', desc: 'Turnkey rooftop and ground-mount installations across India.' },
  { val: '450+ MWp', label: 'Installed Solar Capacity', desc: 'High-power utility and commercial grid-tie solar systems.' },
  { val: '3,800+', label: 'Satisfied Clients', desc: 'Homeowners, corporate enterprises, and industrial facilities.' },
  { val: '12+ Years', label: 'Engineering Experience', desc: 'Pioneering solar EPC excellence and DISCOM net metering.' },
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
  const [projectsStep, setProjectsStep] = useState(0);
  const [impactStep, setImpactStep] = useState(0);

  // Section Refs
  const solutionsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
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

          // 2. Impact Scroll Progress
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

                  <div className="bg-[#131B2E]/95 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 lg:p-7 shadow-2xl shadow-black/90 flex flex-col md:flex-row items-center gap-6 lg:gap-8 group relative z-20">
                    {/* LEFT SIDE — PHOTO */}
                    <div className="w-full md:w-5/12 lg:w-1/2 aspect-[4/3] md:h-[270px] lg:h-[310px] relative rounded-2xl overflow-hidden shrink-0 border border-slate-700/50 shadow-inner">
                      <Image
                        src={story.image}
                        alt={story.heading}
                        fill
                        sizes="(max-width: 1024px) 50vw, 45vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 saturate-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* RIGHT SIDE — CONTENT */}
                    <div className="w-full md:w-7/12 lg:w-1/2 space-y-3.5 text-left">
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

          {/* Section Card Dots Indicator */}
          <div className="flex justify-center items-center gap-3 relative z-30 pb-2 shrink-0">
            {SOLUTIONS_STORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (solutionsRef.current) {
                    const totalDist = solutionsRef.current.offsetHeight - window.innerHeight;
                    const targetProgress = idx / 2;
                    const targetScrollTop = solutionsRef.current.offsetTop + targetProgress * totalDist;
                    window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                  }
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  solutionsStep === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to Card ${idx + 1}`}
              />
            ))}
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

      {/* 4. SECTION 4 — WHY NITISH SOLAR (CORPORATE STATEMENT) */}
      <section className="py-20 bg-[#131B2E] text-slate-100 border-t border-slate-800/80 relative overflow-hidden snap-natural">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">Corporate Engineering Standard</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engineered for Maximum Yield. Built to Last Generations.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light">
              We combine electrical engineering rigor, Tier-1 hardware procurement, and continuous digital telemetry to deliver long-term power security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Turnkey Engineering',
                desc: 'Custom 3D shadow analysis, string inverter sizing, and structural tilt calculations tailored to local wind loads.',
                icon: Shield,
              },
              {
                title: 'Tier-1 Components',
                desc: 'Strict procurement of certified Mono PERC and N-type TOPCon solar panels with 25-30 year linear warranties.',
                icon: Award,
              },
              {
                title: 'Grid Synchronized',
                desc: 'Seamless DISCOM utility net-metering setup, bi-directional meter installation, and statutory safety approvals.',
                icon: Activity,
              },
              {
                title: 'Lifetime Telemetry',
                desc: '24/7 cloud IoT generation tracking, automated alert diagnostics, and preventive maintenance support.',
                icon: Zap,
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="bg-[#0F172A] p-6 sm:p-8 rounded-2xl border border-slate-800/80 space-y-4 hover:border-amber-400/40 transition-all duration-300 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center border border-slate-800 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SECTION 5 — PROJECTS (COMPACT 135VH PINNED CINEMATIC SCROLL) */}
      <section ref={projectsRef} className="relative h-[135vh] bg-[#0B0F17]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Background Images Crossfade */}
          <div className="absolute inset-0 z-0">
            {PROJECT_STORIES.map((proj, idx) => (
              <div
                key={proj.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${projectsStep === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center filter brightness-75 scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-black/50 to-transparent" />
              </div>
            ))}
          </div>

          {/* Sticky Foreground Content Story Overlay */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
            {PROJECT_STORIES.map((proj, idx) => {
              const isActive = projectsStep === idx;
              return (
                <div
                  key={proj.title}
                  className={`transition-all duration-700 ease-out max-w-2xl space-y-4 ${isActive ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-6 absolute pointer-events-none'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-widest border border-slate-700/80">
                      Project Showcase 0{idx + 1}
                    </span>
                    <span className="text-amber-400 font-bold text-sm font-mono">{proj.capacity}</span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {proj.title}
                  </h3>

                  <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">{proj.location}</p>

                  <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                    {proj.desc}
                  </p>

                  <div className="pt-2">
                    <Link href="/projects">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-700 bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-800 font-semibold px-6 py-3 rounded-xl text-sm"
                        icon={<ArrowUpRight className="w-4 h-4 text-amber-400" />}
                      >
                        Explore Project Portfolio
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
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
