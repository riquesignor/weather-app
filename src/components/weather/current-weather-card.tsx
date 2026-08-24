import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { conditionSymbol, type WeatherCondition } from '@/lib/weather-icons';

type CurrentWeatherCardProps = {
  temp: number;
  condition: string;
  conditionKind: WeatherCondition;
  feelsLike: number;
  humidity: number;
  windKmh: number;
};

export function CurrentWeatherCard({
  temp,
  condition,
  conditionKind,
  feelsLike,
  humidity,
  windKmh,
}: CurrentWeatherCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            Agora mesmo
          </ThemedText>
          <ThemedText style={styles.temp}>{temp}°</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {condition}
          </ThemedText>
        </View>
        <SymbolView name={conditionSymbol(conditionKind)} tintColor={theme.moderate} size={52} />
      </View>

      <View style={[styles.metricsRow, { borderTopColor: theme.border }]}>
        <Metric
          iconName={{ ios: 'thermometer.medium', android: 'thermostat', web: 'thermostat' }}
          label="Sensação"
          value={`${feelsLike}°`}
        />
        <Metric
          iconName={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
          label="Umidade"
          value={`${humidity}%`}
        />
        <Metric
          iconName={{ ios: 'wind', android: 'air', web: 'air' }}
          label="Vento"
          value={`${windKmh} km/h`}
        />
      </View>
    </View>
  );
}

function Metric({
  iconName,
  label,
  value,
}: {
  iconName: SymbolViewProps['name'];
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <SymbolView name={iconName} tintColor={theme.textSecondary} size={18} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temp: {
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
});
