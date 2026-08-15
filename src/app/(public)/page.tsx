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
  });

  const quickCalc = calculateSolarSystem({ monthlyBillAmount: quickBill });

  // Dynamic Scroll progress handler - recalculates based on actual section scroll distance
  useEffect(() => {
    const handleScroll = () => {
      // 1. Solutions Scroll Progress (3 stories mapped over 180vh)
      if (solutionsRef.current) {
        const rect = solutionsRef.current.getBoundingClientRect();
        const totalDist = solutionsRef.current.offsetHeight - window.innerHeight;
        if (totalDist > 0) {
          const progress = Math.max(0, Math.min(0.99, -rect.top / totalDist));
          let nextStep = 0;
          if (progress < 0.35) nextStep = 0;
          else if (progress < 0.7) nextStep = 1;
          else nextStep = 2;

          setSolutionsStep((prev) => (prev !== nextStep ? nextStep : prev));
        }
      }

      // 2. Projects Scroll Progress (3 stories mapped over 170vh)
      if (projectsRef.current) {
        const rect = projectsRef.current.getBoundingClientRect();
        const totalDist = projectsRef.current.offsetHeight - window.innerHeight;
        if (totalDist > 0) {
          const progress = Math.max(0, Math.min(0.99, -rect.top / totalDist));
          let nextStep = 0;
          if (progress < 0.35) nextStep = 0;
          else if (progress < 0.7) nextStep = 1;
          else nextStep = 2;

          setProjectsStep((prev) => (prev !== nextStep ? nextStep : prev));
        }
      }

      // 3. Impact Scroll Progress (4 steps mapped over 150vh)
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    addLead({
      fullName: leadForm.name,
      companyName: leadForm.company,
      phone: leadForm.phone,
      email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerType: leadForm.propertyType,
      monthlyBillAmount: Number(leadForm.monthlyBill),
      city: leadForm.location || 'Pune',
      state: 'Maharashtra',
      address: 'Web Inquiry Location',
      proposedCapacityKw: Number(leadForm.requiredCapacity) || quickCalc.recommendedCapacityKw,
      notes: leadForm.message || `Lead request submitted to nitish solar website homepage.`,
      source: 'nitish solar Homepage Form',
      priority: 'HIGH',
    });

    setFormSubmitted(true);
  };

  // Solutions Stories Data
  const SOLUTIONS_STORIES = [
    {
      type: 'RESIDENTIAL SOLAR',
      heading: 'Solar designed around the way you live.',
      desc: 'Rooftop solar installations for luxury homes and housing societies. Reduce monthly electricity bills by up to 90% while benefiting from PM Surya Ghar government subsidy support.',
      image: '/images/residential_light.png',
      link: '/residential',
      bullets: ['Net metering & DISCOM approval assistance', '25-Year linear module performance warranty', 'Smart mobile app generation telemetry'],
      icon: HomeIcon,
    },
    {
      type: 'COMMERCIAL SOLAR INFRASTRUCTURE',
      heading: 'Energy infrastructure built for business.',
      desc: 'Engineered for commercial office buildings, hospitals, hotels, schools, and shopping complexes. Slash operational electricity overheads and capitalize on 40% accelerated tax depreciation.',
      image: '/images/industrial_light.png',
      link: '/commercial',
      bullets: ['40% Accelerated tax depreciation benefit', 'Non-penetrative ballast mounting structures', 'High financial return on investment (IRR)'],
      icon: Building2,
    },
    {
      type: 'INDUSTRIAL & UTILITY MEGA PROJECTS',
      heading: 'Engineered for scale and performance.',
      desc: 'For factories, manufacturing plants, cold storage units, and megawatt solar farms. High-power bifacial N-type TOPCon modules engineered for heavy 24/7 industrial loads.',
      image: '/images/hero_light.png',
      link: '/industrial',
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
    <div className="min-h-screen flex flex-col bg-white text-[#111827] selection:bg-brand-purple selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Dynamic Scroll Navigation Header */}
      <PublicNavbar transparentOverlay lightTheme onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* 1. HERO BACKGROUND (100VH CINEMATIC PHOTOGRAPH) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Full-bleed Daylight Solar Infrastructure Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar bright solar energy infrastructure"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter contrast-105 saturate-105"
          />
          {/* Subtle localized dark gradient behind text ONLY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Generation Clean Energy Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
              Powering India’s Transition to <span className="text-amber-400">Clean Solar Energy</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-100 font-light leading-relaxed max-w-2xl drop-shadow-sm">
              <strong className="text-white font-semibold">nitish solar</strong> delivers turnkey solar infrastructure, smart energy storage, and high-efficiency rooftop systems for homes, commercial enterprises, and industrial complexes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/solutions">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-white text-navy-950 hover:bg-amber-400 hover:text-navy-950 font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 group border-0 text-base"
                  icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                >
                  Explore Solutions
                </Button>
              </Link>
              <Link href="/quote">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-black/30 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/70 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-base"
                >
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-200 text-xs font-medium drop-shadow-md">
          <span className="uppercase tracking-widest text-[10px]">Scroll for Visual Journey</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
        </div>
      </section>

      {/* 2. SECTION 2 — EDITORIAL INTRODUCTION ("Energy that works for tomorrow.") */}
      <section className="py-20 bg-white text-[#111827] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Large Editorial Statement */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple block">
                Editorial Overview
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111827] leading-tight">
                Energy that works for tomorrow.
              </h2>
              <p className="text-slate-700 text-base sm:text-lg font-light leading-relaxed">
                At <strong className="text-[#111827] font-semibold">nitish solar</strong>, we believe energy infrastructure should be built on uncompromised engineering precision, high-efficiency solar modules, and transparent financial returns.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Whether deploying residential rooftop solar installations, commercial net-metered arrays, or utility-scale megawatt projects, our end-to-end EPC workflow ensures optimal tilt geometry, 3D shadow modeling, DISCOM grid synchronization, and 30-year linear performance guarantees.
              </p>
              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-brand-purple hover:text-brand-blue transition-colors group">
                  <span>Discover nitish solar's Engineering Philosophy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="/images/industrial_light.png"
                    alt="nitish solar architectural engineering"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest block">Industrial Rooftop Installation</span>
                    <p className="text-sm font-bold">1.2 MWp High-Efficiency Bifacial Solar System • Pune MIDC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3 — SOLAR SOLUTIONS (COMPACT 145VH PINNED CINEMATIC STORYTELLING) */}
      <section ref={solutionsRef} className="relative h-[145vh] bg-[#F5F6F3]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Background Images Crossfade */}
          <div className="absolute inset-0 z-0">
            {SOLUTIONS_STORIES.map((story, idx) => (
              <div
                key={story.type}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  solutionsStep === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={story.image}
                  alt={story.heading}
                  fill
                  sizes="100vw"
                  className="object-cover object-center filter brightness-90 scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
              </div>
            ))}
          </div>

          {/* Sticky Foreground Content Story Overlay */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
            {SOLUTIONS_STORIES.map((story, idx) => {
              const Icon = story.icon;
              const isActive = solutionsStep === idx;
              return (
                <div
                  key={story.type}
                  className={`transition-all duration-700 ease-out max-w-2xl space-y-6 ${
                    isActive ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-6 absolute pointer-events-none'
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
                    <Icon className="w-4 h-4" />
                    <span>Story 0{idx + 1} — {story.type}</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {story.heading}
                  </h2>

                  <p className="text-slate-200 text-sm sm:text-lg font-light leading-relaxed drop-shadow-sm">
                    {story.desc}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-200 pt-2">
                    {story.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link href={story.link}>
                      <Button
                        variant="accent"
                        size="lg"
                        className="bg-white text-navy-950 hover:bg-amber-400 font-bold px-8 py-3 rounded-xl text-sm shadow-xl transition-all border-0"
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Explore {story.type.split(' ')[0]} Solar
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Story Navigation Indicator Dots */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
              {SOLUTIONS_STORIES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSolutionsStep(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    solutionsStep === idx ? 'bg-amber-400 scale-125 ring-4 ring-white/20' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Go to Story ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 4 — WHY NITISH SOLAR (CORPORATE STATEMENT) — PURE WHITE */}
      <section className="py-20 bg-white text-[#111827] border-t border-slate-200/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple block">Corporate Engineering Standard</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">
              Engineered for Maximum Yield. Built to Last Generations.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-light">
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
                <div key={pillar.title} className="bg-[#F5F6F3] p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:border-brand-purple/40 transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-white text-brand-purple flex items-center justify-center border border-slate-200 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827]">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SECTION 5 — PROJECTS (COMPACT 135VH PINNED CINEMATIC SCROLL) */}
      <section ref={projectsRef} className="relative h-[135vh] bg-[#ECEEEA]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Background Images Crossfade */}
          <div className="absolute inset-0 z-0">
            {PROJECT_STORIES.map((proj, idx) => (
              <div
                key={proj.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  projectsStep === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center filter brightness-85 scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
                  className={`transition-all duration-700 ease-out max-w-2xl space-y-4 ${
                    isActive ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-6 absolute pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-widest border border-white/20">
                      Project Showcase 0{idx + 1}
                    </span>
                    <span className="text-amber-400 font-bold text-sm font-mono">{proj.capacity}</span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {proj.title}
                  </h3>

                  <p className="text-amber-300 font-mono text-xs uppercase tracking-widest">{proj.location}</p>

                  <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                    {proj.desc}
                  </p>

                  <div className="pt-2">
                    <Link href="/projects">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/40 bg-black/30 backdrop-blur-md text-white hover:bg-white/20 font-semibold px-6 py-3 rounded-xl text-sm"
                        icon={<ArrowUpRight className="w-4 h-4" />}
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

      {/* 6. SECTION 6 — IMPACT SECTION (COMPACT 120VH PINNED PROGRESSIVE NUMBERS) */}
      <section ref={impactRef} className="relative h-[120vh] bg-black text-white">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero_light.png"
              alt="nitish solar energy impact"
              fill
              sizes="100vw"
              className="object-cover object-center filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/80" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-6">Proved Turnkey Track Record</span>
            {TRUST_INDICATORS.map((metric, idx) => {
              const isActive = impactStep === idx;
              return (
                <div
                  key={metric.label}
                  className={`transition-all duration-700 ease-out space-y-4 ${
                    isActive ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute pointer-events-none'
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

      {/* 7. SECTION 7 — SOLAR CALCULATOR & PROPOSAL REQUEST — PURE WHITE */}
      <section className="py-20 bg-white text-[#111827] border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#F5F6F3] rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple block">Financial ROI Estimator</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                See what solar can do for your facility.
              </h2>
              <p className="text-slate-600 text-sm font-light leading-relaxed">
                Adjust the interactive monthly electric bill slider to estimate system capacity sizing, annual financial savings, and subsidy eligibility for your <strong className="text-[#111827] font-semibold">nitish solar</strong> installation.
              </p>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-700">Monthly Electric Bill</span>
                    <span className="text-xl font-black text-brand-purple">₹{formatIndianNumber(quickBill)}</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={250000}
                    step={5000}
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
                  <div>
                    <span className="text-slate-500 block">Recommended Capacity:</span>
                    <span className="text-lg font-black text-[#111827]">{quickCalc.recommendedCapacityKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Est. Annual Savings:</span>
                    <span className="text-lg font-black text-emerald-600">₹{formatIndianNumber(quickCalc.annualSavingsEst)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Est. Subsidy / Benefit:</span>
                    <span className="text-sm font-bold text-brand-purple">₹{formatIndianNumber(quickCalc.subsidyEstimate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payback Horizon:</span>
                    <span className="text-sm font-bold text-[#111827]">{quickCalc.paybackPeriodYears} Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-purple" /> Request Custom System Proposal
              </h3>
              <p className="text-xs text-slate-500">
                Receive a detailed engineering quote proposal backed by site survey evaluation from <strong className="text-slate-800">nitish solar</strong>.
              </p>

              {formSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#111827] text-base">Request Received</h4>
                  <p className="text-xs text-slate-600">An engineer from nitish solar will contact you shortly.</p>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-800" onClick={() => setFormSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Patil"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] outline-none focus:border-brand-purple"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                      <select
                        value={leadForm.propertyType}
                        onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value as any })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] outline-none"
                      >
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="INDUSTRIAL">Industrial</option>
                        <option value="RESIDENTIAL">Residential</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    variant="accent"
                    type="submit"
                    className="w-full bg-brand-dark text-white font-bold hover:bg-slate-900 border-0 py-3 mt-2"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Submit Proposal Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 8 — FINAL CINEMATIC CONCLUSION CTA */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        {/* Full-width Daylight Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_light.png"
            alt="nitish solar clean energy future"
            fill
            sizes="100vw"
            className="object-cover object-center filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30" />
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
                className="bg-white text-navy-950 hover:bg-amber-400 font-bold px-8 py-4 rounded-xl text-base shadow-2xl transition-all border-0"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get a Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 bg-black/30 backdrop-blur-md text-white hover:bg-white/20 px-8 py-4 rounded-xl text-base font-semibold shadow-lg"
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
