import { NextRequest, NextResponse } from 'next/server';

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export async function POST(req: NextRequest) {
  try {
    let url = '';
    try {
      const body = await req.json();
      url = body?.url || '';
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL string is required' }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // Security check: Only allow resolution of Google Maps domains
    const isGmaps = /https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(cleanUrl);
    if (!isGmaps) {
      return NextResponse.json({ success: false, error: 'Only Google Maps URLs are allowed' }, { status: 400 });
    }

    let finalUrl = cleanUrl;

    // Follow redirects server-side for short links (e.g. maps.app.goo.gl)
    if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(cleanUrl)) {
      try {
        const response = await fetch(cleanUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        finalUrl = response.url;
      } catch (err) {
        console.error('Error following short link redirect:', err);
      }
    }

    // 1. Check for @lat,lng
    const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({
          success: true,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
          resolvedUrl: finalUrl,
        });
      }
    }

    // 2. Check for data string encoded !3dlat!4dlng
    const dataMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataMatch) {
      const lat = parseFloat(dataMatch[1]);
      const lng = parseFloat(dataMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({
          success: true,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
          resolvedUrl: finalUrl,
        });
      }
    }

    // 3. Check for query parameters q=lat,lng or query=lat,lng
    const queryParamMatch = finalUrl.match(/[?&](?:q|query|ll|center|location|loc:)=?(-?\d+\.\d+)[, +]+(-?\d+\.\d+)/i);
    if (queryParamMatch) {
      const lat = parseFloat(queryParamMatch[1]);
      const lng = parseFloat(queryParamMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({
          success: true,
          lat,
          lng,
          displayAddress: `Google Maps Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          source: 'google-maps-link',
          resolvedUrl: finalUrl,
        });
      }
    }

    // 4. Place Name extraction -> Geocode via OpenStreetMap Nominatim
    const placeMatch = finalUrl.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`,
          {
            headers: {
              'User-Agent': 'NitishSolarApp/1.0',
            },
          }
        );
        const geoData = await geoRes.json();
        if (geoData && geoData[0]) {
          const lat = parseFloat(geoData[0].lat);
          const lng = parseFloat(geoData[0].lon);
          if (isValidLatLng(lat, lng)) {
            return NextResponse.json({
              success: true,
              lat,
              lng,
              displayAddress: geoData[0].display_name || placeName,
              source: 'google-maps-link',
              resolvedUrl: finalUrl,
            });
          }
        }
      } catch (e) {
        console.error('Nominatim geocoding error:', e);
      }
    }

    // Unresolvable Google Maps link -> Return explicit error (NO SILENT FALLBACK!)
    return NextResponse.json(
      {
        success: false,
        error: "Couldn't read coordinates from this Google Maps link. Please paste a full Google Maps URL with coordinates or search by address.",
      },
      { status: 422 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
