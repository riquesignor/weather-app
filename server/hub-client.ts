/**
 * Cliente mínimo do NotificationHub para o vigia (chave SECRETA — só roda em
 * servidor/CI, nunca no app).
 */
import { SEVERE_ALERT_CHANNEL_ID } from '@/services/push-subscription';

import type { DeviceRow, PlannedSend } from './plan-notifications';

const PAGE_SIZE = 500;
const TIMEOUT_MS = 30_000;
/** Depois disso o alerta (janela de 6h) já perdeu o sentido. */
const PUSH_TTL_SECONDS = 3 * 60 * 60;

export type HubConfig = { baseUrl: string; secretKey: string };

type PagedDevices = { items: DeviceRow[]; page: number; pageSize: number; total: number };
export type SendResult = { notificationId: string; status: string; success: boolean; duplicate: boolean };

async function hubFetch<T>(config: HubConfig, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': config.secretKey, ...init?.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`NotificationHub respondeu HTTP ${response.status} em ${path}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

/** Todos os aparelhos ativos com alertas severos ligados (filtro feito no hub). */
export async function listSubscribedDevices(config: HubConfig): Promise<DeviceRow[]> {
  const devices: DeviceRow[] = [];
  for (let page = 1; ; page++) {
    const result = await hubFetch<PagedDevices>(
      config,
      `/api/devices?attr[notifSevero]=true&page=${page}&pageSize=${PAGE_SIZE}`
    );
    devices.push(...result.items);
    if (result.items.length === 0 || devices.length >= result.total) return devices;
  }
}

export function sendAlert(config: HubConfig, send: PlannedSend): Promise<SendResult> {
  return hubFetch<SendResult>(config, '/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      userId: send.userId,
      title: send.title,
      message: send.message,
      primaryChannel: 'push',
      data: send.data,
      idempotencyKey: send.idempotencyKey,
      push: { priority: 'high', channelId: SEVERE_ALERT_CHANNEL_ID, ttlSeconds: PUSH_TTL_SECONDS },
    }),
  });
}
