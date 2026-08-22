'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Target, Eye, Wrench, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Header Banner */}
      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Engineering Clean Energy Systems
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">About nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            Learn about our mission, vision, engineering principles, and commitment to delivering reliable renewable power infrastructure.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Company Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">Corporate Overview</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Engineering Excellence in Solar Power</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              <strong className="text-white font-semibold">nitish solar</strong> is a technology-driven solar engineering firm providing turnkey photovoltaic power plant design, procurement, structural assembly, and grid synchronization.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              We specialize in residential rooftop solar under national subsidy frameworks, commercial roof installations for business complexes, and heavy industrial mega-watt captive power systems.
            </p>
          </div>
          <div className="lg:col-span-5 bg-[#131B2E] p-8 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white">Core Engineering Principles</h4>
            <ul className="space-y-3 text-xs text-slate-300 font-light">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Tier-1 certified component sourcing without compromise.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Custom structural wind load modeling for 170 km/h stability.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>End-to-end DISCOM net metering clearance assistance.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#131B2E] rounded-2xl p-8 border border-slate-800/80 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center border border-slate-800">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              To empower homeowners, commercial enterprises, and industrial facilities with reliable, high-yield solar energy systems that reduce carbon emissions and minimize lifetime power costs.
            </p>
          </div>

          <div className="bg-[#131B2E] rounded-2xl p-8 border border-slate-800/80 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center border border-slate-800">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              To be a trusted regional leader in solar engineering, recognized for technical precision, quality components, and long-term customer satisfaction across all property segments.
            </p>
          </div>
        </div>

        {/* Engineering & Quality Approach */}
        <div className="bg-[#0F172A] text-white rounded-2xl p-8 sm:p-12 border border-slate-800/80 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-white">Engineering & Quality Standards</h3>
            <p className="text-xs text-slate-300 font-light">Every project executed by nitish solar complies with strict electrical safety and structural guidelines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-2">
              <Wrench className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">System Design</h4>
              <p className="text-slate-400 font-light">3D shadow analysis, tilt optimization, and string sizing designed by certified solar engineers.</p>
            </div>
            <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Quality Testing</h4>
              <p className="text-slate-400 font-light">Rigorously tested DC cabling, chemical earthing pits, and surge protection devices.</p>
            </div>
            <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-2">
              <Users className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Customer Focus</h4>
              <p className="text-slate-400 font-light">Dedicated project managers assisting from initial site survey to grid commissioning.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link href="/quote">
              <Button variant="accent" size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                Request a Quote from nitish solar
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
