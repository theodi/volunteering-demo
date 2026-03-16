/**
 * Geocoding via OpenStreetMap Nominatim.
 * Use a valid User-Agent per https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "User-Agent": "VounteeringDemo/1.0 (https://github.com/vounteering-demo)",
  Accept: "application/json",
};

export type ReverseResult = {
  display_name: string;
};

export type ForwardResult = {
  lat: number;
  lon: number;
  display_name: string;
};

/**
 * Reverse geocode: (lat, lng) → address string.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseResult | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = (await res.json()) as { display_name?: string };
  return data.display_name != null ? { display_name: data.display_name } : null;
}

/**
 * Forward geocode: address/postcode string → (lat, lng) and display name.
 */
export async function forwardGeocode(query: string): Promise<ForwardResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const arr = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
  const first = arr?.[0];
  if (!first?.lat || !first?.lon) return null;
  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    display_name: first.display_name ?? `${first.lat}, ${first.lon}`,
  };
}
