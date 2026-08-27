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
  onConfirmTarget?: () => void;
}

/**
 * Web Mercator Projection Conversion Utilities
 * Converts (lat, lng, zoom) <-> World Pixel Coordinates
 */
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
  onConfirmTarget,
}: SatelliteMapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Geographic Center Coordinates (Lat, Lng) & Float Zoom Level
  const [centerLat, setCenterLat] = useState(location.lat);
  const [centerLng, setCenterLng] = useState(location.lng);
  const [geoZoom, setGeoZoom] = useState(19.0); // 14.0 (City) to 20.0 (Rooftop)

  // 2.5D Spatial Perspective Tilt State
  const [tilt, setTilt] = useState({ x: 12, y: 0 });

  // Map Tile Cache: Map<tileKey, HTMLImageElement>
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

  // Sync Stage / ZoomLevel Prop to GeoZoom
  useEffect(() => {
    let targetZ = 19.0;
    if (zoomLevel === 'CITY') targetZ = 14.8;
    else if (zoomLevel === 'NEIGHBOURHOOD') targetZ = 17.0;
    else if (zoomLevel === 'PROPERTY') targetZ = 19.0;
    else if (zoomLevel === 'ROOFTOP') targetZ = 19.8;

    if (stage === 2) targetZ = 15.5;

    setGeoZoom(targetZ);
  }, [zoomLevel, stage]);

  // Canvas Resize Handler to guarantee 100% Fullscreen
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

  // 2.5D Parallax Mouse Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };

      velocity.current = { x: dx, y: dy };

      // Pan geographic map center
      const currentZoom = geoZoom;
      const centerPx = latLngToWorldPixel(centerLat, centerLng, currentZoom);
      const newPx = { x: centerPx.x - dx, y: centerPx.y - dy };
      const newLatLng = worldPixelToLatLng(newPx.x, newPx.y, currentZoom);

      setCenterLat(newLatLng.lat);
      setCenterLng(newLatLng.lng);
      if (onLocationChanged) onLocationChanged(newLatLng.lat, newLatLng.lng);
      return;
    }

    if (!containerRef.current) return;
    const mouseX = (e.clientX - screenDim.width / 2) / (screenDim.width / 2);
    const mouseY = (e.clientY - screenDim.height / 2) / (screenDim.height / 2);

    setTilt({
      x: 12 - mouseY * 8,
      y: mouseX * 10,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Native Non-Passive Event Listeners for Smooth Geographic Zooming & Dragging
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Non-passive wheel listener for TRUE GEOGRAPHIC MAP ZOOMing
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0025;
      setGeoZoom((prev) => Math.max(13.5, Math.min(20.2, prev + zoomDelta)));
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
          setGeoZoom((prev) => Math.max(13.5, Math.min(20.2, prev + delta)));
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
  }, [centerLat, centerLng, geoZoom, tilt, stage, visualMode, panelCount, sunTime, isScanning, scanProgress, location]);

  // MAIN FULLSCREEN 2.5D CANVAS TILE RENDER ENGINE
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = screenDim.width;
    const height = screenDim.height;

    canvas.width = width;
    canvas.height = height;

    // Clear Background
    ctx.clearRect(0, 0, width, height);

    // Render Fullscreen Satellite Tiles
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
      // High-Definition Aerial Canvas Grid
      drawAerialCanvasGrid(ctx, width, height);
    }

    // Dynamic Sun Lighting & Shadow Layer
    drawSunShadowLayer(ctx, sunTime, width, height);

    // Target Property Roof Polygon & Laser Scanner
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      drawRoofPolygonOverlay(ctx, location.roofPolygon, isScanning, scanProgress);
    }

    // Solar Panel Grid Overlay
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

    const shadowLen = Math.abs(normalizedTime - 0.5) * 50;
    const shadowDx = Math.sin(sunAngle) * shadowLen;
    const shadowDy = Math.cos(sunAngle) * (shadowLen * 0.5);

    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 15, 0.45)';
    ctx.fillRect(-150 + shadowDx, -110 + shadowDy, 300, 220);
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

  const drawRoofPolygonOverlay = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    isScanning: boolean,
    scanProgress: number
  ) => {
    ctx.save();

    const scaleX = 3.0;
    const scaleY = 2.2;

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

    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();

    if (isScanning) {
      const scanY = -110 + scanProgress * 220;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-150, scanY);
      ctx.lineTo(150, scanY);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(-150, scanY - 20, 300, 20);
    }

    ctx.restore();
  };

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
    const pWidth = 36;
    const pHeight = 24;
    const pGap = 4;

    const startX = -((cols * (pWidth + pGap)) / 2) + pWidth / 2;
    const startY = -((rows * (pHeight + pGap)) / 2) + pHeight / 2;

    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);

      const px = startX + c * (pWidth + pGap);
      const py = startY + r * (pHeight + pGap);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px - pWidth / 2 + 12, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 12, py + pHeight / 2);
      ctx.moveTo(px - pWidth / 2 + 24, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 24, py + pHeight / 2);
      ctx.stroke();

      const glassGrad = ctx.createLinearGradient(
        px - pWidth / 2,
        py - pHeight / 2,
        px + pWidth / 2,
        py + pHeight / 2
      );
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
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
      style={{
        perspective: '1200px',
      }}
    >
      {/* 2.5D Full-Screen Map Canvas */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>

      {/* REQUIREMENTS #6, #7, #8: STATIONARY PROPERTY TARGET FRAME */}
      {stage >= 3 && stage <= 4 && (
        <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center z-20">
          <div className="relative w-72 h-56 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-400/5 shadow-2xl flex flex-col items-center justify-between p-4 animate-pulse">
            {/* Target Corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

            <span className="text-[11px] font-mono font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              PROPERTY TARGET
            </span>

            <span className="text-xs text-amber-200 font-mono text-center bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
              Position your property inside the frame
            </span>
          </div>
        </div>
      )}

      {/* REQUIREMENT #13: MINIMAL SUBTLE MAP CONTROLS */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setGeoZoom((prev) => Math.min(20.2, prev + 0.5))}
          className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setGeoZoom((prev) => Math.max(13.5, prev - 0.5))}
          className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* Atmospheric Depth Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0F]/80 via-transparent to-[#070A0F]/60" />
    </div>
  );
}
