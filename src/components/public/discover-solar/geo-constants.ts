/**
 * Single source of truth tying the roof/panel engine's normalized 0..100
 * coordinate space to real-world meters. Both the canvas renderer
 * (satellite-map-engine.tsx) and the area/packing math (roof-packing-
 * algorithm.ts) must derive their scale from these same constants — they
 * used to maintain independent, hand-tuned calibrations that drifted apart,
 * which is why traced roofs were reporting wildly understated square
 * footage once real satellite imagery made the mismatch visible.
 */

// Earth's equatorial circumference in meters (WGS84/Web Mercator constant).
export const EARTH_CIRCUMFERENCE_M = 40075016.6855;

// The integer zoom level the normalized 0..100 roof-polygon space is
// calibrated against. A polygon's real-world footprint is fixed regardless
// of what zoom the map is currently displaying — REFERENCE_INTEGER_ZOOM is
// only the anchor used to derive that fixed physical meaning.
export const REFERENCE_INTEGER_ZOOM = 20;

// Canvas CSS pixels per normalized unit at REFERENCE_INTEGER_ZOOM, along
// each screen axis. Must match the values SatelliteMapEngine renders with.
export const NORMALIZED_SCALE_X = 4.2;
export const NORMALIZED_SCALE_Y = 3.6;

/**
 * Real-world meters spanned by 1 normalized unit along one axis, at a given
 * latitude. Web Mercator's meters-per-pixel term is latitude-dependent
 * (Mercator stretches distances away from the equator), but it cancels out
 * of any ratio between two quantities both derived from this same function
 * — which is exactly how the renderer and the area math stay consistent
 * with each other at every latitude, not just the one they were tuned at.
 */
export function metersPerNormalizedUnit(lat: number, axisScalePxPerUnit: number): number {
  const latRad = (lat * Math.PI) / 180;
  const metersPerPixelAtReferenceZoom =
    (Math.cos(latRad) * EARTH_CIRCUMFERENCE_M) / (256 * Math.pow(2, REFERENCE_INTEGER_ZOOM));
  return axisScalePxPerUnit * metersPerPixelAtReferenceZoom;
}

export function metersPerNormalizedUnitX(lat: number): number {
  return metersPerNormalizedUnit(lat, NORMALIZED_SCALE_X);
}

export function metersPerNormalizedUnitY(lat: number): number {
  return metersPerNormalizedUnit(lat, NORMALIZED_SCALE_Y);
}
