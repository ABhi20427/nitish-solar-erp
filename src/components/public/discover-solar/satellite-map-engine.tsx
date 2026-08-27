'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SatelliteLocation, VisualMode } from './types';

interface SatelliteMapEngineProps {
  location: SatelliteLocation;
  stage: number; // 1 to 12
  visualMode: VisualMode;
  panelCount: number; // 6, 12, 18, 24, 30
  sunTime: number; // 6 (06:00) to 18 (18:00)
  isScanning: boolean;
  scanProgress: number; // 0 to 1
  zoomLevel: 'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP';
  onLocationChanged?: (newLat: number, newLng: number) => void;
}

function latLngToWorldPixel(lat: number, lng: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinY = Math.sin((lat * Math.PI) / 180);
  const clampedSinY = Math.min(Math.max(sinY, -0.9999), 0.9999);
  const y = (0.5 - Math.log((1 + clampedSinY) / (1 - clampedSinY)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldPixelToLatLng(x: number, y: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

export function SatelliteMapEngine({
  location,
  stage,
  visualMode,
  panelCount,
  sunTime,
  isScanning,
  scanProgress,
  zoomLevel,
  onLocationChanged,
}: SatelliteMapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Geographic Center Coordinates (Lat, Lng) & Float Zoom Level
  const [centerLat, setCenterLat] = useState(location.lat);
  const [centerLng, setCenterLng] = useState(location.lng);
  const [geoZoom, setGeoZoom] = useState(19.8); // Tight framing on target house

  // Tile Cache: Map<tileKey, HTMLImageElement>
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Inertial Drag Panning State
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Screen Dimensions
  const [screenDim, setScreenDim] = useState({ width: 1920, height: 1080 });

  // Sync Location Prop changes to Center Coordinates
  useEffect(() => {
    setCenterLat(location.lat);
    setCenterLng(location.lng);
  }, [location.lat, location.lng]);

  // Sync Stage / ZoomLevel Prop to GeoZoom (Requirement #2 & #14: Close Property Framing)
  useEffect(() => {
    let targetZ = 19.8;
    if (zoomLevel === 'CITY') targetZ = 14.8;
    else if (zoomLevel === 'NEIGHBOURHOOD') targetZ = 17.2;
    else if (zoomLevel === 'PROPERTY') targetZ = 19.5;
    else if (zoomLevel === 'ROOFTOP') targetZ = 19.95;

    if (stage === 2) targetZ = 15.5;

    setGeoZoom(targetZ);
  }, [zoomLevel, stage]);

  // Screen Resize Listener
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setScreenDim({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Requirement #1: NO MOUSE TILT - Spatially stable drag panning only
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    velocity.current = { x: dx, y: dy };

    const currentZoom = geoZoom;
    const centerPx = latLngToWorldPixel(centerLat, centerLng, currentZoom);
    const newPx = { x: centerPx.x - dx, y: centerPx.y - dy };
    const newLatLng = worldPixelToLatLng(newPx.x, newPx.y, currentZoom);

    setCenterLat(newLatLng.lat);
    setCenterLng(newLatLng.lng);
    if (onLocationChanged) onLocationChanged(newLatLng.lat, newLatLng.lng);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Native Non-Passive Event Listeners for Geographic Map Zoom & Pan (Zero Console Warnings)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0025;
      setGeoZoom((prev) => Math.max(14.0, Math.min(20.3, prev + zoomDelta)));
    };

    let touchStartDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - dragStart.current.x;
        const dy = e.touches[0].clientY - dragStart.current.y;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        velocity.current = { x: dx, y: dy };
        setCenterLat((prevLat) => {
          const px = latLngToWorldPixel(prevLat, centerLng, geoZoom);
          const newLatLng = worldPixelToLatLng(px.x - dx, px.y - dy, geoZoom);
          return newLatLng.lat;
        });
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchStartDist > 0) {
          const delta = (dist - touchStartDist) * 0.006;
          setGeoZoom((prev) => Math.max(14.0, Math.min(20.3, prev + delta)));
        }
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      touchStartDist = 0;
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', onNativeWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [geoZoom, centerLng]);

  // Inertial Damping Loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!isDragging.current) {
        if (Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05) {
          const dx = velocity.current.x;
          const dy = velocity.current.y;

          setCenterLat((prevLat) => {
            const px = latLngToWorldPixel(prevLat, centerLng, geoZoom);
            const newLatLng = worldPixelToLatLng(px.x - dx, px.y - dy, geoZoom);
            return newLatLng.lat;
          });

          velocity.current.x *= 0.88;
          velocity.current.y *= 0.88;
        }
      }
      renderCanvas();
      if (active) animFrameId.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      active = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [centerLat, centerLng, geoZoom, stage, visualMode, panelCount, sunTime, isScanning, scanProgress, location]);

  // MAIN FULLSCREEN CANVAS RENDER ENGINE
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = screenDim.width;
    const height = screenDim.height;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const currentZoom = geoZoom;
    const integerZoom = Math.min(19, Math.floor(currentZoom));
    const zoomFraction = Math.pow(2, currentZoom - integerZoom);

    const centerWorldPx = latLngToWorldPixel(centerLat, centerLng, integerZoom);

    const tileSize = 256;
    const cols = Math.ceil(width / (tileSize * zoomFraction)) + 3;
    const rows = Math.ceil(height / (tileSize * zoomFraction)) + 3;

    const startTileX = Math.floor(centerWorldPx.x / tileSize) - Math.floor(cols / 2);
    const startTileY = Math.floor(centerWorldPx.y / tileSize) - Math.floor(rows / 2);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoomFraction, zoomFraction);

    let hasTileRendered = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = startTileX + c;
        const ty = startTileY + r;

        if (tx < 0 || ty < 0) continue;

        const tileWorldX = tx * tileSize;
        const tileWorldY = ty * tileSize;

        const drawX = tileWorldX - centerWorldPx.x;
        const drawY = tileWorldY - centerWorldPx.y;

        const tileKey = `${integerZoom}/${ty}/${tx}`;
        let img = tileCacheRef.current.get(tileKey);

        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${integerZoom}/${ty}/${tx}`;
          tileCacheRef.current.set(tileKey, img);
        }

        if (img.complete && img.naturalWidth > 0) {
          hasTileRendered = true;
          ctx.drawImage(img, drawX, drawY, tileSize + 0.5, tileSize + 0.5);
        }
      }
    }

    if (!hasTileRendered) {
      drawAerialCanvasGrid(ctx, width, height);
    }

    // Dynamic Sun Lighting & Shadow Overlay
    drawSunShadowLayer(ctx, sunTime, width, height);

    // Requirement #4 & #5: Real Data-Driven Roof Polygon & Obstruction Overlay
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      drawRoofPolygonOverlay(ctx, location.roofPolygon, isScanning, scanProgress, stage);
    }

    // Requirement #6, #7 & #8: Dynamic Solar Panel Array Layout Overlay
    if (stage >= 5) {
      drawSolarPanelsGrid(ctx, location.roofPolygon, panelCount, visualMode);
    }

    ctx.restore();
  }, [centerLat, centerLng, geoZoom, screenDim, stage, visualMode, panelCount, sunTime, isScanning, scanProgress, location]);

  const drawAerialCanvasGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-width, -height, width * 2, height * 2);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = -width; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, -height);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const drawSunShadowLayer = (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
    const normalizedTime = (time - 6) / 12;
    const sunAngle = (normalizedTime - 0.5) * Math.PI * 0.85;

    const shadowLen = Math.abs(normalizedTime - 0.5) * 55;
    const shadowDx = Math.sin(sunAngle) * shadowLen;
    const shadowDy = Math.cos(sunAngle) * (shadowLen * 0.5);

    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 15, 0.48)';
    ctx.fillRect(-175 + shadowDx, -135 + shadowDy, 350, 270);
    ctx.restore();

    let sunTint = 'rgba(251, 191, 36, 0.04)';
    if (time >= 10 && time <= 14) {
      sunTint = 'rgba(255, 255, 255, 0.07)';
    } else if (time > 14) {
      sunTint = 'rgba(245, 158, 11, 0.07)';
    }

    ctx.fillStyle = sunTint;
    ctx.fillRect(-w, -h, w * 2, h * 2);
  };

  // Data-Driven Roof Polygon & Excluded Obstruction Area Rendering
  const drawRoofPolygonOverlay = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    isScanning: boolean,
    scanProgress: number,
    currentStage: number
  ) => {
    ctx.save();

    const scaleX = 3.5;
    const scaleY = 2.7;

    // Outer Roof Boundary
    ctx.beginPath();
    poly.forEach((pt, i) => {
      const px = (pt.x - 50) * scaleX;
      const py = (pt.y - 50) * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([10, 5]);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.fill();

    // STEP 4: Render Excluded Obstruction Zones (e.g. Staircase headroom / HVAC unit)
    if (currentStage >= 4) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);

      // Roof Tank / Stairwell exclusion zone
      ctx.fillRect(20, -60, 45, 35);
      ctx.strokeRect(20, -60, 45, 35);
    }

    // STEP 2: Scanning treatment over REAL satellite imagery
    if (isScanning) {
      const scanY = -135 + scanProgress * 270;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-175, scanY);
      ctx.lineTo(175, scanY);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, scanY - 25, 0, scanY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(-175, scanY - 25, 350, 25);
    }

    ctx.restore();
  };

  // Requirement #6, #7, #8 & #9: Dynamic Panel Grid Layout Calculation
  const drawSolarPanelsGrid = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    count: number,
    mode: VisualMode
  ) => {
    ctx.save();

    let cols = 4;
    if (count >= 24) cols = 6;
    else if (count >= 18) cols = 6;
    else if (count >= 12) cols = 4;
    else cols = 3;

    const rows = Math.ceil(count / cols);
    const pWidth = 40;
    const pHeight = 26;
    const pGap = 4;

    const startX = -((cols * (pWidth + pGap)) / 2) + pWidth / 2;
    const startY = -((rows * (pHeight + pGap)) / 2) + pHeight / 2;

    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);

      const px = startX + c * (pWidth + pGap);
      const py = startY + r * (pHeight + pGap);

      // Skip placement if hitting exclusion zone (HVAC / Tank zone)
      if (px > 10 && px < 70 && py > -70 && py < -20) continue;

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px - pWidth / 2 + 13, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 13, py + pHeight / 2);
      ctx.moveTo(px - pWidth / 2 + 26, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 26, py + pHeight / 2);
      ctx.stroke();

      const glassGrad = ctx.createLinearGradient(
        px - pWidth / 2,
        py - pHeight / 2,
        px + pWidth / 2,
        py + pHeight / 2
      );
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);
    }

    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Fullscreen Map Canvas */}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {/* Target Frame (Only during Stage 3 targeting) */}
      {stage === 3 && (
        <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center z-20">
          <div className="relative w-80 h-64 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-400/5 shadow-2xl flex flex-col items-center justify-between p-4 animate-pulse">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

            <span className="text-[11px] font-mono font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              PROPERTY TARGET
            </span>

            <span className="text-xs text-amber-200 font-mono text-center bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
              Position your property inside the target frame
            </span>
          </div>
        </div>
      )}

      {/* Subtle Controls */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setGeoZoom((prev) => Math.min(20.3, prev + 0.5))}
          className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setGeoZoom((prev) => Math.max(14.0, prev - 0.5))}
          className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0F]/80 via-transparent to-[#070A0F]/60" />
    </div>
  );
}
