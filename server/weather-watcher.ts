/**
 * Vigia de clima do Sereno: roda agendado (GitHub Actions, ver
 * .github/workflows/weather-watcher.yml), avalia a previsão de cada ponto
 * inscrito e pede ao NotificationHub o push dos alertas severos — é isso que
 * faz o alerta chegar com o app FECHADO.
 *
 *   HUB_URL=https://... HUB_SECRET_KEY=... npm run watcher
 *
 * Sem as variáveis, sai sem erro (o workflow fica verde até o hub existir).
 */
import { fetchForecastBatch } from '@/services/open-meteo';

import { listSubscribedDevices, sendAlert, type HubConfig } from './hub-client';
import { groupByLocation, planForLocation } from './plan-notifications';

/** Coordenadas por chamada à Open-Meteo (a API aceita lista; isso limita o tamanho da URL). */
const FORECAST_BATCH_SIZE = 50;

async function main(): Promise<void> {
  const baseUrl = process.env.HUB_URL;
  const secretKey = process.env.HUB_SECRET_KEY;
  if (!baseUrl || !secretKey) {
    console.log('HUB_URL/HUB_SECRET_KEY não configurados — nada a fazer.');
    return;
  }
  const config: HubConfig = { baseUrl, secretKey };

  const devices = await listSubscribedDevices(config);
  const groups = groupByLocation(devices);
  console.log(`${devices.length} aparelho(s) inscrito(s) em ${groups.length} ponto(s).`);

  let sent = 0;
  let duplicates = 0;
  const failures: string[] = [];

  for (let i = 0; i < groups.length; i += FORECAST_BATCH_SIZE) {
    const batch = groups.slice(i, i + FORECAST_BATCH_SIZE);
    const forecasts = await fetchForecastBatch(batch.map((g) => g.coords));

    for (const [index, group] of batch.entries()) {
      const forecast = forecasts[index];
      if (!forecast) continue;

      for (const planned of planForLocation(group, forecast)) {
        try {
          const result = await sendAlert(config, planned);
          if (result.duplicate) duplicates++;
          else if (result.success) sent++;
          else failures.push(`${planned.userId}: status ${result.status}`);
        } catch (error) {
          failures.push(`${planned.userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  console.log(`Enviados: ${sent} · já enviados antes (idempotência): ${duplicates} · falhas: ${failures.length}`);
  if (failures.length > 0) {
    failures.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
