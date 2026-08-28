'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SatelliteLocation, VisualMode, Point2D } from './types';
import { computePanelPlacement, isPointInPolygon } from './roof-packing-algorithm';

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

  // REQUIREMENT #2: Property-First Ultra-Tight Zoom Level (20.2 to 20.5)
  const [geoZoom, setGeoZoom] = useState(20.2);

  // Tile Cache: Map<tileKey, HTMLImageElement>
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Inertial Drag Panning State (NO MOUSE TILT)
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

  // REQUIREMENT #2: Progression: CITY (15.0) -> NEIGHBOURHOOD (17.5) -> PROPERTY (20.2) -> ROOF (20.5)
  useEffect(() => {
    let targetZ = 20.2;
    if (zoomLevel === 'CITY') targetZ = 15.0;
    else if (zoomLevel === 'NEIGHBOURHOOD') targetZ = 17.5;
    else if (zoomLevel === 'PROPERTY') targetZ = 20.2;
    else if (zoomLevel === 'ROOFTOP') targetZ = 20.5;

    if (stage === 2) targetZ = 16.0;

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

  // REQUIREMENT #1: Mouse Drag Panning ONLY (Zero 2.5D Tilt)
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

  // Native Non-Passive Event Listeners for Map Zoom & Pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0025;
      setGeoZoom((prev) => Math.max(14.0, Math.min(21.0, prev + zoomDelta)));
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
          setGeoZoom((prev) => Math.max(14.0, Math.min(21.0, prev + delta)));
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

  // MAIN HIGH-RESOLUTION CANVAS RENDER ENGINE
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

    // Dynamic Sun Lighting Overlay
    drawSunLightingLayer(ctx, sunTime, width, height);

    // REQUIREMENT #5, #6: Data-Driven Roof Polygon & Excluded Obstruction Area Overlay
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      drawRoofAnalysisOverlay(
        ctx,
        location.roofPolygon,
        location.exclusionPolygons || [],
        isScanning,
        scanProgress,
        stage
      );
    }

    // REQUIREMENT #7, #8, #9, #10, #11: Dynamic Photovoltaic Module Array Layout
    if (stage >= 5) {
      drawRealisticSolarPanels(
        ctx,
        location.roofPolygon,
        location.exclusionPolygons || [],
        location.roofOrientationDeg || 0,
        panelCount,
        visualMode,
        isScanning,
        scanProgress
      );
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

  const drawSunLightingLayer = (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => {
    let sunTint = 'rgba(251, 191, 36, 0.03)';
    if (time >= 10 && time <= 14) {
      sunTint = 'rgba(255, 255, 255, 0.05)';
    } else if (time > 14) {
      sunTint = 'rgba(245, 158, 11, 0.06)';
    }

    ctx.fillStyle = sunTint;
    ctx.fillRect(-w, -h, w * 2, h * 2);
  };

  // REQUIREMENT #5 & #6: DATA-DRIVEN ROOF POLYGON & COMPUTATIONAL ANALYSIS VISUALS
  const drawRoofAnalysisOverlay = (
    ctx: CanvasRenderingContext2D,
    poly: Point2D[],
    exclusions: Point2D[][],
    isScanning: boolean,
    scanProgress: number,
    currentStage: number
  ) => {
    if (!poly || poly.length < 3) return;

    ctx.save();

    // Map 0..100 normalized roof space into viewport scale
    const scaleX = 4.2;
    const scaleY = 3.6;

    // Convert normalized point to Canvas coordinates
    const toPx = (pt: Point2D) => ({
      x: (pt.x - 50) * scaleX,
      y: (pt.y - 50) * scaleY,
    });

    // STATE 2: DETECTING ROOF (Gradual line drawing)
    const pts = poly.map(toPx);

    ctx.beginPath();
    pts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    if (currentStage === 5 && scanProgress < 0.36) {
      // Line by line drawing effect
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 6]);
      ctx.stroke();
    } else {
      // Solid sharp property roof border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.stroke();

      // STATE 3 & 5: USABLE SURFACE MAPPING (Subtle grid fill)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fill();
    }

    // STATE 4: EXCLUSION ZONES (Water Tank / Stairwell)
    if (currentStage >= 5 && scanProgress >= 0.54) {
      exclusions.forEach((exPoly) => {
        const exPts = exPoly.map(toPx);
        ctx.beginPath();
        exPts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.fill();
        ctx.stroke();
      });
    }

    // STATE 1 & SCAN BEAM PASS
    if (isScanning && scanProgress < 0.9) {
      const scanY = -180 + scanProgress * 360;

      ctx.save();
      ctx.beginPath();
      pts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.clip(); // Restrict beam strictly inside roof boundary

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-250, scanY);
      ctx.lineTo(250, scanY);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(-250, scanY - 30, 500, 30);

      ctx.restore();
    }

    ctx.restore();
  };

  // REQUIREMENT #7, #8, #9, #10, #11: REALISTIC PHOTOVOLTAIC MODULE RENDERING
  const drawRealisticSolarPanels = (
    ctx: CanvasRenderingContext2D,
    poly: Point2D[],
    exclusions: Point2D[][],
    orientationDeg: number,
    count: number,
    mode: VisualMode,
    isScanning: boolean,
    scanProgress: number
  ) => {
    if (!poly || poly.length < 3) return;

    ctx.save();

    const scaleX = 4.2;
    const scaleY = 3.6;

    // Run dynamic 2D packing algorithm to compute exact module placement coordinates
    const placement = computePanelPlacement(poly, exclusions, orientationDeg, count);
    const visiblePanels = placement.panels;

    // Number of panels to reveal based on scan/animation progress
    let renderLimit = visiblePanels.length;
    if (isScanning) {
      if (scanProgress < 0.72) renderLimit = 0;
      else {
        const animP = (scanProgress - 0.72) / 0.28;
        renderLimit = Math.floor(animP * visiblePanels.length);
      }
    }

    visiblePanels.forEach((p, idx) => {
      if (idx > renderLimit) return;

      const px = (p.x - 50) * scaleX;
      const py = (p.y - 50) * scaleY;
      const pW = p.width * scaleX;
      const pH = p.length * scaleY;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((orientationDeg * Math.PI) / 180);

      // 1. Dark Photovoltaic Monocrystalline Silicon Base
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(-pW / 2, -pH / 2, pW, pH);

      // 2. Anodized Metallic Aluminum Frame Outline
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-pW / 2, -pH / 2, pW, pH);

      // 3. Silicon Wafer Cell Grid Matrix (6 columns x 10 rows cell lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();

      // Busbar lines (vertical silver conductors)
      const busbar1 = -pW / 2 + pW * 0.33;
      const busbar2 = -pW / 2 + pW * 0.66;
      ctx.moveTo(busbar1, -pH / 2);
      ctx.lineTo(busbar1, pH / 2);
      ctx.moveTo(busbar2, -pH / 2);
      ctx.lineTo(busbar2, pH / 2);

      // Horizontal cell division lines
      const cellRows = 5;
      for (let r = 1; r < cellRows; r++) {
        const yLine = -pH / 2 + (pH / cellRows) * r;
        ctx.moveTo(-pW / 2, yLine);
        ctx.lineTo(pW / 2, yLine);
      }
      ctx.stroke();

      // 4. Subtle Anti-Reflective Glass Reflection Glare
      const glassGrad = ctx.createLinearGradient(-pW / 2, -pH / 2, pW / 2, pH / 2);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      glassGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(-pW / 2, -pH / 2, pW, pH);

      ctx.restore();
    });

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
      {/* High-Resolution Fullscreen Map Canvas */}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {/* Subtle Zoom Controls */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setGeoZoom((prev) => Math.min(21.0, prev + 0.4))}
          className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setGeoZoom((prev) => Math.max(14.0, prev - 0.4))}
          className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-800 text-amber-400 hover:bg-slate-900 font-mono text-lg font-bold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0F]/70 via-transparent to-[#070A0F]/50" />
    </div>
  );
}
