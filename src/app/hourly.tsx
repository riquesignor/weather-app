import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StaleDataNotice, WeatherGate } from '@/components/common/weather-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SeverityColor, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { conditionSymbol } from '@/lib/weather-icons';
import { useWeather } from '@/providers/weather-provider';

export default function HourlyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hourlyDetailed } = useWeather();

  return (
    <ThemedView style={styles.container}>
      <WeatherGate>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
          <StaleDataNotice style={styles.notice} />
          {hourlyDetailed.map((hour) => (
            <View key={hour.rangeLabel} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.headerRow}>
                <ThemedText type="smallBold">{hour.rangeLabel}</ThemedText>
                <SymbolView name={conditionSymbol(hour.condition)} tintColor={theme.textSecondary} size={22} />
              </View>

              <View style={styles.grid}>
                <Metric label="Temp" value={`${hour.temp}°C`} />
                <Metric label="Sensação" value={`${hour.feelsLike}°C`} />
                <Metric label="Umidade" value={`${hour.humidity}%`} />
                <Metric label="Vento" value={`${hour.windKmh} km/h`} />
                <Metric label="Precipitação" value={`${hour.precipitation}%`} />
                <Metric
                  label="Granizo"
                  value={hour.hail ? 'Sim' : 'Não'}
                  valueColor={hour.hail ? theme.danger : undefined}
                />
              </View>

              <View style={[styles.gustRow, { borderTopColor: theme.border }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  Risco de rajadas
                </ThemedText>
                <View style={styles.gustBadge}>
                  <View style={[styles.dot, { backgroundColor: theme[SeverityColor[hour.gustRisk]] }]} />
                  <ThemedText type="smallBold" style={{ color: theme[SeverityColor[hour.gustRisk]] }}>
                    {hour.gustRisk === 'high' ? 'Alto' : hour.gustRisk === 'moderate' ? 'Moderado' : 'Baixo'}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </WeatherGate>
    </ThemedView>
  );
}

function Metric({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.metric}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
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
    gap: Spacing.three,
  },
  notice: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.two,
  },
  metric: {
    width: '33.33%',
    gap: 2,
  },
  gustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  gustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
