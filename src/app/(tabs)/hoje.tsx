import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SevereAlertBanner } from '@/components/alert/severe-alert-banner';
import { LocationHeader } from '@/components/common/location-header';
import { StaleDataNotice, WeatherGate } from '@/components/common/weather-status';
import { ThemedView } from '@/components/themed-view';
import { CurrentWeatherCard } from '@/components/weather/current-weather-card';
import { HourlyStrip } from '@/components/weather/hourly-strip';
import { WeatherDetailsGrid } from '@/components/weather/weather-details-grid';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useWeather } from '@/providers/weather-provider';

export default function HojeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alertExpanded, setAlertExpanded] = useState(false);
  const { locationName, current, hourlyForecast, alert, details } = useWeather();

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <WeatherGate>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
          showsVerticalScrollIndicator={false}>
          <StaleDataNotice />
          <CurrentWeatherCard
            temp={current.temp}
            condition={current.condition}
            conditionKind={current.conditionKind}
            feelsLike={current.feelsLike}
            humidity={current.humidity}
            windKmh={current.windKmh}
          />
          <SevereAlertBanner alert={alert} expanded={alertExpanded} onToggle={() => setAlertExpanded((v) => !v)} />
          <HourlyStrip data={hourlyForecast} onPressDetails={() => router.push('/hourly')} />
          <WeatherDetailsGrid details={details} />
        </ScrollView>
      </WeatherGate>
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
