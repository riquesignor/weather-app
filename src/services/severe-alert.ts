/**
 * Heurística de alerta severo derivada da previsão horária real da Open-Meteo.
 *
 * IMPORTANTE (limitação a documentar para quem for evoluir isto): a Open-Meteo não
 * publica um feed de alertas oficiais — ela só dá séries numéricas (código de tempo,
 * rajada, probabilidade de precipitação). Diferente de um alerta real do NOAA/INMET
 * (que vem com polígono geográfico, órgão emissor e nível oficial), o que calculamos
 * aqui é um RISCO ESTIMADO a partir de limiares (thresholds) sobre esses números —
 * não um aviso emitido por um órgão meteorológico. `radiusKm` inclusive é um valor
 * fixo de placeholder, já que não há dado espacial nenhum para derivar isso.
 * Fica marcado aqui como o ponto de troca natural caso o app evolua para consumir um
 * provedor com alertas reais (ex.: NWS `api.weather.gov` para localizações nos EUA).
 */
import type { OpenMeteoHourly } from '@/services/open-meteo';
import { interpretWeatherCode } from '@/services/weather-codes';
import type { SevereAlert, SeverityLevel } from '@/lib/mock-weather';

const WINDOW_SIZE = 6;
const PLACEHOLDER_RADIUS_KM = 10;

const RECOMMENDATIONS: Record<string, string[]> = {
  hail: ['Evite áreas abertas', 'Proteja o carro em uma garagem, se possível', 'Procure abrigo interno'],
  thunderstorm: ['Evite áreas abertas e árvores isoladas', 'Desligue aparelhos elétricos sensíveis', 'Procure abrigo interno'],
  wind: ['Prenda objetos soltos do lado de fora', 'Evite estacionar sob árvores', 'Redobre a atenção ao dirigir'],
};

function inactiveAlert(): SevereAlert {
  return {
    active: false,
    type: '',
    title: '',
    level: 'low',
    levelLabel: 'Baixo',
    validFrom: '',
    validTo: '',
    probability: 0,
    windKmh: 0,
    hail: false,
    radiusKm: 0,
    recommendations: [],
  };
}

function toHourLabel(isoTime: string): string {
  // Open-Meteo devolve horário local (timezone=auto) no formato "YYYY-MM-DDTHH:MM".
  return isoTime.slice(11, 16);
}

/**
 * @param hourly Série horária já alinhada ao fuso local do ponto (ver `fetchForecast`).
 * @param startIndex Índice da hora "agora" dentro de `hourly.time` (ver `findCurrentHourIndex`).
 */
export function deriveSevereAlert(hourly: OpenMeteoHourly, startIndex: number): SevereAlert {
  const endIndex = Math.min(startIndex + WINDOW_SIZE, hourly.time.length);
  if (startIndex < 0 || startIndex >= endIndex) return inactiveAlert();

  const codes = hourly.weather_code.slice(startIndex, endIndex);
  const gusts = hourly.wind_gusts_10m.slice(startIndex, endIndex);
  const precipProb = hourly.precipitation_probability.slice(startIndex, endIndex);

  const infos = codes.map(interpretWeatherCode);
  const hail = infos.some((i) => i.hail);
  const thunderstorm = infos.some((i) => i.thunderstorm);
  const maxGust = gusts.length ? Math.max(...gusts) : 0;
  const maxPrecipProb = precipProb.length ? Math.max(...precipProb) : 0;

  let level: SeverityLevel;
  let kind: keyof typeof RECOMMENDATIONS;
  let type: string;
  let title: string;

  if (hail || maxGust >= 70) {
    level = 'high';
    if (hail) {
      kind = 'hail';
      type = 'Aviso de Granizo';
      title = 'Risco de Granizo';
    } else {
      kind = 'wind';
      type = 'Aviso de Rajadas Fortes';
      title = 'Rajadas de Vento Fortes';
    }
  } else if (thunderstorm || maxGust >= 50 || maxPrecipProb >= 80) {
    level = 'moderate';
    if (thunderstorm) {
      kind = 'thunderstorm';
      type = 'Aviso de Tempestade';
      title = 'Tempestade com Raios';
    } else {
      kind = 'wind';
      type = 'Aviso de Vento';
      title = 'Ventos Moderados a Fortes';
    }
  } else {
    return inactiveAlert();
  }

  return {
    active: true,
    type,
    title,
    level,
    levelLabel: level === 'high' ? 'Alto' : 'Moderado',
    validFrom: toHourLabel(hourly.time[startIndex]),
    validTo: toHourLabel(hourly.time[endIndex - 1]),
    probability: Math.round(maxPrecipProb),
    windKmh: Math.round(maxGust),
    hail,
    radiusKm: PLACEHOLDER_RADIUS_KM,
    recommendations: RECOMMENDATIONS[kind],
  };
}

/** Acha o índice de `hourly.time` mais próximo do timestamp "agora" retornado em `current.time`. */
export function findCurrentHourIndex(hourly: OpenMeteoHourly, currentTimeIso: string): number {
  const index = hourly.time.indexOf(currentTimeIso);
  if (index !== -1) return index;
  // fallback: primeiro horário >= agora (evita quebrar se a API arredondar diferente)
  const fallback = hourly.time.findIndex((t) => t >= currentTimeIso);
  return fallback === -1 ? 0 : fallback;
}
