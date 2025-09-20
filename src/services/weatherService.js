import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from "dotenv";
dotenv.config();

const cache = new NodeCache({ stdTTL: 10 * 60 });
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

export async function getWeather(lat, lon) {
  if (lat == null || lon == null || !OPENWEATHER_KEY) return null;
  const key = `weather:${lat}:${lon}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: OPENWEATHER_KEY, units: 'metric', lang: 'pt_br' },
      timeout: 5000
    });
    const data = {
      temp: resp.data.main?.temp,
      description: resp.data.weather?.[0]?.description,
      wind_speed: resp.data.wind?.speed,
      raw: resp.data
    };
    cache.set(key, data);
    return data;
  } catch (err) {
    console.error('OpenWeather error:', err.message);
    return null;
  }
}
