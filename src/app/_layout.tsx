import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useSevereAlertNotifications } from '@/hooks/use-severe-alert-notifications';
import { NotificationSettingsProvider } from '@/providers/notification-settings-provider';
import { ThemeModeProvider, useThemeMode } from '@/providers/theme-mode-provider';
import { WeatherProvider } from '@/providers/weather-provider';

SplashScreen.preventAutoHideAsync();

function AlertNotificationsBridge() {
  // Precisa estar dentro do WeatherProvider (lê `alert`) e do NotificationSettingsProvider
  // (lê os toggles) — não renderiza nada, só liga o efeito colateral de notificação.
  useSevereAlertNotifications();
  return null;
}

function RootLayoutNav() {
  const { colorScheme } = useThemeMode();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WeatherProvider>
        <AlertNotificationsBridge />
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Configurações' }} />
          <Stack.Screen name="hourly" options={{ headerShown: true, title: 'Previsão detalhada' }} />
          <Stack.Screen name="locations" options={{ headerShown: true, title: 'Minhas localizações' }} />
        </Stack>
      </WeatherProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <NotificationSettingsProvider>
        <RootLayoutNav />
      </NotificationSettingsProvider>
    </ThemeModeProvider>
  );
}
