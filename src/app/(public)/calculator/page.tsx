'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { Zap, Sun, ArrowRight, ArrowUpRight, IndianRupee, Clock, Leaf, Trees, Info } from 'lucide-react';

const PROPERTY_TYPES = [
  { id: 'RESIDENTIAL', label: 'Residential' },
  { id: 'COMMERCIAL', label: 'Commercial' },
  { id: 'INDUSTRIAL', label: 'Industrial' },
] as const;

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

export default function SolarCalculatorPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState(15000);
  const [tariff] = useState(8.5);
  const [roofArea, setRoofArea] = useState(1200);
  const [location, setLocation] = useState('Chennai');
  const [propertyType, setPropertyType] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL'>('RESIDENTIAL');

  const calcResult = calculateSolarSystem({
    monthlyBillAmount: monthlyBill,
    tariffRatePerKwh: tariff,
    availableRoofAreaSqFt: roofArea,
    customerType: propertyType,
  });

  const roofUtilization = Math.min(1, calcResult.roofAreaRequiredSqFt / roofArea);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO — same cinematic full-bleed treatment as the rest of the site,
          compact height since this is a utility/tool page. */}
      <section className="relative w-full min-h-[46vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/residential_light.png"
            alt="nitish solar rooftop system"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/70 to-[#0B0F17]/30" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-14 pt-32">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-amber-400" />
              <span>Engineering System Sizer</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              Size your solar system <span className="text-amber-400">in seconds.</span>
            </h1>
            <p className="text-base text-white/75 font-light leading-relaxed max-w-xl">
              Adjust your bill, roof area, and property type to estimate capacity, generation, and financial payback — instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Main — same engineering-blueprint atmosphere used across the site,
          wrapping a single instrument panel that mirrors the homepage's
          Financial ROI Estimator, but with the full parameter set. */}
      <main className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute right-[8%] top-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0B0F17]/90 rounded-3xl p-6 sm:p-10 border border-slate-800/70 shadow-2xl shadow-black/40">
            {/* Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">Input Parameters</span>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight">Your Property & Usage</h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Adjust these based on your property and latest utility bill.
                </p>
              </div>

              <div className="bg-[#131B2E] p-5 sm:p-6 rounded-2xl border border-slate-800/70 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Property Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPropertyType(cat.id)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          propertyType === cat.id
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-[#0B0F17] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, Pune, Jaipur"
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-slate-300">Monthly Electricity Bill</span>
                    <span className="text-base text-amber-400 tabular-nums">₹{fmt(monthlyBill)}</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={250000}
                    step={1000}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-slate-300">Available Roof Area</span>
                    <span className="text-sm text-white tabular-nums">{fmt(roofArea)} Sq Ft</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={20000}
                    step={100}
                    value={roofArea}
                    onChange={(e) => setRoofArea(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">
                <Sun className="w-3.5 h-3.5" />
                <span>Recommended System Sizing</span>
              </div>

              <div className="bg-[#131B2E] p-5 sm:p-7 rounded-2xl border border-slate-800/70 space-y-6">
                {/* Live Roof-Utilization Gauge + Capacity Readout — the ring
                    fills based on how much of the available roof the
                    recommended system actually needs, a real engineering
                    figure rather than a decorative meter. */}
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <div className="relative shrink-0 w-32 h-32 sm:w-36 sm:h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="7" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - roofUtilization)}
                        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl sm:text-3xl font-semibold text-white tabular-nums leading-none">
                        {calcResult.recommendedCapacityKw}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">kWp system</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                      <span className="text-slate-400">Panel Count Estimate</span>
                      <span className="font-semibold text-white tabular-nums">{calcResult.panelCountEst} panels</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                      <span className="text-slate-400">System Footprint Required</span>
                      <span className="font-semibold text-white tabular-nums">{fmt(calcResult.roofAreaRequiredSqFt)} Sq Ft</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Roof Utilization</span>
                      <span className={`font-semibold tabular-nums ${roofUtilization >= 1 ? 'text-amber-400' : 'text-white'}`}>
                        {Math.round(roofUtilization * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-5 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span>Annual Generation</span>
                    </div>
                    <span className="text-base font-semibold text-white tabular-nums">{fmt(calcResult.annualGenerationKwh)} kWh</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      <span>Annual Savings</span>
                    </div>
                    <span className="text-base font-semibold text-emerald-400 tabular-nums">₹{fmt(calcResult.annualSavingsEst)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      <span>Subsidy / Tax Benefit</span>
                    </div>
                    <span className="text-base font-semibold text-amber-400 tabular-nums">₹{fmt(calcResult.subsidyEstimate)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Payback Horizon</span>
                    </div>
                    <span className="text-base font-semibold text-white tabular-nums">{calcResult.paybackPeriodYears} Years</span>
                  </div>
                </div>

                {/* Environmental Impact Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-slate-400 block">CO₂ Offset / Year</span>
                      <span className="font-semibold text-white tabular-nums">{calcResult.co2OffsetTonsPerYear} Tons</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                      <Trees className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Equivalent Trees Planted</span>
                      <span className="font-semibold text-white tabular-nums">{fmt(calcResult.treesPlantedEquivalent)}</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer Notice */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-xl text-amber-200/90 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-light leading-relaxed">
                    <strong className="font-semibold text-amber-200">Please Note:</strong> All figures are estimates. A formal site survey by <strong className="text-white font-medium">nitish solar</strong> engineers is required for exact technical quotations.
                  </span>
                </div>

                <Link href="/quote" className="block">
                  <Button
                    variant="accent"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold border-0 py-3 hover:scale-[1.01] transition-all"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Request a Quote for This System
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
