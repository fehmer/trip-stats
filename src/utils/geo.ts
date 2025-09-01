const cache = new Map<string, string>();

export async function getTown(params?: {
  position_lat: number;
  position_long: number;
}): Promise<string> {
  if (params === undefined) return "unknown";
  const lat = params.position_lat.toFixed(4);
  const long = params.position_long.toFixed(4);
  const key = lat + "|" + long;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;

  const response = await fetch(url);
  let result = "unknown";

  if (response.ok) {
    const data = await response.json();
    result =
      data.address.town || data.address.city || data.address.village || null;
  }
  cache.set(key, result);
  return result;
}
