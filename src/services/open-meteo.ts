/**
 * Cliente HTTP fino para a Open-Meteo (https://open-meteo.com) — provedor de previsão
 * do tempo gratuito, sem API key e com limite generoso (10k chamadas/dia no uso
 * não-comercial), usado aqui no lugar do OpenWeatherMap/NOAA/INMET previstos no spec
 * original (docs/weather_app_project_spec.md §6): aqueles exigem chave paga ou cobrem
 * só uma região. Troca de provedor é local a este arquivo — nada na UI depende do
 * shape bruto da resposta (ver `weather-transform.ts`).
 *
 * Nenhuma lib de HTTP (axios) é usada — `fetch` nativo do Hermes é suficiente e evita
 * uma dependência extra, seguindo o mesmo princípio de minimizar deps já aplicado
 * no resto do app (ex.: SymbolView em vez de react-native-svg).
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
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
};

export type OpenMeteoForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
};

const HOURLY_VARS = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'relative_humidity_2m',
  'apparent_temperature',
].join(',');

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
].join(',');

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
    timezone: 'auto',
    forecast_days: '2',
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
    timezone: 'auto',
    forecast_days: '2',
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
