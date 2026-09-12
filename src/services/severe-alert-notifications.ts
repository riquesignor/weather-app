/**
 * Cruza o alerta severo derivado (`deriveSevereAlert`) com as preferências de
 * Configurações pra decidir se ele deve virar uma notificação.
 *
 * Não existe um sinal real de "tornado" vindo da Open-Meteo — ela não detecta tornados
 * (ver nota em `services/severe-alert.ts`). O toggle "Avisos de Tornado" reaproveita a
 * mesma rajada muito forte (>=70km/h sem granizo) já usada como proxy de "risco de
 * tornado" no card de previsão detalhada (`weather-transform.ts#windGustToRiskLabel`),
 * pela mesma razão: é o melhor proxy disponível a partir de dado numérico real.
 */
import type { SevereAlert } from '@/lib/mock-weather';
import type { NotificationSettings } from '@/providers/notification-settings-provider';

export function shouldNotifyForAlert(alert: SevereAlert, prefs: NotificationSettings): boolean {
  if (!alert.active || !prefs.notifSevero) return false;

  if (alert.hail) return prefs.notifGranizo;
  if (alert.windKmh >= 70) return prefs.notifTornado;
  if (alert.windKmh >= 50) return prefs.notifRajadas;
  return true; // outros casos (ex.: tempestade com raios sem vento forte) caem no aviso severo genérico
}
