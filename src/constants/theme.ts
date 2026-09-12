/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FAFAFA',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#6B7280',
    card: '#FFFFFF',
    border: '#E7E8EC',
    primary: '#1E88E5',
    danger: '#D32F2F',
    dangerBg: '#FDECEA',
    dangerBorder: 'rgba(211,47,47,0.25)',
    warning: '#F57C00',
    moderate: '#FBC02D',
    success: '#388E3C',
    neutral: '#78909C',
  },
  dark: {
    text: '#F2F2F2',
    background: '#121212',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    card: '#1E1E1E',
    border: '#2C2D31',
    primary: '#5AA6EE',
    danger: '#EF5350',
    dangerBg: '#3A1A18',
    dangerBorder: 'rgba(239,83,80,0.3)',
    warning: '#F57C00',
    moderate: '#FBC02D',
    success: '#66BB6A',
    neutral: '#8B9099',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Severity → theme color key, matches the design system's severity scale (spec §5.1). */
export const SeverityColor = {
  high: 'danger',
  moderate: 'moderate',
  low: 'success',
  normal: 'neutral',
} as const satisfies Record<string, ThemeColor>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
