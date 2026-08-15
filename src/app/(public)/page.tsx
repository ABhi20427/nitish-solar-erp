'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { useSolarStore } from '@/lib/store-context';
import {
  Sun,
  Zap,
  Building2,
  Factory,
  Home as HomeIcon,
  ShieldCheck,
  Award,
  TrendingUp,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Check,
  Send,
  ChevronDown,
  ArrowUpRight,
  Shield,
  Activity,
} from 'lucide-react';

const TRUST_INDICATORS = {
  projectsDelivered: '1,250+',
  installedCapacity: '450+ MWp',
  customersServed: '3,800+',
  yearsOfExperience: '12+ Years',
};

export default function HomePage() {
  const { addLead } = useSolarStore();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quickBill, setQuickBill] = useState(25000);
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white selection:bg-brand-purple selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Sophisticated Transparent Navigation Header */}
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* SECTION 1: DRAMATIC FULL-SCREEN CINEMATIC HERO (90-100vh) */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Full-bleed High-Resolution Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="nitish solar large-scale energy infrastructure"
            fill
            priority
            className="object-cover object-center scale-105 animate-pulse-subtle filter brightness-90"
          />
          {/* Subtle Dark Vignette & Gradient Overlay for Perfect Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-black/40" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0B0F19]/40 to-[#0B0F19]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Generation Clean Energy Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Powering India’s Transition to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">Clean Solar Energy</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
              <strong className="text-white font-semibold">nitish solar</strong> delivers turnkey solar infrastructure, smart energy storage, and high-efficiency rooftop systems for homes, commercial enterprises, and industrial complexes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/solutions">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-white text-navy-950 hover:bg-amber-400 hover:text-navy-950 font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 group"
                  icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                >
                  Explore Solutions
                </Button>
              </Link>
              <Link href="/quote">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/60 px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Get a Quote
                </Button>
              </Link>
            </div>

            {/* Subtle Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-white/15">
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">{TRUST_INDICATORS.installedCapacity}</span>
                <span className="text-xs text-slate-400 font-medium">Installed Capacity</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{TRUST_INDICATORS.projectsDelivered}</span>
                <span className="text-xs text-slate-400 font-medium">Projects Delivered</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white">{TRUST_INDICATORS.customersServed}</span>
                <span className="text-xs text-slate-400 font-medium">Satisfied Clients</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-slate-300">{TRUST_INDICATORS.yearsOfExperience}</span>
                <span className="text-xs text-slate-400 font-medium">Industry Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-400 text-xs font-medium">
          <span className="uppercase tracking-widest text-[10px]">Scroll to Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
        </div>
      </section>

      {/* SECTION 2: EDITORIAL INTRODUCTION ("Energy that works for tomorrow.") */}
      <section className="py-24 sm:py-32 bg-[#0B0F19] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Large Editorial Statement */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
                Editorial Overview
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Energy that works for tomorrow.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                At <strong className="text-white font-semibold">nitish solar</strong>, we believe energy infrastructure should be built on uncompromised engineering precision, high-efficiency solar modules, and transparent financial returns.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Whether deploying residential rooftop solar installations, commercial net-metered arrays, or utility-scale megawatt projects, our end-to-end EPC workflow ensures optimal tilt geometry, 3D shadow modeling, DISCOM grid synchronization, and 30-year linear performance guarantees.
              </p>
              <div className="pt-4">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-white transition-colors group">
                  <span>Discover nitish solar's Engineering Philosophy</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="/images/industrial.png"
                    alt="nitish solar architectural engineering"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
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

      {/* SECTION 3: IMMERSIVE SOLAR SOLUTIONS (Editorial Panels) */}
      <section className="py-24 bg-slate-950 text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">Turnkey Solar Solutions</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Tailored Systems for Every Property Segment
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light">
              From residential homes to commercial headquarters and manufacturing plants, explore customized solar installations engineered for maximum energy yield.
            </p>
          </div>

          {/* Large Editorial Visual Panels */}
          <div className="space-y-12">
            {/* Panel 1: Residential */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F172A] rounded-3xl border border-white/10 overflow-hidden hover:border-amber-400/50 transition-all duration-500 group">
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[320px]">
                <Image
                  src="/images/residential.png"
                  alt="nitish solar residential solar villa"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F172A] hidden lg:block" />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <HomeIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Residential Solar Systems</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  Rooftop solar solutions designed for luxury homes and housing societies. Cut monthly electricity bills by up to 90% while benefiting from PM Surya Ghar government subsidy support.
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Net metering & DISCOM approval assistance</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 25-Year linear module performance warranty</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Smart mobile app generation monitoring</li>
                </ul>
                <div className="pt-2">
                  <Link href="/residential" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-white transition-colors group/btn">
                    <span>Explore Residential Solar</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Panel 2: Commercial */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F172A] rounded-3xl border border-white/10 overflow-hidden hover:border-blue-400/50 transition-all duration-500 group">
              <div className="lg:col-span-5 p-8 sm:p-12 space-y-6 order-2 lg:order-1">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Commercial Solar Infrastructure</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  Engineered for commercial offices, hospitals, hotels, educational institutions, and shopping complexes. Reduce operational electricity overheads and take advantage of 40% accelerated tax depreciation.
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> 40% Accelerated tax depreciation benefit</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Non-penetrative ballast mounting frames</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> High financial internal rate of return (IRR)</li>
                </ul>
                <div className="pt-2">
                  <Link href="/commercial" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-white transition-colors group/btn">
                    <span>Explore Commercial Solar</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[320px] order-1 lg:order-2">
                <Image
                  src="/images/industrial.png"
                  alt="nitish solar commercial rooftop"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0F172A] hidden lg:block" />
              </div>
            </div>

            {/* Panel 3: Industrial */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F172A] rounded-3xl border border-white/10 overflow-hidden hover:border-purple-400/50 transition-all duration-500 group">
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[320px]">
                <Image
                  src="/images/hero.png"
                  alt="nitish solar industrial mega solar farm"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F172A] hidden lg:block" />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Industrial & Utility Mega Projects</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  For factories, manufacturing plants, cold storage facilities, and utility-scale solar farms. High-wattage bifacial N-type TOPCon modules engineered for continuous heavy industrial loads.
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 11kV / 33kV HT grid synchronization</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> High-power bifacial solar modules</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Open access & captive solar power procurement</li>
                </ul>
                <div className="pt-2">
                  <Link href="/industrial" className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-white transition-colors group/btn">
                    <span>Explore Industrial Solar</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY NITISH SOLAR (Corporate Statement) */}
      <section className="py-24 sm:py-32 bg-[#0B0F19] text-white border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">Corporate Engineering Standard</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engineered for Maximum Yield. Built to Last Generations.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light">
              We combine electrical engineering rigor, Tier-1 hardware procurement, and continuous digital telemetry to deliver long-term power security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <div key={pillar.title} className="bg-slate-900/60 p-8 rounded-2xl border border-white/10 space-y-4 hover:border-amber-400/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center border border-white/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: SELECTED PROJECTS PORTFOLIO */}
      <section className="py-24 bg-slate-950 text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">Project Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Featured Solar Infrastructure Executed by nitish solar
              </h2>
            </div>
            <Link href="/projects">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" icon={<ArrowRight className="w-4 h-4" />}>
                View All Projects
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '1.2 MWp Industrial Rooftop Installation',
                location: 'Chakan MIDC, Pune',
                size: '1,200 kWp',
                image: '/images/industrial.png',
                type: 'Industrial Project',
              },
              {
                title: '450 kWp Commercial HQ Rooftop System',
                location: 'GIDC, Ahmedabad',
                size: '450 kWp',
                image: '/images/hero.png',
                type: 'Commercial Project',
              },
              {
                title: '25 kWp Modern Luxury Villa System',
                location: 'Baner, Pune',
                size: '25 kWp',
                image: '/images/residential.png',
                type: 'Residential Project',
              },
            ].map((proj) => (
              <div key={proj.title} className="group rounded-2xl overflow-hidden border border-white/10 bg-[#0F172A] hover:border-amber-400/50 transition-all duration-500">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                    {proj.type}
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{proj.location}</span>
                    <span className="font-bold text-amber-400">{proj.size}</span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    {proj.title} <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: SOLAR CALCULATOR & CONVERSION SECTION */}
      <section className="py-24 bg-[#0B0F19] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/90 rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">Financial ROI Estimator</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                See what solar can do for your facility.
              </h2>
              <p className="text-slate-300 text-sm font-light leading-relaxed">
                Adjust the interactive monthly electric bill slider to estimate system capacity sizing, annual financial savings, and subsidy eligibility for your <strong className="text-white">nitish solar</strong> installation.
              </p>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-300">Monthly Electric Bill</span>
                    <span className="text-xl font-black text-amber-400">₹{quickBill.toLocaleString()}</span>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/50 p-4 rounded-2xl border border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block">Recommended Capacity:</span>
                    <span className="text-lg font-black text-white">{quickCalc.recommendedCapacityKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Annual Savings:</span>
                    <span className="text-lg font-black text-emerald-400">₹{quickCalc.annualSavingsEst.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Subsidy / Benefit:</span>
                    <span className="text-sm font-bold text-amber-400">₹{quickCalc.subsidyEstimate.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payback Horizon:</span>
                    <span className="text-sm font-bold text-white">{quickCalc.paybackPeriodYears} Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-6 bg-[#0F172A] p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" /> Request Custom System Proposal
              </h3>
              <p className="text-xs text-slate-400">
                Receive a detailed engineering quote proposal backed by site survey evaluation from <strong className="text-white">nitish solar</strong>.
              </p>

              {formSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Request Received</h4>
                  <p className="text-xs text-slate-300">An engineer from nitish solar will contact you shortly.</p>
                  <Button variant="outline" size="sm" className="border-white/20 text-white" onClick={() => setFormSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Patil"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
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
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
                      <select
                        value={leadForm.propertyType}
                        onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value as any })}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
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
                    className="w-full bg-amber-400 text-navy-950 font-bold hover:bg-amber-300 border-0 py-3 mt-2"
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

      {/* SECTION 7: FINAL CINEMATIC CONCLUSION CTA */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        {/* Full-width Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sunset.png"
            alt="nitish solar clean energy future"
            fill
            className="object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/70 to-black/50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Let’s build a cleaner energy future.
          </h2>
          <p className="text-slate-300 text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Partner with <strong className="text-white font-semibold">nitish solar</strong> to transition your home, enterprise, or industrial complex to turnkey solar power.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/quote">
              <Button
                variant="accent"
                size="lg"
                className="bg-amber-400 text-navy-950 hover:bg-amber-300 font-bold px-8 py-4 rounded-xl text-base shadow-2xl transition-all"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get a Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 px-8 py-4 rounded-xl text-base"
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
