'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Zap,
  Cpu,
  Activity,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Info,
  ShieldCheck,
  RotateCcw,
  MousePointer,
  Sparkles,
} from 'lucide-react';

// 5 Core Solar Plant Components Data
const PLANT_COMPONENTS = [
  {
    id: 'panel',
    code: '01',
    name: 'SOLAR PANEL (PV MODULE)',
    shortName: 'PANEL',
    role: 'Solar Photons → DC Energy',
    desc: 'Captures incident solar irradiance and converts solar photons into Direct Current (DC) electricity via the semiconductor photoelectric effect.',
    position: { x: 18, y: 55 },
    camera: { x: 150, y: 0, zoom: 1.25 },
    specs: [
      { label: 'Cell Technology', value: 'N-Type TOPCon Bifacial' },
      { label: 'Module Efficiency', value: '22.8% (STC)' },
      { label: 'Irradiance Peak', value: '1,000 W/m²' },
      { label: 'Temp. Coefficient', value: '-0.30% / °C' },
    ],
    concepts: [
      'Photovoltaic Cell Physics & Electron Excitation',
      'Anti-Reflective Glass & Double-Glass Encapsulation',
      'Bifacial Rear-Side Energy Gain (+15-25%)',
      'Hot-Spot & Temperature Degradation Mitigation',
    ],
    color: '#F59E0B',
  },
  {
    id: 'string',
    code: '02',
    name: 'STRING / DC COLLECTION',
    shortName: 'STRING',
    role: 'High-Voltage DC Bundling',
    desc: 'Connects individual PV modules in series to elevate system DC voltage up to 1500V, reducing resistive line losses during transmission to combiner boxes.',
    position: { x: 38, y: 52 },
    camera: { x: 50, y: -20, zoom: 1.35 },
    specs: [
      { label: 'String Voltage', value: '1500V DC Max' },
      { label: 'String Capacity', value: '26 Modules / String' },
      { label: 'DC Cable Insulation', value: 'XLPO 1.8kV Rated' },
      { label: 'Fuse Protection', value: '30A gPV Fuses' },
    ],
    concepts: [
      'Series Voltage Stacking & Voltage Drop Calculations',
      'Maximum Power Point String Sizing Geometry',
      'Over-Current Surge Protection & Isolator Switches',
      'Thermal Resistance of Underground DC Trenching',
    ],
    color: '#EAB308',
  },
  {
    id: 'inverter',
    code: '03',
    name: 'INVERTER STATION',
    shortName: 'INVERTER',
    role: 'DC → AC Power Inversion',
    desc: 'Converts Direct Current (DC) from the solar field into clean, grid-synchronized 3-phase Alternating Current (AC) using high-frequency Insulated Gate Bipolar Transistors (IGBTs).',
    position: { x: 58, y: 48 },
    camera: { x: -60, y: -40, zoom: 1.4 },
    specs: [
      { label: 'Conversion Type', value: '3-Phase AC (800V)' },
      { label: 'Peak Efficiency', value: '98.9% European Efficiency' },
      { label: 'MPPT Count', value: '12 Independent MPPTs' },
      { label: 'THD (Distortion)', value: '< 2% at Full Load' },
    ],
    concepts: [
      'High-Speed Pulse Width Modulation (PWM)',
      'Dynamic Maximum Power Point Tracking (MPPT)',
      'Grid Phase, Frequency & Voltage Synchronization',
      'Active Anti-Islanding Fault Disconnection',
    ],
    color: '#3B82F6',
  },
  {
    id: 'transformer',
    code: '04',
    name: 'STEP-UP TRANSFORMER',
    shortName: 'TRANSFORMER',
    role: 'Voltage Step-Up (415V → 11kV/33kV)',
    desc: 'Steps up low-voltage inverter AC power to high-voltage grid levels (11kV or 33kV) to enable long-distance transmission with negligible thermal power dissipation.',
    position: { x: 76, y: 44 },
    camera: { x: -160, y: -60, zoom: 1.35 },
    specs: [
      { label: 'Voltage Ratio', value: '800V / 33kV Step-Up' },
      { label: 'Cooling Method', value: 'ONAN Oil Immersed' },
      { label: 'Winding Material', value: 'Electrolytic Copper' },
      { label: 'Impedance', value: '6.5% Standard' },
    ],
    concepts: [
      'Electromagnetic Induction & Transformer Turns Ratio',
      'Galvanic Electrical Isolation & Grounding Safety',
      'Buchholz Relay & Oil Temperature Trip Protection',
      'Low Magnetizing Core Loss Optimization',
    ],
    color: '#6366F1',
  },
  {
    id: 'grid',
    code: '05',
    name: 'UTILITY GRID & METERS',
    shortName: 'GRID',
    role: 'Clean Energy Dispatch to Network',
    desc: 'The final destination where synchronized clean electricity is metered via bi-directional ABT meters and exported directly into the DISCOM electrical grid.',
    position: { x: 92, y: 40 },
    camera: { x: -260, y: -80, zoom: 1.2 },
    specs: [
      { label: 'Grid Voltage Level', value: '11kV / 33kV HT Grid' },
      { label: 'Frequency Sync', value: '50.0 Hz ± 0.05 Hz' },
      { label: 'Metering Type', value: '0.2s Class Net Meter' },
      { label: 'Power Factor', value: '0.99 Leading/Lagging' },
    ],
    concepts: [
      'Bi-Directional Net-Metering & Tariff Telemetry',
      'Reactive Power Control & Grid Voltage Regulation',
      'Statutory Utility Protection Relays (Numerical Type)',
      'Substation Switchyard Interconnection Architecture',
    ],
    color: '#10B981',
  },
];

export default function InsideSolarPlantPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('panel');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active Component Data
  const selectedComponent =
    PLANT_COMPONENTS.find((c) => c.id === selectedId) || PLANT_COMPONENTS[0];
  const selectedIndex = PLANT_COMPONENTS.findIndex((c) => c.id === selectedId);

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

  // Canvas 2.5D Animated Energy Flow Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Component Anchor Coordinates in Canvas Space
      const coords = PLANT_COMPONENTS.map((comp) => ({
        id: comp.id,
        x: (comp.position.x / 100) * w,
        y: (comp.position.y / 100) * h,
        color: comp.color,
      }));

      // 1. Draw Energy Flow Lines between consecutive components
      ctx.lineWidth = 3;
      for (let i = 0; i < coords.length - 1; i++) {
        const start = coords[i];
        const end = coords[i + 1];

        // Line gradient
        const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        grad.addColorStop(0, start.color + '88');
        grad.addColorStop(1, end.color + '88');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      // 2. Draw Moving Energy Particles along path (SUN -> PANEL -> STRING -> INVERTER -> TRANSFORMER -> GRID)
      if (!isReducedMotion) {
        particleOffset = (particleOffset + 1.2) % 40;
      }

      for (let i = 0; i < coords.length - 1; i++) {
        const start = coords[i];
        const end = coords[i + 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist / 35);

        for (let j = 0; j <= steps; j++) {
          const t = ((j * 35 + particleOffset) % dist) / dist;
          const px = start.x + dx * t;
          const py = start.y + dy * t;

          ctx.fillStyle = '#F59E0B';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 3. Draw Component Node Glow Rings
      coords.forEach((node) => {
        const isSelected = node.id === selectedId;

        if (isSelected) {
          // Pulse halo for selected component
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16 + Math.sin(Date.now() / 250) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Inner Dot
        ctx.fillStyle = isSelected ? '#F59E0B' : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 8 : 5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedId, isReducedMotion]);

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % PLANT_COMPONENTS.length;
    setSelectedId(PLANT_COMPONENTS[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (selectedIndex - 1 + PLANT_COMPONENTS.length) % PLANT_COMPONENTS.length;
    setSelectedId(PLANT_COMPONENTS[prevIdx].id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased">
      {/* Navigation Header */}
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Title & Eyebrow Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INSIDE A SOLAR PLANT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            See how sunlight becomes power.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Explore the engineering journey from photovoltaic generation to grid-connected energy.
          </p>

          <div className="pt-1">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800">
              <MousePointer className="w-3.5 h-3.5 text-amber-400" />
              <span>Click any component to explore system parameters</span>
            </span>
          </div>
        </div>

        {/* 5-Step System Energy Flow Sequence Bar */}
        <div className="w-full bg-[#131B2E] border border-slate-800 rounded-2xl p-2.5 shadow-xl">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
            {PLANT_COMPONENTS.map((comp) => {
              const isSelected = comp.id === selectedId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`py-2.5 px-1.5 sm:px-3 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 group ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                      : 'bg-[#0B0F17]/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <span className={`text-[10px] sm:text-xs font-mono font-bold ${isSelected ? 'text-slate-950' : 'text-amber-400'}`}>
                    {comp.code}
                  </span>
                  <span className="text-[11px] sm:text-xs tracking-tight font-extrabold truncate">
                    {comp.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive 2.5D Solar Plant Scene + Side Technical Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT 7-COL: Interactive 2.5D Solar Plant Scene */}
          <div className="lg:col-span-7 bg-[#070A10] border border-slate-800 rounded-3xl p-4 sm:p-6 relative min-h-[420px] sm:min-h-[500px] flex flex-col justify-between overflow-hidden shadow-2xl group">
            
            {/* Background Solar Ray Sky Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.12)_0%,rgba(11,15,23,0.95)_70%)] pointer-events-none" />

            {/* Sun Indicator in Background */}
            <div className="absolute top-6 left-6 flex items-center gap-2.5 z-10 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-md">
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Solar Source</span>
                <span className="text-xs font-bold text-white">1000 W/m² Irradiance</span>
              </div>
            </div>

            {/* Viewport Reset Controls */}
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => setSelectedId('panel')}
                className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-800 transition-colors shadow"
                title="Reset Camera View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Camera Pan Viewport Layer */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out pointer-events-none"
              style={{
                transform: isReducedMotion
                  ? 'none'
                  : `translate(${selectedComponent.camera.x}px, ${selectedComponent.camera.y}px) scale(${selectedComponent.camera.zoom})`,
              }}
            >
              {/* HTML5 Energy Flow Particle Canvas */}
              <canvas ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none" />

              {/* 2.5D Isometric Solar Infrastructure Elements */}
              {PLANT_COMPONENTS.map((comp) => {
                const isSelected = comp.id === selectedId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedId(comp.id)}
                    className={`absolute pointer-events-auto cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group/node ${
                      isSelected ? 'scale-125 z-30' : 'scale-100 opacity-75 hover:opacity-100 z-20'
                    }`}
                    style={{ left: `${comp.position.x}%`, top: `${comp.position.y}%` }}
                  >
                    {/* Visual Graphic Representation for Plant Equipment */}
                    <div
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 shadow-2xl backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/20'
                          : 'bg-[#131B2E]/95 text-white border-slate-700/80 hover:border-amber-400/60'
                      }`}
                    >
                      {comp.id === 'panel' && <Sun className="w-6 h-6 shrink-0" />}
                      {comp.id === 'string' && <Zap className="w-6 h-6 shrink-0" />}
                      {comp.id === 'inverter' && <Cpu className="w-6 h-6 shrink-0" />}
                      {comp.id === 'transformer' && <Activity className="w-6 h-6 shrink-0" />}
                      {comp.id === 'grid' && <ShieldCheck className="w-6 h-6 shrink-0" />}

                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider block">
                        {comp.shortName}
                      </span>
                    </div>

                    {/* Tooltip Tag */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/node:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-mono px-2 py-1 rounded border border-slate-800 whitespace-nowrap pointer-events-none shadow-lg">
                      {comp.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Interactive Legend */}
            <div className="relative z-10 mt-auto pt-64 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/60 p-3.5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Active Flow: {selectedComponent.role}</span>
              </div>
              <span className="font-mono text-[11px] text-amber-400/90">
                Step {selectedIndex + 1} of 5
              </span>
            </div>
          </div>

          {/* RIGHT 5-COL: Component Technical Specifications & Engineering Panel */}
          <div className="lg:col-span-5 bg-[#131B2E] border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-2xl space-y-6 relative overflow-hidden">
            {/* Component Accent Light Overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="space-y-6 relative z-10">
              {/* Component Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  COMPONENT {selectedComponent.code} / 05
                </span>
                <span className="text-xs font-mono text-slate-400">Nitish Solar EPC Standard</span>
              </div>

              {/* Title & Role */}
              <div className="space-y-1">
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  {selectedComponent.name}
                </h2>
                <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                  {selectedComponent.role}
                </p>
              </div>

              {/* Functional Description */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light bg-[#0B0F17]/60 p-4 rounded-2xl border border-slate-800/80">
                {selectedComponent.desc}
              </p>

              {/* Technical Specifications Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  Engineering System Specs
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedComponent.specs.map((spec) => (
                    <div key={spec.label} className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 text-xs space-y-0.5">
                      <span className="text-slate-400 block text-[10px] font-mono">{spec.label}</span>
                      <span className="font-bold text-white block text-xs truncate">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Engineering Concepts Bullet List */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 block flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Key Engineering Concepts
                </span>
                <ul className="space-y-2 text-xs text-slate-200">
                  {selectedComponent.concepts.map((concept) => (
                    <li key={concept} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-light leading-snug">{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-4"
              >
                Previous Step
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={handleNext}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 border-0 shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Next Component
              </Button>
            </div>
          </div>
        </div>

        {/* Corporate EPC Engineering Commitment Statement */}
        <section className="bg-[#131B2E] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
                Turnkey Engineering Standards
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Designed for 30-Year High-Yield Operation.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                At <strong className="text-white font-semibold">nitish solar</strong>, every solar plant component is selected through rigorous electrical modeling, 3D shadow simulations, DISCOM net metering compliance, and Tier-1 component testing.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setIsQuoteOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-sm border-0 shadow-xl"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Request Plant Design Proposal
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer & Quote Modal */}
      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
