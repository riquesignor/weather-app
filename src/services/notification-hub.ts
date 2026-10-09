/**
 * Cliente do NotificationHub usado PELO APP: só registra/remove o próprio aparelho,
 * com a chave PÚBLICA (que pode ir embutida no app). Enviar notificação e listar
 * aparelhos exigem a chave secreta e ficam no vigia (`server/weather-watcher.ts`).
 *
 * Configuração por variáveis de ambiente do Expo (ver `.env.example`). Sem elas,
 * o push remoto fica desligado e o app usa só a notificação local.
 */
import { Platform } from 'react-native';

const HUB_URL = process.env.EXPO_PUBLIC_HUB_URL?.replace(/\/+$/, '');
const HUB_PUBLIC_KEY = process.env.EXPO_PUBLIC_HUB_PUBLIC_KEY;
const TIMEOUT_MS = 10_000;

export const isHubConfigured = Boolean(HUB_URL && HUB_PUBLIC_KEY);

export type RegisterDeviceParams = {
  userId: string;
  token: string;
  attributes: Record<string, string>;
  deviceName?: string | null;
};

async function post(path: string, body: unknown): Promise<void> {
  if (!isHubConfigured) throw new Error('NotificationHub não configurado');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${HUB_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': HUB_PUBLIC_KEY! },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // 404 no unregister = já não estava registrado; não é erro para o app.
    if (!response.ok && response.status !== 404) {
      throw new Error(`NotificationHub respondeu HTTP ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export function registerDevice(params: RegisterDeviceParams): Promise<void> {
  return post('/api/devices/register', {
    userId: params.userId,
    token: params.token,
    deviceType: Platform.OS === 'ios' ? 'iOS' : 'android',
    deviceName: params.deviceName ?? null,
    attributes: params.attributes,
  });
}

export function unregisterDevice(token: string): Promise<void> {
  return post('/api/devices/unregister', { token });
}
