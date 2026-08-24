import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/common/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Volume = 'baixa' | 'media' | 'alta';
type UpdateFrequency = '15' | '30' | '60';
type ThemeMode = 'auto' | 'light' | 'dark';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [notifSevero, setNotifSevero] = useState(true);
  const [notifGranizo, setNotifGranizo] = useState(true);
  const [notifTornado, setNotifTornado] = useState(true);
  const [notifRajadas, setNotifRajadas] = useState(true);
  const [volume, setVolume] = useState<Volume>('alta');

  const [locContinua, setLocContinua] = useState(true);
  const [frequency, setFrequency] = useState<UpdateFrequency>('30');
  const [dadosAnonimos, setDadosAnonimos] = useState(true);

  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
        <Section title="Notificações">
          <ToggleRow label="Alertas Severos" value={notifSevero} onValueChange={setNotifSevero} />
          <ToggleRow label="Avisos de Granizo" value={notifGranizo} onValueChange={setNotifGranizo} />
          <ToggleRow label="Avisos de Tornado" value={notifTornado} onValueChange={setNotifTornado} />
          <ToggleRow label="Avisos de Rajadas" value={notifRajadas} onValueChange={setNotifRajadas} last />
        </Section>

        <Card>
          <ThemedText type="smallBold" style={styles.cardLabel}>
            Volume do alerta
          </ThemedText>
          <SegmentedControl
            value={volume}
            onChange={setVolume}
            options={[
              { value: 'baixa', label: 'Baixa' },
              { value: 'media', label: 'Média' },
              { value: 'alta', label: 'Alta' },
            ]}
          />
        </Card>

        <Section title="Privacidade">
          <ToggleRow label="Localização contínua" value={locContinua} onValueChange={setLocContinua} />
          <View style={[styles.frequencyRow, { borderBottomColor: theme.border }]}>
            <ThemedText type="smallBold" style={styles.cardLabel}>
              Frequência de atualização
            </ThemedText>
            <SegmentedControl
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: '15', label: '15 min' },
                { value: '30', label: '30 min' },
                { value: '60', label: '60 min' },
              ]}
            />
          </View>
          <ToggleRow label="Dados anônimos de uso" value={dadosAnonimos} onValueChange={setDadosAnonimos} last />
        </Section>

        <Section title="Tema">
          <Card padded>
            <SegmentedControl
              value={themeMode}
              onChange={setThemeMode}
              options={[
                { value: 'auto', label: 'Automático' },
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Escuro' },
              ]}
            />
          </Card>
        </Section>

        <Section title="Sobre">
          <Card padded>
            <View style={styles.aboutRow}>
              <ThemedText type="default">Versão</ThemedText>
              <ThemedText type="smallBold" themeColor="textSecondary">
                1.0.0
              </ThemedText>
            </View>
          </Card>
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <Card>{children}</Card>
    </View>
  );
}

function Card({ children, padded }: { children: ReactNode; padded?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        padded && styles.cardPadded,
      ]}>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  last,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.toggleRow, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <ThemedText type="default">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingLeft: Spacing.one,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  cardPadded: {
    padding: Spacing.three,
  },
  cardLabel: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  frequencyRow: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
