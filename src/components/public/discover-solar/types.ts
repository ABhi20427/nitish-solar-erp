export type LocationSource = 'address' | 'current-location' | 'google-maps-link' | 'coordinates';

export interface SatelliteLocation {
  address: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  zoom: number; // 1 to 20
  source?: LocationSource;
  roofPolygon: { x: number; y: number }[]; // Normalised roof boundary points [0..100]
  solarIrradiance: number; // kWh/kWp/day
  estimatedUsableAreaSqFt: number;
}

export type VisualMode = 'SATELLITE' | 'SOLAR_ANALYSIS' | 'PANEL_LAYOUT' | 'SUN';

export interface SolarCalculationResult {
  panelCount: number; // 6, 12, 18, 24, 30
  capacityKw: number;
  annualGenerationKwh: number;
  annualSavingsRs: number;
  co2OffsetTonnes: number;
}
