'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Sparkles, Building, ArrowRight, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { SatelliteLocation } from './types';
import { parseLocationInput, isValidLatLng } from './google-maps-parser';
import { generateRealisticRoofGeometry } from './roof-packing-algorithm';

interface AddressAutocompleteProps {
  onSelectLocation: (location: SatelliteLocation) => void;
  initialValue?: string;
}

const rawPresets = [
  {
    address: 'GST Road, Chromepet, Chennai, Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 12.9516,
    lng: 80.1462,
    zoom: 20.2,
    source: 'address' as const,
    solarIrradiance: 5.25,
  },
  {
    address: 'Radha Nagar, Chromepet, Chennai, Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 12.9482,
    lng: 80.1415,
    zoom: 20.2,
    source: 'address' as const,
    solarIrradiance: 5.25,
  },
  {
    address: 'MIT Campus Road, Chromepet, Chennai, Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 12.9472,
    lng: 80.1401,
    zoom: 20.2,
    source: 'address' as const,
    solarIrradiance: 5.25,
  },
  {
    address: 'Hasthinapuram Main Road, Chromepet, Chennai, Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 12.9535,
    lng: 80.1498,
    zoom: 20.2,
    source: 'address' as const,
    solarIrradiance: 5.25,
  },
  {
    address: 'Station Road, Chromepet, Chennai, Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 12.952,
    lng: 80.1448,
    zoom: 20.2,
    source: 'address' as const,
    solarIrradiance: 5.25,
  },
];

export const PRESET_SATELLITE_LOCATIONS: SatelliteLocation[] = rawPresets.map((p) => {
  const geo = generateRealisticRoofGeometry(p.lat, p.lng);
  return {
    ...p,
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
});

export function AddressAutocomplete({ onSelectLocation, initialValue = '' }: AddressAutocompleteProps) {
  const [address, setAddress] = useState(initialValue || 'Chromepet, Chennai');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(PRESET_SATELLITE_LOCATIONS);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedInput = parseLocationInput(address);

  useEffect(() => {
    if (!address.trim()) {
      setSuggestions(PRESET_SATELLITE_LOCATIONS);
      setStatusMessage(null);
      setErrorMessage(null);
      return;
    }

    if (parsedInput.isGoogleMapsLink) {
      if (parsedInput.lat && parsedInput.lng) {
        setStatusMessage(`Google Maps location detected (${parsedInput.lat.toFixed(4)}, ${parsedInput.lng.toFixed(4)})`);
      } else {
        setStatusMessage('Google Maps location link detected → Ready to resolve');
      }
    } else if (parsedInput.isCoordinates) {
      setStatusMessage(`Coordinates detected (${parsedInput.lat?.toFixed(4)}, ${parsedInput.lng?.toFixed(4)})`);
    } else {
      setStatusMessage(null);
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
      setSuggestions(PRESET_SATELLITE_LOCATIONS);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setErrorMessage(null);
    setIsOpen(false);

    if (parsedInput.lat !== null && parsedInput.lng !== null && isValidLatLng(parsedInput.lat, parsedInput.lng)) {
      const geo = generateRealisticRoofGeometry(parsedInput.lat, parsedInput.lng);
      const normalizedLoc: SatelliteLocation = {
        address: parsedInput.displayAddress || address,
        city: 'Chromepet, Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        lat: parsedInput.lat,
        lng: parsedInput.lng,
        zoom: 20.2,
        source: parsedInput.source,
        roofPolygon: geo.roofPolygon,
        exclusionPolygons: geo.exclusionPolygons,
        roofOrientationDeg: geo.roofOrientationDeg,
        solarIrradiance: 5.25,
        totalRoofAreaSqFt: geo.metrics.totalRoofAreaSqFt,
        estimatedUsableAreaSqFt: geo.metrics.usableRoofAreaSqFt,
        obstructionAreaSqFt: geo.metrics.obstructionAreaSqFt,
        metrics: geo.metrics,
        buildingConfidence: 'ESTIMATED ROOF',
      };
      onSelectLocation(normalizedLoc);
      return;
    }

    if (parsedInput.isGoogleMapsLink) {
      setIsLocating(true);
      setStatusMessage('Resolving Google Maps location...');

      try {
        const res = await fetch('/api/resolve-maps-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: address }),
        });

        const data = await res.json();
        setIsLocating(false);

        if (data.success && isValidLatLng(data.lat, data.lng)) {
          setStatusMessage(`Location resolved (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)})`);

          const geo = generateRealisticRoofGeometry(data.lat, data.lng);
          const resolvedLoc: SatelliteLocation = {
            address: data.displayAddress || 'Chromepet, Chennai',
            city: 'Chromepet, Chennai',
            district: 'Chennai',
            state: 'Tamil Nadu',
            lat: data.lat,
            lng: data.lng,
            zoom: 20.2,
            source: 'google-maps-link',
            roofPolygon: geo.roofPolygon,
            exclusionPolygons: geo.exclusionPolygons,
            roofOrientationDeg: geo.roofOrientationDeg,
            solarIrradiance: 5.25,
            totalRoofAreaSqFt: geo.metrics.totalRoofAreaSqFt,
            estimatedUsableAreaSqFt: geo.metrics.usableRoofAreaSqFt,
            obstructionAreaSqFt: geo.metrics.obstructionAreaSqFt,
            metrics: geo.metrics,
            buildingConfidence: 'ESTIMATED ROOF',
          };
          onSelectLocation(resolvedLoc);
          return;
        } else {
          setStatusMessage(null);
          setErrorMessage(
            data.error ||
              "Couldn't read coordinates from this Google Maps link. Please paste a full Google Maps URL with coordinates or search by address."
          );
          return;
        }
      } catch (err) {
        setIsLocating(false);
        setStatusMessage(null);
        setErrorMessage("Error resolving Google Maps URL. Please paste full Google Maps URL or search by address.");
        return;
      }
    }

    const matched = PRESET_SATELLITE_LOCATIONS.find((l) => l.address.toLowerCase().includes(address.toLowerCase()));
    if (matched) {
      onSelectLocation(matched);
      return;
    }

    setIsLocating(true);
    setStatusMessage('Locating address...');

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const geoData = await geoRes.json();
      setIsLocating(false);

      if (geoData && geoData[0]) {
        const lat = parseFloat(geoData[0].lat);
        const lng = parseFloat(geoData[0].lon);
        if (isValidLatLng(lat, lng)) {
          const geo = generateRealisticRoofGeometry(lat, lng);
          const addressLoc: SatelliteLocation = {
            address: geoData[0].display_name || 'Chromepet, Chennai',
            city: 'Chromepet, Chennai',
            district: 'Chennai',
            state: 'Tamil Nadu',
            lat,
            lng,
            zoom: 20.2,
            source: 'address',
            roofPolygon: geo.roofPolygon,
            exclusionPolygons: geo.exclusionPolygons,
            roofOrientationDeg: geo.roofOrientationDeg,
            solarIrradiance: 5.25,
            totalRoofAreaSqFt: geo.metrics.totalRoofAreaSqFt,
            estimatedUsableAreaSqFt: geo.metrics.usableRoofAreaSqFt,
            obstructionAreaSqFt: geo.metrics.obstructionAreaSqFt,
            metrics: geo.metrics,
            buildingConfidence: 'ESTIMATED ROOF',
          };
          onSelectLocation(addressLoc);
          return;
        }
      }

      setStatusMessage(null);
      setErrorMessage(`Address "${address}" could not be found. Please check spelling or enter coordinates.`);
    } catch (err) {
      setIsLocating(false);
      setStatusMessage(null);
      setErrorMessage('Could not complete address search. Please check your internet connection.');
    }
  };

  const handleUseCurrentLocation = () => {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please enter your address manually.');
      return;
    }

    setIsLocating(true);
    setStatusMessage('Locating your position...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let displayAddr = `Chromepet, Chennai (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        let city = 'Chromepet, Chennai';
        let state = 'Tamil Nadu';

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            displayAddr = data.display_name;
            city = 'Chromepet, Chennai';
            state = 'Tamil Nadu';
          }
        } catch (e) {}

        const geo = generateRealisticRoofGeometry(lat, lng);
        const currentLocationLoc: SatelliteLocation = {
          address: displayAddr,
          city,
          district: 'Chennai',
          state,
          lat,
          lng,
          zoom: 20.2,
          source: 'current-location',
          roofPolygon: geo.roofPolygon,
          exclusionPolygons: geo.exclusionPolygons,
          roofOrientationDeg: geo.roofOrientationDeg,
          solarIrradiance: 5.25,
          totalRoofAreaSqFt: geo.metrics.totalRoofAreaSqFt,
          estimatedUsableAreaSqFt: geo.metrics.usableRoofAreaSqFt,
          obstructionAreaSqFt: geo.metrics.obstructionAreaSqFt,
          metrics: geo.metrics,
          buildingConfidence: 'ESTIMATED ROOF',
        };

        setAddress(displayAddr);
        setIsLocating(false);
        setStatusMessage('Location acquired');
        onSelectLocation(currentLocationLoc);
      },
      (err) => {
        setIsLocating(false);
        setStatusMessage(null);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('Location access was denied. You can enter your address or paste a Google Maps link instead.');
        } else if (err.code === err.TIMEOUT) {
          setErrorMessage('Location request timed out. Please enter your address instead.');
        } else {
          setErrorMessage('Could not obtain current location. Please enter your address.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl space-y-3">
      <form onSubmit={handleSubmit} className="relative z-20 flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400">
            {parsedInput.isGoogleMapsLink ? (
              <LinkIcon className="w-5 h-5 text-sky-400" />
            ) : (
              <MapPin className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Enter address, coordinates, or paste Google Maps link..."
            className="w-full pl-12 pr-14 py-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base font-semibold shadow-2xl transition-all"
          />
          {address && (
            <button
              type="button"
              onClick={() => {
                setAddress('');
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLocating}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-4 rounded-2xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all duration-300 shrink-0 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <span>Locate my home</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 font-semibold transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Navigation className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          )}
          <span>Use my current location</span>
        </button>

        {statusMessage && (
          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 font-mono">
            {statusMessage}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Satellite Property Location</span>
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-sm">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {item.address}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {item.city}, {item.state} • Usable Roof: <span className="text-slate-200 font-mono">~{item.estimatedUsableAreaSqFt} sq.ft</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold tabular-nums bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
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
