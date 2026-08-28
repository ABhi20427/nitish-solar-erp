import { Point2D, PanelModulePosition } from './types';

/**
 * 2D Ray-Casting Point-in-Polygon Test
 */
export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  if (polygon.length < 3) return false;
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
 * Calculate polygon area using Shoelace formula (normalised 0..100 space)
 */
export function calculatePolygonArea(polygon: Point2D[]): number {
  if (polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
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
  confidence: 'PROPERTY DETECTED' | 'ESTIMATED BUILDING FOOTPRINT';
} {
  // Hash seed from lat/lng
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
  const seed2 = Math.abs(Math.sin(lat * 38.293 + lng * 48.121) * 23421.123) % 1;

  // Roof orientation / ridge angle (0 to 45 deg, or -30 to +30 deg off South)
  const roofOrientationDeg = Math.round((seed * 60 - 30) * 10) / 10;

  // Choose roof architectural style: 0 -> L-Shape, 1 -> Irregular Octagonal/Hip, 2 -> Standard Rectangular Ridge
  const style = Math.floor(seed * 3);

  let roofPolygon: Point2D[] = [];

  if (style === 0) {
    // L-Shaped Building Footprint
    roofPolygon = [
      { x: 15, y: 15 },
      { x: 85, y: 15 },
      { x: 85, y: 55 },
      { x: 50, y: 55 },
      { x: 50, y: 85 },
      { x: 15, y: 85 },
    ];
  } else if (style === 1) {
    // Irregular Hip Roof with Chamfered Corners
    roofPolygon = [
      { x: 20, y: 15 },
      { x: 80, y: 15 },
      { x: 88, y: 25 },
      { x: 88, y: 75 },
      { x: 78, y: 85 },
      { x: 22, y: 85 },
      { x: 12, y: 75 },
      { x: 12, y: 25 },
    ];
  } else {
    // Standard High-Efficiency Rectangular Roof
    roofPolygon = [
      { x: 15, y: 18 },
      { x: 85, y: 18 },
      { x: 85, y: 82 },
      { x: 15, y: 82 },
    ];
  }

  // Exclusion Zone 1: Stairwell headroom or Water Tank
  const exX1 = 55 + seed2 * 15;
  const exY1 = 25 + seed * 15;
  const exclusion1: Point2D[] = [
    { x: exX1, y: exY1 },
    { x: exX1 + 18, y: exY1 },
    { x: exX1 + 18, y: exY1 + 14 },
    { x: exX1, y: exY1 + 14 },
  ];

  // Exclusion Zone 2: Skylight / HVAC unit (if large roof)
  const exclusion2: Point2D[] = [
    { x: 25, y: 60 },
    { x: 38, y: 60 },
    { x: 38, y: 72 },
    { x: 25, y: 72 },
  ];

  const exclusionPolygons = [exclusion1, exclusion2];

  // Calculate real physical areas based on 100x100 grid mapping to approx 32m x 26m footprint (~830 sq.m / ~2400 sq.ft)
  const rawAreaNorm = calculatePolygonArea(roofPolygon);
  const totalRoofAreaSqFt = Math.round(rawAreaNorm * 32.5); // ~1800 to 2800 sq.ft

  let exAreaNorm = 0;
  exclusionPolygons.forEach((ex) => {
    exAreaNorm += calculatePolygonArea(ex);
  });
  const obstructionAreaSqFt = Math.round(exAreaNorm * 32.5);
  const estimatedUsableAreaSqFt = Math.max(600, totalRoofAreaSqFt - obstructionAreaSqFt - Math.round(totalRoofAreaSqFt * 0.18)); // Edge setback deduction

  return {
    roofPolygon,
    exclusionPolygons,
    roofOrientationDeg,
    totalRoofAreaSqFt,
    estimatedUsableAreaSqFt,
    obstructionAreaSqFt,
    confidence: seed > 0.3 ? 'PROPERTY DETECTED' : 'ESTIMATED BUILDING FOOTPRINT',
  };
}

/**
 * DYNAMIC 2D PANEL PACKING ALGORITHM
 * Calculates optimal photovoltaic module placement coordinates inside usable roof boundary.
 */
export function computePanelPlacement(
  roofPolygon: Point2D[],
  exclusionPolygons: Point2D[][] = [],
  roofOrientationDeg: number = 0,
  requestedCount: number = 24
): {
  panels: PanelModulePosition[];
  totalPositionsAvailable: number;
} {
  if (!roofPolygon || roofPolygon.length < 3) {
    return { panels: [], totalPositionsAvailable: 0 };
  }

  // Find bounding box of roof polygon
  let minX = 100,
    maxX = 0,
    minY = 100,
    maxY = 0;
  roofPolygon.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  // Panel Module Specifications in normalized roof space:
  // Standard 1.76m x 1.13m panel mapped to ~8.5 units x 5.2 units in 0..100 space
  const pW = 8.5; // Panel width
  const pH = 5.2; // Panel height
  const gap = 0.8; // Inter-panel clearance gap
  const setback = 3.0; // Roof edge setback

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

  // Grid scan across roof bounding box
  const stepX = pW + gap;
  const stepY = pH + gap;

  const startX = minX + setback + pW / 2;
  const endX = maxX - setback - pW / 2;
  const startY = minY + setback + pH / 2;
  const endY = maxY - setback - pH / 2;

  let row = 0;
  for (let y = startY; y <= endY; y += stepY) {
    let col = 0;
    for (let x = startX; x <= endX; x += stepX) {
      // Test 4 corners of proposed panel module
      const halfW = pW / 2;
      const halfH = pH / 2;

      const unrotatedCorners: Point2D[] = [
        { x: x - halfW, y: y - halfH },
        { x: x + halfW, y: y - halfH },
        { x: x + halfW, y: y + halfH },
        { x: x - halfW, y: y + halfH },
      ];

      // Apply roof orientation rotation around roof center
      const corners = unrotatedCorners.map((pt) => rotatePoint(centerRoofX, centerRoofY, pt.x, pt.y));
      const centerPt = rotatePoint(centerRoofX, centerRoofY, x, y);

      // Check 1: All 4 corners and center MUST lie inside roof polygon
      const centerInside = isPointInPolygon(centerPt, roofPolygon);
      const c1Inside = isPointInPolygon(corners[0], roofPolygon);
      const c2Inside = isPointInPolygon(corners[1], roofPolygon);
      const c3Inside = isPointInPolygon(corners[2], roofPolygon);
      const c4Inside = isPointInPolygon(corners[3], roofPolygon);

      const isFullyInsideRoof = centerInside && c1Inside && c2Inside && c3Inside && c4Inside;

      if (!isFullyInsideRoof) {
        col++;
        continue;
      }

      // Check 2: Must NOT overlap with any exclusion polygon (water tank, stairwell)
      let overlapsExclusion = false;
      for (const exPoly of exclusionPolygons) {
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

      // Calculate Solar Suitability Score (prefer central/southern roof area)
      const distFromCenter = Math.hypot(centerPt.x - centerRoofX, centerPt.y - centerRoofY);
      const southBias = (centerPt.y - minY) / (maxY - minY || 1); // Higher score for southern plane
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

  // Sort candidates by highest solar suitability score
  candidateList.sort((a, b) => b.score - a.score);

  // Return requested count of panels, fallback to available if less
  const selectedPanels = candidateList.slice(0, Math.min(requestedCount, candidateList.length));

  return {
    panels: selectedPanels,
    totalPositionsAvailable: candidateList.length,
  };
}
