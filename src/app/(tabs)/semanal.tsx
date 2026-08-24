import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { LocationHeader } from '@/components/common/location-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { currentLocation } from '@/lib/mock-weather';

export default function SemanalScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={currentLocation.name}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <View style={styles.emptyState}>
        <View style={[styles.iconCircle, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
            tintColor={theme.textSecondary}
            size={28}
          />
        </View>
        <ThemedText type="smallBold" style={styles.title}>
          Previsão semanal em breve
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Esta seção chegará em uma próxima atualização do app.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
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
    maxWidth: 220,
    lineHeight: 20,
  },
});
