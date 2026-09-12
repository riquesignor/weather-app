import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HIT_SLOP } from '@/constants/layout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { conditionSymbol } from '@/lib/weather-icons';
import { useWeather } from '@/providers/weather-provider';

export default function LocationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, searchLocations, selectLocation, addFavorite, removeFavorite } = useWeather();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function addLocation() {
    const name = query.trim();
    if (!name) {
      setAdding(false);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const results = await searchLocations(name);
      const [match] = results;
      if (!match) {
        setSearchError('Nenhuma cidade encontrada com esse nome.');
        return;
      }
      addFavorite(match);
      setQuery('');
      setAdding(false);
    } catch {
      setSearchError('Não foi possível buscar agora. Tente de novo.');
    } finally {
      setSearching(false);
    }
  }

  function removeLocation(id: string) {
    removeFavorite(id);
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.four }]}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.current) return;
              selectLocation({ id: item.id, name: item.name, latitude: item.latitude, longitude: item.longitude });
              router.back();
            }}
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SymbolView
              name={
                item.current
                  ? { ios: 'star.fill', android: 'star', web: 'star' }
                  : conditionSymbol(item.condition)
              }
              tintColor={item.current ? theme.moderate : theme.textSecondary}
              size={22}
            />
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <View style={styles.rowMeta}>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.current ? `Atual: ${item.temp}°` : item.temp > 0 ? `${item.temp}°` : 'Aguardando dados'}
                </ThemedText>
                {item.alertLabel ? (
                  <View style={styles.alertPill}>
                    <SymbolView
                      name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                      tintColor={theme.danger}
                      size={12}
                    />
                    <ThemedText type="small" style={{ color: theme.danger }}>
                      {item.alertLabel}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
            {!item.current ? (
              <Pressable
                onPress={() => removeLocation(item.id)}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${item.name}`}>
                <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} tintColor={theme.textSecondary} size={18} />
              </Pressable>
            ) : null}
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {adding ? (
              <>
                <View style={[styles.addRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TextInput
                    value={query}
                    onChangeText={(text) => {
                      setQuery(text);
                      if (searchError) setSearchError(null);
                    }}
                    placeholder="Nome da cidade"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { color: theme.text }]}
                    autoFocus
                    editable={!searching}
                    onSubmitEditing={addLocation}
                    returnKeyType="done"
                  />
                  {searching ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Pressable onPress={addLocation} accessibilityRole="button">
                      <ThemedText type="smallBold" style={{ color: theme.primary }}>
                        Adicionar
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
                {searchError ? (
                  <ThemedText type="small" style={{ color: theme.danger, marginTop: Spacing.two }}>
                    {searchError}
                  </ThemedText>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.searchHint}>
                    Busca via Open-Meteo Geocoding — funciona para cidades do mundo todo.
                  </ThemedText>
                )}
              </>
            ) : (
              <Pressable
                onPress={() => setAdding(true)}
                style={[styles.addButton, { borderColor: theme.border }]}
                accessibilityRole="button">
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.primary} size={18} />
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  Adicionar localização
                </ThemedText>
              </Pressable>
            )}
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    marginTop: Spacing.two,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  searchHint: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
});
