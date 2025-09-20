import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 });
const NOMINATIM = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(address) {
  if (!address) return null;
  const key = `geocode:${address}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const resp = await axios.get(`${NOMINATIM}/search`, {
      params: { q: address, format: 'json', limit: 1 },
      timeout: 5000,
      headers: { 'User-Agent': 'FeiraFlow/1.0 (contact@feiraflow.local)' }
    });

    if (Array.isArray(resp.data) && resp.data.length > 0) {
      const { lat, lon } = resp.data[0];
      const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      cache.set(key, coords);
      return coords;
    }
    return null;
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return null;
  }
}
