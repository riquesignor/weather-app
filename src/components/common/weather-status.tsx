/**
 * Estados de dado do `WeatherProvider` que as telas precisam tratar:
 *
 * - `WeatherGate`: enquanto não existe NENHUMA resposta real (`hasData === false`),
 *   mostra carregamento ou erro com "Tentar de novo" no lugar do conteúdo — os
 *   placeholders do mock nunca aparecem como se fossem previsão de verdade.
 * - `StaleDataNotice`: já houve resposta real, mas o último refresh falhou — o
 *   conteúdo continua visível, com aviso de quando ele é.
 */
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWeather } from '@/providers/weather-provider';

function formatTime(epochMs: number): string {
  const date = new Date(epochMs);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function WeatherGate({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { hasData, status, refresh } = useWeather();

  if (hasData) return <>{children}</>;

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <ThemedText type="smallBold" style={styles.title}>
          Não foi possível carregar a previsão
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
          Verifique sua conexão com a internet e tente novamente.
        </ThemedText>
        <Pressable
          onPress={refresh}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button">
          <ThemedText type="smallBold" style={styles.retryText}>
            Tentar de novo
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.centered} accessibilityLabel="Carregando previsão">
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        Buscando a previsão…
      </ThemedText>
    </View>
  );
}

export function StaleDataNotice({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const { hasData, status, updatedAt, refresh } = useWeather();

  if (!hasData || status !== 'error' || updatedAt === null) return null;

  return (
    <Pressable
      onPress={refresh}
      style={[styles.notice, { backgroundColor: theme.backgroundElement }, style]}
      accessibilityRole="button"
      accessibilityHint="Tenta atualizar a previsão">
      <ThemedText type="small" themeColor="textSecondary" style={styles.noticeText}>
        Sem conexão — mostrando dados das {formatTime(updatedAt)}.{' '}
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          Tentar de novo
        </ThemedText>
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
    paddingTop: Spacing.six,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
  },
  notice: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  noticeText: {
    textAlign: 'center',
  },
});
