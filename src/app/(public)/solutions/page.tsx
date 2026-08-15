'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Home, Building2, Factory, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SolutionsPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Header Banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Engineered Photovoltaic Systems
          </span>
          <h1 className="text-4xl font-black tracking-tight">Solar Solutions by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            From residential rooftops under national subsidy schemes to multi-megawatt industrial captive plants, explore our turnkey solar energy solutions.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Residential */}
        <div id="residential" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <Home className="w-4 h-4" /> Residential Solar Rooftop (3 kW - 15 kW)
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">Residential Solar Solutions by nitish solar</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transform your home terrace into a solar power station. Our residential packages include high-efficiency 540W N-type TOPCon panels, bi-directional net meters, hot-dip galvanized mounting structures, and complete DISCOM approval documentation.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Central Govt Subsidy up to ₹78,000</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Electricity Bill Reduction</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 25 Years Panel Warranty</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mobile App Solar Generation Monitoring</div>
            </div>
            <Link href="/residential">
              <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                Explore Residential Solar
              </Button>
            </Link>
          </div>
          <div className="lg:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600"
              alt="nitish solar residential"
              className="rounded-xl object-cover w-full h-64 shadow"
            />
          </div>
        </div>

        {/* Commercial */}
        <div id="commercial" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=600"
              alt="nitish solar commercial"
              className="rounded-xl object-cover w-full h-64 shadow"
            />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Building2 className="w-4 h-4" /> Commercial Buildings & Offices (20 kW - 250 kW)
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">Commercial Solar Solutions by nitish solar</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drastically cut operating expenses for office complexes, hospitals, private schools, and retail hubs. Capitalize on 40% accelerated tax depreciation and achieve complete payback within 3.5 years.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 40% Accelerated Tax Depreciation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> CapEx & PPA Financial Models</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Customized Ballast Frames</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> CEIG Electrical Safety Compliance</div>
            </div>
            <Link href="/commercial">
              <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                Explore Commercial Solar
              </Button>
            </Link>
          </div>
        </div>

        {/* Industrial */}
        <div id="industrial" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-magenta bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
              <Factory className="w-4 h-4" /> Industrial Captive Power Plants (500 kW - 10 MW)
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">Industrial Solar Solutions by nitish solar</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-capacity solar installations designed for heavy manufacturing facilities, textile mills, cold storages, and automotive factories. Bifacial glass-glass solar panels combined with 11kV/33kV high tension grid synchronization.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 25% Bifacial Gain</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> SCADA Remote Telemetry</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> HT Substation Interconnection</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated O&M Support</div>
            </div>
            <Link href="/industrial">
              <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                Explore Industrial Solar
              </Button>
            </Link>
          </div>
          <div className="lg:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600"
              alt="nitish solar industrial"
              className="rounded-xl object-cover w-full h-64 shadow"
            />
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
