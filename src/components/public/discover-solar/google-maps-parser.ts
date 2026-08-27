export interface ParsedLocationInput {
  isGoogleMapsLink: boolean;
  isCoordinates: boolean;
  lat: number | null;
  lng: number | null;
  displayAddress: string;
  source: 'address' | 'current-location' | 'google-maps-link' | 'coordinates';
  error?: string;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Parses user input which can be:
 * 1. A Google Maps link (e.g. https://www.google.com/maps/place/.../@12.9716,77.5946,17z)
 * 2. Latitude, Longitude coordinates (e.g. 12.9716, 77.5946)
 * 3. A standard text address (e.g. Baner Road, Pune)
 * 
 * CRITICAL RULE: NEVER return a fake or default coordinate fallback if parsing fails!
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

  // 1. Direct Coordinates (e.g., "12.9716, 77.5946" or "18.55907 73.78684")
  const coordRegex = /^[-+]?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?)[,\s]+[-+]?(1[0-7]\d(?:\.\d+)?|180(?:\.0+)?|[1-9]?\d(?:\.\d+)?)$/;
  const coordMatch = cleanInput.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return {
        isGoogleMapsLink: false,
        isCoordinates: true,
        lat,
        lng,
        displayAddress: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        source: 'coordinates',
      };
    }
  }

  // 2. Google Maps URL Detection
  const isGmaps = /https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(cleanInput);

  if (isGmaps) {
    // 2a. Check for @lat,lng,zoom or @lat,lng
    const atMatch = cleanInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return {
          isGoogleMapsLink: true,
          isCoordinates: false,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
        };
      }
    }

    // 2b. Check for data string encoded !3dlat!4dlng
    const dataMatch = cleanInput.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataMatch) {
      const lat = parseFloat(dataMatch[1]);
      const lng = parseFloat(dataMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return {
          isGoogleMapsLink: true,
          isCoordinates: false,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
        };
      }
    }

    // 2c. Check for query parameters q=lat,lng or query=lat,lng or ll=lat,lng or center=lat,lng
    const queryParamMatch = cleanInput.match(/[?&](?:q|query|ll|center|location|loc:)=?(-?\d+\.\d+)[, +]+(-?\d+\.\d+)/i);
    if (queryParamMatch) {
      const lat = parseFloat(queryParamMatch[1]);
      const lng = parseFloat(queryParamMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return {
          isGoogleMapsLink: true,
          isCoordinates: false,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
        };
      }
    }

    // 2d. Place name in URL path
    const placeMatch = cleanInput.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return {
        isGoogleMapsLink: true,
        isCoordinates: false,
        lat: null, // Needs server-side API resolution
        lng: null,
        displayAddress: placeName,
        source: 'google-maps-link',
      };
    }

    // 2e. Short URL requiring resolution
    const isShortUrl = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(cleanInput);
    if (isShortUrl) {
      return {
        isGoogleMapsLink: true,
        isCoordinates: false,
        lat: null, // Needs server-side API resolution
        lng: null,
        displayAddress: 'Shortened Google Maps Link',
        source: 'google-maps-link',
      };
    }

    // ABSOLUTE RULE: If URL is recognized as Google Maps but coordinates cannot be extracted directly, return lat: null & error notice. NEVER SILENTLY FALL BACK TO PUNE OR DEFAULT!
    return {
      isGoogleMapsLink: true,
      isCoordinates: false,
      lat: null,
      lng: null,
      displayAddress: cleanInput,
      source: 'google-maps-link',
      error: "Couldn't read location from this Google Maps link. Please paste the full Google Maps URL with coordinates or search by address.",
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
