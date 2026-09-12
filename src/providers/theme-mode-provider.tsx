/**
 * Estado global do modo de tema (item #6 do feedback: o seletor de tema em
 * Configurações precisa funcionar de verdade, não só existir visualmente).
 *
 * 'auto' segue o esquema de cores do sistema operacional (via o hook do próprio
 * projeto — NUNCA `useColorScheme` direto de 'react-native', que quebra hidratação
 * no web; ver `@/hooks/use-color-scheme` e o bug real que isso já causou em
 * `cultivo.tsx`). 'light'/'dark' fixam o tema independente do sistema.
 *
 * Não persiste entre reinícios do app ainda (AsyncStorage seria o próximo passo,
 * mesmo caso do cache de previsão em `weather-provider.tsx`) — dentro de uma sessão
 * de uso já resolve o problema relatado.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type AppColorScheme = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colorScheme: AppColorScheme;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const systemScheme = useColorScheme();

  const colorScheme: AppColorScheme = useMemo(() => {
    if (mode === 'light' || mode === 'dark') return mode;
    return systemScheme === 'dark' ? 'dark' : 'light';
  }, [mode, systemScheme]);

  const value = useMemo<ThemeModeContextValue>(() => ({ mode, setMode, colorScheme }), [mode, colorScheme]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode() precisa estar dentro de <ThemeModeProvider>');
  return ctx;
}
