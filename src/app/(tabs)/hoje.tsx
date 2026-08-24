import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SevereAlertBanner } from '@/components/alert/severe-alert-banner';
import { LocationHeader } from '@/components/common/location-header';
import { ThemedView } from '@/components/themed-view';
import { CurrentWeatherCard } from '@/components/weather/current-weather-card';
import { HourlyStrip } from '@/components/weather/hourly-strip';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { currentConditions, currentLocation, hourlyForecast, severeAlert } from '@/lib/mock-weather';

export default function HojeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alertExpanded, setAlertExpanded] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={currentLocation.name}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
        showsVerticalScrollIndicator={false}>
        <CurrentWeatherCard
          temp={currentConditions.temp}
          condition={currentConditions.condition}
          conditionKind="cloudy"
          feelsLike={currentConditions.feelsLike}
          humidity={currentConditions.humidity}
          windKmh={currentConditions.windKmh}
        />
        <SevereAlertBanner alert={severeAlert} expanded={alertExpanded} onToggle={() => setAlertExpanded((v) => !v)} />
        <HourlyStrip data={hourlyForecast} onPressDetails={() => router.push('/hourly')} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
});
