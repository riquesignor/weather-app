/**
 * Contrato entre o app e o vigia de clima (`server/weather-watcher.ts`) para os
 * alertas por push, que chegam mesmo com o app fechado.
 *
 * O app registra o aparelho no NotificationHub (serviço genérico de notificações)
 * com estes atributos; o vigia lista os aparelhos, avalia a previsão de cada
 * ponto e pede ao hub o envio. O hub não entende nada de clima — só guarda os
 * atributos como texto, por isso tudo aqui é serializado em string.
 */
import type { NotificationSettings } from '@/providers/notification-settings-provider';
import type { Coordinates } from '@/services/open-meteo';

/** Canal Android dos alertas severos (criado pelo app, usado pelo push do vigia). */
export const SEVERE_ALERT_CHANNEL_ID = 'severe-alerts';

/** Rota aberta ao tocar numa notificação de alerta. */
export const ALERTS_ROUTE = '/alertas';

export type SubscriptionPrefs = Pick<
  NotificationSettings,
  'notifSevero' | 'notifGranizo' | 'notifRajadasFortes' | 'notifRajadas'
>;

export type PushSubscription = {
  coords: Coordinates;
  locationName: string;
  prefs: SubscriptionPrefs;
};

/** Precisão das coordenadas enviadas (~1 km) — suficiente para previsão e
 * evita guardar a posição exata do usuário num servidor. */
const COORD_DECIMALS = 2;

export function roundCoord(value: number): number {
  const factor = 10 ** COORD_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function toDeviceAttributes(sub: PushSubscription): Record<string, string> {
  return {
    lat: roundCoord(sub.coords.latitude).toFixed(COORD_DECIMALS),
    lon: roundCoord(sub.coords.longitude).toFixed(COORD_DECIMALS),
    locationName: sub.locationName.slice(0, 120),
    notifSevero: String(sub.prefs.notifSevero),
    notifGranizo: String(sub.prefs.notifGranizo),
    notifRajadasFortes: String(sub.prefs.notifRajadasFortes),
    notifRajadas: String(sub.prefs.notifRajadas),
  };
}

/** Inverso de `toDeviceAttributes`; `null` se o registro estiver incompleto/inválido. */
export function fromDeviceAttributes(attrs: Record<string, string>): PushSubscription | null {
  const latitude = Number(attrs.lat);
  const longitude = Number(attrs.lon);
  if (!attrs.lat || !attrs.lon || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  // Preferência ausente = ligada (mesmo padrão das Configurações do app).
  const flag = (key: keyof SubscriptionPrefs) => attrs[key] !== 'false';
  return {
    coords: { latitude, longitude },
    locationName: attrs.locationName ?? '',
    prefs: {
      notifSevero: flag('notifSevero'),
      notifGranizo: flag('notifGranizo'),
      notifRajadasFortes: flag('notifRajadasFortes'),
      notifRajadas: flag('notifRajadas'),
    },
  };
}
