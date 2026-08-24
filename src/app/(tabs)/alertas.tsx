import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SevereAlertCard } from '@/components/alert/severe-alert-card';
import { LocationHeader } from '@/components/common/location-header';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { currentLocation, severeAlert } from '@/lib/mock-weather';

export default function AlertasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={currentLocation.name}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: Spacing.one, paddingBottom: insets.bottom + BottomTabInset + Spacing.three }}
        showsVerticalScrollIndicator={false}>
        <SevereAlertCard
          alert={severeAlert}
          locationName={currentLocation.name}
          notificationsOn={notificationsOn}
          onToggleNotifications={() => setNotificationsOn((v) => !v)}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
