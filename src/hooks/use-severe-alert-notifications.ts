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
 *
 * Atualização: com o NotificationHub configurado, o push com app fechado existe
 * (`use-push-registration.ts` + vigia no servidor). Nesse caso este aviso local é
 * desligado (`enabled: false`) para o usuário não receber o mesmo alerta duas vezes.
 */
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { useNotificationSettings } from '@/providers/notification-settings-provider';
import { useWeather } from '@/providers/weather-provider';
import { ALERTS_ROUTE } from '@/services/push-subscription';
import { buildAlertNotification, shouldNotifyForAlert } from '@/services/severe-alert-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useSevereAlertNotifications({ enabled }: { enabled: boolean }): void {
  const { alert, hasData, locationName } = useWeather();
  const prefs = useNotificationSettings();
  // "Episódio" do alerta (tipo + dia) — evita reenviar a notificação a cada re-fetch
  // enquanto o mesmo risco continuar ativo. Não usa a janela de validade: ela anda
  // junto com o relógio (começa sempre na hora atual) e repetiria o aviso toda hora.
  // Mesma regra do push do servidor (1 por tipo por dia — ver server/plan-notifications).
  const lastNotifiedKey = useRef<string | null>(null);

  useEffect(() => {
    // Só notifica com base em dado real da API — nunca no placeholder de carregamento.
    if (!hasData || !enabled) return;
    if (!alert.active) {
      lastNotifiedKey.current = null;
      return;
    }

    const key = `${alert.type}-${new Date().toDateString()}`;
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

        const { title, body } = buildAlertNotification(alert, locationName);
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { route: ALERTS_ROUTE },
            sound: prefs.volume === 'baixa' ? undefined : 'default',
          },
          trigger: null,
        });
      } catch {
        // Ambiente sem suporte a notificações (ex.: preview web) — não deve derrubar o app.
      }
    })();
  }, [alert, hasData, enabled, locationName, prefs]);
}
