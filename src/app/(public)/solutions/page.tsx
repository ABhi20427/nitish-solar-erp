'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Home, Building2, Factory, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function SolutionsPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Header Banner */}
      <section className="bg-[#070A10] text-white py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-[#131B2E] px-4 py-1.5 rounded-full border border-slate-800 shadow-sm">
            Turnkey Engineering Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Solar Solutions by nitish solar
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base font-light leading-relaxed">
            From residential rooftops under national subsidy schemes to multi-megawatt industrial captive plants, explore our turnkey solar energy solutions.
          </p>
        </div>
      </section>

      {/* Main Solutions Overview Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        {/* Residential */}
        <div id="residential" className="bg-[#131B2E] rounded-3xl border border-slate-800/80 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-amber-400/40 transition-all">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/30">
              <Home className="w-4 h-4" /> Residential Solar Rooftop (3 kW - 15 kW)
            </div>
            <h2 className="text-3xl font-bold text-white">Residential Solar Solutions by nitish solar</h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Transform your home terrace into a solar power station. Our residential packages include high-efficiency 540W N-type TOPCon panels, bi-directional net meters, hot-dip galvanized mounting structures, and complete DISCOM approval documentation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-light">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Central Govt Subsidy up to ₹78,000</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Up to 90% Electricity Bill Reduction</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 25-Year Linear Panel Performance Guarantee</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Mobile App Generation Telemetry</div>
            </div>
            <div className="pt-2">
              <Link href="/residential">
                <Button variant="accent" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Residential Solar
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
            <Image
              src="/images/residential_light.png"
              alt="nitish solar residential solar rooftop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover filter brightness-95"
            />
          </div>
        </div>

        {/* Commercial */}
        <div id="commercial" className="bg-[#131B2E] rounded-3xl border border-slate-800/80 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-amber-400/40 transition-all">
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 order-2 lg:order-1">
            <Image
              src="/images/industrial_light.png"
              alt="nitish solar commercial rooftop array"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover filter brightness-95"
            />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/30">
              <Building2 className="w-4 h-4" /> Commercial Buildings & Offices (20 kW - 250 kW)
            </div>
            <h2 className="text-3xl font-bold text-white">Commercial Solar Solutions by nitish solar</h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Drastically cut operating expenses for office complexes, hospitals, private schools, and retail hubs. Capitalize on 40% accelerated tax depreciation and achieve complete financial payback within 3.5 years.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-light">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 40% Accelerated Tax Depreciation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> CapEx & PPA Financial Models</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Non-Penetrative Ballast Frames</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Statutory CEIG Electrical Safety Compliance</div>
            </div>
            <div className="pt-2">
              <Link href="/commercial">
                <Button variant="accent" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Commercial Solar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Industrial */}
        <div id="industrial" className="bg-[#131B2E] rounded-3xl border border-slate-800/80 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-amber-400/40 transition-all">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/30">
              <Factory className="w-4 h-4" /> Industrial Captive Power Plants (500 kW - 10 MW)
            </div>
            <h2 className="text-3xl font-bold text-white">Industrial Solar Solutions by nitish solar</h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              High-capacity solar installations designed for heavy manufacturing facilities, textile mills, cold storages, and automotive factories. Bifacial glass-glass solar panels combined with 11kV/33kV high tension grid synchronization.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-light">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Up to 25% Bifacial Gain</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> SCADA Remote Telemetry Systems</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 11kV / 33kV Substation Interconnection</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Dedicated 24/7 O&M Technical Support</div>
            </div>
            <div className="pt-2">
              <Link href="/industrial">
                <Button variant="accent" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Industrial Solar
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
            <Image
              src="/images/hero_light.png"
              alt="nitish solar industrial mega solar farm"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover filter brightness-95"
            />
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
