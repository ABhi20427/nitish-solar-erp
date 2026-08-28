import { Point2D, PanelModulePosition, BuildingConfidenceType } from './types';

/**
 * 2D Ray-Casting Point-in-Polygon Test
 */
export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 0.00001) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates true physical polygon area in square meters (m²) using Web Mercator geographic resolution
 */
export function calculateGeographicPolygonAreaM2(
  polygon: Point2D[],
  lat: number = 18.559,
  zoom: number = 20.2,
  scaleX: number = 4.2,
  scaleY: number = 3.6
): number {
  if (!polygon || polygon.length < 3) return 0;

  // Web Mercator resolution equation: meters per pixel at latitude & float zoom
  const latRad = (lat * Math.PI) / 180;
  const metersPerPixelUnscaled = (Math.cos(latRad) * 40075016.6855) / (256 * Math.pow(2, zoom));

  const integerZoom = Math.min(19, Math.floor(zoom));
  const zoomFraction = Math.pow(2, zoom - integerZoom);

  // Resolution per canvas unit in unscaled space
  const metersPerCanvasUnit = metersPerPixelUnscaled / (zoomFraction || 1);

  // Convert each normalized 0..100 point to physical meters (origin at center (50, 50))
  const pointsMeters = polygon.map((pt) => ({
    x: (pt.x - 50) * scaleX * metersPerCanvasUnit,
    y: (pt.y - 50) * scaleY * metersPerCanvasUnit,
  }));

  // Shoelace formula for polygon area in m²
  let areaM2 = 0;
  for (let i = 0; i < pointsMeters.length; i++) {
    const j = (i + 1) % pointsMeters.length;
    areaM2 += pointsMeters[i].x * pointsMeters[j].y;
    areaM2 -= pointsMeters[j].x * pointsMeters[i].y;
  }

  return Math.abs(areaM2) / 2;
}

/**
 * COMPUTES INNER USABLE POLYGON INSET BY SETBACK DISTANCE (e.g. 0.5 meters)
 */
export function computeInnerUsablePolygon(
  roofPolygon: Point2D[],
  setbackMeters: number = 0.5,
  lat: number = 18.559,
  zoom: number = 20.2
): Point2D[] {
  if (!roofPolygon || roofPolygon.length < 3) return [];

  // Calculate roof center centroid
  let cx = 0,
    cy = 0;
  roofPolygon.forEach((pt) => {
    cx += pt.x;
    cy += pt.y;
  });
  cx /= roofPolygon.length;
  cy /= roofPolygon.length;

  // Approximate scale factor: 1 meter ~ 2.2 units in 0..100 normalized space
  const insetFactor = Math.min(0.18, (setbackMeters * 2.2) / 100);

  // Scale vertices inward toward centroid by insetFactor
  const innerPolygon = roofPolygon.map((pt) => ({
    x: pt.x + (cx - pt.x) * insetFactor,
    y: pt.y + (cy - pt.y) * insetFactor,
  }));

  return innerPolygon;
}

/**
 * RECALCULATES REAL PHYSICAL ROOF METRICS (GEOGRAPHIC SOURCE OF TRUTH)
 */
export function recalculateRoofMetrics(
  roofPolygon: Point2D[],
  exclusionPolygons: Point2D[][] = [],
  lat: number = 18.559,
  zoom: number = 20.2
): {
  totalRoofAreaM2: number;
  totalRoofAreaSqFt: number;
  obstructionAreaM2: number;
  obstructionAreaSqFt: number;
  estimatedUsableAreaM2: number;
  estimatedUsableAreaSqFt: number;
} {
  const SQM_TO_SQFT = 10.7639104;

  // 1. Total Physical Roof Area in m² and sq.ft
  const totalRoofAreaM2 = calculateGeographicPolygonAreaM2(roofPolygon, lat, zoom);
  const totalRoofAreaSqFt = Math.round(totalRoofAreaM2 * SQM_TO_SQFT);

  // 2. Inner Usable Polygon inset by 0.5m setback
  const innerUsablePoly = computeInnerUsablePolygon(roofPolygon, 0.5, lat, zoom);
  let rawUsableAreaM2 = calculateGeographicPolygonAreaM2(innerUsablePoly, lat, zoom);

  // 3. Subtract Obstacle Exclusion Area
  let obstructionAreaM2 = 0;
  exclusionPolygons.forEach((ex) => {
    obstructionAreaM2 += calculateGeographicPolygonAreaM2(ex, lat, zoom);
  });
  const obstructionAreaSqFt = Math.round(obstructionAreaM2 * SQM_TO_SQFT);

  const estimatedUsableAreaM2 = Math.max(5, rawUsableAreaM2 - obstructionAreaM2);
  const estimatedUsableAreaSqFt = Math.round(estimatedUsableAreaM2 * SQM_TO_SQFT);

  // Development Diagnostics
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Roof Metrics Diagnostic] lat=${lat}, zoom=${zoom} | Vertices: ${roofPolygon.length} | ` +
      `Total: ${totalRoofAreaM2.toFixed(2)} m² (${totalRoofAreaSqFt} sq.ft) | ` +
      `Usable: ${estimatedUsableAreaM2.toFixed(2)} m² (${estimatedUsableAreaSqFt} sq.ft)`
    );
  }

  return {
    totalRoofAreaM2: Number(totalRoofAreaM2.toFixed(2)),
    totalRoofAreaSqFt,
    obstructionAreaM2: Number(obstructionAreaM2.toFixed(2)),
    obstructionAreaSqFt,
    estimatedUsableAreaM2: Number(estimatedUsableAreaM2.toFixed(2)),
    estimatedUsableAreaSqFt,
  };
}

/**
 * Deterministically generates realistic building roof footprint geometry seeded by latitude & longitude
 */
export function generateRealisticRoofGeometry(lat: number, lng: number): {
  roofPolygon: Point2D[];
  exclusionPolygons: Point2D[][];
  roofOrientationDeg: number;
  totalRoofAreaSqFt: number;
  estimatedUsableAreaSqFt: number;
  obstructionAreaSqFt: number;
  confidence: BuildingConfidenceType;
} {
  // Hash seed from lat/lng
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
  const seed2 = Math.abs(Math.sin(lat * 38.293 + lng * 48.121) * 23421.123) % 1;

  // Roof orientation / ridge angle (0 to 45 deg, or -30 to +30 deg off South)
  const roofOrientationDeg = Math.round((seed * 60 - 30) * 10) / 10;

  // Architectural style: 0 -> L-Shape, 1 -> Irregular Octagonal/Hip, 2 -> Standard Rectangular Ridge
  const style = Math.floor(seed * 3);

  let roofPolygon: Point2D[] = [];

  if (style === 0) {
    // L-Shaped Building Footprint (~1,050 sq.ft)
    roofPolygon = [
      { x: 28, y: 26 },
      { x: 72, y: 26 },
      { x: 72, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 74 },
      { x: 28, y: 74 },
    ];
  } else if (style === 1) {
    // Irregular Hip Roof with Chamfered Corners (~1,120 sq.ft)
    roofPolygon = [
      { x: 30, y: 26 },
      { x: 70, y: 26 },
      { x: 76, y: 34 },
      { x: 76, y: 66 },
      { x: 68, y: 74 },
      { x: 32, y: 74 },
      { x: 24, y: 66 },
      { x: 24, y: 34 },
    ];
  } else {
    // Standard High-Efficiency Rectangular Roof (~980 sq.ft)
    roofPolygon = [
      { x: 28, y: 27 },
      { x: 72, y: 27 },
      { x: 72, y: 73 },
      { x: 28, y: 73 },
    ];
  }

  // Exclusion Zone 1: Stairwell headroom or Water Tank
  const exX1 = 52 + seed2 * 10;
  const exY1 = 32 + seed * 10;
  const exclusion1: Point2D[] = [
    { x: exX1, y: exY1 },
    { x: exX1 + 10, y: exY1 },
    { x: exX1 + 10, y: exY1 + 10 },
    { x: exX1, y: exY1 + 10 },
  ];

  const exclusionPolygons = [exclusion1];

  const metrics = recalculateRoofMetrics(roofPolygon, exclusionPolygons, lat, 20.2);

  return {
    roofPolygon,
    exclusionPolygons,
    roofOrientationDeg,
    totalRoofAreaSqFt: metrics.totalRoofAreaSqFt,
    estimatedUsableAreaSqFt: metrics.estimatedUsableAreaSqFt,
    obstructionAreaSqFt: metrics.obstructionAreaSqFt,
    confidence: 'ESTIMATED ROOF',
  };
}

/**
 * DYNAMIC 2D PANEL PACKING ALGORITHM (SOURCE OF TRUTH)
 * Panel candidates MUST fit strictly inside inner usable polygon & outside all exclusion zones.
 */
export function computePanelPlacement(
  roofPolygon: Point2D[],
  exclusionPolygons: Point2D[][] = [],
  roofOrientationDeg: number = 0,
  requestedCount: number = 24,
  setbackMeters: number = 0.5
): {
  panels: PanelModulePosition[];
  totalPositionsAvailable: number;
} {
  if (!roofPolygon || roofPolygon.length < 3) {
    return { panels: [], totalPositionsAvailable: 0 };
  }

  // Compute inner usable polygon inset by setback distance
  const usablePoly = computeInnerUsablePolygon(roofPolygon, setbackMeters);

  // Find bounding box of inner usable polygon
  let minX = 100,
    maxX = 0,
    minY = 100,
    maxY = 0;
  usablePoly.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  // Panel Module Specifications in normalized space (~6.6 x 4.0 units)
  const pW = 6.6;
  const pH = 4.0;
  const gap = 0.6;

  // Rotation transform helpers
  const rad = (roofOrientationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatePoint = (cx: number, cy: number, px: number, py: number): Point2D => {
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  };

  const centerRoofX = (minX + maxX) / 2;
  const centerRoofY = (minY + maxY) / 2;

  const candidateList: PanelModulePosition[] = [];
  let candidateId = 0;

  // Grid scan across inner usable polygon bounding box
  const stepX = pW + gap;
  const stepY = pH + gap;

  const startX = minX + pW / 2;
  const endX = maxX - pW / 2;
  const startY = minY + pH / 2;
  const endY = maxY - pH / 2;

  let row = 0;
  for (let y = startY; y <= endY; y += stepY) {
    let col = 0;
    for (let x = startX; x <= endX; x += stepX) {
      const halfW = pW / 2;
      const halfH = pH / 2;

      const unrotatedCorners: Point2D[] = [
        { x: x - halfW, y: y - halfH },
        { x: x + halfW, y: y - halfH },
        { x: x + halfW, y: y + halfH },
        { x: x - halfW, y: y + halfH },
      ];

      const corners = unrotatedCorners.map((pt) => rotatePoint(centerRoofX, centerRoofY, pt.x, pt.y));
      const centerPt = rotatePoint(centerRoofX, centerRoofY, x, y);

      // Check 1: All 4 corners AND center MUST lie strictly inside inner usable polygon
      const centerInside = isPointInPolygon(centerPt, usablePoly);
      const c1Inside = isPointInPolygon(corners[0], usablePoly);
      const c2Inside = isPointInPolygon(corners[1], usablePoly);
      const c3Inside = isPointInPolygon(corners[2], usablePoly);
      const c4Inside = isPointInPolygon(corners[3], usablePoly);

      if (!centerInside || !c1Inside || !c2Inside || !c3Inside || !c4Inside) {
        col++;
        continue;
      }

      // Check 2: Must NOT overlap with any exclusion polygon (water tank, stairwell, obstacles)
      let overlapsExclusion = false;
      for (const exPoly of exclusionPolygons) {
        if (!exPoly || exPoly.length < 3) continue;
        if (
          isPointInPolygon(centerPt, exPoly) ||
          isPointInPolygon(corners[0], exPoly) ||
          isPointInPolygon(corners[1], exPoly) ||
          isPointInPolygon(corners[2], exPoly) ||
          isPointInPolygon(corners[3], exPoly)
        ) {
          overlapsExclusion = true;
          break;
        }
      }

      if (overlapsExclusion) {
        col++;
        continue;
      }

      // Solar Suitability Score
      const distFromCenter = Math.hypot(centerPt.x - centerRoofX, centerPt.y - centerRoofY);
      const southBias = (centerPt.y - minY) / (maxY - minY || 1);
      const score = 100 - distFromCenter * 0.8 + southBias * 25;

      candidateList.push({
        id: candidateId++,
        x: centerPt.x,
        y: centerPt.y,
        width: pW,
        length: pH,
        angleDeg: roofOrientationDeg,
        row,
        col,
        score,
      });

      col++;
    }
    row++;
  }

  candidateList.sort((a, b) => b.score - a.score);
  const selectedPanels = candidateList.slice(0, Math.min(requestedCount, candidateList.length));

  return {
    panels: selectedPanels,
    totalPositionsAvailable: candidateList.length,
  };
}
