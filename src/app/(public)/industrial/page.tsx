'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Factory, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function IndustrialSolarPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Heavy Industry & Megawatt Solutions
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Industrial Solar by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            High-capacity captive power plants for factories, manufacturing facilities, industrial sites, warehouses, & large-scale installations.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-white">Industrial Captive Power Plants (500 kW - 10 MW)</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Industrial plants operate high-power heavy machinery 24/7. <strong className="text-white font-semibold">nitish solar</strong> delivers heavy-duty industrial solar infrastructure with 540W/580W bifacial N-type TOPCon panels, 11kV/33kV high tension grid synchronization, and SCADA remote control monitoring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Bifacial Panels</span>
                <p className="text-slate-300 font-light">Dual-glass modules offering up to 25% additional rear-side irradiance gain.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">HT Grid Sync</span>
                <p className="text-slate-300 font-light">11kV / 33kV high tension substation transformer interconnection.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">SCADA Control</span>
                <p className="text-slate-300 font-light">Real-time industrial telemetry, inverter control, and weather sensors.</p>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-slate-800/80 shadow-md space-y-1">
                <span className="font-bold text-amber-400 block text-sm">Trapezoidal Clamps</span>
                <p className="text-slate-300 font-light">Zero-penetration metal shed clamps preserving roof integrity.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/quote">
                <Button variant="accent" size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                  Inquire MW Industrial Project
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#131B2E] p-8 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Industrial Verticals Served:</h3>
            <ul className="space-y-3 text-xs text-slate-300 font-light">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Textile Mills & Spinning Factories</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Automotive Parts & Tooling Plants</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Cold Storage & Food Processing Facilities</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Chemical & Pharmaceutical Units</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Steel Fabrication & Heavy Engineering</li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
