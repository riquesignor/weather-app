/**
 * Interpretação dos WMO Weather Interpretation Codes retornados pela Open-Meteo
 * (https://open-meteo.com/en/docs — campo `weather_code` / `weathercode`).
 *
 * Mapeia cada código para o subconjunto de condições que o design system do app já
 * suporta (`WeatherCondition`, em `@/lib/weather-icons`) e para um rótulo em PT-BR.
 * Códigos sem ícone dedicado (neve, neblina) caem em um fallback razoável — o app foi
 * desenhado só com 4 estados visuais (clear/partlyCloudy/cloudy/rain).
 */
import type { WeatherCondition } from '@/lib/weather-icons';

export type WeatherCodeInfo = {
  condition: WeatherCondition;
  label: string;
  /** Código indica tempestade com raios (95/96/99). */
  thunderstorm: boolean;
  /** Código indica granizo (96/99 — "thunderstorm with hail"). */
  hail: boolean;
};

const TABLE: Record<number, WeatherCodeInfo> = {
  0: { condition: 'clear', label: 'Céu limpo', thunderstorm: false, hail: false },
  1: { condition: 'clear', label: 'Predominantemente limpo', thunderstorm: false, hail: false },
  2: { condition: 'partlyCloudy', label: 'Parcialmente nublado', thunderstorm: false, hail: false },
  3: { condition: 'cloudy', label: 'Nublado', thunderstorm: false, hail: false },
  45: { condition: 'cloudy', label: 'Neblina', thunderstorm: false, hail: false },
  48: { condition: 'cloudy', label: 'Neblina com geada', thunderstorm: false, hail: false },
  51: { condition: 'rain', label: 'Garoa fraca', thunderstorm: false, hail: false },
  53: { condition: 'rain', label: 'Garoa moderada', thunderstorm: false, hail: false },
  55: { condition: 'rain', label: 'Garoa forte', thunderstorm: false, hail: false },
  56: { condition: 'rain', label: 'Garoa congelante fraca', thunderstorm: false, hail: false },
  57: { condition: 'rain', label: 'Garoa congelante forte', thunderstorm: false, hail: false },
  61: { condition: 'rain', label: 'Chuva fraca', thunderstorm: false, hail: false },
  63: { condition: 'rain', label: 'Chuva moderada', thunderstorm: false, hail: false },
  65: { condition: 'rain', label: 'Chuva forte', thunderstorm: false, hail: false },
  66: { condition: 'rain', label: 'Chuva congelante fraca', thunderstorm: false, hail: false },
  67: { condition: 'rain', label: 'Chuva congelante forte', thunderstorm: false, hail: false },
  71: { condition: 'cloudy', label: 'Neve fraca', thunderstorm: false, hail: false },
  73: { condition: 'cloudy', label: 'Neve moderada', thunderstorm: false, hail: false },
  75: { condition: 'cloudy', label: 'Neve forte', thunderstorm: false, hail: false },
  77: { condition: 'cloudy', label: 'Grãos de neve', thunderstorm: false, hail: false },
  80: { condition: 'rain', label: 'Pancadas de chuva fracas', thunderstorm: false, hail: false },
  81: { condition: 'rain', label: 'Pancadas de chuva moderadas', thunderstorm: false, hail: false },
  82: { condition: 'rain', label: 'Pancadas de chuva fortes', thunderstorm: false, hail: false },
  85: { condition: 'cloudy', label: 'Pancadas de neve fracas', thunderstorm: false, hail: false },
  86: { condition: 'cloudy', label: 'Pancadas de neve fortes', thunderstorm: false, hail: false },
  95: { condition: 'rain', label: 'Trovoada', thunderstorm: true, hail: false },
  96: { condition: 'rain', label: 'Trovoada com granizo fraco', thunderstorm: true, hail: true },
  99: { condition: 'rain', label: 'Trovoada com granizo forte', thunderstorm: true, hail: true },
};

const FALLBACK: WeatherCodeInfo = { condition: 'cloudy', label: 'Indisponível', thunderstorm: false, hail: false };

export function interpretWeatherCode(code: number | null | undefined): WeatherCodeInfo {
  if (code == null) return FALLBACK;
  return TABLE[code] ?? FALLBACK;
}
