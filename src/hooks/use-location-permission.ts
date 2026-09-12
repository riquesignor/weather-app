/**
 * Wrapper de geolocalização sobre `expo-location` — módulo compatível com Expo Go
 * (não exige dev client / rebuild nativo, mesma restrição já seguida pelo resto do
 * app). Cobre a permissão + posição atual (spec §2.1 "Geolocalização automática ao
 * abrir") e o reverse geocoding, usando o geocoder nativo do SO — sem precisar de
 * mais uma API key só para transformar coordenadas em "Cidade, UF".
 */
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coords = { latitude: number; longitude: number };

export type LocationResult = {
  status: 'loading' | 'granted' | 'denied' | 'error';
  coords: Coords;
  locationName: string;
  /** Mensagem de erro quando status === 'error' (GPS desligado, timeout, etc.). */
  errorMessage?: string;
};

/** São Paulo — usado só quando a permissão é negada ou o GPS falha, para o app
 * continuar funcionável em vez de travar sem dado nenhum. */
const FALLBACK_COORDS: Coords = { latitude: -23.5505, longitude: -46.6333 };
const FALLBACK_NAME = 'São Paulo, SP (padrão)';

async function reverseGeocode(coords: Coords): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (!place) return 'Local atual';
    const city = place.city ?? place.subregion ?? undefined;
    const region = place.region ?? undefined;
    if (city && region && city !== region) return `${city}, ${region}`;
    return city ?? region ?? 'Local atual';
  } catch {
    return 'Local atual';
  }
}

export function useLocationPermission(): LocationResult & { refresh: () => void } {
  const [result, setResult] = useState<LocationResult>({
    status: 'loading',
    coords: FALLBACK_COORDS,
    locationName: 'Buscando localização…',
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setResult((prev) => ({ ...prev, status: 'loading' }));
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setResult({ status: 'denied', coords: FALLBACK_COORDS, locationName: FALLBACK_NAME });
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const locationName = await reverseGeocode(coords);
        if (!cancelled) {
          setResult({ status: 'granted', coords, locationName });
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            status: 'error',
            coords: FALLBACK_COORDS,
            locationName: FALLBACK_NAME,
            errorMessage: error instanceof Error ? error.message : 'Falha ao obter localização',
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const refresh = useCallback(() => setAttempt((a) => a + 1), []);

  return { ...result, refresh };
}
