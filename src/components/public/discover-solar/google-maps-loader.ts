import { setOptions } from '@googlemaps/js-api-loader';

// setOptions() is only valid to call once for the lifetime of the page (the
// loader warns and ignores repeats). Both the address lookup and the
// satellite map need the Google Maps API, so the guard lives here at module
// scope and either can call this first.
let googleMapsOptionsSet = false;

export function ensureGoogleMapsOptions() {
  if (googleMapsOptionsSet) return;
  googleMapsOptionsSet = true;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    v: 'weekly',
  });
}
