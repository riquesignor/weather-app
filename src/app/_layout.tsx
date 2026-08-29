import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { WeatherProvider } from '@/providers/weather-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WeatherProvider>
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
