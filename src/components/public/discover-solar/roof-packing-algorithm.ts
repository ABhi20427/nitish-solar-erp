import { Point2D, PanelModulePosition, BuildingConfidenceType, CanonicalRoofMetrics } from './types';
import { metersPerNormalizedUnitX, metersPerNormalizedUnitY } from './geo-constants';

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
 * Signed area of the triangle (a, b, c) x2 — positive if c is left of a→b,
 * negative if right, zero if collinear. Standard orientation test used by
 * the segment-intersection check below.
 */
function orientation(a: Point2D, b: Point2D, c: Point2D): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * True if segment (p1,p2) properly crosses segment (p3,p4) — i.e. each
 * segment's endpoints lie on opposite sides of the other segment's line.
 * Endpoint-touching/collinear cases are intentionally not flagged; the
 * caller only ever tests non-adjacent polygon edges, so a proper crossing
 * is exactly the "bowtie" condition we care about.
 */
function segmentsProperlyIntersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): boolean {
  const d1 = orientation(p3, p4, p1);
  const d2 = orientation(p3, p4, p2);
  const d3 = orientation(p1, p2, p3);
  const d4 = orientation(p1, p2, p4);

  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/**
 * True if the polygon's edges cross each other anywhere (a "bowtie"/
 * self-intersecting shape). The shoelace area formula used below is only
 * valid for simple (non-self-intersecting) polygons — for a crossing shape
 * it silently returns a much smaller number than the shape's visual area,
 * since the crossing loops cancel each other out. Used to reject roof-edit
 * drags that would produce a shape whose displayed area no longer matches
 * what's visually drawn.
 */
export function isPolygonSelfIntersecting(polygon: Point2D[]): boolean {
  const n = polygon.length;
  if (n < 4) return false; // a triangle can never self-intersect

  for (let i = 0; i < n; i++) {
    const a1 = polygon[i];
    const a2 = polygon[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      // Skip the edge itself and both edges adjacent to it (they share a
      // vertex with edge i, which is not a "crossing").
      if (j === i || j === (i + 1) % n || (j + 1) % n === i) continue;
      const b1 = polygon[j];
      const b2 = polygon[(j + 1) % n];
      if (segmentsProperlyIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

/**
 * True if the polygon's shoelace area is a suspiciously small fraction of
 * its own axis-aligned bounding box — the signature of a degenerate
 * "sliver"/"spike" shape produced by dragging one vertex most of the way
 * across the others. This is a *different* failure mode from
 * self-intersection: the polygon stays simple (no crossing edges), so its
 * area is mathematically correct for the shape as drawn — but that shape
 * is a razor-thin needle, not a usable roof outline, and its
 * correct-but-tiny area reads exactly like a bug to anyone looking at the
 * number. A well-formed building footprint (rectangle, L-shape, octagon,
 * etc.) fills at least ~20% of its bounding box; a collapsed sliver falls
 * far below that.
 */
export function isPolygonTooThin(polygon: Point2D[]): boolean {
  if (!polygon || polygon.length < 3) return true;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  polygon.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });
  const bboxArea = (maxX - minX) * (maxY - minY);
  if (bboxArea <= 0) return true;

  // Only the fill *ratio* matters here, so the plain normalized-space
  // shoelace area is enough — the physical meters-per-pixel scaling used
  // by calculateGeographicPolygonAreaM2 would cancel out anyway.
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  area = Math.abs(area) / 2;

  return area / bboxArea < 0.2;
}

/**
 * Single validity gate for interactive roof-boundary edits — a drag is
 * rejected if it would either cross the shape's own edges
 * (isPolygonSelfIntersecting) or collapse it into a degenerate sliver
 * (isPolygonTooThin). Both failure modes produce a technically-computed
 * area that no longer matches what's visually drawn.
 */
export function isPolygonEditValid(polygon: Point2D[]): boolean {
  return !isPolygonSelfIntersecting(polygon) && !isPolygonTooThin(polygon);
}

/**
 * Converts a normalized-space polygon to real physical meters, using the
 * same per-axis calibration the map engine renders with (geo-constants.ts)
 * — this is what keeps a boundary traced against the real satellite image
 * reporting its true square footage instead of an arbitrary number.
 */
function polygonToMeters(polygon: Point2D[], lat: number): Point2D[] {
  const metersPerUnitX = metersPerNormalizedUnitX(lat);
  const metersPerUnitY = metersPerNormalizedUnitY(lat);
  return polygon.map((pt) => ({
    x: (pt.x - 50) * metersPerUnitX,
    y: (pt.y - 50) * metersPerUnitY,
  }));
}

function polygonFromMeters(pointsMeters: Point2D[], lat: number): Point2D[] {
  const metersPerUnitX = metersPerNormalizedUnitX(lat);
  const metersPerUnitY = metersPerNormalizedUnitY(lat);
  return pointsMeters.map((pt) => ({
    x: pt.x / metersPerUnitX + 50,
    y: pt.y / metersPerUnitY + 50,
  }));
}

function shoelaceAreaM2(pointsMeters: Point2D[]): number {
  let areaM2 = 0;
  for (let i = 0; i < pointsMeters.length; i++) {
    const j = (i + 1) % pointsMeters.length;
    areaM2 += pointsMeters[i].x * pointsMeters[j].y;
    areaM2 -= pointsMeters[j].x * pointsMeters[i].y;
  }
  return Math.abs(areaM2) / 2;
}

/**
 * Calculates true physical polygon area in square meters (m²), using the
 * same normalized-space-to-meters calibration the renderer draws with
 * (geo-constants.ts) — so this number always matches what's actually
 * traced on the satellite image, at any latitude or viewing zoom.
 */
export function calculateGeographicPolygonAreaM2(polygon: Point2D[], lat: number = 18.559): number {
  if (!polygon || polygon.length < 3) return 0;
  return shoelaceAreaM2(polygonToMeters(polygon, lat));
}

/**
 * True if polygon (in meters space, any winding) is wound counter-clockwise
 * in standard math orientation (y-up). Used to pick which perpendicular of
 * an edge points into the polygon's interior.
 */
function isCounterClockwise(pointsMeters: Point2D[]): boolean {
  let signedArea = 0;
  for (let i = 0; i < pointsMeters.length; i++) {
    const j = (i + 1) % pointsMeters.length;
    signedArea += pointsMeters[i].x * pointsMeters[j].y - pointsMeters[j].x * pointsMeters[i].y;
  }
  return signedArea > 0;
}

/**
 * Offsets a simple polygon inward by `distanceMeters` along each edge's
 * normal, then re-intersects consecutive offset edges to find the new
 * vertices — the standard straight-skeleton-adjacent "polygon erosion"
 * technique, done here in real meters space (not the display's normalized
 * space, whose X/Y scales differ) so the setback is geometrically correct
 * regardless of the roof's aspect ratio or the display's screen coordinate
 * quirks. Falls back to null for a vertex whose neighboring edges are
 * parallel (no unique intersection) or that inverts across the polygon
 * (shape too small/thin for this setback) — callers fall back to the
 * simpler centroid-scaling approximation in that case.
 */
function offsetPolygonInward(pointsMeters: Point2D[], distanceMeters: number): Point2D[] | null {
  const n = pointsMeters.length;
  if (n < 3 || distanceMeters <= 0) return pointsMeters;

  const ccw = isCounterClockwise(pointsMeters);

  // For each edge, the offset line: a point on it plus its inward normal.
  const edgeOffsetLines = pointsMeters.map((p1, i) => {
    const p2 = pointsMeters[(i + 1) % n];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return null;
    // Perpendicular to (dx,dy); sign chosen so it points into a CCW polygon's
    // interior (and flipped for CW).
    const nx = (ccw ? -dy : dy) / len;
    const ny = (ccw ? dx : -dx) / len;
    return {
      point: { x: p1.x + nx * distanceMeters, y: p1.y + ny * distanceMeters },
      dir: { x: dx, y: dy },
    };
  });

  if (edgeOffsetLines.some((e) => e === null)) return null;

  const result: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const prev = edgeOffsetLines[(i - 1 + n) % n]!;
    const curr = edgeOffsetLines[i]!;

    // Intersect the two offset lines: prev.point + t*prev.dir == curr.point + s*curr.dir
    const denom = prev.dir.x * curr.dir.y - prev.dir.y * curr.dir.x;
    if (Math.abs(denom) < 1e-9) return null; // parallel neighboring edges

    const ex = curr.point.x - prev.point.x;
    const ey = curr.point.y - prev.point.y;
    const t = (ex * curr.dir.y - ey * curr.dir.x) / denom;

    const vertex = {
      x: prev.point.x + t * prev.dir.x,
      y: prev.point.y + t * prev.dir.y,
    };

    // Sanity check: the offset vertex must have moved toward the polygon's
    // original centroid-ward side, not flipped past it — a flip means this
    // setback is too large for the shape at this corner (thin/small roof).
    const original = pointsMeters[i];
    const movedDist = Math.hypot(vertex.x - original.x, vertex.y - original.y);
    if (movedDist > distanceMeters * 4) return null;

    result.push(vertex);
  }

  return isPolygonSelfIntersecting(result) ? null : result;
}

/**
 * COMPUTES INNER USABLE POLYGON INSET BY SETBACK DISTANCE (e.g. 0.5 meters)
 * — a true geometric edge offset computed in real meters (see
 * offsetPolygonInward), with the old flat centroid-scaling as a safety-net
 * fallback for shapes the offset can't handle (e.g. too thin/small, or
 * concave corners where the offset would invert).
 */
export function computeInnerUsablePolygon(
  roofPolygon: Point2D[],
  setbackMeters: number = 0.5,
  lat: number = 18.559
): Point2D[] {
  if (!roofPolygon || roofPolygon.length < 3) return [];

  const pointsMeters = polygonToMeters(roofPolygon, lat);
  const offsetMeters = offsetPolygonInward(pointsMeters, setbackMeters);
  if (offsetMeters) {
    return polygonFromMeters(offsetMeters, lat);
  }

  // Fallback: scale vertices inward toward centroid by a flat percentage.
  let cx = 0,
    cy = 0;
  roofPolygon.forEach((pt) => {
    cx += pt.x;
    cy += pt.y;
  });
  cx /= roofPolygon.length;
  cy /= roofPolygon.length;

  const insetFactor = Math.min(0.12, (setbackMeters * 1.6) / 100);
  return roofPolygon.map((pt) => ({
    x: pt.x + (cx - pt.x) * insetFactor,
    y: pt.y + (cy - pt.y) * insetFactor,
  }));
}

/**
 * RECALCULATES REAL PHYSICAL ROOF METRICS & RETURNS CANONICAL SINGLE SOURCE OF TRUTH METRICS
 */
export function recalculateRoofMetrics(
  roofPolygon: Point2D[],
  exclusionPolygons: Point2D[][] = [],
  lat: number = 18.559,
  requestedPanelCount: number = 24,
  solarIrradiance: number = 4.85
): CanonicalRoofMetrics {
  const SQM_TO_SQFT = 10.7639104;

  // 1. Total Physical Roof Area
  const totalRoofAreaM2 = calculateGeographicPolygonAreaM2(roofPolygon, lat);
  const totalRoofAreaSqFt = Math.round(totalRoofAreaM2 * SQM_TO_SQFT);

  // 2. Obstacle Exclusion Area
  let obstructionAreaM2 = 0;
  exclusionPolygons.forEach((ex) => {
    obstructionAreaM2 += calculateGeographicPolygonAreaM2(ex, lat);
  });
  const obstructionAreaSqFt = Math.round(obstructionAreaM2 * SQM_TO_SQFT);

  // 3. Inner Usable Polygon inset by 0.5m setback
  const innerUsablePoly = computeInnerUsablePolygon(roofPolygon, 0.5, lat);
  let rawUsableAreaM2 = calculateGeographicPolygonAreaM2(innerUsablePoly, lat);
  let usableRoofAreaM2 = Math.max(5, rawUsableAreaM2 - obstructionAreaM2);
  let usableRoofAreaSqFt = Math.round(usableRoofAreaM2 * SQM_TO_SQFT);

  // STAGE-GATE INVARIANT GUARANTEE: usableRoofArea <= totalRoofArea
  if (usableRoofAreaM2 > totalRoofAreaM2) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[CRITICAL INVARIANT VIOLATION] usableRoofAreaM2 (${usableRoofAreaM2}) > totalRoofAreaM2 (${totalRoofAreaM2})! Clamping values.`
      );
    }
    usableRoofAreaM2 = totalRoofAreaM2;
    usableRoofAreaSqFt = totalRoofAreaSqFt;
  }

  // 4. Panel Placement & System Telemetry
  const placement = computePanelPlacement(roofPolygon, exclusionPolygons, 0, requestedPanelCount, 0.5);
  const activePanels = placement.panels.length;
  const capacityKw = Number(((activePanels * 450) / 1000).toFixed(1));
  const kwhPerKw = solarIrradiance * 365 * 0.78;
  const annualGenKwh = Math.round(capacityKw * kwhPerKw);
  const annualSavings = Math.round(annualGenKwh * 9.6);
  const co2Offset = Number((annualGenKwh * 0.00084).toFixed(1));

  // Development Diagnostic Log
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Canonical Roof Metrics] lat=${lat} | Vertices: ${roofPolygon.length} | ` +
      `Total: ${totalRoofAreaM2.toFixed(2)} m² (${totalRoofAreaSqFt} sq.ft) | ` +
      `Usable: ${usableRoofAreaM2.toFixed(2)} m² (${usableRoofAreaSqFt} sq.ft) | ` +
      `Panels: ${activePanels} (${capacityKw} kW)`
    );
  }

  return {
    totalRoofAreaM2: Number(totalRoofAreaM2.toFixed(2)),
    totalRoofAreaSqFt,
    usableRoofAreaM2: Number(usableRoofAreaM2.toFixed(2)),
    usableRoofAreaSqFt,
    obstructionAreaM2: Number(obstructionAreaM2.toFixed(2)),
    obstructionAreaSqFt,
    panelCount: activePanels,
    capacityKw,
    annualGenKwh,
    annualSavings,
    co2Offset,
  };
}

/**
 * Deterministically generates realistic building roof footprint geometry seeded by latitude & longitude
 */
export function generateRealisticRoofGeometry(lat: number, lng: number): {
  roofPolygon: Point2D[];
  exclusionPolygons: Point2D[][];
  roofOrientationDeg: number;
  confidence: BuildingConfidenceType;
  metrics: CanonicalRoofMetrics;
} {
  // Hash seed from lat/lng
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;

  // Roof orientation / ridge angle (0 to 45 deg, or -30 to +30 deg off South)
  const roofOrientationDeg = Math.round((seed * 60 - 30) * 10) / 10;

  // Architectural style: 0 -> L-Shape, 1 -> Irregular Octagonal/Hip, 2 -> Standard Rectangular Ridge
  const style = Math.floor(seed * 3);

  let roofPolygon: Point2D[] = [];

  // Vertex extents below are calibrated against geo-constants.ts's real
  // meters-per-normalized-unit so each style lands close to its labeled
  // square footage — before calculateGeographicPolygonAreaM2 was corrected
  // to match the renderer's actual scale, these shapes were unknowingly
  // reporting several times their intended size.
  if (style === 0) {
    // L-Shaped Building Footprint (~1,050 sq.ft)
    roofPolygon = [
      { x: 41, y: 40.2 },
      { x: 59, y: 40.2 },
      { x: 59, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 59.8 },
      { x: 41, y: 59.8 },
    ];
  } else if (style === 1) {
    // Irregular Hip Roof with Chamfered Corners (~1,120 sq.ft)
    roofPolygon = [
      { x: 41.8, y: 40.2 },
      { x: 58.2, y: 40.2 },
      { x: 60.6, y: 43.5 },
      { x: 60.6, y: 56.5 },
      { x: 57.4, y: 59.8 },
      { x: 42.6, y: 59.8 },
      { x: 39.4, y: 56.5 },
      { x: 39.4, y: 43.5 },
    ];
  } else {
    // Standard High-Efficiency Rectangular Roof (~1,000 sq.ft)
    roofPolygon = [
      { x: 41, y: 41 },
      { x: 59, y: 41 },
      { x: 59, y: 59 },
      { x: 41, y: 59 },
    ];
  }

  // No obstacle is invented for a freshly detected roof — a stairwell or
  // water tank isn't something the engine can actually see, so showing one
  // unconditionally on every roof would be a fabricated detail, not a
  // detection result. Obstacles now only exist once a user explicitly adds
  // one via "+ Add Obstacle" while adjusting the boundary.
  const exclusionPolygons: Point2D[][] = [];

  const metrics = recalculateRoofMetrics(roofPolygon, exclusionPolygons, lat, 24, 4.85);

  return {
    roofPolygon,
    exclusionPolygons,
    roofOrientationDeg,
    confidence: 'ESTIMATED ROOF',
    metrics,
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
  setbackMeters: number = 0.5,
  lat: number = 18.559
): {
  panels: PanelModulePosition[];
  totalPositionsAvailable: number;
  effectiveAngleDeg: number;
} {
  if (!roofPolygon || roofPolygon.length < 3) {
    return { panels: [], totalPositionsAvailable: 0, effectiveAngleDeg: 0 };
  }

  // Calculate dominant roof edge angle (angle of longest edge of polygon)
  let maxEdgeLen = 0;
  let dominantAngleDeg = roofOrientationDeg;
  for (let i = 0; i < roofPolygon.length; i++) {
    const j = (i + 1) % roofPolygon.length;
    const dx = roofPolygon[j].x - roofPolygon[i].x;
    const dy = roofPolygon[j].y - roofPolygon[i].y;
    const len = Math.hypot(dx, dy);
    if (len > maxEdgeLen) {
      maxEdgeLen = len;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      dominantAngleDeg = Math.round(angle * 10) / 10;
    }
  }

  // Compute inner usable polygon inset by setback distance
  const usablePoly = computeInnerUsablePolygon(roofPolygon, setbackMeters, lat);

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

  // Panel module footprint: ~2.1m x 1.05m (typical 450W residential module),
  // expressed in normalized units via geo-constants.ts's real-world scale —
  // previously these were tuned against the area math's old, uncorrected
  // meters conversion and worked out to a physically oversized ~4m x 2m panel.
  const metersPerUnitX = metersPerNormalizedUnitX(lat);
  const metersPerUnitY = metersPerNormalizedUnitY(lat);
  const pW = 2.1 / metersPerUnitX;
  const pH = 1.05 / metersPerUnitY;
  const gap = 0.3 / metersPerUnitX;

  // Rotation transform helpers
  const rad = (dominantAngleDeg * Math.PI) / 180;
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
        angleDeg: dominantAngleDeg,
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
    effectiveAngleDeg: dominantAngleDeg,
  };
}
