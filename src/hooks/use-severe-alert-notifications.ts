/**
 * Dispara uma notificação LOCAL (expo-notifications) quando um novo alerta severo fica
 * ativo, respeitando os toggles de Configurações (`notification-settings-provider`).
 *
 * Importante (limitação combinada com o usuário — item #6 do feedback): isso é
 * notificação local, não push. Só dispara com o app aberto ou em segundo plano
 * (minimizado); NÃO dispara com o app fechado/kill — isso exigiria um servidor push
 * (Firebase/APNs), infraestrutura descartada antes por ser desproporcional ao escopo
 * deste projeto. Ainda assim cobre o caso mais comum (app rodando em background
 * enquanto o usuário usa o celular pra outra coisa).
 */
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { useNotificationSettings } from '@/providers/notification-settings-provider';
import { useWeather } from '@/providers/weather-provider';
import { shouldNotifyForAlert } from '@/services/severe-alert-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useSevereAlertNotifications(): void {
  const { alert } = useWeather();
  const prefs = useNotificationSettings();
  // "Episódio" do alerta (tipo + janela de validade) — evita reenviar a notificação a
  // cada re-fetch de previsão enquanto o mesmo risco continuar ativo.
  const lastNotifiedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!alert.active) {
      lastNotifiedKey.current = null;
      return;
    }

    const key = `${alert.type}-${alert.validFrom}-${alert.validTo}`;
    if (lastNotifiedKey.current === key) return;
    if (!shouldNotifyForAlert(alert, prefs)) return;

    lastNotifiedKey.current = key;

    (async () => {
      try {
        const current = await Notifications.getPermissionsAsync();
        let granted = current.status === 'granted';
        if (!granted) {
          const requested = await Notifications.requestPermissionsAsync();
          granted = requested.status === 'granted';
        }
        if (!granted) return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${alert.type}`,
            body: `${alert.title} · válido ${alert.validFrom}–${alert.validTo}`,
            sound: prefs.volume === 'baixa' ? undefined : 'default',
          },
          trigger: null,
        });
      } catch {
        // Ambiente sem suporte a notificações (ex.: preview web) — não deve derrubar o app.
      }
    })();
  }, [alert, prefs]);
}
