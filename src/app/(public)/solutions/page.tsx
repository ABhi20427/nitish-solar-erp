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
    <div className="min-h-screen flex flex-col bg-white text-[#111827] font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Header Banner */}
      <section className="bg-[#F5F6F3] text-[#111827] py-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-xs">
            Turnkey Engineering Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111827]">
            Solar Solutions by nitish solar
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base font-light leading-relaxed">
            From residential rooftops under national subsidy schemes to multi-megawatt industrial captive plants, explore our turnkey solar energy solutions.
          </p>
        </div>
      </section>

      {/* Main Solutions Overview Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        {/* Residential */}
        <div id="residential" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-brand-purple/40 transition-all">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100">
              <Home className="w-4 h-4" /> Residential Solar Rooftop (3 kW - 15 kW)
            </div>
            <h2 className="text-3xl font-bold text-[#111827]">Residential Solar Solutions by nitish solar</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              Transform your home terrace into a solar power station. Our residential packages include high-efficiency 540W N-type TOPCon panels, bi-directional net meters, hot-dip galvanized mounting structures, and complete DISCOM approval documentation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Central Govt Subsidy up to ₹78,000</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 90% Electricity Bill Reduction</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 25-Year Linear Panel Performance Guarantee</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Mobile App Generation Telemetry</div>
            </div>
            <div className="pt-2">
              <Link href="/residential">
                <Button variant="accent" className="bg-brand-dark text-white font-bold hover:bg-slate-900 px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Residential Solar
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/residential_light.png"
              alt="nitish solar residential solar rooftop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Commercial */}
        <div id="commercial" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-brand-blue/40 transition-all">
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md order-2 lg:order-1">
            <Image
              src="/images/industrial_light.png"
              alt="nitish solar commercial rooftop array"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              <Building2 className="w-4 h-4" /> Commercial Buildings & Offices (20 kW - 250 kW)
            </div>
            <h2 className="text-3xl font-bold text-[#111827]">Commercial Solar Solutions by nitish solar</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              Drastically cut operating expenses for office complexes, hospitals, private schools, and retail hubs. Capitalize on 40% accelerated tax depreciation and achieve complete financial payback within 3.5 years.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> 40% Accelerated Tax Depreciation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> CapEx & PPA Financial Models</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Non-Penetrative Ballast Frames</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Statutory CEIG Electrical Safety Compliance</div>
            </div>
            <div className="pt-2">
              <Link href="/commercial">
                <Button variant="accent" className="bg-brand-dark text-white font-bold hover:bg-slate-900 px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Commercial Solar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Industrial */}
        <div id="industrial" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-brand-purple/40 transition-all">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100">
              <Factory className="w-4 h-4" /> Industrial Captive Power Plants (500 kW - 10 MW)
            </div>
            <h2 className="text-3xl font-bold text-[#111827]">Industrial Solar Solutions by nitish solar</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              High-capacity solar installations designed for heavy manufacturing facilities, textile mills, cold storages, and automotive factories. Bifacial glass-glass solar panels combined with 11kV/33kV high tension grid synchronization.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Up to 25% Bifacial Gain</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> SCADA Remote Telemetry Systems</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> 11kV / 33kV Substation Interconnection</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Dedicated 24/7 O&M Technical Support</div>
            </div>
            <div className="pt-2">
              <Link href="/industrial">
                <Button variant="accent" className="bg-brand-dark text-white font-bold hover:bg-slate-900 px-6 py-3" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Industrial Solar
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/hero_light.png"
              alt="nitish solar industrial mega solar farm"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
