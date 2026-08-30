/**
 * Preferências de notificação (tela Configurações) — extraídas do `useState` local que
 * settings.tsx tinha antes pra virar um Context, porque agora elas precisam ser lidas
 * de fora da tela de Configurações também: `use-severe-alert-notifications.ts` (que
 * dispara a notificação de verdade) precisa saber se o usuário quer ou não ser avisado
 * de cada tipo de alerta.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type AlertVolume = 'baixa' | 'media' | 'alta';

export type NotificationSettings = {
  notifSevero: boolean;
  notifGranizo: boolean;
  notifTornado: boolean;
  notifRajadas: boolean;
  volume: AlertVolume;
};

type NotificationSettingsContextValue = NotificationSettings & {
  setNotifSevero: (value: boolean) => void;
  setNotifGranizo: (value: boolean) => void;
  setNotifTornado: (value: boolean) => void;
  setNotifRajadas: (value: boolean) => void;
  setVolume: (value: AlertVolume) => void;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | null>(null);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [notifSevero, setNotifSevero] = useState(true);
  const [notifGranizo, setNotifGranizo] = useState(true);
  const [notifTornado, setNotifTornado] = useState(true);
  const [notifRajadas, setNotifRajadas] = useState(true);
  const [volume, setVolume] = useState<AlertVolume>('alta');

  const value = useMemo<NotificationSettingsContextValue>(
    () => ({
      notifSevero,
      notifGranizo,
      notifTornado,
      notifRajadas,
      volume,
      setNotifSevero,
      setNotifGranizo,
      setNotifTornado,
      setNotifRajadas,
      setVolume,
    }),
    [notifSevero, notifGranizo, notifTornado, notifRajadas, volume]
  );

  return <NotificationSettingsContext.Provider value={value}>{children}</NotificationSettingsContext.Provider>;
}

export function useNotificationSettings(): NotificationSettingsContextValue {
  const ctx = useContext(NotificationSettingsContext);
  if (!ctx) throw new Error('useNotificationSettings() precisa estar dentro de <NotificationSettingsProvider>');
  return ctx;
}
