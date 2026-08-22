'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Home, CheckCircle2, ArrowRight, ShieldCheck, Zap, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function ResidentialSolarPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Home & Villa Rooftop Solutions
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Residential Solar by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            Reduce electricity bills by up to 90% with custom home solar designs, PM Surya Ghar subsidy integration, & 25-year panel warranties.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-white">Rooftop Solar Designed for Your Home</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              <strong className="text-white font-semibold">nitish solar</strong> provides complete turnkey residential rooftop systems ranging from 3 kW to 15 kW. Our home systems include high-efficiency 540W N-type TOPCon panels, grid-tie inverters, bidirectional net metering meters, and mobile app generation monitoring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Government Subsidy</span>
                <p className="text-slate-300 font-light">Central Govt PM Surya Ghar scheme subsidy support up to ₹78,000.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Energy Savings</span>
                <p className="text-slate-300 font-light">Eliminate monthly electricity bills and generate clean green power.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Elevated Structure</span>
                <p className="text-slate-300 font-light">Hot-dip galvanized structures designed to preserve terrace usable space.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Mobile Monitoring</span>
                <p className="text-slate-300 font-light">Track daily unit generation and system status from your phone.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/quote">
                <Button variant="accent" size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Residential Quote
                </Button>
              </Link>
              <Link href="/calculator">
                <Button variant="outline" size="lg" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white" icon={<Calculator className="w-4 h-4 text-amber-400" />}>
                  Calculate Home Savings
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#131B2E] p-8 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Residential Package Includes:</h3>
            <ul className="space-y-3 text-xs text-slate-300 font-light">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Free comprehensive site shade survey</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Tier-1 N-Type TOPCon Mono Panels</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> IP65 Waterproof String Inverter</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Complete DISCOM net meter processing</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Chemical earthing & SPD protection</li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
