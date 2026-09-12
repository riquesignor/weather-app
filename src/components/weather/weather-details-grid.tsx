import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WeatherDetails } from '@/lib/mock-weather';

type DetailItem = {
  key: string;
  icon: SymbolViewProps['name'];
  label: string;
  value: string;
};

/**
 * Grid "Detalhes" da tela Hoje — inspirado na referência de app anexada pelo usuário
 * (UV, qualidade do ar, vento, ponto de orvalho, pressão, visibilidade). Pólen fica de
 * fora de propósito: a Open-Meteo só cobre isso de forma confiável na Europa.
 */
export function WeatherDetailsGrid({ details }: { details: WeatherDetails }) {
  const theme = useTheme();

  const items: DetailItem[] = [
    {
      key: 'uv',
      icon: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
      label: 'Índice UV',
      value: `${details.uvIndex} · ${details.uvLabel}`,
    },
    {
      key: 'aqi',
      icon: { ios: 'wind', android: 'air', web: 'air' },
      label: 'Qualidade do ar',
      value: details.aqi === null ? 'Indisponível' : `${details.aqi} · ${details.aqiLabel}`,
    },
    {
      key: 'wind',
      icon: { ios: 'safari.fill', android: 'explore', web: 'explore' },
      label: 'Direção do vento',
      value: `${details.windDirectionLabel} · ${details.windDirection}°`,
    },
    {
      key: 'dew',
      icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
      label: 'Ponto de orvalho',
      value: `${details.dewPoint}°`,
    },
    {
      key: 'pressure',
      icon: { ios: 'gauge.medium', android: 'speed', web: 'speed' },
      label: 'Pressão',
      value: `${details.pressure} hPa`,
    },
    {
      key: 'visibility',
      icon: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
      label: 'Visibilidade',
      value: `${details.visibilityKm} km`,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="smallBold" style={styles.title}>
        Detalhes
      </ThemedText>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.key} style={styles.item}>
            <View style={styles.itemHeader}>
              <SymbolView name={item.icon} tintColor={theme.textSecondary} size={16} />
              <ThemedText type="small" themeColor="textSecondary">
                {item.label}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={styles.itemValue}>
              {item.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.one,
    borderRadius: 22,
    borderWidth: 1,
    padding: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '50%',
    paddingVertical: Spacing.two,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  itemValue: {
    fontSize: 15,
  },
});
