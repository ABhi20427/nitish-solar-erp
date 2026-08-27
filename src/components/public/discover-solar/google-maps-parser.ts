export interface ParsedLocationInput {
  isGoogleMapsLink: boolean;
  isCoordinates: boolean;
  lat: number | null;
  lng: number | null;
  displayAddress: string;
  source: 'address' | 'current-location' | 'google-maps-link' | 'coordinates';
}

/**
 * Parses user input which can be:
 * 1. A Google Maps link (e.g. https://www.google.com/maps/place/.../@18.559,73.786,17z)
 * 2. Latitude, Longitude coordinates (e.g. 18.55907, 73.78684)
 * 3. A standard text address (e.g. Baner Road, Pune)
 */
export function parseLocationInput(input: string): ParsedLocationInput {
  const cleanInput = input.trim();

  if (!cleanInput) {
    return {
      isGoogleMapsLink: false,
      isCoordinates: false,
      lat: null,
      lng: null,
      displayAddress: '',
      source: 'address',
    };
  }

  // 1. Check for Direct Coordinates (e.g., "18.55907, 73.78684" or "18.55907 73.78684")
  const coordRegex = /^[-+]?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?)[,\s]+[-+]?(1[0-7]\d(?:\.\d+)?|180(?:\.0+)?|[1-9]?\d(?:\.\d+)?)$/;
  const coordMatch = cleanInput.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    return {
      isGoogleMapsLink: false,
      isCoordinates: true,
      lat,
      lng,
      displayAddress: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      source: 'coordinates',
    };
  }

  // 2. Check for Google Maps Links
  const isGmaps = /https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(cleanInput);

  if (isGmaps) {
    // Try to extract @lat,lng,zoom
    const atMatch = cleanInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      return {
        isGoogleMapsLink: true,
        isCoordinates: false,
        lat,
        lng,
        displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        source: 'google-maps-link',
      };
    }

    // Try query param q=lat,lng or query=lat,lng or ll=lat,lng
    const queryParamMatch = cleanInput.match(/[?&](?:q|query|ll|location)=?(-?\d+\.\d+)[, ]+(-?\d+\.\d+)/i);
    if (queryParamMatch) {
      const lat = parseFloat(queryParamMatch[1]);
      const lng = parseFloat(queryParamMatch[2]);
      return {
        isGoogleMapsLink: true,
        isCoordinates: false,
        lat,
        lng,
        displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        source: 'google-maps-link',
      };
    }

    // If Google Maps link has place name (e.g. /maps/place/Baner+Pune/...)
    const placeMatch = cleanInput.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return {
        isGoogleMapsLink: true,
        isCoordinates: false,
        lat: null,
        lng: null,
        displayAddress: placeName,
        source: 'google-maps-link',
      };
    }

    // Fallback for short links
    return {
      isGoogleMapsLink: true,
      isCoordinates: false,
      lat: 18.559, // Default to Pune solar hub if unparseable short link
      lng: 73.7868,
      displayAddress: 'Google Maps Link Location',
      source: 'google-maps-link',
    };
  }

  // 3. Normal Address String
  return {
    isGoogleMapsLink: false,
    isCoordinates: false,
    lat: null,
    lng: null,
    displayAddress: cleanInput,
    source: 'address',
  };
}
