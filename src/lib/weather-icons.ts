import type { SymbolViewProps } from 'expo-symbols';

export type WeatherCondition = 'clear' | 'partlyCloudy' | 'cloudy' | 'rain';

type SymbolName = SymbolViewProps['name'];

/** Maps a forecast condition to the platform-native icon glyph (SF Symbols on iOS, Material Symbols elsewhere). */
export function conditionSymbol(condition: WeatherCondition): SymbolName {
  switch (condition) {
    case 'clear':
      return { ios: 'sun.max.fill', android: 'clear_day', web: 'clear_day' };
    case 'partlyCloudy':
      return { ios: 'cloud.sun.fill', android: 'partly_cloudy_day', web: 'partly_cloudy_day' };
    case 'rain':
      return { ios: 'cloud.rain.fill', android: 'rainy', web: 'rainy' };
    case 'cloudy':
    default:
      return { ios: 'cloud.fill', android: 'cloud', web: 'cloud' };
  }
}
