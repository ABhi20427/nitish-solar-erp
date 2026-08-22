'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { Calculator, Zap, Sun, ShieldCheck, ArrowRight, Leaf, Trees, Info } from 'lucide-react';
import Link from 'next/link';

export default function SolarCalculatorPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState(15000);
  const [tariff, setTariff] = useState(8.5);
  const [roofArea, setRoofArea] = useState(1200);
  const [location, setLocation] = useState('Pune');
  const [propertyType, setPropertyType] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL'>('RESIDENTIAL');

  const calcResult = calculateSolarSystem({
    monthlyBillAmount: monthlyBill,
    tariffRatePerKwh: tariff,
    availableRoofAreaSqFt: roofArea,
    customerType: propertyType,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Engineering System Sizer
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Solar Calculator by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            Calculate your recommended solar capacity, roof footprint, estimated annual generation, and financial savings in seconds.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-800/80 bg-[#131B2E] text-slate-100">
              <CardHeader title="Input Your Solar Parameters" subtitle="Adjust parameters based on your property and latest utility bill." />
              <CardBody className="space-y-6 text-sm">
                <div>
                  <label className="block font-semibold text-slate-300 mb-2">Property Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'RESIDENTIAL', label: 'Residential' },
                      { id: 'COMMERCIAL', label: 'Commercial' },
                      { id: 'INDUSTRIAL', label: 'Industrial' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPropertyType(cat.id as any)}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                          propertyType === cat.id
                            ? 'bg-amber-500 text-slate-950 shadow font-bold'
                            : 'bg-[#0B0F17] text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pune, Jaipur, Ahmedabad"
                    className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-300">Monthly Electricity Bill (₹)</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">₹{new Intl.NumberFormat('en-IN').format(monthlyBill)}</span>
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
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-300">Available Roof Area (Sq Ft)</span>
                    <span className="text-sm font-bold text-white font-mono">{roofArea} Sq Ft</span>
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
              </CardBody>
            </Card>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-800/80 bg-[#131B2E] text-slate-100 shadow-xl">
              <CardHeader
                title={<span className="text-white flex items-center gap-2"><Sun className="w-5 h-5 text-amber-400" /> Recommended Solar System Sizing</span>}
                subtitle="Calculated for optimal solar irradiation yield."
              />
              <CardBody className="space-y-6">
                <div className="bg-[#0B0F17] text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Suggested Solar Capacity</span>
                      <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">{calcResult.recommendedCapacityKw} kWp</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Approx System Footprint</span>
                      <div className="text-xl font-bold text-white font-mono">{calcResult.roofAreaRequiredSqFt} Sq Ft</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs font-light">
                    <div>
                      <span className="text-slate-400 block">Est. Annual Generation:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">{new Intl.NumberFormat('en-IN').format(calcResult.annualGenerationKwh)} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Est. Annual Savings:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">₹{new Intl.NumberFormat('en-IN').format(calcResult.annualSavingsEst)}</span>
                    </div>
                  </div>
                </div>

                {/* Important Disclaimer Notice */}
                <div className="p-3 bg.amber-500/10 border border-amber-400/30 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-light">
                    <strong className="font-bold">Please Note:</strong> All system sizing figures, energy yields, and payback calculations are estimates. A formal physical site survey by <strong className="text-white font-semibold">nitish solar</strong> engineers is required for exact technical quotations.
                  </span>
                </div>

                {/* Request a Quote CTA Button after results */}
                <Link href="/quote" className="block">
                  <Button
                    variant="accent"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-0 py-3"
                    size="lg"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Request a Quote
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
