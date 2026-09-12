import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

import { LocationHeader } from '@/components/common/location-header';
import { buildMapHtml } from '@/components/map/radar-webview-html';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mapLayers } from '@/lib/mock-weather';
import { useWeather } from '@/providers/weather-provider';

type FrameLabel = { index: number; label: string; isForecast: boolean };

// WebView (e portanto o mapa real) só existe em iOS/Android — na build nativa é o que
// interessa. No preview web o pacote não tem implementação própria e cairia no aviso
// genérico da lib; aqui trocamos por um estado explicado, sem quebrar o `expo export`.
const MAP_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

export default function MapaScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { locationName, coordinates, alert, favorites } = useWeather();
  const webviewRef = useRef<WebView>(null);
  const [layer, setLayer] = useState<(typeof mapLayers)[number]>('Radar');
  const [frames, setFrames] = useState<FrameLabel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [html] = useState(buildMapHtml);

  const run = useCallback((script: string) => {
    webviewRef.current?.injectJavaScript(`${script}; true;`);
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    run(`setCenter(${coordinates.latitude}, ${coordinates.longitude}, 8)`);
  }, [mapReady, coordinates.latitude, coordinates.longitude, run]);

  useEffect(() => {
    if (!mapReady) return;
    const payload = alert.active
      ? { active: true, level: alert.level, title: alert.title, radiusKm: alert.radiusKm, lat: coordinates.latitude, lon: coordinates.longitude }
      : { active: false };
    run(`setAlert(${JSON.stringify(payload)})`);
  }, [mapReady, alert, coordinates, run]);

  useEffect(() => {
    if (!mapReady) return;
    const payload = favorites.map((f) => ({ lat: f.latitude, lon: f.longitude, name: f.name, temp: f.temp }));
    run(`setPlaces(${JSON.stringify(payload)})`);
  }, [mapReady, favorites, run]);

  useEffect(() => {
    if (!mapReady) return;
    run(`showLayer(${JSON.stringify(layer)})`);
  }, [mapReady, layer, run]);

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { type: string; payload?: unknown };
      if (msg.type === 'ready') {
        setMapReady(true);
      } else if (msg.type === 'frames') {
        const payload = msg.payload as { labels: FrameLabel[]; nowIndex: number };
        setFrames(payload.labels);
        setSelectedIndex(payload.nowIndex);
      } else if (msg.type === 'error') {
        setMapError(String(msg.payload));
      }
    } catch {
      // Mensagem malformada do WebView — ignora, não é crítico pra tela funcionar.
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <LocationHeader
        locationName={locationName}
        onPressLocation={() => router.push('/locations')}
        onPressSettings={() => router.push('/settings')}
      />
      <View style={styles.body}>
        <View style={[styles.mapWrap, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          {MAP_SUPPORTED ? (
            <WebView
              ref={webviewRef}
              source={{ html }}
              originWhitelist={['*']}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              style={styles.webview}
            />
          ) : (
            <View style={styles.unsupportedWrap}>
              <ThemedText type="smallBold" style={styles.unsupportedTitle}>
                Mapa disponível no app
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.unsupportedText}>
                O radar interativo usa um componente nativo (WebView) — funciona no APK/app instalado, não neste
                preview web.
              </ThemedText>
            </View>
          )}
        </View>

        {mapError ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
            {mapError}
          </ThemedText>
        ) : null}

        <View style={styles.layerRow}>
          {mapLayers.map((label) => {
            const active = label === layer;
            return (
              <Pressable
                key={label}
                onPress={() => setLayer(label)}
                style={[styles.layerButton, { backgroundColor: active ? theme.dangerBg : theme.backgroundElement }]}
                accessibilityRole="button">
                <ThemedText type="smallBold" style={active ? { color: theme.danger } : undefined}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {layer === 'Radar' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourRow}>
            {frames.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.loadingHint}>
                Carregando horários do radar…
              </ThemedText>
            ) : (
              frames.map((frame) => {
                const active = frame.index === selectedIndex;
                return (
                  <Pressable
                    key={frame.index}
                    onPress={() => {
                      setSelectedIndex(frame.index);
                      run(`setRadarFrame(${frame.index})`);
                    }}
                    style={[styles.hourButton, { backgroundColor: active ? theme.primary : theme.backgroundElement }]}
                    accessibilityRole="button">
                    <ThemedText
                      type="smallBold"
                      style={active ? styles.hourTextActive : undefined}
                      themeColor={active ? undefined : 'textSecondary'}>
                      {frame.label}
                      {frame.isForecast ? ' ▸' : ''}
                    </ThemedText>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.one,
  },
  mapWrap: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 220,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unsupportedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.one,
  },
  unsupportedTitle: {
    textAlign: 'center',
  },
  unsupportedText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    marginTop: Spacing.one,
  },
  layerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  layerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  hourRow: {
    gap: Spacing.one,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  hourButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  hourTextActive: {
    color: '#FFFFFF',
  },
  loadingHint: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
});
