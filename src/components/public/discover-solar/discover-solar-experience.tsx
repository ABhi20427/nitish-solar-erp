'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  IndianRupee,
  TreePine,
  Activity,
  Layers,
  Sliders,
  Compass,
  Check,
  ShieldCheck,
  Edit3,
  PlusCircle,
  CheckCheck,
  Undo2,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { AddressAutocomplete, PRESET_SATELLITE_LOCATIONS } from './address-autocomplete';
import { SatelliteMapEngine } from './satellite-map-engine';
import { CountUp } from './count-up';
import { SatelliteLocation, VisualMode, Point2D, SolarEngineState, CanonicalRoofMetrics } from './types';
import { generateRealisticRoofGeometry, recalculateRoofMetrics, computePanelPlacement } from './roof-packing-algorithm';
import { useSolarStore } from '@/lib/store-context';

interface DiscoverSolarExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

// Header step navigator ranges
const HEADER_STEPS = [
  { label: 'Location', min: 1, max: 1 },
  { label: 'Roof Boundary', min: 2, max: 5 },
  { label: 'Confirmation', min: 6, max: 7 },
  { label: 'Array Design', min: 8, max: 999 },
] as const;

export function DiscoverSolarExperience({ isOpen, onClose }: DiscoverSolarExperienceProps) {
  const { addLead } = useSolarStore();

  const initialLoc: SatelliteLocation = PRESET_SATELLITE_LOCATIONS[0];

  const [stage, setStage] = useState<SolarEngineState>(1);
  const [selectedLocation, setSelectedLocation] = useState<SatelliteLocation>(initialLoc);

  // Undo History Stack for Roof Boundary Edits
  const undoHistoryRef = useRef<{ roofPolygon: Point2D[]; exclusionPolygons: Point2D[][] }[]>([]);

  // Stage 2 Property Zoom Progression
  const [zoomLevel, setZoomLevel] = useState<'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP'>('CITY');
  const [flyInText, setFlyInText] = useState('PUNE REGION SATELLITE FEED');

  // 8-Step Roof Scan Sequence
  const [scanStepText, setScanStepText] = useState<string>('STATE 6 — CALCULATING SOLAR POTENTIAL');
  const [scanProgress, setScanProgress] = useState<number>(0);

  // System Size Panel Config
  const [panelCount, setPanelCount] = useState<number>(24);

  // Sun Position Slider (06:00 to 18:00)
  const [sunTime, setSunTime] = useState<number>(12);

  // Visual Mode
  const [visualMode, setVisualMode] = useState<VisualMode>('PANEL_LAYOUT');

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // SINGLE CANONICAL METRICS SOURCE OF TRUTH
  const metrics: CanonicalRoofMetrics = recalculateRoofMetrics(
    selectedLocation.roofPolygon,
    selectedLocation.exclusionPolygons || [],
    selectedLocation.lat,
    selectedLocation.zoom || 20.2,
    panelCount,
    selectedLocation.solarIrradiance
  );

  const STAGE_ORDER = [1, 2, 3, 4, 6, 7, 8, 11, 12];
  const stageOrderIdx = STAGE_ORDER.indexOf(stage as number);
  const overallProgressPct = stageOrderIdx === -1 ? 0 : (stageOrderIdx / (STAGE_ORDER.length - 1)) * 100;

  // Stage 2 Property Zoom Controller
  useEffect(() => {
    if (stage !== 2) return;

    setZoomLevel('CITY');
    setFlyInText(`${selectedLocation.state.toUpperCase()} SATELLITE SECTOR`);

    const t1 = setTimeout(() => {
      setZoomLevel('NEIGHBOURHOOD');
      setFlyInText(`${selectedLocation.city.toUpperCase()} NEIGHBOURHOOD`);
    }, 700);

    const t2 = setTimeout(() => {
      setZoomLevel('PROPERTY');
      setFlyInText('PROPERTY IDENTIFIED — FRAMING BUILDING');
    }, 1500);

    const t3 = setTimeout(() => {
      setZoomLevel('ROOFTOP');
      setStage(3); // ROOF DETECTED
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [stage, selectedLocation]);

  // Roof Analysis Controller (State 6 & 7)
  useEffect(() => {
    if (stage !== 6) return;

    let p = 0;
    const interval = setInterval(() => {
      p += 0.05;
      setScanProgress(Math.min(1, p));

      if (p < 0.5) {
        setScanStepText('STATE 6 — CALCULATING SOLAR POTENTIAL');
      } else if (p < 0.9) {
        setScanStepText('STATE 7 — OPTIMISING PANEL LAYOUT');
      } else {
        setScanStepText('STATE 8 — SOLAR ARRAY READY');
      }

      if (p >= 1) {
        clearInterval(interval);
        setTimeout(() => setStage(8), 300);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc: SatelliteLocation) => {
    const hasGeometry = loc.roofPolygon && loc.roofPolygon.length >= 3 && loc.metrics;
    const enrichedLoc: SatelliteLocation = hasGeometry
      ? { ...loc, isUserConfirmed: false, buildingConfidence: loc.buildingConfidence || 'ESTIMATED ROOF' }
      : (() => {
          const geo = generateRealisticRoofGeometry(loc.lat, loc.lng);
          return {
            ...loc,
            roofPolygon: geo.roofPolygon,
            exclusionPolygons: geo.exclusionPolygons,
            roofOrientationDeg: geo.roofOrientationDeg,
            totalRoofAreaSqFt: geo.metrics.totalRoofAreaSqFt,
            estimatedUsableAreaSqFt: geo.metrics.usableRoofAreaSqFt,
            obstructionAreaSqFt: geo.metrics.obstructionAreaSqFt,
            metrics: geo.metrics,
            buildingConfidence: 'ESTIMATED ROOF' as const,
            isUserConfirmed: false,
          };
        })();
    setSelectedLocation(enrichedLoc);
    undoHistoryRef.current = [];
    setStage(2);
  };

  const pushUndoState = () => {
    undoHistoryRef.current.push({
      roofPolygon: JSON.parse(JSON.stringify(selectedLocation.roofPolygon)),
      exclusionPolygons: JSON.parse(JSON.stringify(selectedLocation.exclusionPolygons || [])),
    });
    if (undoHistoryRef.current.length > 20) undoHistoryRef.current.shift();
  };

  const handleUndo = () => {
    if (undoHistoryRef.current.length === 0) return;
    const prev = undoHistoryRef.current.pop()!;
    const newMetrics = recalculateRoofMetrics(
      prev.roofPolygon,
      prev.exclusionPolygons,
      selectedLocation.lat,
      selectedLocation.zoom || 20.2,
      panelCount,
      selectedLocation.solarIrradiance
    );
    setSelectedLocation((loc) => ({
      ...loc,
      roofPolygon: prev.roofPolygon,
      exclusionPolygons: prev.exclusionPolygons,
      totalRoofAreaSqFt: newMetrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: newMetrics.usableRoofAreaSqFt,
      obstructionAreaSqFt: newMetrics.obstructionAreaSqFt,
      metrics: newMetrics,
    }));
  };

  const handleRoofPolygonChanged = (newPoly: Point2D[]) => {
    pushUndoState();
    const newMetrics = recalculateRoofMetrics(
      newPoly,
      selectedLocation.exclusionPolygons || [],
      selectedLocation.lat,
      selectedLocation.zoom || 20.2,
      panelCount,
      selectedLocation.solarIrradiance
    );
    setSelectedLocation((prev) => ({
      ...prev,
      roofPolygon: newPoly,
      totalRoofAreaSqFt: newMetrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: newMetrics.usableRoofAreaSqFt,
      obstructionAreaSqFt: newMetrics.obstructionAreaSqFt,
      metrics: newMetrics,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
  };

  const handleAddPoint = () => {
    pushUndoState();
    const poly = [...selectedLocation.roofPolygon];
    if (poly.length < 3) return;
    const newPt = {
      x: (poly[0].x + poly[1].x) / 2,
      y: (poly[0].y + poly[1].y) / 2,
    };
    poly.splice(1, 0, newPt);
    const newMetrics = recalculateRoofMetrics(
      poly,
      selectedLocation.exclusionPolygons || [],
      selectedLocation.lat,
      selectedLocation.zoom || 20.2,
      panelCount,
      selectedLocation.solarIrradiance
    );
    setSelectedLocation((prev) => ({
      ...prev,
      roofPolygon: poly,
      totalRoofAreaSqFt: newMetrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: newMetrics.usableRoofAreaSqFt,
      obstructionAreaSqFt: newMetrics.obstructionAreaSqFt,
      metrics: newMetrics,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
  };

  const handleAddObstacle = () => {
    pushUndoState();
    const currentEx = selectedLocation.exclusionPolygons || [];
    const newEx: Point2D[] = [
      { x: 44, y: 44 },
      { x: 56, y: 44 },
      { x: 56, y: 56 },
      { x: 44, y: 56 },
    ];
    const updatedEx = [...currentEx, newEx];
    const newMetrics = recalculateRoofMetrics(
      selectedLocation.roofPolygon,
      updatedEx,
      selectedLocation.lat,
      selectedLocation.zoom || 20.2,
      panelCount,
      selectedLocation.solarIrradiance
    );
    setSelectedLocation((prev) => ({
      ...prev,
      exclusionPolygons: updatedEx,
      totalRoofAreaSqFt: newMetrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: newMetrics.usableRoofAreaSqFt,
      obstructionAreaSqFt: newMetrics.obstructionAreaSqFt,
      metrics: newMetrics,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
  };

  const handleConfirmRoof = () => {
    setSelectedLocation((prev) => ({
      ...prev,
      isUserConfirmed: true,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
    setStage(6);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          location: selectedLocation.address,
          propertyType: 'RESIDENTIAL',
          requiredCapacity: metrics.capacityKw,
          monthlyBill: Math.round(metrics.annualSavings / 12),
          message: `Confirmed Roof Solar Lead: (${selectedLocation.lat}, ${selectedLocation.lng}), Roof Area ${metrics.totalRoofAreaSqFt} sq.ft (${metrics.totalRoofAreaM2} m²), Usable Area ${metrics.usableRoofAreaSqFt} sq.ft (${metrics.usableRoofAreaM2} m²), ${metrics.panelCount} modules, ${metrics.capacityKw} kW, Est generation ${metrics.annualGenKwh} kWh/yr. ${leadForm.notes}`,
          source: 'Discover Your Solar Experience',
        }),
      });

      addLead({
        fullName: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        customerType: 'RESIDENTIAL',
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        proposedCapacityKw: metrics.capacityKw,
        monthlyBillAmount: Math.round(metrics.annualSavings / 12),
        roofAreaSqFt: metrics.usableRoofAreaSqFt,
        source: 'Discover Your Solar Experience',
        notes: `Qualified Confirmed-Roof Lead: Coordinates: ${selectedLocation.lat}, ${selectedLocation.lng}. Total Roof: ${metrics.totalRoofAreaSqFt} sq.ft (${metrics.totalRoofAreaM2} m²), Usable: ${metrics.usableRoofAreaSqFt} sq.ft (${metrics.usableRoofAreaM2} m²). Configured: ${metrics.panelCount} Modules (${metrics.capacityKw} kWp), Est. Generation: ${metrics.annualGenKwh} kWh/yr, Est. Savings: ₹${metrics.annualSavings.toLocaleString('en-IN')}.`,
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
      {/* 100% Fullscreen Background Engine */}
      <div className="fixed inset-0 z-0">
        {stage === 1 ? (
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#070A0F]">
            <img
              src="/images/solar-vision-hero.jpg"
              alt="Solar Vision Sunset Landscape"
              className="w-full h-full object-cover object-[85%_center] animate-in fade-in duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/70 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
          </div>
        ) : (
          <SatelliteMapEngine
            location={selectedLocation}
            stage={stage}
            visualMode={visualMode}
            panelCount={panelCount}
            sunTime={sunTime}
            isScanning={stage === 6}
            scanProgress={scanProgress}
            zoomLevel={zoomLevel}
            onLocationChanged={(newLat, newLng) => {
              setSelectedLocation((prev) => ({
                ...prev,
                lat: Number(newLat.toFixed(6)),
                lng: Number(newLng.toFixed(6)),
              }));
            }}
            onRoofPolygonChanged={handleRoofPolygonChanged}
          />
        )}

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 backdrop-blur-2xl shadow-xl">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-700 ease-out"
            style={{ width: `${overallProgressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-white font-display font-black tracking-tight text-lg">
            <span>Solar</span><span className="text-amber-400">Vision</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-slate-900 border border-slate-800 text-amber-400 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-400" />
              REAL GEOGRAPHIC ENGINE
            </span>
          </div>

          <div className="hidden md:flex items-center border-l border-slate-800/90 pl-5">
            {HEADER_STEPS.map((step, i) => {
              const status = stage > step.max ? 'complete' : stage >= step.min ? 'active' : 'upcoming';
              return (
                <React.Fragment key={step.label}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black shrink-0 transition-all duration-500 ${
                        status === 'complete'
                          ? 'bg-amber-500 text-slate-950'
                          : status === 'active'
                          ? 'bg-amber-500/20 border border-amber-400 text-amber-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {status === 'complete' ? <Check className="w-3 h-3 text-slate-950 stroke-[3]" /> : i + 1}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-500 ${
                        status === 'upcoming' ? 'text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < HEADER_STEPS.length - 1 && (
                    <span className="relative w-7 h-[2px] mx-2.5 bg-slate-800 overflow-hidden shrink-0">
                      <span
                        className={`absolute inset-y-0 left-0 bg-amber-400 transition-all duration-500 ${
                          stage > step.max ? 'w-full' : 'w-0'
                        }`}
                      />
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stage >= 3 && (
            <button
              onClick={() => setStage(1)}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Location</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
            aria-label="Close experience"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* FLOATING COMPACT EDITOR BAR (ONLY IN STAGE 4 ADJUST ROOF) */}
      {stage === 4 && (
        <div className="relative z-30 flex items-center justify-center pt-3.5 px-3 pointer-events-none">
          <div className="max-w-full bg-slate-950/95 border border-slate-800 p-2.5 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-wrap items-center justify-center gap-2 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
            <span className="hidden sm:flex text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-amber-400 px-3 items-center gap-1.5 border-r border-slate-800 whitespace-nowrap">
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>ADJUST ROOF BOUNDARY</span>
            </span>

            <button
              onClick={handleAddPoint}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-sky-300 font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap"
              title="Add Point"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>+ Add Point</span>
            </button>

            <button
              onClick={handleAddObstacle}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-rose-300 font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap"
              title="Add Obstacle"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>+ Add Obstacle</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={undoHistoryRef.current.length === 0}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 whitespace-nowrap"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleConfirmRoof}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <CheckCheck className="w-4 h-4 text-slate-950 stroke-[3] shrink-0" />
              <span>Confirm roof →</span>
            </button>
          </div>
        </div>
      )}

      {/* CENTER HUD & STAGE CONTAINERS */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-8 pointer-events-none">
        
        {/* STATE 1: LOCATING PROPERTY (ADDRESS INPUT UI) */}
        {stage === 1 && (
          <div className="relative w-full max-w-2xl self-start text-left space-y-6 pointer-events-auto mt-auto pb-4 sm:pb-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-2.5 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-[0.2em]">
              <span className="w-5 h-[2px] bg-amber-400" />
              <span>REAL GEOGRAPHIC ROOF ENGINE</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
              Discover your roof <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">in solar.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Enter your address, coordinates, or Google Maps link to measure your actual roof geometry and design your solar system.
            </p>

            <div className="pt-2">
              <AddressAutocomplete onSelectLocation={handleSelectLocation} initialValue={selectedLocation.address} />
            </div>
          </div>
        )}

        {/* STATE 2: PROPERTY FOUND (CINEMATIC SATELLITE TRANSITION) */}
        {stage === 2 && (
          <div className="my-auto text-center space-y-5 pointer-events-auto bg-slate-950/95 px-8 py-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 max-w-md w-full">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-amber-400 animate-spin" />
              <Activity className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>

            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <span>SATELLITE POSITIONING FEED</span>
            </div>
            <div className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              {flyInText}
            </div>
            <div className="w-48 h-1.5 bg-slate-900 rounded-full mx-auto overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-3/4 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-medium">{selectedLocation.address}</p>
          </div>
        )}

        {/* STATE 3: ROOF DETECTED */}
        {stage === 3 && (
          <div className="w-full flex justify-between items-start pointer-events-none">
            <div className="bg-slate-950/95 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl pointer-events-auto max-w-sm w-full space-y-4 animate-in fade-in slide-in-from-left-6 duration-500">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedLocation.buildingConfidence || 'ESTIMATED ROOF'}</span>
              </div>
              <h2 className="font-display text-2xl font-black text-white tracking-tight">Roof detected</h2>
              <p className="text-xs text-slate-400 font-medium line-clamp-2">{selectedLocation.address}</p>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Roof Area:</span>
                  <span className="text-amber-400 font-mono font-bold tabular-nums">{metrics.totalRoofAreaSqFt} sq.ft ({metrics.totalRoofAreaM2} m²)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Usable Area (Setback):</span>
                  <span className="text-emerald-400 font-mono font-bold tabular-nums">{metrics.usableRoofAreaSqFt} sq.ft ({metrics.usableRoofAreaM2} m²)</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2.5">
                <button
                  onClick={handleConfirmRoof}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02]"
                >
                  <CheckCheck className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Confirm roof boundary →</span>
                </button>

                <button
                  onClick={() => setStage(4)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl border border-slate-800 text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adjust roof boundary</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 pointer-events-auto flex items-center gap-2 animate-in fade-in slide-in-from-right-6 duration-500 shadow-xl">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Review boundary • Click Adjust to refine vertices</span>
            </div>
          </div>
        )}

        {/* STATE 4: ADJUST ROOF (LIVE AREA TELEMETRY HUD) */}
        {stage === 4 && (
          <div className="w-full flex justify-between items-start pointer-events-none">
            <div className="bg-slate-950/95 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl pointer-events-auto max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-[0.15em] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                <Edit3 className="w-3.5 h-3.5" />
                <span>SPATIAL ROOF EDITOR ACTIVE</span>
              </div>

              <h2 className="font-display text-xl font-black text-white">Live geometry telemetry</h2>
              <ul className="text-xs text-slate-300 leading-relaxed font-medium space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Drag corners (●) or edges to align structure
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Telemetry updates live while dragging
                </li>
              </ul>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Total Roof Area:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm tabular-nums">{metrics.totalRoofAreaSqFt} sq.ft ({metrics.totalRoofAreaM2} m²)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Usable Area (Setback):</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm tabular-nums">{metrics.usableRoofAreaSqFt} sq.ft ({metrics.usableRoofAreaM2} m²)</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={handleConfirmRoof}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02]"
                >
                  <CheckCheck className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Confirm roof →</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-400 pointer-events-auto flex items-center gap-2 animate-in fade-in slide-in-from-right-6 duration-500 shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Drag corners or edges to edit shape</span>
            </div>
          </div>
        )}

        {/* STATE 6 & 7: CALCULATING SOLAR POTENTIAL */}
        {stage >= 6 && stage <= 7 && (
          <div className="relative my-auto text-center space-y-4 pointer-events-auto bg-slate-950/95 px-8 py-7 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-w-md w-full">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-amber-400" />
              <span>DYNAMIC 2D ROOF PACKING ENGINE</span>
            </div>
            <div className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              {scanStepText}
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-150"
                style={{ width: `${scanProgress * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 pt-1 tabular-nums">
              <div>Confirmed: <span className="text-white font-bold">{metrics.totalRoofAreaSqFt} sq.ft</span></div>
              <div className="text-rose-400">Excluded: <span className="font-bold">{metrics.obstructionAreaSqFt} sq.ft</span></div>
              <div className="text-amber-400 font-bold">Usable: {metrics.usableRoofAreaSqFt} sq.ft</div>
            </div>
          </div>
        )}

        {/* STATE 8: SOLAR ARRAY READY */}
        {stage === 8 && (
          <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none mt-auto">
            {/* Left Information Instrument Panel */}
            <div className="bg-slate-950/95 p-5.5 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl pointer-events-auto w-full md:max-w-sm space-y-3.5 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-[0.15em] block">
                    {selectedLocation.buildingConfidence || 'USER-CONFIRMED ROOF'}
                  </span>
                  <h3 className="font-display text-base font-black text-white">Solar Telemetry Terminal</h3>
                </div>

                <div className="relative shrink-0 w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1, metrics.capacityKw / 15))}
                      style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-sm font-black text-amber-400 leading-none tabular-nums">
                      <CountUp value={metrics.capacityKw} decimals={1} />
                    </span>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5 font-bold">kW</span>
                  </div>
                </div>
              </div>

              {/* CANONICAL METRICS INSTRUMENT GRID */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-[0.08em] font-sans">Total Roof Area</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums"><CountUp value={metrics.totalRoofAreaSqFt} /> sq.ft</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-[0.08em] font-sans">Usable Roof Area</span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums"><CountUp value={metrics.usableRoofAreaSqFt} /> sq.ft</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-[0.08em] font-sans">Panel Count</span>
                  <span className="text-sm font-bold text-white tabular-nums"><CountUp value={metrics.panelCount} /> Modules</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-[0.08em] font-sans">Est. Annual Gen.</span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    <CountUp value={metrics.annualGenKwh} /> kWh
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[9px] uppercase tracking-[0.08em] font-sans">Est. Annual Savings</span>
                    <span className="text-sm font-black text-emerald-400 tabular-nums">₹<CountUp value={metrics.annualSavings} /></span>
                  </div>
                </div>
              </div>

              {/* System Size Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">System Size Selector</span>
                  <button
                    onClick={() => setStage(4)}
                    className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Roof</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[6, 12, 18, 24, 30].map((count) => {
                    const maxAvail = computePanelPlacement(
                      selectedLocation.roofPolygon,
                      selectedLocation.exclusionPolygons || [],
                      selectedLocation.roofOrientationDeg || 0,
                      100,
                      0.5
                    ).totalPositionsAvailable;
                    const isExceeded = count > maxAvail;
                    const isSelected = panelCount === count || (count === 30 && panelCount > maxAvail && panelCount === maxAvail);

                    return (
                      <button
                        key={count}
                        onClick={() => setPanelCount(Math.min(count, Math.max(1, maxAvail)))}
                        className={`py-2 text-xs font-mono font-bold tabular-nums rounded-xl transition-all relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md'
                            : isExceeded
                            ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-900 border border-slate-800/60 line-through'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                        title={isExceeded ? `Maximum ${maxAvail} panels fit on usable roof` : `${count} Panels`}
                      >
                        {count}P
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sun Position Control */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-[0.1em] text-[10px] font-mono">
                    <Sun className="w-3.5 h-3.5" />
                    Sun Position
                  </span>
                  <span className="font-mono text-xs text-slate-200 font-bold tabular-nums">
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
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                />
              </div>
            </div>

            {/* Right Controls: Visual Modes & Payoff CTA */}
            <div className="flex flex-col gap-3 pointer-events-auto w-full md:w-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="bg-slate-950/95 p-2 rounded-2xl border border-slate-800 backdrop-blur-2xl flex items-center gap-1 shadow-2xl">
                {(
                  [
                    { id: 'SATELLITE', label: 'Satellite' },
                    { id: 'SOLAR_ANALYSIS', label: 'Analysis' },
                    { id: 'PANEL_LAYOUT', label: 'Panels' },
                    { id: 'SUN', label: 'Sun' },
                  ] as { id: VisualMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setVisualMode(m.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      visualMode === m.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStage(11 as any)}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-xl text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>See final savings payoff</span>
                <ArrowRight className="w-5 h-5 text-slate-950 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 11: THE FINAL MOMENT REVEAL SCREEN */}
        {((stage as any) === 11) && (
          <div className="my-auto w-full max-w-3xl pointer-events-auto bg-slate-950/95 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400 block">
                CONFIRMED ROOF ENERGY POTENTIAL SUMMARY
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                Your roof could become your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">power plant.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0ms' }}>
                <Zap className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="font-mono text-2xl font-black text-white block tabular-nums"><CountUp value={metrics.capacityKw} decimals={1} /> kW</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-[0.08em] block">System Capacity</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '80ms' }}>
                <Sun className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="font-mono text-2xl font-black text-white block tabular-nums">
                  ~<CountUp value={metrics.annualGenKwh} />
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-[0.08em] block">kWh / Year (Est.)</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '160ms' }}>
                <IndianRupee className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="font-mono text-2xl font-black text-amber-400 block tabular-nums">
                  ₹<CountUp value={metrics.annualSavings} />
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-[0.08em] block">Est. Annual Savings</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '240ms' }}>
                <TreePine className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="font-mono text-2xl font-black text-emerald-400 block tabular-nums"><CountUp value={metrics.co2Offset} decimals={1} /> t</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-[0.08em] block">Est. CO₂ Offset</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setStage(12 as any)}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-xl text-sm flex items-center justify-center gap-3 transition-all hover:scale-105"
              >
                <span>Get my detailed solar plan →</span>
              </button>
              <button
                onClick={() => setStage(8)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-4 px-6 rounded-2xl border border-slate-800 text-sm transition-all"
              >
                Explore roof again
              </button>
            </div>
          </div>
        )}

        {/* STAGE 12: LEAD GENERATION FORM */}
        {((stage as any) === 12) && (
          <div className="my-auto w-full max-w-xl pointer-events-auto bg-slate-950/95 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-6 animate-in zoom-in-95 duration-300">
            {!leadSuccess ? (
              <>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em] block">
                    FINALIZE YOUR REAL ROOF PLAN
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-white">Get your custom solar proposal</h2>
                  <p className="text-xs text-slate-300 font-mono tabular-nums">
                    System: <strong className="text-amber-400">{metrics.panelCount} Panels ({metrics.capacityKw} kW)</strong> • Est. Savings: <strong className="text-emerald-400">₹{metrics.annualSavings.toLocaleString('en-IN')}/yr</strong>
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="rajesh@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Property Address</label>
                    <input
                      type="text"
                      value={selectedLocation.address}
                      onChange={(e) =>
                        setSelectedLocation({ ...selectedLocation, address: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-4 px-6 rounded-2xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span>Generating proposal...</span>
                    ) : (
                      <span>Get my solar plan →</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-black text-white">Real roof solar plan generated!</h3>
                <p className="text-slate-300 text-sm font-medium">
                  Thank you, <strong className="text-amber-400 font-bold">{leadForm.name}</strong>. Our solar engineering team is preparing your DISCOM net metering proposal for {selectedLocation.address}.
                </p>
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>System Capacity:</span>
                    <span className="text-amber-400 font-bold tabular-nums">{metrics.capacityKw} kW ({metrics.panelCount} Modules)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Annual Generation:</span>
                    <span className="text-white font-bold tabular-nums">{metrics.annualGenKwh.toLocaleString('en-IN')} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Annual Savings:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">₹{metrics.annualSavings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-md"
                  >
                    Return to website
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
