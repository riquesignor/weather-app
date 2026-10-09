import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { useSevereAlertNotifications } from '@/hooks/use-severe-alert-notifications';
import { NotificationSettingsProvider } from '@/providers/notification-settings-provider';
import { ThemeModeProvider, useThemeMode } from '@/providers/theme-mode-provider';
import { WeatherProvider } from '@/providers/weather-provider';

SplashScreen.preventAutoHideAsync();

function AlertNotificationsBridge() {
  // Precisa estar dentro do WeatherProvider (lê `alert`) e do NotificationSettingsProvider
  // (lê os toggles) — não renderiza nada, só liga os efeitos colaterais de notificação.
  // Com push ativo (hub configurado), quem avisa é o servidor; senão, o aviso local.
  const push = usePushRegistration();
  useSevereAlertNotifications({ enabled: !push.active });
  return null;
}

function NotificationTapHandler() {
  // Tocar numa notificação (local ou push) abre a rota indicada em `data.route`.
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handledId.current === id) return;
    handledId.current = id;

    const route = response.notification.request.content.data?.route;
    if (typeof route === 'string' && route.startsWith('/')) router.push(route as Href);
  }, [response, router]);

  return null;
}

function RootLayoutNav() {
  const { colorScheme } = useThemeMode();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WeatherProvider>
        <AlertNotificationsBridge />
        {Platform.OS !== 'web' ? <NotificationTapHandler /> : null}
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
