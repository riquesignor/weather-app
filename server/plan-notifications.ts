/**
 * Decide QUEM recebe QUAL alerta — função pura (sem rede), testada em
 * `plan-notifications.test.ts`. Usa exatamente a mesma heurística do app
 * (`deriveSevereAlert` + `shouldNotifyForAlert`), então o push do servidor e o
 * aviso local nunca discordam.
 */
import type { OpenMeteoForecastResponse } from '@/services/open-meteo';
import { fromDeviceAttributes, roundCoord, ALERTS_ROUTE, type PushSubscription } from '@/services/push-subscription';
import { deriveSevereAlert, findCurrentHourIndex } from '@/services/severe-alert';
import { buildAlertNotification, shouldNotifyForAlert } from '@/services/severe-alert-notifications';

export type DeviceRow = {
  userId: string;
  attributes: Record<string, string>;
  registeredAt: string;
  lastUsedAt: string | null;
};

export type LocationGroup = {
  key: string;
  coords: { latitude: number; longitude: number };
  subscribers: Array<{ userId: string; subscription: PushSubscription }>;
};

export type PlannedSend = {
  userId: string;
  title: string;
  message: string;
  idempotencyKey: string;
  data: Record<string, string>;
};

/**
 * Agrupa aparelhos por ponto (coordenada já arredondada pelo app), para fazer
 * UMA consulta de previsão por lugar, não por usuário. Se a mesma instalação
 * aparecer mais de uma vez (token antigo ainda ativo), vale o registro mais recente.
 */
export function groupByLocation(devices: DeviceRow[]): LocationGroup[] {
  const latestByUser = new Map<string, { row: DeviceRow; subscription: PushSubscription }>();
  for (const row of devices) {
    const subscription = fromDeviceAttributes(row.attributes);
    if (!subscription || !subscription.prefs.notifSevero) continue;

    const current = latestByUser.get(row.userId);
    if (!current || touchedAt(row) > touchedAt(current.row)) {
      latestByUser.set(row.userId, { row, subscription });
    }
  }

  const groups = new Map<string, LocationGroup>();
  for (const [userId, { subscription }] of latestByUser) {
    const latitude = roundCoord(subscription.coords.latitude);
    const longitude = roundCoord(subscription.coords.longitude);
    const key = `${latitude},${longitude}`;
    const group = groups.get(key) ?? { key, coords: { latitude, longitude }, subscribers: [] };
    group.subscribers.push({ userId, subscription });
    groups.set(key, group);
  }
  return [...groups.values()];
}

function touchedAt(row: DeviceRow): number {
  return Date.parse(row.lastUsedAt ?? row.registeredAt) || 0;
}

/** Notificações a enviar para um ponto, dada a previsão dele. */
export function planForLocation(group: LocationGroup, forecast: OpenMeteoForecastResponse): PlannedSend[] {
  const startIndex = findCurrentHourIndex(forecast.hourly, forecast.current.time);
  const alert = deriveSevereAlert(forecast.hourly, startIndex);
  if (!alert.active) return [];

  // Data local do ponto ("YYYY-MM-DD", timezone=auto): no máximo 1 push por tipo
  // de alerta por dia — o hub descarta repetições com a mesma chave.
  const localDate = forecast.current.time.slice(0, 10);

  return group.subscribers
    .filter(({ subscription }) => shouldNotifyForAlert(alert, subscription.prefs))
    .map(({ userId, subscription }) => {
      const { title, body } = buildAlertNotification(alert, subscription.locationName || undefined);
      return {
        userId,
        title,
        message: body,
        idempotencyKey: `severe:${userId}:${localDate}:${alert.type}`,
        data: { route: ALERTS_ROUTE },
      };
    });
}
