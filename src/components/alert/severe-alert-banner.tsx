import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SevereAlert } from '@/lib/mock-weather';

type SevereAlertBannerProps = {
  alert: SevereAlert;
  expanded: boolean;
  onToggle: () => void;
};

/** Collapsed banner shown on the Hoje tab; expands in place to a quick summary (spec §2.1). */
export function SevereAlertBanner({ alert, expanded, onToggle }: SevereAlertBannerProps) {
  const theme = useTheme();

  if (!alert.active) return null;

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.banner, { backgroundColor: theme.dangerBg, borderColor: theme.dangerBorder }]}
      accessibilityRole="button"
      accessibilityLabel={`${alert.type}, toque para ${expanded ? 'recolher' : 'ver'} detalhes`}>
      <View style={styles.headerRow}>
        <SymbolView
          name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
          tintColor={theme.danger}
          size={24}
        />
        <View style={styles.headerText}>
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            {alert.type}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Vigília ativa · próximas 3h
          </ThemedText>
        </View>
        <SymbolView
          name={{
            ios: expanded ? 'chevron.up' : 'chevron.down',
            android: expanded ? 'expand_less' : 'expand_more',
            web: expanded ? 'expand_less' : 'expand_more',
          }}
          tintColor={theme.danger}
          size={18}
        />
      </View>

      {expanded ? (
        <View style={[styles.detailsRow, { borderTopColor: theme.dangerBorder }]}>
          <View style={styles.statsRow}>
            <Stat label="PROBABILIDADE" value={`${alert.probability}%`} />
            <Stat label="VENTO" value={`${alert.windKmh} km/h`} />
            <Stat label="GRANIZO" value={alert.hail ? 'Sim' : 'Não'} />
          </View>
          <ThemedText type="small" style={styles.recommendation}>
            Evite áreas abertas e proteja objetos soltos até o fim da vigência.
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.card }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
  },
  detailsRow: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.two,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  recommendation: {
    lineHeight: 20,
    textAlign: 'left',
  },
});
