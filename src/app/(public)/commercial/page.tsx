'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CommercialSolarPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Business & Enterprise Solar Solutions
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Commercial Solar by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            For offices, shops, hotels, schools, warehouses, & commercial buildings. Drastically cut operational power costs and claim 40% accelerated tax depreciation.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-white">Commercial Solar Power Plants (20 kW - 250 kW)</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Commercial buildings spend heavily on daytime grid power and air conditioning. <strong className="text-white font-semibold">nitish solar</strong> designs turnkey commercial rooftop systems that match daytime power consumption peaks, maximizing energy self-consumption.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">40% Tax Benefit</span>
                <p className="text-slate-300 font-light">Accelerated tax depreciation benefit under Section 32 of Income Tax Act.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">3.5 Year Payback</span>
                <p className="text-slate-300 font-light">Rapid financial ROI payback period followed by 20+ years of free power.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Flexible CapEx / PPA</span>
                <p className="text-slate-300 font-light">Choose outright ownership or zero-investment Power Purchase Agreements (PPA).</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">CEIG Safety Clearance</span>
                <p className="text-slate-300 font-light">Full compliance with Electrical Inspectorate safety standards.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/quote">
                <Button variant="accent" size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Commercial Quote
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#131B2E] p-8 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Commercial Property Verticals:</h3>
            <ul className="space-y-3 text-xs text-slate-300 font-light">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Corporate IT & Office Hubs</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Educational Campuses & Schools</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Hospitals & Healthcare Facilities</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Hotels, Resorts & Retail Malls</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Warehouses & Logistics Hubs</li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
