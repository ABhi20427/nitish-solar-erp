'use client';

import React, { useEffect, useRef, useState } from 'react';
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
}

/**
 * Web Mercator projection conversion (lat, lng, zoom) -> Tile X, Y
 */
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const rad = (lat * Math.PI) / 180;
  const tileX = Math.floor(((lng + 180) / 360) * n);
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  );
  return { tileX, tileY };
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
}: SatelliteMapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 2.5D Perspective Tilt & Parallax State
  const [tilt, setTilt] = useState({ x: 12, y: 0 }); // 12 deg tilt for 2.5D spatial angle
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Map Tile Loading State
  const [isLoadingTiles, setIsLoadingTiles] = useState(true);
  const [tileLoadError, setTileLoadError] = useState(false);

  // Inertial Drag State
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // High-Resolution Satellite Aerial Images (3x3 Tile Grid Composite)
  const tileImagesRef = useRef<HTMLImageElement[]>([]);

  // Compute Zoom Scale based on Zoom Stage
  useEffect(() => {
    let targetScale = 1;
    if (zoomLevel === 'CITY') targetScale = 0.4;
    else if (zoomLevel === 'NEIGHBOURHOOD') targetScale = 0.7;
    else if (zoomLevel === 'PROPERTY') targetScale = 1.1;
    else if (zoomLevel === 'ROOFTOP') targetScale = 1.55;

    if (stage === 2) targetScale = 0.5;

    setZoomScale(targetScale);
  }, [zoomLevel, stage]);

  // Load Real 3x3 Satellite Tile Grid for Target Property
  useEffect(() => {
    setIsLoadingTiles(true);
    setTileLoadError(false);

    const lat = location.lat;
    const lng = location.lng;
    const z = 18; // High-res tile zoom level

    const { tileX, tileY } = latLngToTile(lat, lng, z);

    const tilePromises: Promise<HTMLImageElement>[] = [];
    const images: HTMLImageElement[] = [];

    // Fetch 3x3 surrounding tile grid
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Esri World Imagery Tile Feed URL
        const tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;

        const p = new Promise<HTMLImageElement>((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => {
            // Backup tile source (Google Satellite Tiles)
            const backupImg = new Image();
            backupImg.crossOrigin = 'anonymous';
            backupImg.src = `https://mt1.google.com/vt/lyrs=s&x=${tx}&y=${ty}&z=${z}`;
            backupImg.onload = () => resolve(backupImg);
            backupImg.onerror = () => resolve(img);
          };
        });

        img.src = tileUrl;
        images.push(img);
        tilePromises.push(p);
      }
    }

    Promise.all(tilePromises)
      .then((loadedImages) => {
        tileImagesRef.current = loadedImages;
        setIsLoadingTiles(false);
        renderCanvas();
      })
      .catch(() => {
        setTileLoadError(true);
        setIsLoadingTiles(false);
        renderCanvas();
      });
  }, [location]);

  // Mouse Spatial Movement (2.5D Parallax)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };

      velocity.current = { x: dx * 0.8, y: dy * 0.8 };
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    // 2.5D spatial tilt angle
    setTilt({
      x: 14 - mouseY * 12,
      y: mouseX * 14,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Native Non-Passive Wheel & Touch Event Listeners Architecture
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomScale((prev) => Math.max(0.3, Math.min(2.5, prev - e.deltaY * 0.0015)));
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
        velocity.current = { x: dx * 0.8, y: dy * 0.8 };
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchStartDist > 0) {
          const delta = (dist - touchStartDist) * 0.005;
          setZoomScale((prev) => Math.max(0.3, Math.min(2.5, prev + delta)));
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
  }, []);

  // Inertia damping loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!isDragging.current) {
        if (Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05) {
          setPanOffset((prev) => ({
            x: prev.x + velocity.current.x,
            y: prev.y + velocity.current.y,
          }));
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
  }, [panOffset, zoomScale, tilt, stage, visualMode, panelCount, sunTime, isScanning, scanProgress, location]);

  // MAIN 2.5D CANVAS RENDER FUNCTION
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + panOffset.x;
    const centerY = height / 2 + panOffset.y;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoomScale, zoomScale);

    // 1. BASE SATELLITE AERIAL IMAGERY LAYER
    const tiles = tileImagesRef.current;
    let hasValidTile = false;

    if (tiles.length === 9) {
      const tileSize = 256;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const img = tiles[r * 3 + c];
          if (img && img.complete && img.naturalWidth > 0) {
            hasValidTile = true;
            ctx.drawImage(img, (c - 1) * tileSize - tileSize / 2, (r - 1) * tileSize - tileSize / 2, tileSize, tileSize);
          }
        }
      }
    }

    if (!hasValidTile) {
      // High-Res Aerial Property Orthophoto Canvas
      drawAerialOrthophotoCanvas(ctx);
    }

    // 2. SUN LIGHTING & SHADOW OVERLAY
    drawSunShadowLayer(ctx, sunTime);

    // 3. ROOF DETECTION POLYGON OVERLAY
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      drawRoofDetectionPolygon(ctx, location.roofPolygon, isScanning, scanProgress);
    }

    // 4. SOLAR PANEL OVERLAY
    if (stage >= 5) {
      drawSolarPanelsGrid(ctx, location.roofPolygon, panelCount, visualMode);
    }

    ctx.restore();
  };

  // High-Definition Aerial Property Orthophoto Rendering
  const drawAerialOrthophotoCanvas = (ctx: CanvasRenderingContext2D) => {
    // Lawn & Property Environment
    ctx.fillStyle = '#112218';
    ctx.fillRect(-380, -380, 760, 760);

    // Surrounding Road Network
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-380, 190, 760, 190);

    // Road Divider lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(-380, 285);
    ctx.lineTo(380, 285);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target Building Roof (Real Satellite Tile Style)
    const roofW = 290;
    const roofH = 220;

    const grad = ctx.createLinearGradient(-roofW / 2, -roofH / 2, roofW / 2, roofH / 2);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');

    ctx.fillStyle = grad;
    ctx.fillRect(-roofW / 2, -roofH / 2, roofW, roofH);

    // Roof parapet boundary
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(-roofW / 2, -roofH / 2, roofW, roofH);

    // Roof Ridge Line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-roofW / 2, 0);
    ctx.lineTo(roofW / 2, 0);
    ctx.stroke();

    // Surrounding Trees
    drawTreeFoliage(ctx, -220, -190, 50);
    drawTreeFoliage(ctx, 230, -170, 55);
    drawTreeFoliage(ctx, -240, 110, 42);
  };

  const drawTreeFoliage = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#064e3b';
    ctx.fill();
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Sun & Shadow Vector Simulation
  const drawSunShadowLayer = (ctx: CanvasRenderingContext2D, time: number) => {
    const normalizedTime = (time - 6) / 12; // 0 to 1
    const sunAngle = (normalizedTime - 0.5) * Math.PI * 0.85;

    const shadowLen = Math.abs(normalizedTime - 0.5) * 45;
    const shadowDx = Math.sin(sunAngle) * shadowLen;
    const shadowDy = Math.cos(sunAngle) * (shadowLen * 0.5);

    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 15, 0.45)';
    ctx.fillRect(-145 + shadowDx, -110 + shadowDy, 290, 220);
    ctx.restore();

    let sunTint = 'rgba(251, 191, 36, 0.05)';
    if (time >= 10 && time <= 14) {
      sunTint = 'rgba(255, 255, 255, 0.08)';
    } else if (time > 14) {
      sunTint = 'rgba(245, 158, 11, 0.08)';
    }

    ctx.fillStyle = sunTint;
    ctx.fillRect(-380, -380, 760, 760);
  };

  // Computer-Vision Roof Detection Polygon Shader
  const drawRoofDetectionPolygon = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    isScanning: boolean,
    scanProgress: number
  ) => {
    ctx.save();

    const scaleX = 2.9;
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
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fill();

    if (isScanning) {
      const scanY = -110 + scanProgress * 220;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-145, scanY);
      ctx.lineTo(145, scanY);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(-145, scanY - 20, 290, 20);
    }

    ctx.restore();
  };

  // Photorealistic Solar Panel Overlay Engine
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
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <canvas ref={canvasRef} width={1280} height={800} className="w-full h-full object-cover" />
      </div>

      {/* Requirement #13: Premium Loading Experience */}
      {isLoadingTiles && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-amber-400 space-y-3 font-mono animate-in fade-in">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-amber-400/20" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-100">
            LOCATING YOUR PROPERTY — FETCHING SATELLITE IMAGERY
          </span>
          <span className="text-[11px] text-slate-400">
            Coordinates: ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
          </span>
        </div>
      )}

      {/* Atmospheric Depth Vignette & Map HUD Grid */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/60" />
      <div className="absolute inset-0 pointer-events-none border border-amber-500/10 rounded-3xl m-4" />
    </div>
  );
}
