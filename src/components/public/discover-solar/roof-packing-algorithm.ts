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
 * Calculate polygon area using Shoelace formula (normalised 0..100 space)
 */
export function calculatePolygonArea(polygon: Point2D[]): number {
  if (!polygon || polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Recalculates real physical roof areas (sq.ft) dynamically from any arbitrary polygon & exclusion zones
 */
export function recalculateRoofMetrics(
  roofPolygon: Point2D[],
  exclusionPolygons: Point2D[][] = []
): {
  totalRoofAreaSqFt: number;
  obstructionAreaSqFt: number;
  estimatedUsableAreaSqFt: number;
} {
  const rawAreaNorm = calculatePolygonArea(roofPolygon);
  // Scale factor: 100x100 normalised space maps to approx 32m x 26m footprint (~830 sq.m / ~2400 sq.ft)
  const totalRoofAreaSqFt = Math.round(rawAreaNorm * 32.5);

  let exAreaNorm = 0;
  exclusionPolygons.forEach((ex) => {
    exAreaNorm += calculatePolygonArea(ex);
  });
  const obstructionAreaSqFt = Math.round(exAreaNorm * 32.5);

  // Usable area accounts for edge setback deduction (approx 15% buffer)
  const estimatedUsableAreaSqFt = Math.max(
    100,
    totalRoofAreaSqFt - obstructionAreaSqFt - Math.round(totalRoofAreaSqFt * 0.15)
  );

  return {
    totalRoofAreaSqFt,
    obstructionAreaSqFt,
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
    // L-Shaped Building Footprint
    roofPolygon = [
      { x: 18, y: 18 },
      { x: 82, y: 18 },
      { x: 82, y: 52 },
      { x: 52, y: 52 },
      { x: 52, y: 82 },
      { x: 18, y: 82 },
    ];
  } else if (style === 1) {
    // Irregular Hip Roof with Chamfered Corners
    roofPolygon = [
      { x: 22, y: 18 },
      { x: 78, y: 18 },
      { x: 86, y: 28 },
      { x: 86, y: 72 },
      { x: 76, y: 82 },
      { x: 24, y: 82 },
      { x: 14, y: 72 },
      { x: 14, y: 28 },
    ];
  } else {
    // Standard High-Efficiency Rectangular Roof
    roofPolygon = [
      { x: 16, y: 20 },
      { x: 84, y: 20 },
      { x: 84, y: 80 },
      { x: 16, y: 80 },
    ];
  }

  // Exclusion Zone 1: Stairwell headroom or Water Tank
  const exX1 = 54 + seed2 * 14;
  const exY1 = 26 + seed * 14;
  const exclusion1: Point2D[] = [
    { x: exX1, y: exY1 },
    { x: exX1 + 16, y: exY1 },
    { x: exX1 + 16, y: exY1 + 14 },
    { x: exX1, y: exY1 + 14 },
  ];

  const exclusionPolygons = [exclusion1];

  const metrics = recalculateRoofMetrics(roofPolygon, exclusionPolygons);

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
 * Calculates optimal photovoltaic module placement coordinates inside arbitrary N-point polygon.
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

  // Find bounding box of arbitrary N-point roof polygon
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
  // Standard 1.76m x 1.13m panel mapped to ~8.2 units x 5.0 units in 0..100 space
  const pW = 8.2; // Panel width
  const pH = 5.0; // Panel height
  const gap = 0.8; // Inter-panel clearance gap
  const setback = 2.5; // Edge setback buffer

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

      // Check 1: All 4 corners AND center MUST lie strictly inside arbitrary roof polygon
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

      // Check 2: Must NOT overlap with any user/auto exclusion polygon (water tank, stairwell)
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
