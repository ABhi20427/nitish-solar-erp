'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Check,
  ShieldCheck,
  Edit3,
  PlusCircle,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import { AddressAutocomplete, PRESET_SATELLITE_LOCATIONS } from './address-autocomplete';
import { SatelliteMapEngine } from './satellite-map-engine';
import { SatelliteLocation, VisualMode, Point2D, SolarEngineState } from './types';
import { generateRealisticRoofGeometry, recalculateRoofMetrics } from './roof-packing-algorithm';
import { useSolarStore } from '@/lib/store-context';

interface DiscoverSolarExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiscoverSolarExperience({ isOpen, onClose }: DiscoverSolarExperienceProps) {
  const { addLead } = useSolarStore();

  // Initial setup with realistic geometry
  const initialGeo = generateRealisticRoofGeometry(PRESET_SATELLITE_LOCATIONS[0].lat, PRESET_SATELLITE_LOCATIONS[0].lng);
  const initialLoc: SatelliteLocation = {
    ...PRESET_SATELLITE_LOCATIONS[0],
    roofPolygon: initialGeo.roofPolygon,
    exclusionPolygons: initialGeo.exclusionPolygons,
    roofOrientationDeg: initialGeo.roofOrientationDeg,
    totalRoofAreaSqFt: initialGeo.totalRoofAreaSqFt,
    estimatedUsableAreaSqFt: initialGeo.estimatedUsableAreaSqFt,
    obstructionAreaSqFt: initialGeo.obstructionAreaSqFt,
    buildingConfidence: 'ESTIMATED ROOF',
    isUserConfirmed: false,
  };

  // 8 VISUAL STATES ARCHITECTURE (Requirement #14)
  // 1: LOCATING PROPERTY, 2: PROPERTY FOUND, 3: ROOF DETECTED, 4: ADJUST ROOF,
  // 5: ROOF CONFIRMED, 6: CALCULATING SOLAR POTENTIAL, 7: OPTIMISING PANEL LAYOUT, 8: SOLAR ARRAY READY
  const [stage, setStage] = useState<SolarEngineState>(1);
  const [selectedLocation, setSelectedLocation] = useState<SatelliteLocation>(initialLoc);

  // Stage 2 Property Zoom Progression
  const [zoomLevel, setZoomLevel] = useState<'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP'>('CITY');
  const [flyInText, setFlyInText] = useState('PUNE REGION SATELLITE FEED');

  // Requirement #14 Data-Driven 8-Step Roof Scan Sequence
  const [scanStepText, setScanStepText] = useState<string>('STATE 6 — CALCULATING SOLAR POTENTIAL');
  const [scanProgress, setScanProgress] = useState<number>(0);

  // System Size Panel Config (6, 12, 18, 24, 30)
  const [panelCount, setPanelCount] = useState<number>(24);

  // Requirement #13 Live Derived Solar Metrics
  const [capacityKw, setCapacityKw] = useState<number>(10.8);
  const [annualGenKwh, setAnnualGenKwh] = useState<number>(14800);
  const [annualSavings, setAnnualSavings] = useState<number>(142000);
  const [co2Offset, setCo2Offset] = useState<number>(12.4);

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

  // REQUIREMENT #11, #13, #22: SINGLE SOURCE OF TRUTH METRICS CASCADE
  // Recalculates metrics live whenever panelCount or roofPolygon/exclusionPolygons change!
  useEffect(() => {
    const kw = Number(((panelCount * 450) / 1000).toFixed(1));
    const kwhPerKw = selectedLocation.solarIrradiance * 365 * 0.78;
    const genKwh = Math.round(kw * kwhPerKw);
    const savings = Math.round(genKwh * 9.6);
    const co2 = Number((genKwh * 0.00084).toFixed(1));

    setCapacityKw(kw);
    setAnnualGenKwh(genKwh);
    setAnnualSavings(savings);
    setCo2Offset(co2);
  }, [panelCount, selectedLocation.solarIrradiance, selectedLocation.totalRoofAreaSqFt, selectedLocation.estimatedUsableAreaSqFt]);

  // Stage 2 Property Zoom Controller (Progression: CITY -> NEIGHBOURHOOD -> PROPERTY -> ROOFTOP)
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

  // Requirement #14 Data-Driven Roof Analysis Controller (State 6 & 7)
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
    const geo = generateRealisticRoofGeometry(loc.lat, loc.lng);
    const enrichedLoc: SatelliteLocation = {
      ...loc,
      roofPolygon: geo.roofPolygon,
      exclusionPolygons: geo.exclusionPolygons,
      roofOrientationDeg: geo.roofOrientationDeg,
      totalRoofAreaSqFt: geo.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: geo.estimatedUsableAreaSqFt,
      obstructionAreaSqFt: geo.obstructionAreaSqFt,
      buildingConfidence: 'ESTIMATED ROOF',
      isUserConfirmed: false,
    };
    setSelectedLocation(enrichedLoc);
    setStage(2);
  };

  // Callback when user drags/edits roof polygon vertices in ADJUST ROOF mode (Stage 4)
  const handleRoofPolygonChanged = (newPoly: Point2D[]) => {
    const metrics = recalculateRoofMetrics(newPoly, selectedLocation.exclusionPolygons || []);
    setSelectedLocation((prev) => ({
      ...prev,
      roofPolygon: newPoly,
      totalRoofAreaSqFt: metrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: metrics.estimatedUsableAreaSqFt,
      obstructionAreaSqFt: metrics.obstructionAreaSqFt,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
  };

  // Add custom user obstacle exclusion zone
  const handleAddObstacle = () => {
    const currentEx = selectedLocation.exclusionPolygons || [];
    // Insert new obstacle box centered in middle of roof
    const newEx: Point2D[] = [
      { x: 42, y: 42 },
      { x: 58, y: 42 },
      { x: 58, y: 56 },
      { x: 42, y: 56 },
    ];
    const updatedEx = [...currentEx, newEx];
    const metrics = recalculateRoofMetrics(selectedLocation.roofPolygon, updatedEx);
    setSelectedLocation((prev) => ({
      ...prev,
      exclusionPolygons: updatedEx,
      totalRoofAreaSqFt: metrics.totalRoofAreaSqFt,
      estimatedUsableAreaSqFt: metrics.estimatedUsableAreaSqFt,
      obstructionAreaSqFt: metrics.obstructionAreaSqFt,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
  };

  // Confirm roof boundary action (Requirement #4, #22: Single Source of Truth)
  const handleConfirmRoof = () => {
    setSelectedLocation((prev) => ({
      ...prev,
      isUserConfirmed: true,
      buildingConfidence: 'USER-CONFIRMED ROOF',
    }));
    setStage(6); // Move to CALCULATING SOLAR POTENTIAL
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
          requiredCapacity: capacityKw,
          monthlyBill: Math.round(annualSavings / 12),
          message: `Confirmed Roof Solar Lead: (${selectedLocation.lat}, ${selectedLocation.lng}), Roof Area ${selectedLocation.totalRoofAreaSqFt} sq.ft, Usable Area ${selectedLocation.estimatedUsableAreaSqFt} sq.ft, ${panelCount} modules, ${capacityKw} kW, Est generation ${annualGenKwh} kWh/yr. ${leadForm.notes}`,
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
        proposedCapacityKw: capacityKw,
        monthlyBillAmount: Math.round(annualSavings / 12),
        roofAreaSqFt: selectedLocation.estimatedUsableAreaSqFt,
        source: 'Discover Your Solar Experience',
        notes: `Qualified Confirmed-Roof Lead: Coordinates: ${selectedLocation.lat}, ${selectedLocation.lng}. Roof Area: ${selectedLocation.totalRoofAreaSqFt} sq.ft, Usable: ${selectedLocation.estimatedUsableAreaSqFt} sq.ft. Configured: ${panelCount} Modules (${capacityKw} kWp), Est. Generation: ${annualGenKwh} kWh/yr, Est. Savings: ₹${annualSavings.toLocaleString('en-IN')}.`,
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
      {/* 100% Fullscreen Real Satellite Map Engine */}
      <div className="fixed inset-0 z-0">
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
      </div>

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold tracking-wider text-base sm:text-lg">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>SOLAR VISION</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono font-normal">
              EDITABLE ROOF ENGINE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
            <span className={stage >= 1 ? 'text-amber-400 font-bold' : ''}>01 LOCATION</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 3 ? 'text-amber-400 font-bold' : ''}>02 ROOF BOUNDARY</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 5 ? 'text-amber-400 font-bold' : ''}>03 CONFIRMATION</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={stage >= 8 ? 'text-amber-400 font-bold' : ''}>04 ARRAY DESIGN</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stage >= 3 && (
            <button
              onClick={() => setStage(1)}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CHANGE LOCATION</span>
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
        
        {/* STATE 1: LOCATING PROPERTY (ADDRESS INPUT UI) */}
        {stage === 1 && (
          <div className="my-auto w-full max-w-2xl text-center space-y-6 pointer-events-auto bg-slate-950/95 p-8 sm:p-12 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>AUTOMATIC + EDITABLE ROOF ENGINE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              DISCOVER YOUR ROOF IN <span className="text-amber-400">SOLAR</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
              Enter your address, coordinates, or Google Maps link to auto-detect your building footprint and design your solar array.
            </p>

            <div className="pt-2">
              <AddressAutocomplete onSelectLocation={handleSelectLocation} initialValue={selectedLocation.address} />
            </div>
          </div>
        )}

        {/* STATE 2: PROPERTY FOUND (CINEMATIC SATELLITE TRANSITION) */}
        {stage === 2 && (
          <div className="my-auto text-center space-y-4 pointer-events-auto bg-slate-950/95 px-8 py-6 rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>SATELLITE POSITIONING</span>
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

        {/* STATE 3: ROOF DETECTED (AUTO BOUNDARY REVIEW HUD - REQUIREMENT #3, #18, #19) */}
        {stage === 3 && (
          <div className="w-full flex justify-between items-start pointer-events-none">
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl pointer-events-auto max-w-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{selectedLocation.buildingConfidence || 'ESTIMATED ROOF'}</span>
              </div>
              <h2 className="text-2xl font-black text-white">ROOF DETECTED</h2>
              <p className="text-xs text-slate-400 font-mono line-clamp-2">{selectedLocation.address}</p>
              
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">TOTAL ROOF AREA:</span>
                  <span className="text-amber-400 font-bold">{selectedLocation.totalRoofAreaSqFt} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USABLE AREA:</span>
                  <span className="text-emerald-400 font-bold">{selectedLocation.estimatedUsableAreaSqFt} sq.ft</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={handleConfirmRoof}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>CONFIRM ROOF BOUNDARY →</span>
                </button>

                <button
                  onClick={() => setStage(4)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>ADJUST ROOF BOUNDARY</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/85 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Review boundary • Click Adjust to refine vertices</span>
            </div>
          </div>
        )}

        {/* STATE 4: ADJUST ROOF (INTERACTIVE CANVAS EDITING HUD - REQUIREMENT #3, #9, #18) */}
        {stage === 4 && (
          <div className="w-full flex justify-between items-start pointer-events-none">
            <div className="bg-slate-950/95 p-5 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-xl pointer-events-auto max-w-sm space-y-3 animate-in zoom-in-95">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Edit3 className="w-4 h-4 animate-pulse" />
                <span>SPATIAL ROOF EDITOR ACTIVE</span>
              </div>

              <h2 className="text-xl font-black text-white">ADJUST ROOF BOUNDARY</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                • Drag handles (●) to align roof corners<br />
                • Click '+' to add vertex<br />
                • Right-click handle to delete vertex
              </p>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">TOTAL ROOF AREA:</span>
                  <span className="text-amber-400 font-bold">{selectedLocation.totalRoofAreaSqFt} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USABLE ROOF AREA:</span>
                  <span className="text-emerald-400 font-bold">{selectedLocation.estimatedUsableAreaSqFt} sq.ft</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={handleAddObstacle}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>+ ADD OBSTACLE EXCLUSION</span>
                </button>

                <button
                  onClick={handleConfirmRoof}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>CONFIRM ROOF →</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/85 px-4 py-2.5 rounded-xl border border-amber-500/30 text-xs font-mono text-amber-400 pointer-events-auto flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Editing: Click and drag handles over satellite image</span>
            </div>
          </div>
        )}

        {/* STATE 6 & 7: CALCULATING SOLAR POTENTIAL & OPTIMISING PANEL LAYOUT */}
        {stage >= 6 && stage <= 7 && (
          <div className="my-auto text-center space-y-3 pointer-events-auto bg-slate-950/95 px-8 py-6 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>DYNAMIC 2D ROOF PACKING ENGINE</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
              {scanStepText}
            </div>
            <div className="w-72 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-150"
                style={{ width: `${scanProgress * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 pt-1">
              <div>Confirmed Area: {selectedLocation.totalRoofAreaSqFt} sq.ft</div>
              <div className="text-rose-300">Excluded: {selectedLocation.obstructionAreaSqFt} sq.ft</div>
              <div className="text-amber-400 font-bold">Usable: {selectedLocation.estimatedUsableAreaSqFt} sq.ft</div>
            </div>
          </div>
        )}

        {/* STATE 8: SOLAR ARRAY READY (COMPACT INSTRUMENT HUD & LIVE DERIVED TELEMETRY) */}
        {stage === 8 && (
          <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none mt-auto">
            {/* Left Compact Information Instrument Panel */}
            <div className="bg-slate-950/90 p-5 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-2xl pointer-events-auto w-full md:max-w-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                    {selectedLocation.buildingConfidence || 'USER-CONFIRMED ROOF'}
                  </span>
                  <h3 className="text-base font-black text-white">SOLAR TELEMETRY</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400">{capacityKw} kW</span>
                  <span className="text-[10px] text-slate-400 font-mono block">CAPACITY</span>
                </div>
              </div>

              {/* Requirement #13, #15: Real calculated roof metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">TOTAL ROOF AREA</span>
                  <span className="text-sm font-bold text-slate-200">{selectedLocation.totalRoofAreaSqFt} sq.ft</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">USABLE ROOF AREA</span>
                  <span className="text-sm font-bold text-amber-400">{selectedLocation.estimatedUsableAreaSqFt} sq.ft</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">PANEL COUNT</span>
                  <span className="text-sm font-bold text-white">{panelCount} Modules</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">EST. ANNUAL GEN.</span>
                  <span className="text-sm font-bold text-amber-400">
                    {annualGenKwh.toLocaleString('en-IN')} kWh
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[9px]">EST. ANNUAL SAVINGS</span>
                    <span className="text-sm font-bold text-emerald-400">₹{annualSavings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* System Size Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">System Size Selector</span>
                  <button
                    onClick={() => setStage(4)}
                    className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Roof</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[6, 12, 18, 24, 30].map((count) => (
                    <button
                      key={count}
                      onClick={() => setPanelCount(count)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all ${
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

              {/* Sun Position Control */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
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
              </div>
            </div>

            {/* Right Controls: Visual Modes & Payoff CTA */}
            <div className="flex flex-col gap-3 pointer-events-auto w-full md:w-auto">
              <div className="bg-slate-950/90 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl flex items-center gap-1 shadow-2xl">
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

              <button
                onClick={() => setStage(11 as any)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-2xl shadow-amber-500/20 text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
              >
                <span>SEE FINAL SAVINGS PAYOFF</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 11: THE FINAL MOMENT REVEAL SCREEN */}
        {((stage as any) === 11) && (
          <div className="my-auto w-full max-w-3xl pointer-events-auto bg-slate-950/95 p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
                CONFIRMED ROOF ENERGY POTENTIAL SUMMARY
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
                <span className="text-[11px] text-slate-400 font-mono block">EST. CO₂ OFFSET</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setStage(12 as any)}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-3 transition-all hover:scale-105"
              >
                <span>GET MY DETAILED SOLAR PLAN →</span>
              </button>
              <button
                onClick={() => setStage(8)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-4 px-6 rounded-2xl border border-slate-800 text-sm transition-all"
              >
                EXPLORE ROOF AGAIN
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
                    <span className="text-amber-400 font-bold">{capacityKw} kW ({panelCount} Modules)</span>
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
