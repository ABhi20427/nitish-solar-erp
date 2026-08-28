'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Target, Eye, Wrench, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const CORE_PRINCIPLES = [
  'Tier-1 certified component sourcing without compromise.',
  'Custom structural wind load modeling for 170 km/h stability.',
  'End-to-end DISCOM net metering clearance assistance.',
];

const QUALITY_STANDARDS = [
  { icon: Wrench, title: 'System Design', desc: '3D shadow analysis, tilt optimization, and string sizing designed by certified solar engineers.' },
  { icon: ShieldCheck, title: 'Quality Testing', desc: 'Rigorously tested DC cabling, chemical earthing pits, and surge protection devices.' },
  { icon: Users, title: 'Customer Focus', desc: 'Dedicated project managers assisting from initial site survey to grid commissioning.' },
];

export default function AboutPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO — same cinematic full-bleed treatment as the rest of the site. */}
      <section className="relative w-full min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="nitish solar engineering team on site"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-14 pt-32">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-amber-400" />
              <span>Engineering Clean Energy Systems</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              Discover nitish solar's <span className="text-amber-400">Engineering Philosophy.</span>
            </h1>
            <p className="text-base text-white/75 font-light leading-relaxed max-w-xl">
              Our mission, vision, and the engineering principles behind every system we design and install.
            </p>
          </div>
        </div>
      </section>

      {/* Main — same engineering-blueprint atmosphere used across the site. */}
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
          <div className="absolute left-[8%] top-[10%] w-[560px] h-[560px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          {/* Company Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400 block">Corporate Overview</span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">Engineering Excellence in Solar Power</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                <strong className="text-white font-semibold">nitish solar</strong> is a technology-driven solar engineering firm providing turnkey photovoltaic power plant design, procurement, structural assembly, and grid synchronization.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                We specialize in residential rooftop solar under national subsidy frameworks, commercial roof installations for business complexes, and heavy industrial mega-watt captive power systems.
              </p>
            </div>
            <div className="lg:col-span-5 bg-[#131B2E] p-7 sm:p-8 rounded-2xl border border-slate-800/70 space-y-4">
              <h4 className="font-display text-base font-semibold text-white">Core Engineering Principles</h4>
              <ul className="space-y-3 text-sm text-slate-300 font-light">
                {CORE_PRINCIPLES.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#131B2E] rounded-2xl p-7 sm:p-8 border border-slate-800/70 space-y-4 transition-colors duration-300 hover:border-amber-400/30">
              <div className="w-11 h-11 rounded-lg bg-[#0B0F17] text-amber-400 flex items-center justify-center border border-slate-800">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">Our Mission</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                To empower homeowners, commercial enterprises, and industrial facilities with reliable, high-yield solar energy systems that reduce carbon emissions and minimize lifetime power costs.
              </p>
            </div>

            <div className="bg-[#131B2E] rounded-2xl p-7 sm:p-8 border border-slate-800/70 space-y-4 transition-colors duration-300 hover:border-amber-400/30">
              <div className="w-11 h-11 rounded-lg bg-[#0B0F17] text-amber-400 flex items-center justify-center border border-slate-800">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">Our Vision</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                To be a trusted regional leader in solar engineering, recognized for technical precision, quality components, and long-term customer satisfaction across all property segments.
              </p>
            </div>
          </div>

          {/* Engineering & Quality Approach */}
          <div className="bg-[#0B0F17]/90 rounded-3xl p-8 sm:p-12 border border-slate-800/70 shadow-2xl shadow-black/40 space-y-9">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">Standards</span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">Engineering & Quality Standards</h3>
              <p className="text-sm text-slate-400 font-light">Every project executed by nitish solar complies with strict electrical safety and structural guidelines.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {QUALITY_STANDARDS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/70 space-y-3 transition-colors duration-300 hover:border-amber-400/30">
                  <div className="w-10 h-10 rounded-lg bg-[#0B0F17] text-amber-400 flex items-center justify-center border border-slate-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white text-sm">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link href="/quote">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold border-0 px-8 hover:scale-[1.02] transition-all"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Request a Quote from nitish solar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
