import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/common/location-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useGardenLog } from '@/hooks/use-garden-log';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/providers/theme-mode-provider';
import { useWeather } from '@/providers/weather-provider';
import { deriveActivitySuggestion } from '@/services/activity-advisor';
import { derivePlantingSuggestion, getCultivoTip, getPlantCalendar, getWeeklyPlantingPlan } from '@/services/garden-advisor';

/**
 * Paleta das duas cards "hero" (ilustração de céu/horta) — não vêm do design system
 * principal (`@/constants/theme`) porque são decorativas e específicas desta aba, no
 * mesmo espírito das cores ad-hoc já usadas no placeholder do Mapa.
 */
const HERO_PALETTE = {
  light: {
    activity: {
      gradient: ['#5EB3F5', '#A9DDF9', '#D8EFFB'] as const,
      text: '#0D3B57',
      buttonBg: '#0D3B57',
      buttonText: '#FFFFFF',
      badgeBg: '#FFFFFFCC',
      badgeText: '#0D3B57',
    },
    garden: {
      gradient: ['#FBEAA0', '#F3D27A'] as const,
      text: '#3E2E0B',
      buttonBg: '#3E2E0B',
      buttonText: '#FFFFFF',
      badgeBg: '#FFFFFFCC',
      badgeText: '#3E2E0B',
    },
    chipPlantBg: '#E7F5E9',
    tipBg: '#EAF3FC',
  },
  dark: {
    activity: {
      gradient: ['#2E5A82', '#3E729E', '#5A8CB4'] as const,
      text: '#F2F2F2',
      buttonBg: '#F2F2F2',
      buttonText: '#0D3B57',
      badgeBg: '#00000055',
      badgeText: '#F2F2F2',
    },
    garden: {
      gradient: ['#4A3B1A', '#5F4C22'] as const,
      text: '#F2F2F2',
      buttonBg: '#F2F2F2',
      buttonText: '#3E2E0B',
      badgeBg: '#00000055',
      badgeText: '#F2F2F2',
    },
    chipPlantBg: '#1A3320',
    tipBg: '#1A2E3F',
  },
};

export default function CultivoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colorScheme } = useThemeMode();
  const palette = colorScheme === 'dark' ? HERO_PALETTE.dark : HERO_PALETTE.light;
  const insets = useSafeAreaInsets();

  const { locationName, current, hourlyForecast, dailyForecast } = useWeather();
  const { tasks, plants, activityStreak, activityLoggedToday, gardenLoggedToday, toggleTask, logActivity, logGarden } =
    useGardenLog();

  const activity = deriveActivitySuggestion(current, hourlyForecast);
  const planting = derivePlantingSuggestion(current);
  const calendar = getPlantCalendar(current);
  const tip = getCultivoTip(current);
  const weeklyPlan = getWeeklyPlantingPlan(dailyForecast);
  const bestDay = weeklyPlan.find((d) => d.goodForPlanting) ?? null;

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
        showsVerticalScrollIndicator={false}>
        <LinearGradient colors={palette.activity.gradient} style={styles.hero}>
          <View style={styles.heroIllustration}>
            <SymbolView
              name={{ ios: 'sun.max.fill', android: 'clear_day', web: 'clear_day' }}
              tintColor={palette.activity.text + '40'}
              size={72}
            />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <ThemedText type="smallBold" style={[styles.heroTitle, { color: palette.activity.text }]}>
                {activity.title}
              </ThemedText>
              <ThemedText type="small" style={[styles.heroSubtitle, { color: palette.activity.text }]}>
                {activity.subtitle}
              </ThemedText>
            </View>
            {activityLoggedToday ? (
              <View style={[styles.heroBadge, { backgroundColor: palette.activity.badgeBg }]}>
                <ThemedText type="smallBold" style={{ color: palette.activity.badgeText }}>
                  🔥 {activityStreak} dias
                </ThemedText>
              </View>
            ) : (
              <Pressable
                onPress={logActivity}
                style={[styles.heroButton, { backgroundColor: palette.activity.buttonBg }]}
                accessibilityRole="button">
                <ThemedText type="smallBold" style={{ color: palette.activity.buttonText }}>
                  Registrei ✓
                </ThemedText>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        <LinearGradient colors={palette.garden.gradient} style={styles.hero}>
          <View style={styles.heroIllustration}>
            <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} tintColor={palette.garden.text + '40'} size={72} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <ThemedText type="smallBold" style={[styles.heroTitle, { color: palette.garden.text }]}>
                {planting.title}
              </ThemedText>
              <ThemedText type="small" style={[styles.heroSubtitle, { color: palette.garden.text }]}>
                {planting.subtitle}
              </ThemedText>
            </View>
            {gardenLoggedToday ? (
              <View style={[styles.heroBadge, { backgroundColor: palette.garden.badgeBg }]}>
                <ThemedText type="smallBold" style={{ color: palette.garden.badgeText }}>
                  🌱 Feito hoje
                </ThemedText>
              </View>
            ) : (
              <Pressable
                onPress={logGarden}
                style={[styles.heroButton, { backgroundColor: palette.garden.buttonBg }]}
                accessibilityRole="button">
                <ThemedText type="smallBold" style={{ color: palette.garden.buttonText }}>
                  Reguei ✓
                </ThemedText>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Calendário de plantio
          </ThemedText>
          <View style={styles.chipsRow}>
            {calendar.map((p) => (
              <View
                key={p.name}
                style={[styles.chip, { backgroundColor: p.plant ? palette.chipPlantBg : theme.backgroundElement }]}>
                <ThemedText type="smallBold" style={{ color: p.plant ? theme.success : theme.textSecondary }}>
                  {p.plant ? '🌱' : '⏳'} {p.name}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Melhores dias da semana pra plantar
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
            {weeklyPlan.map((day, index) => (
              <View
                key={`${day.dayLabel}-${index}`}
                style={[
                  styles.weekDay,
                  { backgroundColor: day.goodForPlanting ? palette.chipPlantBg : theme.backgroundElement },
                ]}>
                <ThemedText type="smallBold">{day.dayLabel}</ThemedText>
                <ThemedText style={styles.weekDayIcon}>
                  {day.goodForPlanting ? '🌱' : day.goodForWatering ? '💧' : '—'}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
          <ThemedText type="small" themeColor="textSecondary" style={styles.weekNote}>
            {bestDay
              ? `${bestDay.dayLabel}: ${bestDay.note}`
              : 'Nenhum dia ideal pra plantio nos próximos 7 dias — foque em regar e adubar o que já está no canteiro.'}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Tarefas de hoje
          </ThemedText>
          {tasks.map((t) => (
            <Pressable key={t.id} onPress={() => toggleTask(t.id)} style={styles.taskRow} accessibilityRole="button">
              <View
                style={[
                  styles.checkbox,
                  t.done
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { borderColor: theme.border },
                ]}>
                {t.done ? (
                  <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={12} />
                ) : null}
              </View>
              <ThemedText type="default" themeColor={t.done ? 'textSecondary' : 'text'}>
                {t.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.tipCard, { backgroundColor: palette.tipBg }]}>
          <ThemedText style={styles.tipEmoji}>💡</ThemedText>
          <View style={styles.tipTextWrap}>
            <ThemedText type="small" style={[styles.tipHeading, { color: theme.primary }]}>
              Sabia que...
            </ThemedText>
            <ThemedText type="small">{tip}</ThemedText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Sua horta
          </ThemedText>
          {plants.map((p) => (
            <View key={p.id} style={styles.plantRow}>
              <ThemedText type="default">{p.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {p.daysLeft} dias p/ colheita
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
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
  hero: {
    borderRadius: 22,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-end',
  },
  heroIllustration: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 3,
    lineHeight: 18,
  },
  heroButton: {
    flexShrink: 0,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  heroBadge: {
    flexShrink: 0,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
  },
  cardTitle: {
    marginBottom: Spacing.two,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.two + 2,
    borderRadius: 10,
  },
  weekScroll: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  weekDay: {
    width: 52,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  weekDayIcon: {
    fontSize: 16,
  },
  weekNote: {
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    borderRadius: 18,
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipTextWrap: {
    flex: 1,
  },
  tipHeading: {
    fontWeight: '700',
    marginBottom: 2,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one + 3,
  },
});
