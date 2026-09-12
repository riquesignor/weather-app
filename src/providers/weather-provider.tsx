/**
 * Fonte única da verdade dos dados de clima em tempo real (fluxo descrito no spec
 * §7 — aqui um Context substitui o Zustand store previsto, para não introduzir mais
 * uma dependência num app deste porte).
 *
 * Orquestra: permissão de localização (`use-location-permission`) → fetch na
 * Open-Meteo (`services/open-meteo`) → transformação para os tipos de domínio
 * (`services/weather-transform`) → estado consumido pelas telas via `useWeather()`.
 *
 * Cache: em memória (Map, TTL de 5 min — spec §9 "cache agressivo para dados não
 * críticos"), perdido ao reiniciar o app. Suficiente para uma sessão de uso; virar
 * persistente é o próximo passo natural (AsyncStorage), fora do escopo agora.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  currentConditions as fallbackCurrentConditions,
  currentLocation as fallbackLocation,
  dailyForecast as fallbackDailyForecast,
  favoriteLocations as seedFavorites,
  hourlyDetailed as fallbackHourlyDetailed,
  hourlyForecast as fallbackHourlyForecast,
  severeAlert as fallbackAlert,
  weatherDetails as fallbackWeatherDetails,
  type CurrentConditions,
  type DailyForecastPoint,
  type FavoriteLocation,
  type HourlyDetail,
  type HourlyPoint,
  type SevereAlert,
  type WeatherDetails,
} from '@/lib/mock-weather';
import {
  fetchAirQuality,
  fetchForecast,
  fetchForecastBatch,
  searchLocations,
  type Coordinates,
  type GeocodingResult,
  type OpenMeteoForecastResponse,
} from '@/services/open-meteo';
import { deriveSevereAlert, findCurrentHourIndex } from '@/services/severe-alert';
import { transformForecast } from '@/services/weather-transform';
import { toWeatherDetails } from '@/services/weather-details';
import { useLocationPermission } from '@/hooks/use-location-permission';

const CACHE_TTL_MS = 5 * 60 * 1000;
const forecastCache = new Map<string, { data: OpenMeteoForecastResponse; expiresAt: number }>();

function cacheKey(coords: Coordinates): string {
  return `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`;
}

async function fetchForecastCached(coords: Coordinates): Promise<OpenMeteoForecastResponse> {
  const key = cacheKey(coords);
  const cached = forecastCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const data = await fetchForecast({ latitude: coords.latitude, longitude: coords.longitude });
  forecastCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

type ManualFavorite = { id: string; name: string; latitude: number; longitude: number };
type ActiveLocation = { id: string; name: string; latitude: number; longitude: number };

type WeatherContextValue = {
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
  locationName: string;
  coordinates: Coordinates;
  current: CurrentConditions;
  hourlyForecast: HourlyPoint[];
  hourlyDetailed: HourlyDetail[];
  alert: SevereAlert;
  dailyForecast: DailyForecastPoint[];
  details: WeatherDetails;
  favorites: FavoriteLocation[];
  searchLocations: (query: string) => Promise<GeocodingResult[]>;
  refresh: () => void;
  selectLocation: (loc: ActiveLocation) => void;
  addFavorite: (result: GeocodingResult) => void;
  removeFavorite: (id: string) => void;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

function formatGeoName(result: GeocodingResult): string {
  const region = result.admin1 ?? result.country;
  return region && region !== result.name ? `${result.name}, ${region}` : result.name;
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const gps = useLocationPermission();

  // Localização escolhida manualmente na tela de favoritos (sobrepõe o GPS até o refresh seguinte).
  const [activeOverride, setActiveOverride] = useState<ActiveLocation | null>(null);
  // Favoritos adicionados pelo usuário via busca (a linha "atual"/GPS é sempre injetada à parte).
  const [manualFavorites, setManualFavorites] = useState<ManualFavorite[]>(
    seedFavorites
      .filter((f) => !f.current)
      .map((f) => ({ id: f.id, name: f.name, latitude: f.latitude, longitude: f.longitude }))
  );

  const [weather, setWeather] = useState<{
    status: 'loading' | 'ready' | 'error';
    errorMessage?: string;
    current: CurrentConditions;
    hourlyForecast: HourlyPoint[];
    hourlyDetailed: HourlyDetail[];
    alert: SevereAlert;
    dailyForecast: DailyForecastPoint[];
    details: WeatherDetails;
  }>({
    status: 'loading',
    current: fallbackCurrentConditions,
    hourlyForecast: fallbackHourlyForecast,
    hourlyDetailed: fallbackHourlyDetailed,
    alert: fallbackAlert,
    dailyForecast: fallbackDailyForecast,
    details: fallbackWeatherDetails,
  });

  const [favoritesData, setFavoritesData] = useState<FavoriteLocation[]>(seedFavorites);
  const [attempt, setAttempt] = useState(0);

  const active: ActiveLocation = activeOverride ?? {
    id: 'gps',
    name: gps.locationName,
    latitude: gps.coords.latitude,
    longitude: gps.coords.longitude,
  };

  // Evita corrida entre respostas de fetches concorrentes (troca rápida de localização).
  const requestId = useRef(0);

  useEffect(() => {
    if (gps.status === 'loading' && !activeOverride) return; // aguarda permissão resolver antes do 1º fetch

    let cancelled = false;
    const myRequest = ++requestId.current;

    async function run() {
      setWeather((prev) => ({ ...prev, status: 'loading' }));
      try {
        const resp = await fetchForecastCached({ latitude: active.latitude, longitude: active.longitude });
        const transformed = transformForecast(resp);
        const startIndex = findCurrentHourIndex(resp.hourly, resp.current.time);

        // Qualidade do ar é um "nice to have" do card Detalhes — roda em paralelo e não
        // deve derrubar a tela principal se essa API falhar (ela é separada da de previsão).
        let details: WeatherDetails;
        try {
          const air = await fetchAirQuality({ latitude: active.latitude, longitude: active.longitude });
          details = toWeatherDetails(resp, startIndex, air);
        } catch {
          details = toWeatherDetails(resp, startIndex, null);
        }

        if (cancelled || requestId.current !== myRequest) return;
        setWeather({ status: 'ready', ...transformed, details });
      } catch (error) {
        if (cancelled || requestId.current !== myRequest) return;
        setWeather({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Falha ao buscar previsão',
          current: fallbackCurrentConditions,
          hourlyForecast: fallbackHourlyForecast,
          hourlyDetailed: fallbackHourlyDetailed,
          alert: fallbackAlert,
          dailyForecast: fallbackDailyForecast,
          details: fallbackWeatherDetails,
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.latitude, active.longitude, gps.status, attempt]);

  // Lista de favoritos com dado ao vivo: 1 chamada em lote (GPS + favoritos manuais).
  useEffect(() => {
    if (gps.status === 'loading') return;
    let cancelled = false;

    async function run() {
      const points: Coordinates[] = [gps.coords, ...manualFavorites.map((f) => ({ latitude: f.latitude, longitude: f.longitude }))];
      try {
        const responses = await fetchForecastBatch(points);
        if (cancelled) return;

        const rows: FavoriteLocation[] = responses.map((resp, index) => {
          const isGps = index === 0;
          const startIndex = findCurrentHourIndex(resp.hourly, resp.current.time);
          const info = transformForecast(resp);
          const alertActive = deriveSevereAlert(resp.hourly, startIndex);
          const meta = isGps
            ? { id: 'gps', name: gps.locationName }
            : manualFavorites[index - 1];
          return {
            id: meta.id,
            name: meta.name,
            latitude: resp.latitude,
            longitude: resp.longitude,
            temp: info.current.temp,
            current: isGps,
            condition: info.current.conditionKind,
            alertLabel: alertActive.active ? alertActive.type : null,
          };
        });
        setFavoritesData(rows);
      } catch {
        // Mantém a última lista boa conhecida (ou o seed) — não derruba a tela por causa disso.
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gps.status, gps.coords.latitude, gps.coords.longitude, gps.locationName, manualFavorites, attempt]);

  const refresh = useCallback(() => {
    forecastCache.clear();
    setAttempt((a) => a + 1);
  }, []);

  const selectLocation = useCallback((loc: ActiveLocation) => {
    setActiveOverride(loc.id === 'gps' ? null : loc);
  }, []);

  const addFavorite = useCallback((result: GeocodingResult) => {
    const id = String(result.id);
    setManualFavorites((prev) => (prev.some((f) => f.id === id) ? prev : [...prev, { id, name: formatGeoName(result), latitude: result.latitude, longitude: result.longitude }]));
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setManualFavorites((prev) => prev.filter((f) => f.id !== id));
    setActiveOverride((prev) => (prev?.id === id ? null : prev));
  }, []);

  const value = useMemo<WeatherContextValue>(
    () => ({
      status: weather.status,
      errorMessage: weather.errorMessage,
      locationName: active.name || fallbackLocation.name,
      coordinates: { latitude: active.latitude, longitude: active.longitude },
      current: weather.current,
      hourlyForecast: weather.hourlyForecast,
      hourlyDetailed: weather.hourlyDetailed,
      alert: weather.alert,
      dailyForecast: weather.dailyForecast,
      details: weather.details,
      favorites: favoritesData,
      searchLocations,
      refresh,
      selectLocation,
      addFavorite,
      removeFavorite,
    }),
    [weather, active.name, active.latitude, active.longitude, favoritesData, refresh, selectLocation, addFavorite, removeFavorite]
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather() precisa estar dentro de <WeatherProvider>');
  return ctx;
}
