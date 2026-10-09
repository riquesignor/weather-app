/**
 * Registra este aparelho no NotificationHub para receber alertas severos por PUSH —
 * que chegam mesmo com o app fechado (o vigia de clima avalia a previsão no
 * servidor; ver `server/weather-watcher.ts`).
 *
 * Reenvia o registro quando a localização exibida ou as preferências mudam, e
 * remove o aparelho se o usuário desligar "Alertas Severos". Se o hub não estiver
 * configurado, ou o push não for possível (web, emulador, Expo Go no Android),
 * devolve `active: false` e o app continua só com a notificação local.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { getInstallId } from '@/lib/install-id';
import { useNotificationSettings } from '@/providers/notification-settings-provider';
import { useWeather } from '@/providers/weather-provider';
import { isHubConfigured, registerDevice, unregisterDevice } from '@/services/notification-hub';
import { SEVERE_ALERT_CHANNEL_ID, roundCoord, toDeviceAttributes } from '@/services/push-subscription';

const PUSH_SUPPORTED = isHubConfigured && Platform.OS !== 'web' && Device.isDevice;
const UNREGISTERED = 'unregistered';

export async function ensureSevereAlertChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(SEVERE_ALERT_CHANNEL_ID, {
    name: 'Alertas severos',
    description: 'Granizo, tempestades e rajadas fortes previstas para a sua localização.',
    importance: Notifications.AndroidImportance.MAX,
  });
}

/** @param ask Se `false`, nunca abre o pedido de permissão (só usa a já concedida). */
async function getPushToken(ask: boolean): Promise<string | null> {
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && ask) status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export function usePushRegistration(): { active: boolean } {
  const { hasData, coordinates, locationName } = useWeather();
  const prefs = useNotificationSettings();
  const [active, setActive] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const lastSignature = useRef<string | null>(null);

  const { hydrated, notifSevero, notifGranizo, notifRajadasFortes, notifRajadas } = prefs;
  const lat = roundCoord(coordinates.latitude);
  const lon = roundCoord(coordinates.longitude);

  useEffect(() => {
    // Espera a 1ª previsão real (localização já resolvida) e as preferências salvas,
    // para não registrar o ponto/padrões provisórios.
    if (!PUSH_SUPPORTED || !hydrated || !hasData) return;
    let cancelled = false;

    (async () => {
      try {
        if (!notifSevero) {
          // Também cobre "desligou numa sessão anterior": pega o token sem pedir permissão.
          if (lastSignature.current !== UNREGISTERED) {
            const token = tokenRef.current ?? (await getPushToken(false));
            if (token) await unregisterDevice(token);
            lastSignature.current = UNREGISTERED;
          }
          if (!cancelled) setActive(false);
          return;
        }

        await ensureSevereAlertChannel();
        const token = tokenRef.current ?? (await getPushToken(true));
        if (!token) {
          if (!cancelled) setActive(false);
          return;
        }
        tokenRef.current = token;

        const attributes = toDeviceAttributes({
          coords: { latitude: lat, longitude: lon },
          locationName,
          prefs: { notifSevero, notifGranizo, notifRajadasFortes, notifRajadas },
        });
        const signature = JSON.stringify([token, attributes]);
        if (signature !== lastSignature.current) {
          await registerDevice({ userId: await getInstallId(), token, attributes, deviceName: Device.modelName });
          lastSignature.current = signature;
        }
        if (!cancelled) setActive(true);
      } catch (error) {
        // Hub fora do ar, sem rede, Expo Go no Android (sem push remoto)...
        // O app segue com a notificação local.
        if (__DEV__) console.warn('[push] registro no NotificationHub falhou:', error);
        if (!cancelled) setActive(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, hasData, lat, lon, locationName, notifSevero, notifGranizo, notifRajadasFortes, notifRajadas]);

  return { active };
}
