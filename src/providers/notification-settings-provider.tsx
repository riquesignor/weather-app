/**
 * Preferências de notificação (tela Configurações) — extraídas do `useState` local que
 * settings.tsx tinha antes pra virar um Context, porque agora elas precisam ser lidas
 * de fora da tela de Configurações também: `use-severe-alert-notifications.ts` (aviso
 * local) e `use-push-registration.ts` (envia as preferências ao NotificationHub, para
 * o vigia de clima respeitá-las no push com o app fechado).
 *
 * Persistidas em AsyncStorage: sobrevivem a reinícios do app.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadJson, saveJson } from '@/lib/storage';

export type AlertVolume = 'baixa' | 'media' | 'alta';

export type NotificationSettings = {
  notifSevero: boolean;
  notifGranizo: boolean;
  notifRajadasFortes: boolean;
  notifRajadas: boolean;
  volume: AlertVolume;
};

type NotificationSettingsContextValue = NotificationSettings & {
  /** `false` até as preferências salvas terminarem de carregar. */
  hydrated: boolean;
  setNotifSevero: (value: boolean) => void;
  setNotifGranizo: (value: boolean) => void;
  setNotifRajadasFortes: (value: boolean) => void;
  setNotifRajadas: (value: boolean) => void;
  setVolume: (value: AlertVolume) => void;
};

const STORAGE_KEY = 'sereno.notificationSettings';

const DEFAULTS: NotificationSettings = {
  notifSevero: true,
  notifGranizo: true,
  notifRajadasFortes: true,
  notifRajadas: true,
  volume: 'alta',
};

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | null>(null);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadJson<Partial<NotificationSettings>>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      // Merge com os padrões: chaves novas (de versões futuras) ganham o default.
      if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEY, settings);
  }, [settings, hydrated]);

  const value = useMemo<NotificationSettingsContextValue>(() => {
    const set =
      <K extends keyof NotificationSettings>(key: K) =>
      (value: NotificationSettings[K]) =>
        setSettings((prev) => ({ ...prev, [key]: value }));
    return {
      ...settings,
      hydrated,
      setNotifSevero: set('notifSevero'),
      setNotifGranizo: set('notifGranizo'),
      setNotifRajadasFortes: set('notifRajadasFortes'),
      setNotifRajadas: set('notifRajadas'),
      setVolume: set('volume'),
    };
  }, [settings, hydrated]);

  return <NotificationSettingsContext.Provider value={value}>{children}</NotificationSettingsContext.Provider>;
}

export function useNotificationSettings(): NotificationSettingsContextValue {
  const ctx = useContext(NotificationSettingsContext);
  if (!ctx) throw new Error('useNotificationSettings() precisa estar dentro de <NotificationSettingsProvider>');
  return ctx;
}
