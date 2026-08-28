export type LocationSource = 'address' | 'current-location' | 'google-maps-link' | 'coordinates';

export interface Point2D {
  x: number; // Normalised 0..100 relative to roof bounding frame
  y: number;
}

export type BuildingConfidenceType = 'ESTIMATED ROOF' | 'USER-CONFIRMED ROOF' | 'CUSTOM ROOF' | 'PROPERTY DETECTED';

export interface SatelliteLocation {
  address: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  zoom: number; // 1 to 21
  source?: LocationSource;
  roofPolygon: Point2D[]; // Normalised building roof boundary points [0..100]
  exclusionPolygons?: Point2D[][]; // Normalised excluded obstacle regions [0..100]
  roofOrientationDeg?: number; // Roof ridge/azimuth orientation angle in degrees (0..360)
  solarIrradiance: number; // kWh/kWp/day
  totalRoofAreaSqFt: number;
  estimatedUsableAreaSqFt: number;
  obstructionAreaSqFt: number;
  buildingConfidence?: BuildingConfidenceType;
  isUserConfirmed?: boolean;
}

export type VisualMode = 'SATELLITE' | 'SOLAR_ANALYSIS' | 'PANEL_LAYOUT' | 'SUN';

export type SolarEngineState =
  | 1 // LOCATING PROPERTY
  | 2 // PROPERTY FOUND
  | 3 // ROOF DETECTED
  | 4 // ADJUST ROOF
  | 5 // ROOF CONFIRMED
  | 6 // CALCULATING SOLAR POTENTIAL
  | 7 // OPTIMISING PANEL LAYOUT
  | 8; // SOLAR ARRAY READY

export interface PanelModulePosition {
  id: number;
  x: number; // Center X in roof coordinate space (-100..100 or world offset)
  y: number; // Center Y in roof coordinate space
  width: number;
  length: number;
  angleDeg: number; // Panel orientation angle
  row: number;
  col: number;
  score: number; // Solar exposure / suitability score
}

export interface SolarCalculationResult {
  panelCount: number; // 6, 12, 18, 24, 30, etc.
  capacityKw: number;
  annualGenerationKwh: number;
  annualSavingsRs: number;
  co2OffsetTonnes: number;
  totalRoofAreaSqFt: number;
  usableRoofAreaSqFt: number;
}


