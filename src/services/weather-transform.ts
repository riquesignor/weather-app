/**
 * Converte a resposta bruta da Open-Meteo para os tipos de domínio que a UI já
 * consome (definidos em `@/lib/mock-weather`). Nenhum componente de tela precisa
 * mudar por causa da troca mock → API real — só a origem dos dados muda.
 */
import type { CurrentConditions, HourlyDetail, HourlyPoint, SeverityLevel } from '@/lib/mock-weather';
import type { OpenMeteoForecastResponse } from '@/services/open-meteo';
import { deriveSevereAlert, findCurrentHourIndex } from '@/services/severe-alert';
import { interpretWeatherCode } from '@/services/weather-codes';

const HOURLY_STRIP_COUNT = 10;
const HOURLY_DETAIL_COUNT = 6;

/** Limiares de rajada (km/h) usados só para colorir o badge "Risco de tornado" da
 * tela de previsão detalhada — a Open-Meteo não detecta tornados, é um proxy visual
 * a partir da rajada prevista, mantido para não quebrar o design original do card. */
function windGustToRiskLabel(gustKmh: number): SeverityLevel {
  if (gustKmh >= 70) return 'high';
  if (gustKmh >= 50) return 'moderate';
  return 'low';
}

export function toCurrentConditions(resp: OpenMeteoForecastResponse): CurrentConditions {
  const info = interpretWeatherCode(resp.current.weather_code);
  return {
    temp: Math.round(resp.current.temperature_2m),
    condition: info.label,
    conditionKind: info.condition,
    feelsLike: Math.round(resp.current.apparent_temperature),
    humidity: Math.round(resp.current.relative_humidity_2m),
    windKmh: Math.round(resp.current.wind_speed_10m),
  };
}

function hourLabel(isoTime: string, isNow: boolean): string {
  if (isNow) return 'Agora';
  const hour = isoTime.slice(11, 13);
  return `${hour}h`;
}

export function toHourlyForecast(resp: OpenMeteoForecastResponse, startIndex: number): HourlyPoint[] {
  const { hourly } = resp;
  const end = Math.min(startIndex + HOURLY_STRIP_COUNT, hourly.time.length);
  const points: HourlyPoint[] = [];
  for (let i = startIndex; i < end; i++) {
    const info = interpretWeatherCode(hourly.weather_code[i]);
    points.push({
      time: hourLabel(hourly.time[i], i === startIndex),
      temp: Math.round(hourly.temperature_2m[i]),
      precipitation: Math.round(hourly.precipitation_probability[i]),
      condition: info.condition,
    });
  }
  return points;
}

export function toHourlyDetailed(resp: OpenMeteoForecastResponse, startIndex: number): HourlyDetail[] {
  const { hourly } = resp;
  const end = Math.min(startIndex + HOURLY_DETAIL_COUNT, hourly.time.length - 1);
  const details: HourlyDetail[] = [];
  for (let i = startIndex; i < end; i++) {
    const info = interpretWeatherCode(hourly.weather_code[i]);
    const gust = hourly.wind_gusts_10m[i];
    details.push({
      rangeLabel: `${hourly.time[i].slice(11, 16)} → ${hourly.time[i + 1].slice(11, 16)}`,
      temp: Math.round(hourly.temperature_2m[i]),
      feelsLike: Math.round(hourly.apparent_temperature[i]),
      humidity: Math.round(hourly.relative_humidity_2m[i]),
      windKmh: Math.round(hourly.wind_speed_10m[i]),
      precipitation: Math.round(hourly.precipitation_probability[i]),
      hail: info.hail,
      tornadoRisk: windGustToRiskLabel(gust),
      condition: info.condition,
    });
  }
  return details;
}

export type TransformedWeather = {
  current: CurrentConditions;
  hourlyForecast: HourlyPoint[];
  hourlyDetailed: HourlyDetail[];
  alert: ReturnType<typeof deriveSevereAlert>;
};

/** Ponto único de entrada: aplica todos os transforms acima a partir de uma resposta crua. */
export function transformForecast(resp: OpenMeteoForecastResponse): TransformedWeather {
  const startIndex = findCurrentHourIndex(resp.hourly, resp.current.time);
  return {
    current: toCurrentConditions(resp),
    hourlyForecast: toHourlyForecast(resp, startIndex),
    hourlyDetailed: toHourlyDetailed(resp, startIndex),
    alert: deriveSevereAlert(resp.hourly, startIndex),
  };
}
