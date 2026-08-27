'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Sparkles, Building, ArrowRight } from 'lucide-react';
import { SatelliteLocation } from './types';

interface AddressAutocompleteProps {
  onSelectLocation: (location: SatelliteLocation) => void;
  initialValue?: string;
}

export const PRESET_SATELLITE_LOCATIONS: SatelliteLocation[] = [
  {
    address: 'Baner Road, Baner, Pune, Maharashtra',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.559,
    lng: 73.7868,
    zoom: 19.2,
    roofPolygon: [
      { x: 32, y: 28 },
      { x: 68, y: 28 },
      { x: 72, y: 72 },
      { x: 28, y: 72 },
    ],
    solarIrradiance: 4.85,
    estimatedUsableAreaSqFt: 1450,
  },
  {
    address: 'DLF Cyber City, Phase 2, Gurugram, Haryana',
    city: 'Gurugram',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.495,
    lng: 77.0895,
    zoom: 19.0,
    roofPolygon: [
      { x: 25, y: 22 },
      { x: 75, y: 22 },
      { x: 75, y: 78 },
      { x: 25, y: 78 },
    ],
    solarIrradiance: 4.92,
    estimatedUsableAreaSqFt: 2200,
  },
  {
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    zoom: 19.3,
    roofPolygon: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 66, y: 75 },
      { x: 26, y: 75 },
    ],
    solarIrradiance: 4.65,
    estimatedUsableAreaSqFt: 1300,
  },
  {
    address: 'Pali Hill, Bandra West, Mumbai, Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0622,
    lng: 72.828,
    zoom: 19.4,
    roofPolygon: [
      { x: 35, y: 30 },
      { x: 65, y: 30 },
      { x: 65, y: 70 },
      { x: 35, y: 70 },
    ],
    solarIrradiance: 4.75,
    estimatedUsableAreaSqFt: 1100,
  },
  {
    address: 'SG Highway, Bodakdev, Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0396,
    lng: 72.5074,
    zoom: 19.1,
    roofPolygon: [
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 80, y: 80 },
      { x: 20, y: 80 },
    ],
    solarIrradiance: 5.4,
    estimatedUsableAreaSqFt: 2800,
  },
  {
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4156,
    lng: 78.4347,
    zoom: 19.2,
    roofPolygon: [
      { x: 30, y: 26 },
      { x: 70, y: 26 },
      { x: 70, y: 74 },
      { x: 30, y: 74 },
    ],
    solarIrradiance: 5.12,
    estimatedUsableAreaSqFt: 1600,
  },
];

export function AddressAutocomplete({ onSelectLocation, initialValue = '' }: AddressAutocompleteProps) {
  const [address, setAddress] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(PRESET_SATELLITE_LOCATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address.trim()) {
      setSuggestions(PRESET_SATELLITE_LOCATIONS);
      return;
    }

    const query = address.toLowerCase();
    const filtered = PRESET_SATELLITE_LOCATIONS.filter(
      (loc) =>
        loc.address.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
      setSuggestions(filtered);
    } else {
      setSuggestions([
        {
          address: `${address}, Mapped Location, India`,
          city: 'Mapped Region',
          district: 'District',
          state: 'India',
          lat: 18.5204,
          lng: 73.8567,
          zoom: 19.0,
          roofPolygon: [
            { x: 30, y: 25 },
            { x: 70, y: 25 },
            { x: 70, y: 75 },
            { x: 30, y: 75 },
          ],
          solarIrradiance: 4.8,
          estimatedUsableAreaSqFt: 1500,
        },
      ]);
    }
  }, [address]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: SatelliteLocation) => {
    setAddress(loc.address);
    setIsOpen(false);
    onSelectLocation(loc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    const matched = PRESET_SATELLITE_LOCATIONS.find((l) => l.address.toLowerCase().includes(address.toLowerCase()));
    if (matched) {
      onSelectLocation(matched);
    } else {
      onSelectLocation(suggestions[0] || PRESET_SATELLITE_LOCATIONS[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative z-20 flex items-center gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400">
            <MapPin className="w-5 h-5 animate-pulse" />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Enter property address (e.g. Baner Pune, Cyber City Gurugram)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base font-medium shadow-2xl transition-all"
          />
          {address && (
            <button
              type="button"
              onClick={() => setAddress('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center gap-2 transition-all duration-300 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>LOCATE MY HOME</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select exact satellite property location</span>
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-3 rounded-xl hover:bg-slate-900/80 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {item.address}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.city}, {item.state} • Satellite View Ready
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full border border-slate-700">
                  {item.solarIrradiance} kWh/kWp/day
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
