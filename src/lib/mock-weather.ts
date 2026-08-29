/**
 * Tipos de domínio do app + dados de fallback (seed).
 *
 * A Fase 2 (integração de API real, ver docs/weather_app_project_spec.md §6) chegou:
 * os dados ao vivo vêm agora de `@/providers/weather-provider` (Open-Meteo), que produz
 * exatamente os tipos abaixo via `@/services/weather-transform`. Os componentes de UI
 * não sabem a diferença. As constantes abaixo (`currentConditions`, `severeAlert`, etc.)
 * seguem existindo como fallback: usadas enquanto a primeira resposta da API não chega,
 * ou se a chamada de rede falhar completamente (ver `WeatherProvider`).
 */
import type { WeatherCondition } from '@/lib/weather-icons';

export type SeverityLevel = 'high' | 'moderate' | 'low';

export type HourlyPoint = {
  time: string;
  temp: number;
  precipitation: number;
  condition: WeatherCondition;
};

export type SevereAlert = {
  active: boolean;
  type: string;
  title: string;
  level: SeverityLevel;
  levelLabel: string;
  validFrom: string;
  validTo: string;
  probability: number;
  windKmh: number;
  hail: boolean;
  radiusKm: number;
  recommendations: string[];
};

export type FavoriteLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temp: number;
  current: boolean;
  condition: WeatherCondition;
  alertLabel: string | null;
};

export type CurrentConditions = {
  temp: number;
  condition: string;
  conditionKind: WeatherCondition;
  feelsLike: number;
  humidity: number;
  windKmh: number;
};

export const currentLocation = { name: 'Brasília, DF' };

export const currentConditions: CurrentConditions = {
  temp: 31,
  condition: 'Parcialmente nublado',
  conditionKind: 'partlyCloudy',
  feelsLike: 35,
  humidity: 65,
  windKmh: 18,
};

export const severeAlert: SevereAlert = {
  active: true,
  type: 'Aviso de Tornado',
  title: 'Tornado Watch Ativo',
  level: 'high',
  levelLabel: 'Alto',
  validFrom: '14:30',
  validTo: '17:30',
  probability: 85,
  windKmh: 70,
  hail: true,
  radiusKm: 30,
  recommendations: ['Evite áreas abertas', 'Prenda objetos soltos', 'Procure abrigo interno'],
};

export const hourlyForecast: HourlyPoint[] = [
  { time: 'Agora', temp: 31, precipitation: 20, condition: 'cloudy' },
  { time: '14h', temp: 29, precipitation: 60, condition: 'cloudy' },
  { time: '15h', temp: 28, precipitation: 80, condition: 'cloudy' },
  { time: '16h', temp: 26, precipitation: 50, condition: 'cloudy' },
  { time: '17h', temp: 25, precipitation: 40, condition: 'partlyCloudy' },
  { time: '18h', temp: 24, precipitation: 20, condition: 'partlyCloudy' },
  { time: '19h', temp: 23, precipitation: 10, condition: 'partlyCloudy' },
  { time: '20h', temp: 22, precipitation: 5, condition: 'clear' },
  { time: '21h', temp: 21, precipitation: 5, condition: 'clear' },
  { time: '22h', temp: 20, precipitation: 0, condition: 'clear' },
];

export type HourlyDetail = {
  rangeLabel: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windKmh: number;
  precipitation: number;
  hail: boolean;
  tornadoRisk: SeverityLevel;
  condition: WeatherCondition;
};

/** Previsão hora-a-hora detalhada (spec §2.3) — série independente do resumo do card Hoje. */
export const hourlyDetailed: HourlyDetail[] = [
  { rangeLabel: '13:00 → 14:00', temp: 29, feelsLike: 35, humidity: 70, windKmh: 35, precipitation: 40, hail: true, tornadoRisk: 'high', condition: 'cloudy' },
  { rangeLabel: '14:00 → 15:00', temp: 28, feelsLike: 33, humidity: 72, windKmh: 38, precipitation: 55, hail: true, tornadoRisk: 'high', condition: 'cloudy' },
  { rangeLabel: '15:00 → 16:00', temp: 26, feelsLike: 30, humidity: 74, windKmh: 32, precipitation: 45, hail: false, tornadoRisk: 'moderate', condition: 'cloudy' },
  { rangeLabel: '16:00 → 17:00', temp: 25, feelsLike: 27, humidity: 68, windKmh: 24, precipitation: 30, hail: false, tornadoRisk: 'moderate', condition: 'partlyCloudy' },
  { rangeLabel: '17:00 → 18:00', temp: 24, feelsLike: 25, humidity: 60, windKmh: 16, precipitation: 15, hail: false, tornadoRisk: 'low', condition: 'partlyCloudy' },
  { rangeLabel: '18:00 → 19:00', temp: 22, feelsLike: 22, humidity: 58, windKmh: 12, precipitation: 5, hail: false, tornadoRisk: 'low', condition: 'clear' },
];

export const favoriteLocations: FavoriteLocation[] = [
  {
    id: '1',
    name: 'Brasília, DF',
    latitude: -15.7797,
    longitude: -47.9297,
    temp: 31,
    current: true,
    condition: 'cloudy',
    alertLabel: 'Tornado Watch',
  },
  {
    id: '2',
    name: 'São Paulo, SP',
    latitude: -23.5505,
    longitude: -46.6333,
    temp: 24,
    current: false,
    condition: 'rain',
    alertLabel: null,
  },
];

export const mapLayers = ['Radar', 'Alertas', 'Locais'] as const;
export const mapHours = ['14h', '15h', '16h', '17h', '18h'] as const;
