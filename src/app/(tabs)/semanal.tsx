import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/common/location-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DailyForecastPoint } from '@/lib/mock-weather';
import { conditionSymbol } from '@/lib/weather-icons';
import { useWeather } from '@/providers/weather-provider';

export default function SemanalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { locationName, dailyForecast, status } = useWeather();

  // Maior/menor temperatura da semana — usados pra escalar a barra min→max de cada linha.
  const weekMin = Math.min(...dailyForecast.map((d) => d.tempMin));
  const weekMax = Math.max(...dailyForecast.map((d) => d.tempMax));
  const weekRange = Math.max(weekMax - weekMin, 1);

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
        showsVerticalScrollIndicator={false}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          PRÓXIMOS {dailyForecast.length} DIAS
        </ThemedText>

        {status === 'error' ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.notice}>
            Não foi possível atualizar a previsão agora — mostrando os últimos dados conhecidos.
          </ThemedText>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {dailyForecast.map((day, index) => (
            <DayRow
              key={day.date || day.dayLabel}
              day={day}
              last={index === dailyForecast.length - 1}
              weekMin={weekMin}
              weekRange={weekRange}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function DayRow({
  day,
  last,
  weekMin,
  weekRange,
}: {
  day: DailyForecastPoint;
  last: boolean;
  weekMin: number;
  weekRange: number;
}) {
  const theme = useTheme();
  const barStart = ((day.tempMin - weekMin) / weekRange) * 100;
  const barWidth = ((day.tempMax - day.tempMin) / weekRange) * 100;

  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <ThemedText type="smallBold" style={styles.dayLabel}>
        {day.dayLabel}
      </ThemedText>
      <SymbolView name={conditionSymbol(day.condition)} tintColor={theme.textSecondary} size={20} />
      <View style={styles.precipWrap}>
        <SymbolView name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} tintColor={theme.primary} size={12} />
        <ThemedText type="small" themeColor="textSecondary">
          {day.precipitation}%
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.tempMin}>
        {day.tempMin}°
      </ThemedText>
      <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.barFill,
            { left: `${barStart}%`, width: `${Math.max(barWidth, 8)}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>
      <ThemedText type="smallBold" style={styles.tempMax}>
        {day.tempMax}°
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingLeft: Spacing.one,
  },
  notice: {
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.one,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  dayLabel: {
    width: 40,
  },
  precipWrap: {
    width: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tempMin: {
    width: 28,
    textAlign: 'right',
  },
  tempMax: {
    width: 32,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 2,
  },
});
