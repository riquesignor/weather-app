import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { HourlyPoint } from '@/lib/mock-weather';
import { conditionSymbol } from '@/lib/weather-icons';

type HourlyStripProps = {
  data: HourlyPoint[];
  onPressDetails?: () => void;
};

export function HourlyStrip({ data, onPressDetails }: HourlyStripProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
        PRÓXIMAS 24 HORAS
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {data.map((point) => (
          <View key={point.time} style={[styles.hourCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{point.time}</ThemedText>
            <SymbolView name={conditionSymbol(point.condition)} tintColor={theme.textSecondary} size={20} />
            <ThemedText type="smallBold">{point.temp}°</ThemedText>
            <View style={[styles.precipTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.precipFill,
                  { width: `${point.precipitation}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {point.precipitation}%
            </ThemedText>
          </View>
        ))}
      </ScrollView>
      <Pressable onPress={onPressDetails} accessibilityRole="button">
        <ThemedText type="linkPrimary" style={{ color: theme.primary }}>
          Ver detalhes por hora →
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.three,
  },
  scrollContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  hourCard: {
    width: 62,
    alignItems: 'center',
    gap: 7,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: 16,
  },
  precipTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  precipFill: {
    height: '100%',
    borderRadius: 2,
  },
});
