import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LocationHeader } from '@/components/common/location-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mapHours, mapLayers } from '@/lib/mock-weather';
import { useWeather } from '@/providers/weather-provider';

export default function MapaScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { locationName } = useWeather();
  const [layer, setLayer] = useState<(typeof mapLayers)[number]>('Radar');
  const [hour, setHour] = useState<(typeof mapHours)[number]>('14h');

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <View style={styles.body}>
        <View style={[styles.radarPlaceholder, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={[styles.radarLabel, { backgroundColor: theme.card + 'DD' }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.radarLabelText}>
              mapa de radar{'\n'}+ camadas de alerta
            </ThemedText>
          </View>
          <View style={[styles.pin, styles.pinDanger, { backgroundColor: theme.danger, borderColor: theme.card }]} />
          <View style={[styles.pin, styles.pinPrimary, { backgroundColor: theme.primary, borderColor: theme.card }]} />
        </View>

        <View style={styles.layerRow}>
          {mapLayers.map((label) => {
            const active = label === layer;
            return (
              <Pressable
                key={label}
                onPress={() => setLayer(label)}
                style={[
                  styles.layerButton,
                  { backgroundColor: active ? theme.dangerBg : theme.backgroundElement },
                ]}
                accessibilityRole="button">
                <ThemedText type="smallBold" style={active ? { color: theme.danger } : undefined}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourRow}>
          {mapHours.map((label) => {
            const active = label === hour;
            return (
              <Pressable
                key={label}
                onPress={() => setHour(label)}
                style={[
                  styles.hourButton,
                  { backgroundColor: active ? theme.primary : theme.backgroundElement },
                ]}
                accessibilityRole="button">
                <ThemedText type="smallBold" style={active ? styles.hourTextActive : undefined} themeColor={active ? undefined : 'textSecondary'}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.one,
  },
  radarPlaceholder: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radarLabel: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
  },
  radarLabelText: {
    textAlign: 'center',
  },
  pin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  pinDanger: {
    top: 16,
    left: 16,
  },
  pinPrimary: {
    bottom: 40,
    right: 30,
  },
  layerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  layerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  hourRow: {
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  hourButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  hourTextActive: {
    color: '#FFFFFF',
  },
});
