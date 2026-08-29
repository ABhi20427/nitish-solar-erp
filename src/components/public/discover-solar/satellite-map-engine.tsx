'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SatelliteLocation, VisualMode, Point2D } from './types';
import { computePanelPlacement, computeInnerUsablePolygon, isPointInPolygon, isPolygonEditValid } from './roof-packing-algorithm';

interface SatelliteMapEngineProps {
  location: SatelliteLocation;
  stage: number; // 1 to 8
  visualMode: VisualMode;
  panelCount: number; // 6, 12, 18, 24, 30
  sunTime: number; // 6 (06:00) to 18 (18:00)
  isScanning: boolean;
  scanProgress: number; // 0 to 1
  zoomLevel: 'CITY' | 'NEIGHBOURHOOD' | 'PROPERTY' | 'ROOFTOP';
  onLocationChanged?: (newLat: number, newLng: number) => void;
  onRoofPolygonChanged?: (newPoly: Point2D[]) => void;
  onExclusionPolygonsChanged?: (newExclusions: Point2D[][]) => void;
  isAddingObstacle?: boolean;
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

// Returns the leading fraction of a closed polygon's perimeter, walked
// vertex-by-vertex from the start and interpolated across whichever edge
// `progress` currently falls on — used to "trace in" the confirmed-roof
// outline instead of drawing the whole closed shape instantly.
function getTracedPerimeterPoints(
  pts: { x: number; y: number }[],
  progress: number
): { x: number; y: number }[] {
  if (progress >= 1 || pts.length < 2) return [...pts, pts[0]];

  const closed = [...pts, pts[0]];
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < closed.length - 1; i++) {
    const d = Math.hypot(closed[i + 1].x - closed[i].x, closed[i + 1].y - closed[i].y);
    segLens.push(d);
    total += d;
  }
  if (total === 0) return [closed[0]];

  const targetLen = total * Math.max(0, progress);
  const result: { x: number; y: number }[] = [closed[0]];
  let acc = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (acc + segLens[i] >= targetLen) {
      const t = segLens[i] > 0 ? (targetLen - acc) / segLens[i] : 0;
      result.push({
        x: closed[i].x + (closed[i + 1].x - closed[i].x) * t,
        y: closed[i].y + (closed[i + 1].y - closed[i].y) * t,
      });
      return result;
    }
    acc += segLens[i];
    result.push(closed[i + 1]);
  }
  return result;
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
  onRoofPolygonChanged,
  onExclusionPolygonsChanged,
  isAddingObstacle = false,
}: SatelliteMapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Geographic Center Coordinates (Lat, Lng) & Float Zoom Level
  const [centerLat, setCenterLat] = useState(location.lat);
  const [centerLng, setCenterLng] = useState(location.lng);
  const [geoZoom, setGeoZoom] = useState(20.2);

  // Tile Cache: Map<tileKey, HTMLImageElement>
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Interactive Vertex & Edge Dragging Editor State (Stage 4 ADJUST ROOF)
  const activeVertexIndex = useRef<number | null>(null);
  const activeEdgeIndex = useRef<number | null>(null);
  const edgeDragStart = useRef<Point2D | null>(null);
  const hoverVertexIndex = useRef<number | null>(null);
  const hoverEdgeIndex = useRef<number | null>(null);

  // Inertial Drag Panning State
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Screen Dimensions
  const [screenDim, setScreenDim] = useState({ width: 1920, height: 1080 });

  // Roof-boundary "trace-in" reveal — timestamp of the moment Stage 3 was
  // entered, so the confirmed-roof outline draws itself around the
  // perimeter over a beat instead of appearing instantly, fully-formed.
  const roofRevealStartRef = useRef<number | null>(null);
  const prevStageForRevealRef = useRef(stage);
  useEffect(() => {
    if (stage === 3 && prevStageForRevealRef.current !== 3) {
      roofRevealStartRef.current = performance.now();
    }
    prevStageForRevealRef.current = stage;
  }, [stage]);

  // Sync Location Prop changes to Center Coordinates
  useEffect(() => {
    setCenterLat(location.lat);
    setCenterLng(location.lng);
  }, [location.lat, location.lng]);

  // Progression: CITY (15.0) -> NEIGHBOURHOOD (17.5) -> PROPERTY (20.2) -> ROOF (20.5)
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

  // Spatial coordinate mapping helpers (Normalized 0..100 space <-> Viewport canvas space)
  const scaleX = 4.2;
  const scaleY = 3.6;

  const normToCanvas = useCallback(
    (pt: Point2D) => ({
      x: (pt.x - 50) * scaleX,
      y: (pt.y - 50) * scaleY,
    }),
    [scaleX, scaleY]
  );

  const canvasToNorm = useCallback(
    (cx: number, cy: number) => ({
      x: cx / scaleX + 50,
      y: cy / scaleY + 50,
    }),
    [scaleX, scaleY]
  );

  // Mouse Handlers for Interactive Vertex & Edge Editing (Stage 4)
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const currentZoom = geoZoom;
    const integerZoom = Math.min(19, Math.floor(currentZoom));
    const zoomFraction = Math.pow(2, currentZoom - integerZoom);

    const unscaledMouseX = mouseX / zoomFraction;
    const unscaledMouseY = mouseY / zoomFraction;

    // STAGE 4: ADJUST ROOF MODE
    if (stage === 4) {
      const poly = location.roofPolygon || [];

      // 1. Check if hit existing vertex handle (Generous 16px touch/mouse target)
      for (let i = 0; i < poly.length; i++) {
        const pt = normToCanvas(poly[i]);
        const dist = Math.hypot(pt.x - unscaledMouseX, pt.y - unscaledMouseY);

        if (dist <= 16) {
          if (e.button === 2) {
            // Right-click to delete vertex (enforce >= 3 vertices minimum)
            e.preventDefault();
            if (poly.length > 3 && onRoofPolygonChanged) {
              const updated = poly.filter((_, idx) => idx !== i);
              onRoofPolygonChanged(updated);
            }
            return;
          }

          activeVertexIndex.current = i;
          return;
        }
      }

      // 2. Check if hit edge midpoint handle to ADD NEW VERTEX (within 12px)
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        const pt1 = normToCanvas(poly[i]);
        const pt2 = normToCanvas(poly[j]);
        const midX = (pt1.x + pt2.x) / 2;
        const midY = (pt1.y + pt2.y) / 2;

        const dist = Math.hypot(midX - unscaledMouseX, midY - unscaledMouseY);
        if (dist <= 12 && onRoofPolygonChanged) {
          const newNormPt = canvasToNorm(midX, midY);
          const updated = [...poly];
          updated.splice(i + 1, 0, newNormPt);
          onRoofPolygonChanged(updated);
          activeVertexIndex.current = i + 1;
          return;
        }
      }

      // 3. Check if hit edge segment to DRAG FULL EDGE (perpendicular distance <= 10px)
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        const p1 = normToCanvas(poly[i]);
        const p2 = normToCanvas(poly[j]);

        // Distance from point to line segment formula
        const l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) ** 2;
        if (l2 === 0) continue;
        let t = ((unscaledMouseX - p1.x) * (p2.x - p1.x) + (unscaledMouseY - p1.y) * (p2.y - p1.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = p1.x + t * (p2.x - p1.x);
        const projY = p1.y + t * (p2.y - p1.y);
        const distToEdge = Math.hypot(unscaledMouseX - projX, unscaledMouseY - projY);

        if (distToEdge <= 10) {
          activeEdgeIndex.current = i;
          edgeDragStart.current = canvasToNorm(unscaledMouseX, unscaledMouseY);
          return;
        }
      }
    }

    // Default: Inertial map drag panning
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. STAGE 4 ACTIVE VERTEX DRAGGING
    if (stage === 4 && activeVertexIndex.current !== null && onRoofPolygonChanged) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const currentZoom = geoZoom;
      const integerZoom = Math.min(19, Math.floor(currentZoom));
      const zoomFraction = Math.pow(2, currentZoom - integerZoom);

      const unscaledMouseX = mouseX / zoomFraction;
      const unscaledMouseY = mouseY / zoomFraction;

      const newNormPt = canvasToNorm(unscaledMouseX, unscaledMouseY);
      newNormPt.x = Math.max(2, Math.min(98, newNormPt.x));
      newNormPt.y = Math.max(2, Math.min(98, newNormPt.y));

      const poly = [...(location.roofPolygon || [])];
      poly[activeVertexIndex.current] = newNormPt;

      // Reject drags that would cross the shape's own edges or collapse it
      // into a razor-thin sliver — either way the area formula stops
      // matching what's visually drawn. The vertex simply stops following
      // the cursor at the boundary instead.
      if (isPolygonEditValid(poly)) {
        onRoofPolygonChanged(poly);
      }
      return;
    }

    // 2. STAGE 4 ACTIVE EDGE DRAGGING (Moves both adjacent vertices in tandem)
    if (stage === 4 && activeEdgeIndex.current !== null && edgeDragStart.current && onRoofPolygonChanged) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const currentZoom = geoZoom;
      const integerZoom = Math.min(19, Math.floor(currentZoom));
      const zoomFraction = Math.pow(2, currentZoom - integerZoom);

      const unscaledMouseX = mouseX / zoomFraction;
      const unscaledMouseY = mouseY / zoomFraction;

      const currentMouseNorm = canvasToNorm(unscaledMouseX, unscaledMouseY);
      const deltaX = currentMouseNorm.x - edgeDragStart.current.x;
      const deltaY = currentMouseNorm.y - edgeDragStart.current.y;
      edgeDragStart.current = currentMouseNorm;

      const poly = [...(location.roofPolygon || [])];
      const i = activeEdgeIndex.current;
      const j = (i + 1) % poly.length;

      const nextPoly = [...poly];
      nextPoly[i] = {
        x: Math.max(2, Math.min(98, poly[i].x + deltaX)),
        y: Math.max(2, Math.min(98, poly[i].y + deltaY)),
      };
      nextPoly[j] = {
        x: Math.max(2, Math.min(98, poly[j].x + deltaX)),
        y: Math.max(2, Math.min(98, poly[j].y + deltaY)),
      };

      // Same validity guard as single-vertex dragging above.
      if (isPolygonEditValid(nextPoly)) {
        onRoofPolygonChanged(nextPoly);
      }
      return;
    }

    // 3. INERTIAL MAP PANNING
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

  const handleMouseUp = () => {
    activeVertexIndex.current = null;
    activeEdgeIndex.current = null;
    edgeDragStart.current = null;
    isDragging.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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

    // Data-Driven Outer Roof & Inner Usable Region Overlay
    if (stage >= 3 && visualMode !== 'SATELLITE') {
      const ROOF_REVEAL_MS = 850;
      let roofRevealProgress = 1;
      if (stage === 3 && roofRevealStartRef.current !== null) {
        const elapsed = performance.now() - roofRevealStartRef.current;
        const t = Math.min(1, elapsed / ROOF_REVEAL_MS);
        roofRevealProgress = 1 - Math.pow(1 - t, 3); // ease-out cubic
      }

      drawRoofAnalysisOverlay(
        ctx,
        location.roofPolygon,
        location.exclusionPolygons || [],
        isScanning,
        scanProgress,
        stage,
        roofRevealProgress
      );
    }

    // Dynamic Solar Panel Array Layout Driven Strictly by Usable Roof Polygon
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
  }, [centerLat, centerLng, geoZoom, screenDim, stage, visualMode, panelCount, sunTime, isScanning, scanProgress, location, normToCanvas]);

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

  // VISUALIZE OUTER ROOF BOUNDARY & INNER USABLE REGION (SETBACK VISUALIZATION)
  const drawRoofAnalysisOverlay = (
    ctx: CanvasRenderingContext2D,
    poly: Point2D[],
    exclusions: Point2D[][],
    isScanning: boolean,
    scanProgress: number,
    currentStage: number,
    revealProgress: number = 1
  ) => {
    if (!poly || poly.length < 3) return;

    ctx.save();
    const pts = poly.map(normToCanvas);

    if (currentStage === 4) {
      // STAGE 4 ADJUST ROOF: amber dashed edit line — already actively
      // being edited, so no reveal delay here.
      ctx.beginPath();
      pts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 4]);
      ctx.stroke();
    } else {
      // CONFIRMED ROOF: a crisp white line that traces itself around the
      // perimeter instead of appearing instantly, fully-formed — a
      // boundary that was just "detected" should look detected, not
      // pre-existing. No glow — a clean architectural line, not a scanner.
      const tracedPts = getTracedPerimeterPoints(pts, revealProgress);
      ctx.beginPath();
      tracedPts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.75;
      ctx.setLineDash([]);
      ctx.stroke();

      // Small leading tip while actively tracing — plain, no glow.
      if (revealProgress < 1 && tracedPts.length > 0) {
        const tip = tracedPts[tracedPts.length - 1];
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    // 2. Draw Inner Usable Roof Region (Setback Inset Region - Emerald Green)
    // — held back until the outer boundary finishes tracing in, so the
    // "usable area" reads as computed from a confirmed boundary rather than
    // appearing simultaneously with it.
    if (revealProgress >= 1) {
      const innerPoly = computeInnerUsablePolygon(poly, 0.5, centerLat, geoZoom);
      if (innerPoly.length >= 3) {
        const innerPts = innerPoly.map(normToCanvas);

        ctx.beginPath();
        innerPts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        ctx.strokeStyle = '#10b981'; // Vibrant emerald stroke
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();

        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'; // Restrained 8% emerald tint
        ctx.fill();
      }
    }

    // 3. Draw Premium Handles strictly ONLY in STAGE 4 (ADJUST ROOF MODE)
    if (currentStage === 4) {
      ctx.setLineDash([]);

      // Edge Midpoint "add point" markers — a small crosshair inside a
      // faint ring in a neutral tone, so they read as a quiet secondary
      // affordance rather than competing with the corner handles.
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        const midX = (pts[i].x + pts[j].x) / 2;
        const midY = (pts[i].y + pts[j].y) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(midX, midY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(midX, midY, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(midX - 2.5, midY);
        ctx.lineTo(midX + 2.5, midY);
        ctx.moveTo(midX, midY - 2.5);
        ctx.lineTo(midX, midY + 2.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Corner vertex handles — a small target-reticle: a crisp amber ring
      // with four short crosshair ticks and a white core. No glow — flat,
      // precise, like a real measurement tool rather than a screen effect.
      pts.forEach((pt, i) => {
        const isDraggingThis = activeVertexIndex.current === i;
        const ringR = isDraggingThis ? 8 : 6.5;
        const accent = isDraggingThis ? '#fbbf24' : '#f59e0b';

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Four short crosshair ticks just outside the ring
        const tickInner = ringR + 2;
        const tickOuter = ringR + 5.5;
        ctx.strokeStyle = isDraggingThis ? accent : 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 1.4;
        ([[0, -1], [0, 1], [-1, 0], [1, 0]] as const).forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(pt.x + dx * tickInner, pt.y + dy * tickInner);
          ctx.lineTo(pt.x + dx * tickOuter, pt.y + dy * tickOuter);
          ctx.stroke();
        });

        // Solid white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isDraggingThis ? 3.5 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 4. Draw Obstacle Exclusion Zones (Stairwell / Water Tank / User Obstacles)
    if (currentStage >= 4) {
      exclusions.forEach((exPoly) => {
        const exPts = exPoly.map(normToCanvas);
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

    ctx.restore();
  };

  // REALISTIC PHOTOVOLTAIC MODULE RENDERING (DRIVEN STRICTLY BY USABLE POLYGON)
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

    // Run dynamic 2D packing algorithm strictly inside inner usable polygon & outside obstacles
    const placement = computePanelPlacement(poly, exclusions, orientationDeg, count, 0.5);
    const visiblePanels = placement.panels;

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

      const busbar1 = -pW / 2 + pW * 0.33;
      const busbar2 = -pW / 2 + pW * 0.66;
      ctx.moveTo(busbar1, -pH / 2);
      ctx.lineTo(busbar1, pH / 2);
      ctx.moveTo(busbar2, -pH / 2);
      ctx.lineTo(busbar2, pH / 2);

      const cellRows = 5;
      for (let r = 1; r < cellRows; r++) {
        const yLine = -pH / 2 + (pH / cellRows) * r;
        ctx.moveTo(-pW / 2, yLine);
        ctx.lineTo(pW / 2, yLine);
      }
      ctx.stroke();

      // 4. Anti-Reflective Glass Reflection Glare
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      className={`fixed inset-0 w-full h-full overflow-hidden select-none ${
        stage === 4 ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
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
