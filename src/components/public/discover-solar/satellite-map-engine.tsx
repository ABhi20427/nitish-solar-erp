'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SatelliteLocation, VisualMode } from './types';

interface SatelliteMapEngineProps {
  location: SatelliteLocation;
  stage: number; // 1 to 10
  visualMode: VisualMode;
  panelCount: number; // 6, 12, 18, 24, 30
  sunTime: number; // 6 (06:00) to 18 (18:00)
  isScanning: boolean;
  scanProgress: number; // 0 to 1
  zoomLevel: 'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP';
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

  // Inertial Drag State
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // High-Resolution Satellite Aerial Images (Real property tile feeds)
  const satelliteImgRef = useRef<HTMLImageElement | null>(null);

  // Compute Zoom Scale based on Zoom Stage
  useEffect(() => {
    let targetScale = 1;
    if (zoomLevel === 'CITY') targetScale = 0.35;
    else if (zoomLevel === 'NEIGHBOURHOOD') targetScale = 0.65;
    else if (zoomLevel === 'PROPERTY') targetScale = 1.05;
    else if (zoomLevel === 'ROOFTOP') targetScale = 1.5;

    // Stage 2 Cinematic Fly-in Zoom Animation
    if (stage === 2) targetScale = 0.45;

    setZoomScale(targetScale);
  }, [zoomLevel, stage]);

  // Load Real Aerial/Satellite Image for Target Property
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Map real location coordinates to high-resolution satellite imagery feeds (Esri / OpenStreetMap Aerial / High-Res Imagery)
    const lat = location.lat;
    const lng = location.lng;

    // High resolution real satellite image generator (using crisp aerial orthophoto source)
    img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/19/${Math.floor(
      ((90 - lat) / 180) * (1 << 19)
    )}/${Math.floor(((lng + 180) / 360) * (1 << 19))}`;

    img.onload = () => {
      satelliteImgRef.current = img;
      renderCanvas();
    };

    img.onerror = () => {
      // Fallback to high-res aerial roof canvas texture if external tile network is restricted
      satelliteImgRef.current = null;
      renderCanvas();
    };
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

    // Subtle 2.5D spatial tilt angle
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

    // Non-passive native wheel listener to zoom satellite map smoothly without browser warning
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomScale((prev) => Math.max(0.3, Math.min(2.5, prev - e.deltaY * 0.0015)));
    };

    // Mobile touch interaction handler
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
          velocity.current.x *= 0.88; // Damping
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

    // 1. BASE SATELLITE AERIAL IMAGERY LAYER
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoomScale, zoomScale);

    if (satelliteImgRef.current && satelliteImgRef.current.complete) {
      // Draw real satellite aerial image
      const imgW = 700;
      const imgH = 700;
      ctx.drawImage(satelliteImgRef.current, -imgW / 2, -imgH / 2, imgW, imgH);
    } else {
      // Procedural High-Res Aerial Roof Fallback Texture
      drawFallbackAerialRoof(ctx);
    }

    // 2. SUN LIGHTING & SHADOW OVERLAY (Phases 7 & 8)
    drawSunShadowLayer(ctx, sunTime);

    // 3. ROOF DETECTION POLYGON OVERLAY (Phases 5 & 6)
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      drawRoofDetectionPolygon(ctx, location.roofPolygon, isScanning, scanProgress);
    }

    // 4. SOLAR PANEL OVERLAY (Phases 6, 7 & 8)
    if (stage >= 5) {
      drawSolarPanelsGrid(ctx, location.roofPolygon, panelCount, visualMode);
    }

    ctx.restore();
  };

  // Procedural Aerial Property Fallback Rendering (used if offline/restricted tile stream)
  const drawFallbackAerialRoof = (ctx: CanvasRenderingContext2D) => {
    // Lawn / Surroundings
    ctx.fillStyle = '#15251b';
    ctx.fillRect(-350, -350, 700, 700);

    // Driveway & Road
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-350, 180, 700, 170);

    // Main House Roof (Satellite Perspective)
    const roofW = 280;
    const roofH = 210;

    // Roof Tiles Surface
    const grad = ctx.createLinearGradient(-roofW / 2, -roofH / 2, roofW / 2, roofH / 2);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');

    ctx.fillStyle = grad;
    ctx.fillRect(-roofW / 2, -roofH / 2, roofW, roofH);

    // Roof Ridge Line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-roofW / 2, 0);
    ctx.lineTo(roofW / 2, 0);
    ctx.stroke();

    // Surrounding Trees
    drawTreeFoliage(ctx, -200, -180, 45);
    drawTreeFoliage(ctx, 210, -160, 50);
    drawTreeFoliage(ctx, -220, 120, 40);
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

  // Sun & Shadow Vector Simulation (Phase 8)
  const drawSunShadowLayer = (ctx: CanvasRenderingContext2D, time: number) => {
    // Calculate sun angle from 06:00 (-80 deg) to 12:00 (0 deg) to 18:00 (+80 deg)
    const normalizedTime = (time - 6) / 12; // 0 to 1
    const sunAngle = (normalizedTime - 0.5) * Math.PI * 0.85;

    // Shadow displacement vector
    const shadowLen = Math.abs(normalizedTime - 0.5) * 45;
    const shadowDx = Math.sin(sunAngle) * shadowLen;
    const shadowDy = Math.cos(sunAngle) * (shadowLen * 0.5);

    // Draw Dynamic Building Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 15, 0.45)';
    ctx.fillRect(-140 + shadowDx, -105 + shadowDy, 280, 210);
    ctx.restore();

    // Sunlight Color Temperature Tint Overlay
    let sunTint = 'rgba(251, 191, 36, 0.05)'; // Morning golden
    if (time >= 10 && time <= 14) {
      sunTint = 'rgba(255, 255, 255, 0.08)'; // Noon bright white
    } else if (time > 14) {
      sunTint = 'rgba(245, 158, 11, 0.08)'; // Evening sunset
    }

    ctx.fillStyle = sunTint;
    ctx.fillRect(-350, -350, 700, 700);
  };

  // Computer-Vision Roof Detection Polygon Shader (Phase 5)
  const drawRoofDetectionPolygon = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    isScanning: boolean,
    scanProgress: number
  ) => {
    ctx.save();

    // Convert polygon coordinates to canvas scale (-140 to +140)
    const scaleX = 2.8;
    const scaleY = 2.1;

    ctx.beginPath();
    poly.forEach((pt, i) => {
      const px = (pt.x - 50) * scaleX;
      const py = (pt.y - 50) * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Animated Computer-Vision Glowing Outline
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fill();

    // Scanning Laser Beam Animation (Phase 5)
    if (isScanning) {
      const scanY = -105 + scanProgress * 210;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-140, scanY);
      ctx.lineTo(140, scanY);
      ctx.stroke();

      // Laser glow plane
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(-140, scanY - 20, 280, 20);
    }

    ctx.restore();
  };

  // Photorealistic Solar Panel Overlay Engine (Phases 6 & 7)
  const drawSolarPanelsGrid = (
    ctx: CanvasRenderingContext2D,
    poly: { x: number; y: number }[],
    count: number,
    mode: VisualMode
  ) => {
    ctx.save();

    // Grid arrangement based on system size
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

      // Photovoltaic Panel Base (Silicon Dark Blue)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      // Panel Aluminum Frame
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - pWidth / 2, py - pHeight / 2, pWidth, pHeight);

      // PV Solar Cell Grid Lines (Busbars)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px - pWidth / 2 + 12, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 12, py + pHeight / 2);
      ctx.moveTo(px - pWidth / 2 + 24, py - pHeight / 2);
      ctx.lineTo(px - pWidth / 2 + 24, py + pHeight / 2);
      ctx.stroke();

      // Anti-reflective Glass Specular Highlight
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

      {/* Atmospheric Depth Vignette & Map HUD Grid */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/60" />
      <div className="absolute inset-0 pointer-events-none border border-amber-500/10 rounded-3xl m-4" />
    </div>
  );
}
