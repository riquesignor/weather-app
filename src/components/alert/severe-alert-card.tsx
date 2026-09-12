import { SymbolView } from 'expo-symbols';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SevereAlert } from '@/lib/mock-weather';

type SevereAlertCardProps = {
  alert: SevereAlert;
  locationName: string;
  notificationsOn: boolean;
  onToggleNotifications: () => void;
  onOpenHistory?: () => void;
};

export function SevereAlertCard({
  alert,
  locationName,
  notificationsOn,
  onToggleNotifications,
  onOpenHistory,
}: SevereAlertCardProps) {
  const theme = useTheme();

  async function handleShare() {
    try {
      await Share.share({
        message: `${alert.title} · ${locationName} · vigência até ${alert.validTo}. Vento ${alert.windKmh} km/h · probabilidade ${alert.probability}% · risco de granizo.`,
      });
    } catch {
      // usuário cancelou o share sheet — nada a fazer
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerCard, { backgroundColor: theme.dangerBg, borderColor: theme.dangerBorder }]}>
        <View style={styles.headerRow}>
          <SymbolView
            name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
            tintColor={theme.danger}
            size={28}
          />
          <View>
            <ThemedText type="small" style={[styles.levelLabel, { color: theme.danger }]}>
              NÍVEL: {alert.levelLabel.toUpperCase()}
            </ThemedText>
            <ThemedText style={styles.title}>{alert.title}</ThemedText>
          </View>
        </View>
        <View style={[styles.validityRow, { backgroundColor: theme.card + 'B0' }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.validityLabel}>
            VIGÊNCIA
          </ThemedText>
          <ThemedText type="smallBold">
            {alert.validFrom} – {alert.validTo}
          </ThemedText>
        </View>
      </View>

      <View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          DETALHES
        </ThemedText>
        <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <DetailRow label="Velocidade do vento" value={`${alert.windKmh} km/h`} border={theme.border} />
          <DetailRow label="Probabilidade" value={`${alert.probability}%`} border={theme.border} />
          <DetailRow label="Raio afetado" value={`${alert.radiusKm} km`} border={theme.border} />
          <DetailRow label="Granizo" value={alert.hail ? 'Sim' : 'Não'} border={theme.border} last />
        </View>
      </View>

      <View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          RECOMENDAÇÕES
        </ThemedText>
        <View style={[styles.recommendationsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {alert.recommendations.map((rec) => (
            <View key={rec} style={styles.recommendationRow}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                tintColor={theme.success}
                size={20}
              />
              <ThemedText type="small">{rec}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Pressable onPress={onOpenHistory} accessibilityRole="button">
        <ThemedText type="linkPrimary" style={{ color: theme.primary, textAlign: 'center' }}>
          Ver histórico de alertas →
        </ThemedText>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleShare}
          style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
          accessibilityRole="button">
          <ThemedText type="smallBold">Compartilhar</ThemedText>
        </Pressable>
        <Pressable
          onPress={onToggleNotifications}
          style={[styles.actionButton, { backgroundColor: theme.danger }]}
          accessibilityRole="button">
          <ThemedText type="smallBold" style={styles.actionButtonTextOnDanger}>
            {notificationsOn ? 'Notificações Ativas' : 'Ativar Notificações'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  border,
  last,
}: {
  label: string;
  value: string;
  border: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: border }]}>
      <ThemedText type="default" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  validityRow: {
    marginTop: Spacing.three,
    borderRadius: 14,
    paddingVertical: Spacing.two,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validityLabel: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  detailLabel: {
    fontSize: 14,
  },
  recommendationsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonTextOnDanger: {
    color: '#FFFFFF',
  },
});
