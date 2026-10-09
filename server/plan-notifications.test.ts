import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { OpenMeteoForecastResponse } from '@/services/open-meteo';
import { fromDeviceAttributes, toDeviceAttributes } from '@/services/push-subscription';

import { groupByLocation, planForLocation, type DeviceRow } from './plan-notifications';

const ALL_ON = { notifSevero: true, notifGranizo: true, notifRajadasFortes: true, notifRajadas: true };

function device(userId: string, lat: number, lon: number, prefs = ALL_ON, lastUsedAt: string | null = null): DeviceRow {
  return {
    userId,
    attributes: toDeviceAttributes({ coords: { latitude: lat, longitude: lon }, locationName: 'Curitiba, PR', prefs }),
    registeredAt: '2026-10-01T00:00:00Z',
    lastUsedAt,
  };
}

/** Previsão sintética de 6h a partir de 14:00 com o código/rajada dados. */
function forecast(code: number, gust: number): OpenMeteoForecastResponse {
  const time = Array.from({ length: 6 }, (_, i) => `2026-10-08T${String(14 + i).padStart(2, '0')}:00`);
  const fill = (v: number) => time.map(() => v);
  return {
    latitude: -25.43,
    longitude: -49.27,
    timezone: 'America/Sao_Paulo',
    current: { time: time[0] } as OpenMeteoForecastResponse['current'],
    hourly: {
      time,
      weather_code: fill(code),
      wind_gusts_10m: fill(gust),
      precipitation_probability: fill(40),
      temperature_2m: fill(20),
      wind_speed_10m: fill(10),
      relative_humidity_2m: fill(70),
      apparent_temperature: fill(20),
      uv_index: fill(1),
      visibility: fill(10000),
    },
    daily: {} as OpenMeteoForecastResponse['daily'],
  };
}

describe('contrato de atributos', () => {
  it('ida e volta preserva coordenada arredondada e preferências', () => {
    const attrs = toDeviceAttributes({
      coords: { latitude: -25.43219, longitude: -49.27153 },
      locationName: 'Curitiba, PR',
      prefs: { ...ALL_ON, notifRajadas: false },
    });
    assert.equal(attrs.lat, '-25.43');
    assert.equal(attrs.lon, '-49.27');

    const parsed = fromDeviceAttributes(attrs);
    assert.deepEqual(parsed?.coords, { latitude: -25.43, longitude: -49.27 });
    assert.equal(parsed?.prefs.notifRajadas, false);
    assert.equal(parsed?.prefs.notifGranizo, true);
  });

  it('rejeita coordenadas ausentes ou inválidas', () => {
    assert.equal(fromDeviceAttributes({}), null);
    assert.equal(fromDeviceAttributes({ lat: 'abc', lon: '1' }), null);
    assert.equal(fromDeviceAttributes({ lat: '95', lon: '1' }), null);
  });
});

describe('groupByLocation', () => {
  it('agrupa usuários do mesmo ponto e ignora quem desligou alertas', () => {
    const groups = groupByLocation([
      device('a', -25.43, -49.27),
      device('b', -25.43, -49.27),
      device('c', -23.55, -46.63),
      device('d', -25.43, -49.27, { ...ALL_ON, notifSevero: false }),
    ]);

    assert.equal(groups.length, 2);
    const curitiba = groups.find((g) => g.key === '-25.43,-49.27');
    assert.deepEqual(curitiba?.subscribers.map((s) => s.userId).sort(), ['a', 'b']);
  });

  it('mesma instalação em dois registros: vale o mais recente', () => {
    const groups = groupByLocation([
      device('a', -23.55, -46.63, ALL_ON, '2026-10-01T10:00:00Z'),
      device('a', -25.43, -49.27, ALL_ON, '2026-10-05T10:00:00Z'),
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].key, '-25.43,-49.27');
  });
});

describe('planForLocation', () => {
  it('sem risco, não envia nada', () => {
    const [group] = groupByLocation([device('a', -25.43, -49.27)]);
    assert.deepEqual(planForLocation(group, forecast(1, 20)), []);
  });

  it('granizo: avisa quem quer granizo, com chave de idempotência diária', () => {
    const [group] = groupByLocation([
      device('a', -25.43, -49.27),
      device('b', -25.43, -49.27, { ...ALL_ON, notifGranizo: false }),
    ]);

    const sends = planForLocation(group, forecast(96, 30));

    assert.equal(sends.length, 1);
    assert.equal(sends[0].userId, 'a');
    assert.equal(sends[0].idempotencyKey, 'severe:a:2026-10-08:Aviso de Granizo');
    assert.equal(sends[0].data.route, '/alertas');
    assert.match(sends[0].message, /em Curitiba, PR/);
  });

  it('rajada >= 70 km/h respeita o toggle de rajadas muito fortes', () => {
    const [group] = groupByLocation([
      device('a', -25.43, -49.27, { ...ALL_ON, notifRajadasFortes: false }),
    ]);
    assert.deepEqual(planForLocation(group, forecast(3, 80)), []);
  });
});
