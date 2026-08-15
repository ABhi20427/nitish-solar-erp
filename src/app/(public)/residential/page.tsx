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
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Home & Villa Rooftop Solutions
          </span>
          <h1 className="text-4xl font-black tracking-tight">Residential Solar by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Reduce electricity bills by up to 90% with custom home solar designs, PM Surya Ghar subsidy integration, & 25-year panel warranties.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-brand-dark">Rooftop Solar Designed for Your Home</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-brand-dark font-bold">nitish solar</strong> provides complete turnkey residential rooftop systems ranging from 3 kW to 15 kW. Our home systems include high-efficiency 540W N-type TOPCon panels, grid-tie inverters, bidirectional net metering meters, and mobile app generation monitoring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-purple block text-sm">Government Subsidy</span>
                <p className="text-slate-600">Central Govt PM Surya Ghar scheme subsidy support up to ₹78,000.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-blue block text-sm">Energy Savings</span>
                <p className="text-slate-600">Eliminate monthly electricity bills and generate clean green power.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-magenta block text-sm">Elevated Structure</span>
                <p className="text-slate-600">Hot-dip galvanized structures designed to preserve terrace usable space.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-dark block text-sm">Mobile Monitoring</span>
                <p className="text-slate-600">Track daily unit generation and system status from your phone.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/quote">
                <Button variant="accent" size="lg" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Residential Quote
                </Button>
              </Link>
              <Link href="/calculator">
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700" icon={<Calculator className="w-4 h-4 text-brand-purple" />}>
                  Calculate Home Savings
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Residential Package Includes:</h3>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Free comprehensive site shade survey</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Tier-1 N-Type TOPCon Mono Panels</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> IP65 Waterproof String Inverter</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Complete DISCOM net meter processing</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Chemical earthing & SPD protection</li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
