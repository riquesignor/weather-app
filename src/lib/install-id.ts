/**
 * Identificador anônimo desta instalação — o Sereno não tem login, então é ele que
 * identifica o aparelho no NotificationHub. UUID aleatório criptográfico (não dá
 * para adivinhar o de outra pessoa) e persistido: sobrevive a reinícios do app.
 */
import * as Crypto from 'expo-crypto';

import { loadJson, saveJson } from '@/lib/storage';

const KEY = 'sereno.installId';
let cached: Promise<string> | null = null;

export function getInstallId(): Promise<string> {
  cached ??= (async () => {
    const stored = await loadJson<string>(KEY);
    if (stored) return stored;
    const id = Crypto.randomUUID();
    await saveJson(KEY, id);
    return id;
  })();
  return cached;
}
