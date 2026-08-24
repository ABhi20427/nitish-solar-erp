'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Sun,
  Zap,
  Cpu,
  Activity,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';

// 5 Stages of the Solar Power Journey, each with custom exploded 3D layers
const STAGES_DATA = [
  {
    id: 'panel',
    code: '01',
    title: 'SOLAR PANEL',
    subtitle: 'Photons → DC Electricity',
    shortDesc: 'Captures sunlight photons and converts them into Direct Current (DC) electricity.',
    icon: Sun,
    layers: [
      { id: 'frame', name: '01 — Frame', desc: 'Anodized aluminum structural frame protecting module edges.' },
      { id: 'glass', name: '02 — Tempered Glass', desc: 'Anti-reflective glass allowing 95%+ solar transmission.' },
      { id: 'eva1', name: '03 — Encapsulant EVA', desc: 'Ethylene-vinyl acetate layer cushioning PV cells.' },
      { id: 'cells', name: '04 — Solar Cells', desc: 'Monocrystalline N-Type TOPCon silicon cell matrix.' },
      { id: 'eva2', name: '05 — Rear EVA Sheet', desc: 'Moisture-barrier rear encapsulation layer.' },
      { id: 'backsheet', name: '06 — Backsheet & J-Box', desc: 'Protective insulating sheet with IP68 bypass diode box.' },
    ],
  },
  {
    id: 'string',
    code: '02',
    title: 'STRING / DC COLLECTION',
    subtitle: 'Series Voltage Stacking',
    shortDesc: 'Multiple solar modules connected in series to build high-voltage DC power for collection.',
    icon: Zap,
    layers: [
      { id: 'modules', name: '01 — PV Module Chain', desc: 'Series string arrangement stacking voltage to 1500V DC.' },
      { id: 'mc4', name: '02 — MC4 Connectors', desc: 'Weatherproof locking DC connectors minimizing resistance.' },
      { id: 'cables', name: '03 — Solar DC Cables', desc: 'XLPO dual-insulated UV-resistant high-voltage copper cabling.' },
      { id: 'combiner', name: '04 — DC Combiner Box', desc: 'IP65 enclosure combining strings with 30A gPV surge protection.' },
    ],
  },
  {
    id: 'inverter',
    code: '03',
    title: 'INVERTER STATION',
    subtitle: 'DC → 3-Phase AC Inversion',
    shortDesc: 'Converts solar DC electricity into grid-ready 3-phase AC power with high efficiency.',
    icon: Cpu,
    layers: [
      { id: 'cabinet', name: '01 — Weatherproof Cabinet', desc: 'Heavy-gauge NEMA 4X steel enclosure with forced-air cooling.' },
      { id: 'mppt', name: '02 — MPPT Controllers', desc: '12 independent MPPT trackers optimizing peak solar yield.' },
      { id: 'power', name: '03 — Power Switching Stage', desc: 'High-frequency Silicon Carbide IGBT inversion bridge.' },
      { id: 'acfilter', name: '04 — AC Filter & Sync', desc: 'Sinusoidal filter outputting clean 800V 3-phase AC power.' },
    ],
  },
  {
    id: 'transformer',
    code: '04',
    title: 'STEP-UP TRANSFORMER',
    subtitle: 'Voltage Step-Up (800V → 33kV)',
    shortDesc: 'Raises AC voltage to 11kV or 33kV for efficient long-distance grid transmission.',
    icon: Activity,
    layers: [
      { id: 'tank', name: '01 — Transformer Tank', desc: 'ONAN oil-immersed steel tank with radiator cooling fins.' },
      { id: 'bushings', name: '02 — HV Bushings', desc: '33kV ceramic high-voltage insulation bushings.' },
      { id: 'windings', name: '03 — Copper Coils', desc: 'Primary & secondary electrolytic copper isolation windings.' },
      { id: 'core', name: '04 — Magnetic Core', desc: 'Low-loss grain-oriented silicon steel magnetic core.' },
    ],
  },
  {
    id: 'grid',
    code: '05',
    title: 'UTILITY GRID TIE-IN',
    subtitle: 'Grid Export & Net Metering',
    shortDesc: 'Synchronizes clean electricity with the regional grid for utility distribution and net metering.',
    icon: ShieldCheck,
    layers: [
      { id: 'gantry', name: '01 — Transmission Gantry', desc: '33kV overhead grid interconnection gantry tower.' },
      { id: 'meter', name: '02 — Net Metering System', desc: '0.2s class bi-directional ABT tariff meter.' },
      { id: 'switchgear', name: '03 — Vacuum Breakers', desc: 'HT vacuum circuit breaker switchgear panel.' },
      { id: 'relays', name: '04 — Protection Relays', desc: 'Numerical anti-islanding & statutory grid protection relays.' },
    ],
  },
];

export default function InsideSolarPlantExperience() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [layerIdx, setLayerIdx] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  
  const outerRef = useRef<HTMLDivElement>(null);

  const currentStage = STAGES_DATA[stageIdx];
  const currentLayer = currentStage.layers[layerIdx] || currentStage.layers[0];

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

  // Handle Scroll to update active stage
  useEffect(() => {
    const handleScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const totalScroll = outerRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScroll));
      setScrollProgress(progress);

      const computedStage = Math.min(4, Math.floor(progress * 5));
      if (computedStage !== stageIdx) {
        setStageIdx(computedStage);
        setLayerIdx(0); // Reset layer focus on stage transition
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stageIdx]);

  const scrollToStage = (targetIdx: number) => {
    if (outerRef.current) {
      const totalDist = outerRef.current.offsetHeight - window.innerHeight;
      const targetScrollTop = outerRef.current.offsetTop + (targetIdx / 4) * totalDist;
      window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
    setStageIdx(targetIdx);
    setLayerIdx(0);
  };

  const handleNextStage = () => {
    const next = Math.min(4, stageIdx + 1);
    scrollToStage(next);
  };

  const handlePrevStage = () => {
    const prev = Math.max(0, stageIdx - 1);
    scrollToStage(prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* Navigation Header */}
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Main Outer Scroll Container (400vh for smooth scroll-driven journey through 5 stages) */}
      <div ref={outerRef} className="relative w-full h-[400vh]">
        
        {/* Sticky Viewport Container (100vh full viewport) */}
        <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-20 pb-6 bg-[#0B0F17] relative">
          
          {/* Subtle Ambient Background Solar Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-slate-950/80 to-[#0B0F17]" />
            <div
              className="absolute left-1/2 top-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-amber-500/15 via-sky-600/10 to-amber-400/15 blur-3xl transition-transform duration-700 ease-out opacity-80"
              style={{
                transform: `translate(-50%, -50%) translateX(${(2 - stageIdx) * 15}vw)`,
              }}
            />
          </div>

          {/* 1. Page Header Title & Subtitle */}
          <div className="max-w-4xl mx-auto px-4 text-center space-y-1.5 relative z-30 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>INSIDE A SOLAR PLANT</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              See how sunlight becomes power.
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
              Explore the 5-stage engineering journey from photovoltaic generation to grid energy.
            </p>
          </div>

          {/* 2. Interactive Exploded 3D Stage Visual Assembly Stage */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto z-20">
            
            {/* 3D Isometric Perspective Viewport */}
            <div
              className={`relative w-[280px] sm:w-[380px] lg:w-[440px] h-[180px] sm:h-[240px] lg:h-[270px] transition-all duration-700 ease-out ${
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
                {/* Render Exploded Layers for Current Stage */}
                {currentStage.layers.map((layer, idx) => {
                  const isActive = idx === layerIdx;
                  const totalLayers = currentStage.layers.length;

                  // Explosion Gap Math along Z-axis
                  const explosionSpread = 50;
                  const zOffset = ((totalLayers - 1) / 2 - idx) * explosionSpread + (isActive ? 35 : 0);
                  const opacity = isActive ? 1.0 : Math.abs(idx - layerIdx) === 1 ? 0.75 : 0.45;
                  const scale = isActive ? 1.05 : 1.0;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setLayerIdx(idx)}
                      className="absolute inset-0 cursor-pointer transition-all duration-500 ease-out group"
                      style={{
                        transform: `translateZ(${zOffset}px) scale(${scale})`,
                        opacity,
                        willChange: 'transform, opacity',
                      }}
                    >
                      {/* Layer Surface Visual Graphic */}
                      <div
                        className={`w-full h-full rounded-2xl border transition-all duration-300 shadow-2xl relative overflow-hidden backdrop-blur-md ${
                          isActive
                            ? 'border-amber-400 bg-[#16223B]/90 ring-4 ring-amber-400/30 shadow-amber-500/25'
                            : 'border-slate-700/80 bg-[#0F172A]/70 group-hover:border-slate-400'
                        }`}
                      >
                        {/* Internal Schematic Texture Lines */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
                        
                        {/* Unique Graphic Features per Stage */}
                        {stageIdx === 0 && layer.id === 'cells' && (
                          <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-1 p-2">
                            {Array.from({ length: 24 }).map((_, c) => (
                              <div key={c} className="bg-sky-950 border border-amber-400/50 rounded-sm" />
                            ))}
                          </div>
                        )}

                        {stageIdx === 1 && (
                          <div className="w-full h-full flex items-center justify-around px-4">
                            <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">DC</div>
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-amber-300 mx-2" />
                            <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">1500V</div>
                          </div>
                        )}

                        {stageIdx === 2 && (
                          <div className="w-full h-full flex flex-col justify-between p-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span>DC INPUT</span>
                              <span className="text-amber-400 font-bold">MPPT ACTIVE</span>
                              <span>AC OUTPUT</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 w-3/4 rounded-full animate-pulse" />
                            </div>
                          </div>
                        )}

                        {stageIdx === 3 && (
                          <div className="w-full h-full flex items-center justify-center gap-6">
                            <div className="w-12 h-12 rounded-full border-4 border-amber-400/80 flex items-center justify-center text-xs font-bold text-amber-400">800V</div>
                            <div className="text-amber-400 font-extrabold text-sm">➔➔➔</div>
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-400/80 flex items-center justify-center text-xs font-bold text-emerald-400">33kV</div>
                          </div>
                        )}

                        {stageIdx === 4 && (
                          <div className="w-full h-full flex items-center justify-between px-6 text-xs font-mono font-bold text-emerald-400">
                            <span>50.0 Hz SYNC</span>
                            <span className="text-amber-400 animate-ping">● LIVE EXPORT</span>
                            <span>NET METER</span>
                          </div>
                        )}
                      </div>

                      {/* Layer Side Label Tag */}
                      <div
                        className={`absolute -right-28 sm:-right-36 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs font-mono font-bold transition-all duration-300 whitespace-nowrap shadow-lg ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold scale-110'
                            : 'bg-slate-950/90 text-slate-400 border-slate-800 group-hover:text-white'
                        }`}
                      >
                        {layer.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Short 1-Sentence Technical Explanation Card */}
          <div className="max-w-xl mx-auto w-full px-4 relative z-30 shrink-0">
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-center space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  {currentStage.code} — {currentStage.title}
                </span>
                <span className="text-slate-500">{currentLayer.name}</span>
              </div>

              <p className="text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
                {currentLayer.desc}
              </p>

              {/* Prev / Next Layer Toggles */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setLayerIdx((prev) => Math.max(0, prev - 1))}
                  disabled={layerIdx === 0}
                  className="text-[11px] font-mono text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Layer
                </button>

                <button
                  onClick={() => setLayerIdx((prev) => Math.min(currentStage.layers.length - 1, prev + 1))}
                  disabled={layerIdx === currentStage.layers.length - 1}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 disabled:opacity-30 flex items-center gap-1 font-bold"
                >
                  Next Layer <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Continuous 5-Stage Journey Progress Navigation Bar */}
          <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-1 relative z-30 shrink-0">
            <div className="flex items-center justify-between bg-[#131B2E]/90 border border-slate-800 rounded-2xl p-2 shadow-xl">
              {STAGES_DATA.map((stage, idx) => {
                const isSelected = idx === stageIdx;
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => scrollToStage(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight hidden sm:inline">
                      {stage.code} {stage.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Quote Modal */}
      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
