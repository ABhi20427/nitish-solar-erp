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
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Heavy Industry & Megawatt Solutions
          </span>
          <h1 className="text-4xl font-black tracking-tight">Industrial Solar by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            High-capacity captive power plants for factories, manufacturing facilities, industrial sites, warehouses, & large-scale installations.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-brand-dark">Industrial Captive Power Plants (500 kW - 10 MW)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Industrial plants operate high-power heavy machinery 24/7. <strong className="text-brand-dark font-bold">nitish solar</strong> delivers heavy-duty industrial solar infrastructure with 540W/580W bifacial N-type TOPCon panels, 11kV/33kV high tension grid synchronization, and SCADA remote control monitoring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-purple block text-sm">Bifacial Panels</span>
                <p className="text-slate-600">Dual-glass modules offering up to 25% additional rear-side irradiance gain.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-blue block text-sm">HT Grid Sync</span>
                <p className="text-slate-600">11kV / 33kV high tension substation transformer interconnection.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-magenta block text-sm">SCADA Control</span>
                <p className="text-slate-600">Real-time industrial telemetry, inverter control, and weather sensors.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-brand-dark block text-sm">Trapezoidal Clamps</span>
                <p className="text-slate-600">Zero-penetration metal shed clamps preserving roof integrity.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/quote">
                <Button variant="accent" size="lg" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                  Inquire MW Industrial Project
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Industrial Verticals Served:</h3>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Textile Mills & Spinning Factories</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Automotive Parts & Tooling Plants</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Cold Storage & Food Processing Facilities</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Chemical & Pharmaceutical Units</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Steel Fabrication & Heavy Engineering</li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
