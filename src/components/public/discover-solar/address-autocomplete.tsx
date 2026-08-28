'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Sparkles, Building, ArrowRight, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { SatelliteLocation } from './types';
import { parseLocationInput, isValidLatLng } from './google-maps-parser';

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
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 30, y: 24 },
      { x: 72, y: 24 },
      { x: 76, y: 76 },
      { x: 24, y: 76 },
    ],
    solarIrradiance: 4.85,
    totalRoofAreaSqFt: 1850,
    estimatedUsableAreaSqFt: 1450,
    obstructionAreaSqFt: 400,
  },
  {
    address: 'DLF Cyber City, Phase 2, Gurugram, Haryana',
    city: 'Gurugram',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.495,
    lng: 77.0895,
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 22, y: 20 },
      { x: 78, y: 20 },
      { x: 78, y: 80 },
      { x: 22, y: 80 },
    ],
    solarIrradiance: 4.92,
    totalRoofAreaSqFt: 2750,
    estimatedUsableAreaSqFt: 2200,
    obstructionAreaSqFt: 550,
  },
  {
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 28, y: 22 },
      { x: 72, y: 22 },
      { x: 68, y: 78 },
      { x: 24, y: 78 },
    ],
    solarIrradiance: 4.65,
    totalRoofAreaSqFt: 1650,
    estimatedUsableAreaSqFt: 1300,
    obstructionAreaSqFt: 350,
  },
  {
    address: 'Pali Hill, Bandra West, Mumbai, Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0622,
    lng: 72.828,
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 32, y: 26 },
      { x: 68, y: 26 },
      { x: 68, y: 74 },
      { x: 32, y: 74 },
    ],
    solarIrradiance: 4.75,
    totalRoofAreaSqFt: 1400,
    estimatedUsableAreaSqFt: 1100,
    obstructionAreaSqFt: 300,
  },
  {
    address: 'SG Highway, Bodakdev, Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0396,
    lng: 72.5074,
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 18, y: 18 },
      { x: 82, y: 18 },
      { x: 82, y: 82 },
      { x: 18, y: 82 },
    ],
    solarIrradiance: 5.4,
    totalRoofAreaSqFt: 3400,
    estimatedUsableAreaSqFt: 2800,
    obstructionAreaSqFt: 600,
  },
  {
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4156,
    lng: 78.4347,
    zoom: 20.2,
    source: 'address',
    roofPolygon: [
      { x: 26, y: 24 },
      { x: 74, y: 24 },
      { x: 74, y: 76 },
      { x: 26, y: 76 },
    ],
    solarIrradiance: 5.12,
    totalRoofAreaSqFt: 2000,
    estimatedUsableAreaSqFt: 1600,
    obstructionAreaSqFt: 400,
  },
];

export function AddressAutocomplete({ onSelectLocation, initialValue = '' }: AddressAutocompleteProps) {
  const [address, setAddress] = useState(initialValue);
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
      setSuggestions([]);
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

    // 1. Direct Coordinates or Pre-extracted Google Maps URL Coordinates
    if (parsedInput.lat !== null && parsedInput.lng !== null && isValidLatLng(parsedInput.lat, parsedInput.lng)) {
      console.log(`Google Maps location parsed directly: { latitude: ${parsedInput.lat}, longitude: ${parsedInput.lng} }`);
      const normalizedLoc: SatelliteLocation = {
        address: parsedInput.displayAddress || address,
        city: 'Mapped Location',
        district: 'District',
        state: 'India',
        lat: parsedInput.lat,
        lng: parsedInput.lng,
        zoom: 19.8,
        source: parsedInput.source,
        roofPolygon: [
          { x: 25, y: 22 },
          { x: 75, y: 22 },
          { x: 75, y: 78 },
          { x: 25, y: 78 },
        ],
        solarIrradiance: 4.85,
        totalRoofAreaSqFt: 1900,
        estimatedUsableAreaSqFt: 1500,
        obstructionAreaSqFt: 400,
      };
      onSelectLocation(normalizedLoc);
      return;
    }

    // 2. Google Maps URL requiring server-side expansion (e.g. short link or place search link)
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
          console.log(`Google Maps location resolved via API: { latitude: ${data.lat}, longitude: ${data.lng} }`);
          setStatusMessage(`Location resolved (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)})`);

          const resolvedLoc: SatelliteLocation = {
            address: data.displayAddress || address,
            city: 'Mapped Region',
            district: 'District',
            state: 'India',
            lat: data.lat,
            lng: data.lng,
            zoom: 19.8,
            source: 'google-maps-link',
            roofPolygon: [
              { x: 25, y: 22 },
              { x: 75, y: 22 },
              { x: 75, y: 78 },
              { x: 25, y: 78 },
            ],
            solarIrradiance: 4.85,
            totalRoofAreaSqFt: 1900,
            estimatedUsableAreaSqFt: 1500,
            obstructionAreaSqFt: 400,
          };
          onSelectLocation(resolvedLoc);
          return;
        } else {
          // ABSOLUTE RULE #6: NEVER SILENTLY FALL BACK TO DEFAULT PUNE LOCATION!
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

    // 3. Preset match
    const matched = PRESET_SATELLITE_LOCATIONS.find((l) => l.address.toLowerCase().includes(address.toLowerCase()));
    if (matched) {
      onSelectLocation(matched);
      return;
    }

    // 4. Geocode text address via OpenStreetMap Nominatim
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
          const addressLoc: SatelliteLocation = {
            address: geoData[0].display_name || address,
            city: geoData[0].address?.city || 'Local Region',
            district: geoData[0].address?.county || 'District',
            state: geoData[0].address?.state || 'India',
            lat,
            lng,
            zoom: 19.8,
            source: 'address',
            roofPolygon: [
              { x: 25, y: 22 },
              { x: 75, y: 22 },
              { x: 75, y: 78 },
              { x: 25, y: 78 },
            ],
            solarIrradiance: 4.8,
            totalRoofAreaSqFt: 1800,
            estimatedUsableAreaSqFt: 1400,
            obstructionAreaSqFt: 400,
          };
          onSelectLocation(addressLoc);
          return;
        }
      }

      // Geocoding failed -> Return clear error (NO SILENT DEFAULT FALLBACK!)
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

        let displayAddr = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        let city = 'Local Region';
        let state = 'India';

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            displayAddr = data.display_name;
            city = data.address?.city || data.address?.town || data.address?.suburb || 'Local Region';
            state = data.address?.state || 'India';
          }
        } catch (e) {}

        const currentLocationLoc: SatelliteLocation = {
          address: displayAddr,
          city,
          district: city,
          state,
          lat,
          lng,
          zoom: 19.8,
          source: 'current-location',
          roofPolygon: [
            { x: 26, y: 22 },
            { x: 74, y: 22 },
            { x: 74, y: 78 },
            { x: 26, y: 78 },
          ],
          solarIrradiance: 4.85,
          totalRoofAreaSqFt: 1750,
          estimatedUsableAreaSqFt: 1400,
          obstructionAreaSqFt: 350,
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
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative z-20 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400">
            {parsedInput.isGoogleMapsLink ? (
              <LinkIcon className="w-5 h-5 text-sky-400 animate-pulse" />
            ) : (
              <MapPin className="w-5 h-5 animate-pulse" />
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
            className="w-full pl-12 pr-14 py-4 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base font-medium shadow-2xl transition-all"
          />
          {address && (
            <button
              type="button"
              onClick={() => {
                setAddress('');
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLocating}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all duration-300 shrink-0 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>LOCATING...</span>
            </>
          ) : (
            <>
              <span>LOCATE MY HOME</span>
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 font-mono font-bold transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Navigation className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          )}
          <span>◎ USE MY CURRENT LOCATION</span>
        </button>

        {statusMessage && (
          <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 animate-pulse">
            {statusMessage}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
                    {item.city}, {item.state} • Usable Area: ~{item.estimatedUsableAreaSqFt} sq.ft
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
