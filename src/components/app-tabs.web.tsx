import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const TAB_ICONS: Record<string, SymbolViewProps['name']> = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  semanal: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  alertas: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  mapa: { ios: 'map.fill', android: 'map', web: 'map' },
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="hoje" href="/hoje" asChild>
            <TabButton icon="home">Hoje</TabButton>
          </TabTrigger>
          <TabTrigger name="semanal" href="/semanal" asChild>
            <TabButton icon="semanal">Semanal</TabButton>
          </TabTrigger>
          <TabTrigger name="alertas" href="/alertas" asChild>
            <TabButton icon="alertas">Alertas</TabButton>
          </TabTrigger>
          <TabTrigger name="mapa" href="/mapa" asChild>
            <TabButton icon="mapa">Mapa</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof TAB_ICONS };

export function TabButton({ children, icon, isFocused, ...props }: TabButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <SymbolView
          name={TAB_ICONS[icon]}
          tintColor={isFocused ? colors.text : colors.textSecondary}
          size={16}
        />
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Weather
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
