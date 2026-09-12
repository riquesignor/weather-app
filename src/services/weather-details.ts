/**
 * Deriva os campos extras do card "Detalhes" (tela Hoje — item inspirado na referência
 * de app que o usuário anexou: UV, qualidade do ar, vento, ponto de orvalho, pressão,
 * visibilidade) a partir da resposta bruta da Open-Meteo (previsão + qualidade do ar).
 * Mesma separação de responsabilidades de `weather-transform.ts`: nenhuma tela lida
 * com o shape cru da API.
 */
import type { WeatherDetails } from '@/lib/mock-weather';
import type { AirQualityResponse, OpenMeteoForecastResponse } from '@/services/open-meteo';

const COMPASS_LABELS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];

export function degreesToCompass(deg: number): string {
  const index = Math.round(deg / 45) % 8;
  return COMPASS_LABELS[(index + 8) % 8];
}

export function uvIndexLabel(uv: number): string {
  if (uv >= 11) return 'Extremo';
  if (uv >= 8) return 'Muito alto';
  if (uv >= 6) return 'Alto';
  if (uv >= 3) return 'Moderado';
  return 'Baixo';
}

/** Escala European AQI (0-100+) — a mesma usada pela Open-Meteo Air Quality API. */
export function europeanAqiLabel(aqi: number): string {
  if (aqi > 100) return 'Extremamente ruim';
  if (aqi > 80) return 'Muito ruim';
  if (aqi > 60) return 'Ruim';
  if (aqi > 40) return 'Moderado';
  if (aqi > 20) return 'Razoável';
  return 'Boa';
}

/**
 * `air` é opcional de propósito: a chamada de qualidade do ar roda em paralelo à
 * previsão principal e não deve derrubar o card "Detalhes" inteiro se falhar — só o
 * campo de AQI fica indisponível (ver `WeatherProvider`).
 */
export function toWeatherDetails(
  resp: OpenMeteoForecastResponse,
  startIndex: number,
  air: AirQualityResponse | null
): WeatherDetails {
  const uv = resp.hourly.uv_index[startIndex] ?? 0;
  const visibilityMeters = resp.hourly.visibility[startIndex] ?? 10_000;
  const aqi = air?.current?.european_aqi ?? null;

  return {
    uvIndex: Math.round(uv),
    uvLabel: uvIndexLabel(uv),
    visibilityKm: Math.round(visibilityMeters / 1000),
    dewPoint: Math.round(resp.current.dew_point_2m),
    pressure: Math.round(resp.current.pressure_msl),
    windDirection: Math.round(resp.current.wind_direction_10m),
    windDirectionLabel: degreesToCompass(resp.current.wind_direction_10m),
    aqi,
    aqiLabel: aqi === null ? 'Indisponível' : europeanAqiLabel(aqi),
  };
}
