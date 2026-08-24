import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SeverityColor, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hourlyDetailed } from '@/lib/mock-weather';
import { conditionSymbol } from '@/lib/weather-icons';

export default function HourlyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
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

            <View style={[styles.tornadoRow, { borderTopColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Risco de tornado
              </ThemedText>
              <View style={styles.tornadoBadge}>
                <View style={[styles.dot, { backgroundColor: theme[SeverityColor[hour.tornadoRisk]] }]} />
                <ThemedText type="smallBold" style={{ color: theme[SeverityColor[hour.tornadoRisk]] }}>
                  {hour.tornadoRisk === 'high' ? 'Alto' : hour.tornadoRisk === 'moderate' ? 'Moderado' : 'Baixo'}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  tornadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  tornadoBadge: {
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
