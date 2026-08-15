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
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Header Banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Engineering Clean Energy Systems
          </span>
          <h1 className="text-4xl font-black tracking-tight">About nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Learn about our mission, vision, engineering principles, and commitment to delivering reliable renewable power infrastructure.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Company Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">Corporate Overview</span>
            <h2 className="text-3xl font-black text-brand-dark tracking-tight">Engineering Excellence in Solar Power</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-brand-dark font-bold">nitish solar</strong> is a technology-driven solar engineering firm providing turnkey photovoltaic power plant design, procurement, structural assembly, and grid synchronization.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We specialize in residential rooftop solar under national subsidy frameworks, commercial roof installations for business complexes, and heavy industrial mega-watt captive power systems.
            </p>
          </div>
          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h4 className="text-base font-bold text-brand-dark">Core Engineering Principles</h4>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                <span>Tier-1 certified component sourcing without compromise.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>Custom structural wind load modeling for 170 km/h stability.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
                <span>End-to-end DISCOM net metering clearance assistance.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To empower homeowners, commercial enterprises, and industrial facilities with reliable, high-yield solar energy systems that reduce carbon emissions and minimize lifetime power costs.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be a trusted regional leader in solar engineering, recognized for technical precision, quality components, and long-term customer satisfaction across all property segments.
            </p>
          </div>
        </div>

        {/* Engineering & Quality Approach */}
        <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold">Engineering & Quality Standards</h3>
            <p className="text-xs text-slate-300">Every project executed by nitish solar complies with strict electrical safety and structural guidelines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <Wrench className="w-6 h-6 text-brand-purplelight" />
              <h4 className="font-bold text-white text-sm">System Design</h4>
              <p className="text-slate-400">3D shadow analysis, tilt optimization, and string sizing designed by certified solar engineers.</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <ShieldCheck className="w-6 h-6 text-brand-bluelight" />
              <h4 className="font-bold text-white text-sm">Quality Testing</h4>
              <p className="text-slate-400">Rigorously tested DC cabling, chemical earthing pits, and surge protection devices.</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <Users className="w-6 h-6 text-brand-magentalight" />
              <h4 className="font-bold text-white text-sm">Customer Focus</h4>
              <p className="text-slate-400">Dedicated project managers assisting from initial site survey to grid commissioning.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link href="/quote">
              <Button variant="accent" size="lg" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<ArrowRight className="w-4 h-4" />}>
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
