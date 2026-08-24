'use client';

import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Layers, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';

// 6 Concise Photovoltaic Module Layers
const MODULE_LAYERS = [
  {
    id: 'frame',
    code: '01',
    name: 'Frame',
    fullName: '01 — Anodized Aluminum Frame',
    desc: 'Provides structural strength and protects the entire module assembly against high wind and snow loads.',
    color: '#94A3B8',
    zBase: 120,
  },
  {
    id: 'glass',
    code: '02',
    name: 'Glass',
    fullName: '02 — Anti-Reflective Tempered Glass',
    desc: 'Protects the photovoltaic cells while allowing maximum sunlight transmission with minimal reflection.',
    color: '#38BDF8',
    zBase: 75,
  },
  {
    id: 'eva-top',
    code: '03',
    name: 'EVA Film',
    fullName: '03 — Encapsulant EVA Film',
    desc: 'Encapsulates and cushions the fragile photovoltaic cells against moisture and mechanical shock.',
    color: '#F59E0B',
    zBase: 30,
  },
  {
    id: 'cells',
    code: '04',
    name: 'Solar Cells',
    fullName: '04 — Photovoltaic Solar Cells',
    desc: 'Convert incident sunlight photons directly into electrical energy via the semiconductor photoelectric effect.',
    color: '#F59E0B',
    zBase: -15,
  },
  {
    id: 'backsheet',
    code: '05',
    name: 'Backsheet',
    fullName: '05 — Protective Backsheet',
    desc: 'Provides electrical insulation and protects the rear of the module from UV radiation and moisture.',
    color: '#64748B',
    zBase: -60,
  },
  {
    id: 'jbox',
    code: '06',
    name: 'Junction Box',
    fullName: '06 — IP68 Junction Box',
    desc: 'Connects the module electrically and provides statutory bypass diode protection against shading.',
    color: '#10B981',
    zBase: -105,
  },
];

export default function InsideSolarModulePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(3); // Default to 04 Solar Cells
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  const currentLayer = MODULE_LAYERS[activeIdx];

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % MODULE_LAYERS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + MODULE_LAYERS.length) % MODULE_LAYERS.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* Navigation Header */}
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* Page Title & Concise Introduction */}
        <div className="text-center space-y-3 pt-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INSIDE A SOLAR MODULE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Every layer has a purpose.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Explore the technology behind the panels that power modern solar systems.
          </p>

          <div className="pt-1 flex items-center justify-center gap-3">
            <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              Explore each layer below
            </span>
          </div>
        </div>

        {/* 3D Exploded Technical Visual Assembly Stage */}
        <div className="relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex items-center justify-center my-4 py-8">
          
          {/* Subtle Ambient Background Radial Solar Light */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[500px] h-[350px] bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-amber-500/15 blur-3xl rounded-full opacity-70 animate-pulse" />
          </div>

          {/* 3D Isometric Perspective Container */}
          <div
            className={`relative w-[300px] sm:w-[420px] lg:w-[480px] h-[200px] sm:h-[260px] lg:h-[300px] transition-transform duration-700 ease-out z-10 ${
              isReducedMotion ? '' : 'animate-[float_6s_ease-in-out_infinite]'
            }`}
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 40%',
            }}
          >
            <div
              className="w-full h-full relative transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(52deg) rotateZ(-28deg)',
              }}
            >
              {/* Render 6 Exploded Module Layers */}
              {MODULE_LAYERS.map((layer, idx) => {
                const isActive = idx === activeIdx;

                // Explosion GAP math: when exploded, layers expand vertically along Z-axis
                const explosionSpread = isExploded ? 55 : 12;
                const zOffset = (2.5 - idx) * explosionSpread + (isActive ? 35 : 0);
                const opacity = isActive ? 1.0 : Math.abs(idx - activeIdx) === 1 ? 0.75 : 0.45;
                const scale = isActive ? 1.04 : 1.0;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveIdx(idx)}
                    className="absolute inset-0 cursor-pointer transition-all duration-500 ease-out group"
                    style={{
                      transform: `translateZ(${zOffset}px) scale(${scale})`,
                      opacity,
                      willChange: 'transform, opacity',
                    }}
                  >
                    {/* Layer Render Surfaces */}
                    {layer.id === 'frame' && (
                      <div className={`w-full h-full rounded-2xl border-4 transition-all duration-300 shadow-2xl ${
                        isActive ? 'border-amber-400 bg-slate-800/40 ring-4 ring-amber-400/20 shadow-amber-500/20' : 'border-slate-600 bg-slate-900/20 group-hover:border-slate-400'
                      }`} />
                    )}

                    {layer.id === 'glass' && (
                      <div className={`w-full h-full rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-2xl relative overflow-hidden ${
                        isActive ? 'border-sky-300 bg-gradient-to-tr from-sky-400/30 via-white/40 to-sky-300/10 ring-4 ring-sky-400/20' : 'border-sky-400/30 bg-sky-500/10 group-hover:border-sky-300/60'
                      }`}>
                        {/* Glass Reflection Streak */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    )}

                    {layer.id === 'eva-top' && (
                      <div className={`w-full h-full rounded-2xl border transition-all duration-300 backdrop-blur-sm shadow-xl ${
                        isActive ? 'border-amber-400/80 bg-amber-400/20 ring-4 ring-amber-400/20' : 'border-amber-500/20 bg-amber-500/5 group-hover:border-amber-400/40'
                      }`} />
                    )}

                    {layer.id === 'cells' && (
                      <div className={`w-full h-full rounded-2xl border transition-all duration-300 shadow-2xl p-2 flex flex-col justify-between ${
                        isActive ? 'border-amber-400 bg-[#0C1425] ring-4 ring-amber-400/30 shadow-amber-500/30' : 'border-sky-500/40 bg-[#080D18] group-hover:border-amber-400/60'
                      }`}>
                        {/* Monocrystalline PV Cell Grid Matrix (6x6 Cells) */}
                        <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-1.5 p-1">
                          {Array.from({ length: 24 }).map((_, cIdx) => (
                            <div
                              key={cIdx}
                              className={`rounded-md border transition-colors relative overflow-hidden ${
                                isActive ? 'bg-sky-950 border-amber-400/60 shadow-inner' : 'bg-slate-900 border-sky-900/50'
                              }`}
                            >
                              {/* Silver Busbar Wire Lines */}
                              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-400/40" />
                              <div className="absolute inset-y-0 left-1/3 w-[1px] bg-slate-400/40" />
                              <div className="absolute inset-y-0 left-2/3 w-[1px] bg-slate-400/40" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {layer.id === 'eva-bottom' && (
                      <div className={`w-full h-full rounded-2xl border transition-all duration-300 backdrop-blur-sm shadow-xl ${
                        isActive ? 'border-amber-400/80 bg-amber-400/20 ring-4 ring-amber-400/20' : 'border-amber-500/20 bg-amber-500/5 group-hover:border-amber-400/40'
                      }`} />
                    )}

                    {layer.id === 'backsheet' && (
                      <div className={`w-full h-full rounded-2xl border transition-all duration-300 shadow-xl ${
                        isActive ? 'border-slate-300 bg-slate-700/80 ring-4 ring-white/20' : 'border-slate-700 bg-slate-900/80 group-hover:border-slate-500'
                      }`} />
                    )}

                    {layer.id === 'jbox' && (
                      <div className="w-full h-full relative">
                        <div className={`absolute bottom-2 right-4 w-16 h-12 rounded-xl border transition-all duration-300 shadow-2xl flex items-center justify-center ${
                          isActive ? 'border-emerald-400 bg-emerald-950 ring-4 ring-emerald-400/30' : 'border-emerald-500/40 bg-slate-900 group-hover:border-emerald-400/60'
                        }`}>
                          <ShieldCheck className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    )}

                    {/* Floating Side Tag Label for Layer */}
                    <div
                      className={`absolute -right-28 sm:-right-36 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs font-mono font-bold transition-all duration-300 whitespace-nowrap shadow-lg ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold scale-110'
                          : 'bg-slate-950/90 text-slate-400 border-slate-800 group-hover:text-white'
                      }`}
                    >
                      {layer.code} — {layer.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Horizontal Component Sequence Navigation Timeline */}
        <div className="w-full max-w-4xl mx-auto py-2 px-2">
          <div className="relative flex items-center justify-between">
            {/* Connecting Timeline Cable */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
            
            {/* Active Progress Line */}
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 z-0 transition-all duration-500 ease-out"
              style={{ width: `${(activeIdx / (MODULE_LAYERS.length - 1)) * 92}%` }}
            />

            {MODULE_LAYERS.map((layer, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative z-10 flex flex-col items-center gap-2 group focus:outline-none`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/20 scale-110 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-400/60 hover:text-white'
                    }`}
                  >
                    {layer.code}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-mono tracking-tight hidden sm:block transition-colors duration-300 ${
                      isActive ? 'text-amber-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {layer.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Concise Explanation Box (1-2 sentences) */}
        <div className="max-w-2xl mx-auto w-full bg-[#131B2E] border border-slate-800/90 rounded-2xl p-6 shadow-2xl text-center space-y-3 relative overflow-hidden">
          {/* Subtle Glow Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl pointer-events-none rounded-full" />

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              {currentLayer.fullName}
            </span>
            <span className="text-xs font-mono text-slate-500">Photovoltaic Architecture</span>
          </div>

          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed animate-fade-in key={currentLayer.id}">
            {currentLayer.desc}
          </p>

          {/* Quick Prev / Next Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 text-xs px-3"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous Layer
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={handleNext}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 border-0 shadow-lg shadow-amber-500/10"
            >
              Next Layer <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* EPC Engineering Quality Callout Statement */}
        <div className="max-w-4xl mx-auto w-full bg-[#070A10] border border-slate-800/80 rounded-2xl p-6 text-center space-y-3 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Tier-1 Monocrystalline Engineering Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            At <strong className="text-slate-200 font-semibold">nitish solar</strong>, we deploy premium double-glass bifacial modules tested for 30-year linear performance guarantees, IEC 61215 certification, and maximum energy yield.
          </p>
          <div className="pt-2">
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs border-0 shadow-lg flex items-center gap-2 mx-auto"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Request Custom System Proposal
            </Button>
          </div>
        </div>
      </main>

      {/* Footer & Quote Modal */}
      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
