import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SevereAlertCard } from '@/components/alert/severe-alert-card';
import { LocationHeader } from '@/components/common/location-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWeather } from '@/providers/weather-provider';

export default function AlertasScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const { locationName, alert } = useWeather();

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: Spacing.one, paddingBottom: insets.bottom + BottomTabInset + Spacing.three }}
        showsVerticalScrollIndicator={false}>
        {alert.active ? (
          <SevereAlertCard
            alert={alert}
            locationName={locationName}
            notificationsOn={notificationsOn}
            onToggleNotifications={() => setNotificationsOn((v) => !v)}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
                tintColor={theme.success}
                size={28}
              />
            </View>
            <ThemedText type="smallBold" style={styles.title}>
              Nenhum alerta ativo
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Sem risco severo estimado para {locationName} nas próximas horas.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
    paddingTop: Spacing.six,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});
