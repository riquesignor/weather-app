import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HIT_SLOP } from '@/constants/layout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LocationHeaderProps = {
  locationName: string;
  onPressLocation?: () => void;
  onPressSettings?: () => void;
};

export function LocationHeader({ locationName, onPressLocation, onPressSettings }: LocationHeaderProps) {
  const theme = useTheme();
  // A Stack raiz roda com headerShown:false (o header é este componente), então
  // sem isso o conteúdo fica embaixo da status bar/notch em qualquer Android real —
  // no navegador/emulador a barra de status não ocupa espaço, por isso passou batido.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { backgroundColor: theme.card, paddingTop: insets.top + Spacing.two }]}>
      <Pressable
        onPress={onPressLocation}
        style={styles.locationButton}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Trocar localização">
        <SymbolView
          name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
          tintColor={theme.primary}
          size={18}
        />
        <View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.eyebrow}>
            LOCALIZAÇÃO ATUAL
          </ThemedText>
          <ThemedText type="smallBold" style={styles.locationName}>
            {locationName}
          </ThemedText>
        </View>
      </Pressable>

      <Pressable
        onPress={onPressSettings}
        style={[styles.settingsButton, { backgroundColor: theme.backgroundElement }]}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Abrir configurações">
        <SymbolView
          name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
          tintColor={theme.text}
          size={18}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  locationName: {
    fontSize: 17,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
