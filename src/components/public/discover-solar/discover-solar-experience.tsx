'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Sparkles,
  ArrowRight,
  Sun,
  Zap,
  RotateCcw,
  CheckCircle2,
  Eye,
  ChevronRight,
  IndianRupee,
  TreePine,
  Activity,
  Layers,
  Sliders,
  Compass,
} from 'lucide-react';
import { AddressAutocomplete, PRESET_SATELLITE_LOCATIONS } from './address-autocomplete';
import { SatelliteMapEngine } from './satellite-map-engine';
import { SatelliteLocation, VisualMode } from './types';
import { useSolarStore } from '@/lib/store-context';

interface DiscoverSolarExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiscoverSolarExperience({ isOpen, onClose }: DiscoverSolarExperienceProps) {
  const { addLead } = useSolarStore();

  // STAGE MANAGEMENT (1 to 12)
  const [stage, setStage] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<SatelliteLocation>(PRESET_SATELLITE_LOCATIONS[0]);

  // Stage 2 Cinematic Zoom Progression
  const [zoomLevel, setZoomLevel] = useState<'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP'>('CITY');
  const [flyInText, setFlyInText] = useState('PUNE REGION SATELLITE FEED');

  // Stage 5 Roof Scan Status
  const [scanStep, setScanStep] = useState<string>('ANALYSING ROOF');
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Stage 7 Panel Config
  const [panelCount, setPanelCount] = useState<number>(24);
  const [capacityKw, setCapacityKw] = useState<number>(10.8);
  const [annualGenKwh, setAnnualGenKwh] = useState<number>(14800);
  const [annualSavings, setAnnualSavings] = useState<number>(142000);
  const [co2Offset, setCo2Offset] = useState<number>(12.4);

  // Stage 9 Sun Slider (06:00 to 18:00)
  const [sunTime, setSunTime] = useState<number>(12); // Default 12:00 Noon

  // Stage 10 Visual Mode
  const [visualMode, setVisualMode] = useState<VisualMode>('PANEL_LAYOUT');

  // Stage 12 Lead Capture Form
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Calculate dynamic solar metrics based on selectedLocation & panelCount
  useEffect(() => {
    // Each panel = 450W TOPCon module
    const kw = Number(((panelCount * 450) / 1000).toFixed(1));
    const kwhPerKw = selectedLocation.solarIrradiance * 365 * 0.78; // Approx yield factor
    const genKwh = Math.round(kw * kwhPerKw);
    const savings = Math.round(genKwh * 9.6);
    const co2 = Number((genKwh * 0.00084).toFixed(1));

    setCapacityKw(kw);
    setAnnualGenKwh(genKwh);
    setAnnualSavings(savings);
    setCo2Offset(co2);
  }, [panelCount, selectedLocation]);

  // Stage 2 Cinematic Location Zoom Controller
  useEffect(() => {
    if (stage !== 2) return;

    setZoomLevel('CITY');
    setFlyInText(`${selectedLocation.state.toUpperCase()} AERIAL SECTOR`);

    const t1 = setTimeout(() => {
      setZoomLevel('NEIGHBOURHOOD');
      setFlyInText(`${selectedLocation.city.toUpperCase()} NEIGHBOURHOOD`);
    }, 800);

    const t2 = setTimeout(() => {
      setZoomLevel('PROPERTY');
      setFlyInText('TARGET PROPERTY ROOFTOP IDENTIFIED');
    }, 1700);

    const t3 = setTimeout(() => {
      setZoomLevel('ROOFTOP');
      setStage(3);
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [stage, selectedLocation]);

  // Stage 5 Roof Scanning Sequence Controller
  useEffect(() => {
    if (stage !== 5) return;

    let p = 0;
    const interval = setInterval(() => {
      p += 0.05;
      setScanProgress(Math.min(1, p));

      if (p < 0.25) setScanStep('ANALYSING ROOF');
      else if (p < 0.45) setScanStep('SURFACE DETECTED');
      else if (p < 0.65) setScanStep('ROOF AREA MAPPED');
      else if (p < 0.85) setScanStep('OBSTRUCTIONS IDENTIFIED');
      else setScanStep('SOLAR ARRAY OPTIMISED');

      if (p >= 1) {
        clearInterval(interval);
        setTimeout(() => setStage(6), 400);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc: SatelliteLocation) => {
    setSelectedLocation(loc);
    setStage(2);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;
    setIsSubmitting(true);

    try {
      // Submit lead to backend API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          location: selectedLocation.address,
          propertyType: 'RESIDENTIAL',
          requiredCapacity: capacityKw,
          monthlyBill: Math.round(annualSavings / 12),
          message: `2.5D Real Satellite Solar Lead: Coordinates (${selectedLocation.lat}, ${selectedLocation.lng}), ${panelCount} panels, ${capacityKw} kW, Est generation ${annualGenKwh} kWh/yr. ${leadForm.notes}`,
          source: 'Discover Your Solar 2.5D Experience',
        }),
      });

      // Save lead to ERP Store
      addLead({
        fullName: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        customerType: 'RESIDENTIAL',
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        proposedCapacityKw: capacityKw,
        monthlyBillAmount: Math.round(annualSavings / 12),
        roofAreaSqFt: selectedLocation.estimatedUsableAreaSqFt,
        source: 'Discover Your Solar 2.5D Experience',
        notes: `Qualified 2.5D Real-Rooftop Lead: Coordinates: ${selectedLocation.lat}, ${selectedLocation.lng}. Configured: ${panelCount} Panels (${capacityKw} kWp), Est. Generation: ${annualGenKwh} kWh/yr, Est. Annual Savings: ₹${annualSavings.toLocaleString('en-IN')}.`,
        priority: 'HIGH',
      });

      setLeadSuccess(true);
    } catch (err) {
      console.error('Lead submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A0F] text-slate-100 flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* 2.5D Real Satellite Imagery Map Canvas Engine */}
      <div className="absolute inset-0 z-0">
        <SatelliteMapEngine
          location={selectedLocation}
          stage={stage}
          visualMode={visualMode}
          panelCount={panelCount}
          sunTime={sunTime}
          isScanning={stage === 5}
          scanProgress={scanProgress}
          zoomLevel={zoomLevel}
        />
      </div>

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold tracking-wider text-base sm:text-lg">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>NITISH SOLAR</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono font-normal">
              REAL ROOFTOP 2.5D
            </span>
          </div>

          {/* Journey Breadcrumb Trail */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
            <span className={stage >= 1 ? 'text-amber-400 font-bold' : ''}>01 ADDRESS</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 3 ? 'text-amber-400 font-bold' : ''}>02 REAL ROOF</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 5 ? 'text-amber-400 font-bold' : ''}>03 SCAN</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 6 ? 'text-amber-400 font-bold' : ''}>04 PANELS</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 11 ? 'text-amber-400 font-bold' : ''}>05 PAYOFF</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stage >= 3 && (
            <button
              onClick={() => setStage(1)}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RECHANGE ADDRESS</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            aria-label="Close experience"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CENTER HUD & STAGE CONTAINERS */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-8 pointer-events-none">
        
        {/* STAGE 1: ADDRESS INPUT UI */}
        {stage === 1 && (
          <div className="my-auto w-full max-w-2xl text-center space-y-6 pointer-events-auto bg-slate-950/85 p-8 sm:p-12 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Real Rooftop Solar Simulator</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              SEE YOUR ROOF IN <span className="text-amber-400">SOLAR</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
              Enter your address and discover how much solar your roof could generate using high-resolution aerial imagery.
            </p>

            <div className="pt-2">
              <AddressAutocomplete onSelectLocation={handleSelectLocation} initialValue={selectedLocation.address} />
            </div>
          </div>
        )}

        {/* STAGE 2: CINEMATIC LOCATION TRANSITION HUD */}
        {stage === 2 && (
          <div className="my-auto text-center space-y-4 pointer-events-auto bg-slate-950/90 px-8 py-6 rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>CINEMATIC SATELLITE FLY-IN</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-wider font-mono">
              {flyInText}
            </div>
            <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-400 animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-slate-400 font-mono">{selectedLocation.address}</p>
          </div>
        )}

        {/* STAGE 3 & 4: REAL PROPERTY REVEAL & 2.5D INTERACTION HUD */}
        {stage === 3 && (
          <div className="w-full flex justify-between items-start pointer-events-none">
            <div className="bg-slate-950/85 p-5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl pointer-events-auto max-w-sm space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>SOLAR POTENTIAL DETECTED</span>
              </div>
              <h2 className="text-2xl font-black text-white">YOUR REAL ROOF</h2>
              <p className="text-xs text-slate-400 font-mono line-clamp-2">{selectedLocation.address}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Lat: {selectedLocation.lat} • Lng: {selectedLocation.lng}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setStage(5)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <span>START COMPUTER-VISION ROOF SCAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-950/75 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Move mouse for 2.5D spatial tilt • Scroll to zoom</span>
            </div>
          </div>
        )}

        {/* STAGE 5: ROOF DETECTION HUD */}
        {stage === 5 && (
          <div className="my-auto text-center space-y-3 pointer-events-auto bg-slate-950/90 px-8 py-6 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>ROOF DETECTION ANALYTICS</span>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white font-mono tracking-wider">
              {scanStep}
            </div>
            <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-150"
                style={{ width: `${scanProgress * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Usable Terrace Area: ~{selectedLocation.estimatedUsableAreaSqFt} sq.ft
            </div>
          </div>
        )}

        {/* STAGE 6, 7, 8, 9 & 10: INTERACTIVE SOLAR TELEMETRY & SUN SLIDER HUD */}
        {stage >= 6 && stage <= 10 && (
          <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none mt-auto">
            {/* Left Floating Info Card */}
            <div className="bg-slate-950/85 p-6 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-2xl pointer-events-auto w-full md:max-w-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                    ROOFTOP SOLAR POTENTIAL
                  </span>
                  <h3 className="text-lg font-black text-white">SOLAR TELEMETRY</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{capacityKw} kW</span>
                  <span className="text-[10px] text-slate-400 font-mono block">CAPACITY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">PANEL COUNT</span>
                  <span className="text-base font-bold text-white">{panelCount} Modules</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">EST. ANNUAL GEN.</span>
                  <span className="text-base font-bold text-amber-400">
                    {annualGenKwh.toLocaleString('en-IN')} kWh
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">EST. ANNUAL SAVINGS</span>
                  <span className="text-base font-bold text-emerald-400">
                    ₹{annualSavings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CO₂ OFFSET</span>
                  <span className="text-base font-bold text-emerald-300">{co2Offset} t/yr</span>
                </div>
              </div>

              {/* STAGE 7: Panel Configuration Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-300 block">Configure System Size</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[6, 12, 18, 24, 30].map((count) => (
                    <button
                      key={count}
                      onClick={() => setPanelCount(count)}
                      className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                        panelCount === count
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {count}P
                    </button>
                  ))}
                </div>
              </div>

              {/* STAGE 9: Sun Position Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sun className="w-3.5 h-3.5" />
                    SUN POSITION
                  </span>
                  <span>
                    {sunTime < 10
                      ? `0${sunTime}:00 Morning`
                      : sunTime > 14
                      ? `${sunTime}:00 Evening`
                      : '12:00 Noon'}
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={sunTime}
                  onChange={(e) => setSunTime(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>

            {/* Right Controls: Visual Modes & Proceed CTA */}
            <div className="flex flex-col gap-3 pointer-events-auto w-full md:w-auto">
              {/* STAGE 10 Visual Mode Switcher */}
              <div className="bg-slate-950/85 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl flex items-center gap-1 shadow-2xl">
                {(
                  [
                    { id: 'SATELLITE', label: 'SATELLITE' },
                    { id: 'SOLAR_ANALYSIS', label: 'ANALYSIS' },
                    { id: 'PANEL_LAYOUT', label: 'PANELS' },
                    { id: 'SUN', label: 'SUN' },
                  ] as { id: VisualMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setVisualMode(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      visualMode === m.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* STAGE 11 Payoff Trigger */}
              <button
                onClick={() => setStage(11)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-2xl shadow-amber-500/20 text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
              >
                <span>SEE FINAL SAVINGS PAYOFF</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 11: THE FINAL MOMENT REVEAL SCREEN */}
        {stage === 11 && (
          <div className="my-auto w-full max-w-3xl pointer-events-auto bg-slate-950/90 p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
                REAL ROOF ENERGY POTENTIAL SUMMARY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                YOUR ROOF COULD BECOME YOUR <span className="text-amber-400">POWER PLANT</span>.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <Zap className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="text-2xl font-black text-white block">{capacityKw} kW</span>
                <span className="text-[11px] text-slate-400 font-mono block">SYSTEM CAPACITY</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <Sun className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="text-2xl font-black text-white block">
                  ~{annualGenKwh.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">kWh / YEAR (EST.)</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
                <IndianRupee className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="text-2xl font-black text-amber-400 block">
                  ₹{annualSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">EST. ANNUAL SAVINGS</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                <TreePine className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-2xl font-black text-emerald-400 block">{co2Offset} t</span>
                <span className="text-[11px] text-slate-400 font-mono block">CO₂ AVOIDED / YR</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setStage(12)}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-3 transition-all hover:scale-105"
              >
                <span>GET MY DETAILED SOLAR PLAN →</span>
              </button>
              <button
                onClick={() => setStage(7)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-4 px-6 rounded-2xl border border-slate-800 text-sm transition-all"
              >
                EXPLORE ROOF AGAIN
              </button>
            </div>
          </div>
        )}

        {/* STAGE 12: LEAD GENERATION FORM */}
        {stage === 12 && (
          <div className="my-auto w-full max-w-xl pointer-events-auto bg-slate-950/95 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-6 animate-in zoom-in-95 duration-300">
            {!leadSuccess ? (
              <>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    STAGE 12 — FINALIZE YOUR REAL ROOF PLAN
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">GET YOUR CUSTOM SOLAR PROPOSAL</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    System: {panelCount} Panels ({capacityKw} kW) • Est. Savings: ₹
                    {annualSavings.toLocaleString('en-IN')}/yr
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="rajesh@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Property Address</label>
                    <input
                      type="text"
                      value={selectedLocation.address}
                      onChange={(e) =>
                        setSelectedLocation({ ...selectedLocation, address: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <span>GENERATING PROPOSAL...</span>
                    ) : (
                      <span>GET MY SOLAR PLAN →</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">REAL ROOF SOLAR PLAN GENERATED!</h3>
                <p className="text-slate-300 text-sm">
                  Thank you, <strong className="text-amber-400">{leadForm.name}</strong>. Our solar engineering team is preparing your DISCOM net metering proposal for {selectedLocation.address}.
                </p>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>System Capacity:</span>
                    <span className="text-amber-400 font-bold">{capacityKw} kW ({panelCount} Panels)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Annual Generation:</span>
                    <span className="text-white font-bold">{annualGenKwh.toLocaleString('en-IN')} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Annual Savings:</span>
                    <span className="text-emerald-400 font-bold">₹{annualSavings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-amber-500 text-slate-950 font-extrabold py-3 rounded-xl text-xs"
                  >
                    RETURN TO WEBSITE
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
