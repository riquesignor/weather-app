/**
 * Recomendações de plantio derivadas da temperatura/umidade atuais.
 *
 * Não existe uma API pública de "o que plantar com esse clima" — isso é uma faixa de
 * temperatura ideal por espécie (senso comum agronômico, valores aproximados) aplicada
 * aos dados reais da Open-Meteo. Mesmo espírito de `activity-advisor.ts`: heurística
 * local sobre dado real, não uma chamada de rede a mais.
 */
import type { CurrentConditions } from '@/lib/mock-weather';

export type PlantingSuggestion = { title: string; subtitle: string };
export type PlantCalendarEntry = { name: string; plant: boolean };

type PlantProfile = { name: string; minTemp: number; maxTemp: number };

const PLANT_PROFILES: PlantProfile[] = [
  { name: 'Tomate', minTemp: 18, maxTemp: 30 },
  { name: 'Alface', minTemp: 10, maxTemp: 24 },
  { name: 'Cenoura', minTemp: 7, maxTemp: 24 },
  { name: 'Pimentão', minTemp: 20, maxTemp: 32 },
];

export function getPlantCalendar(current: CurrentConditions): PlantCalendarEntry[] {
  return PLANT_PROFILES.map((p) => ({
    name: p.name,
    plant: current.temp >= p.minTemp && current.temp <= p.maxTemp,
  }));
}

export function derivePlantingSuggestion(current: CurrentConditions): PlantingSuggestion {
  const suitable = getPlantCalendar(current).filter((p) => p.plant);

  if (current.temp > 32) {
    return {
      title: 'Prefira espécies resistentes ao calor',
      subtitle: `${current.temp}° agora — regue no fim de tarde e proteja mudas novas do sol direto.`,
    };
  }

  if (current.temp < 12) {
    return {
      title: 'Época mais fria para plantio',
      subtitle: `${current.temp}° agora — priorize espécies resistentes ao frio ou espere um dia mais ameno.`,
    };
  }

  if (current.humidity >= 85) {
    return {
      title: 'Solo provavelmente úmido',
      subtitle: `Umidade em ${current.humidity}% — evite regar em excesso hoje e fique de olho em fungos.`,
    };
  }

  if (suitable.length > 0) {
    const names = suitable.map((p) => p.name.toLowerCase()).slice(0, 2).join(' e ');
    return {
      title: `Boa época para plantar ${names}`,
      subtitle: `Clima ameno favorece o plantio nesta estação — regue com frequência.`,
    };
  }

  return {
    title: 'Dia neutro para plantio',
    subtitle: `${current.temp}°, ${current.humidity}% de umidade — condições dentro do normal.`,
  };
}

const TIPS_HOT = 'Em dias quentes, regar no início da manhã ou fim da tarde reduz a evaporação e economiza água.';
const TIPS_HUMID = 'Umidade alta favorece fungos — espace um pouco mais as regas e garanta boa circulação de ar entre as plantas.';
const TIPS_COLD = 'Em dias frios, evite regar à noite — a água parada no solo gelado pode prejudicar as raízes.';
const TIPS_DEFAULT = 'Rotacionar os canteiros a cada estação ajuda a manter o solo mais saudável e produtivo.';

export function getCultivoTip(current: CurrentConditions): string {
  if (current.temp >= 30) return TIPS_HOT;
  if (current.humidity >= 80) return TIPS_HUMID;
  if (current.temp <= 12) return TIPS_COLD;
  return TIPS_DEFAULT;
}
