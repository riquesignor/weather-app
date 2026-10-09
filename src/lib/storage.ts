/**
 * Persistência simples em chave-valor (AsyncStorage) com JSON. Falhas de leitura
 * ou escrita nunca derrubam o app — no pior caso, volta ao valor padrão.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem espaço/armazenamento indisponível: a preferência vale só nesta sessão.
  }
}
