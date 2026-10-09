/**
 * Cruza o alerta severo derivado (`deriveSevereAlert`) com as preferências de
 * Configurações pra decidir se ele deve virar uma notificação.
 *
 * A Open-Meteo não detecta tornados (ver nota em `services/severe-alert.ts`), então os
 * toggles de vento são por faixa de rajada prevista — os mesmos limiares do badge
 * "Risco de rajadas" da previsão detalhada (`weather-transform.ts#windGustToRiskLabel`).
 */
import type { SevereAlert } from '@/lib/mock-weather';
import type { NotificationSettings } from '@/providers/notification-settings-provider';

export function shouldNotifyForAlert(
  alert: SevereAlert,
  prefs: Pick<NotificationSettings, 'notifSevero' | 'notifGranizo' | 'notifRajadasFortes' | 'notifRajadas'>
): boolean {
  if (!alert.active || !prefs.notifSevero) return false;

  if (alert.hail) return prefs.notifGranizo;
  if (alert.windKmh >= 70) return prefs.notifRajadasFortes;
  if (alert.windKmh >= 50) return prefs.notifRajadas;
  return true; // outros casos (ex.: tempestade com raios sem vento forte) caem no aviso severo genérico
}

/** Título/corpo da notificação — o mesmo texto no aviso local e no push do servidor. */
export function buildAlertNotification(alert: SevereAlert, locationName?: string): { title: string; body: string } {
  const where = locationName ? ` em ${locationName}` : '';
  return {
    title: `⚠️ ${alert.type}`,
    body: `${alert.title}${where} · válido ${alert.validFrom}–${alert.validTo}`,
  };
}
