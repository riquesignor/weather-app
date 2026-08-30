/**
 * Cliente HTTP fino para a Open-Meteo (https://open-meteo.com) — provedor de previsão
 * do tempo gratuito, sem API key e com limite generoso (10k chamadas/dia no uso
 * não-comercial), usado aqui no lugar do OpenWeatherMap/NOAA/INMET previstos no spec
 * original (docs/weather_app_project_spec.md §6): aqueles exigem chave paga ou cobrem
 * só uma região. Troca de provedor é local a este arquivo — nada na UI depende do
 * shape bruto da resposta (ver `weather-transform.ts` / `weather-details.ts`).
 *
 * Nenhuma lib de HTTP (axios) é usada — `fetch` nativo do Hermes é suficiente e evita
 * uma dependência extra, seguindo o mesmo princípio de minimizar deps já aplicado
 * no resto do app (ex.: SymbolView em vez de react-native-svg).
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const REVERSE_TIMEOUT_MS = 10_000;

export class WeatherApiError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export type Coordinates = { latitude: number; longitude: number };

export type OpenMeteoCurrent = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  dew_point_2m: number;
  pressure_msl: number;
  wind_direction_10m: number;
};

export type OpenMeteoHourly = {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  uv_index: number[];
  visibility: number[];
};

export type OpenMeteoDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
};

export type OpenMeteoForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
};

const HOURLY_VARS = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'relative_humidity_2m',
  'apparent_temperature',
  'uv_index',
  'visibility',
].join(',');

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'dew_point_2m',
  'pressure_msl',
  'wind_direction_10m',
].join(',');

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'sunrise',
  'sunset',
].join(',');

/** 7 dias cobre "hoje + 6" — o suficiente para a seção Semanal sem estourar o free tier. */
const FORECAST_DAYS = '7';

async function fetchJson<T>(url: string, timeoutMs = REVERSE_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherApiError(`HTTP ${response.status} ao chamar ${url}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof WeatherApiError) throw error;
    throw new WeatherApiError('Falha de rede ao consultar a Open-Meteo', error);
  } finally {
    clearTimeout(timeout);
  }
}

/** Previsão para UM ponto (latitude/longitude). */
export async function fetchForecast(coords: Coordinates): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: FORECAST_DAYS,
    wind_speed_unit: 'kmh',
  });
  return fetchJson<OpenMeteoForecastResponse>(`${FORECAST_URL}?${params.toString()}`);
}

/**
 * Previsão em lote para VÁRIOS pontos em uma única chamada HTTP — a Open-Meteo aceita
 * listas separadas por vírgula em `latitude`/`longitude` e devolve um array na mesma
 * ordem. Evita N chamadas (uma por favorito) na tela de localizações.
 */
export async function fetchForecastBatch(coordsList: Coordinates[]): Promise<OpenMeteoForecastResponse[]> {
  if (coordsList.length === 0) return [];
  if (coordsList.length === 1) return [await fetchForecast(coordsList[0])];

  const params = new URLSearchParams({
    latitude: coordsList.map((c) => c.latitude).join(','),
    longitude: coordsList.map((c) => c.longitude).join(','),
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: FORECAST_DAYS,
    wind_speed_unit: 'kmh',
  });
  const result = await fetchJson<OpenMeteoForecastResponse[] | OpenMeteoForecastResponse>(
    `${FORECAST_URL}?${params.toString()}`
  );
  return Array.isArray(result) ? result : [result];
}

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  admin1: string | null;
};

type RawGeocodingResponse = {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }>;
};

/** Busca de cidades por nome (autocomplete da tela "Minhas localizações"). */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '6',
    language: 'pt',
    format: 'json',
  });
  const data = await fetchJson<RawGeocodingResponse>(`${GEOCODING_URL}?${params.toString()}`, 8_000);
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country ?? null,
    admin1: r.admin1 ?? null,
  }));
}

export type AirQualityCurrent = {
  time: string;
  european_aqi: number;
  pm10: number;
  pm2_5: number;
};

export type AirQualityResponse = {
  current: AirQualityCurrent;
};

const AIR_QUALITY_CURRENT_VARS = ['european_aqi', 'pm10', 'pm2_5'].join(',');

/**
 * Qualidade do ar (índice europeu, 0-100+) — API irmã da Open-Meteo, mesma política de
 * uso gratuito, sem key. Pólen é reportado por essa mesma API mas só tem cobertura
 * confiável na Europa (https://open-meteo.com/en/docs/air-quality-api), por isso não é
 * usado aqui — mostrar "N/A" pra usuários fora da Europa não agregaria valor.
 */
export async function fetchAirQuality(coords: Coordinates): Promise<AirQualityResponse> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: AIR_QUALITY_CURRENT_VARS,
    timezone: 'auto',
  });
  return fetchJson<AirQualityResponse>(`${AIR_QUALITY_URL}?${params.toString()}`, 8_000);
}
