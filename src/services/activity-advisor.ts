/**
 * Sugestão de atividade ao ar livre derivada da previsão real (não é uma API externa —
 * não existe um provedor público de "o que fazer com esse clima"; é uma pequena regra de
 * negócio sobre os mesmos dados de `@/providers/weather-provider`, no mesmo espírito da
 * heurística de alerta severo em `severe-alert.ts`). Alimenta a aba Cultivo.
 */
import type { CurrentConditions, HourlyPoint } from '@/lib/mock-weather';

export type ActivitySuggestion = { title: string; subtitle: string };

const NEXT_HOURS_TO_CHECK = 3;

export function deriveActivitySuggestion(current: CurrentConditions, hourlyForecast: HourlyPoint[]): ActivitySuggestion {
  const soon = hourlyForecast.slice(0, NEXT_HOURS_TO_CHECK);
  const maxPrecipSoon = soon.length ? Math.max(...soon.map((h) => h.precipitation)) : 0;

  if (maxPrecipSoon >= 60) {
    return {
      title: 'Prefira algo coberto hoje',
      subtitle: `Chance de ${maxPrecipSoon}% de chuva nas próximas horas — bora de treino indoor ou uma caminhada no shopping.`,
    };
  }

  if (current.windKmh >= 40) {
    return {
      title: 'Vento forte no momento',
      subtitle: `Rajadas por volta de ${current.windKmh} km/h — evite ciclismo e esportes ao ar livre por enquanto.`,
    };
  }

  if (current.temp >= 32) {
    return {
      title: 'Cuidado com o calor',
      subtitle: `${current.temp}° agora — se for treinar fora, prefira o fim de tarde e hidrate-se bem.`,
    };
  }

  if (current.temp <= 12) {
    return {
      title: 'Esquente antes de sair',
      subtitle: `${current.temp}° agora — vista camadas se for treinar ao ar livre.`,
    };
  }

  if ((current.conditionKind === 'clear' || current.conditionKind === 'partlyCloudy') && maxPrecipSoon < 30) {
    return {
      title: 'Ótimo para atividades ao ar livre',
      subtitle: `${current.condition}, ${current.temp}° e vento fraco — ideal para caminhada, corrida ou ciclismo.`,
    };
  }

  return {
    title: 'Dia neutro para atividades externas',
    subtitle: `${current.condition}, ${current.temp}° — dá pra sair, mas sem exageros.`,
  };
}
