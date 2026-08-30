/**
 * HTML/JS embutido no WebView da tela Mapa (item #4 do feedback: "a tela de mapa não
 * é funcional"). Um WebView + Leaflet é a única forma de ter um mapa de verdade sem
 * sair do Expo Go (react-native-maps exige um dev client / build nativo customizado —
 * fora do fluxo atual do projeto).
 *
 * Camada de radar: RainViewer (https://www.rainviewer.com/api.html) — API pública,
 * gratuita, sem key, cobertura global. `weather-maps.json` devolve os frames
 * disponíveis (passado + nowcast de ~30min) como uma lista de timestamps + paths de
 * tile; cada frame vira um XYZ tile layer padrão.
 *
 * Comunicação com o RN é via `postMessage`/`injectJavaScript` (o protocolo padrão de
 * WebView): este arquivo só define funções globais (`setCenter`, `setRadarFrame`,
 * `showLayer`, `setAlert`, `setPlaces`) que a tela `mapa.tsx` invoca via
 * `injectJavaScript`, e chama `post(...)` para mandar dados de volta (frames
 * disponíveis, erros).
 */
export function buildMapHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #10151c; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  function post(type, payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
  }

  var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([-15.78, -47.93], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  var radarLayer = null;
  var alertLayer = L.layerGroup();
  var placesLayer = L.layerGroup();
  var frames = [];
  var currentLayerName = 'Radar';

  window.setCenter = function (lat, lon, zoom) {
    map.setView([lat, lon], zoom || map.getZoom());
  };

  window.setRadarFrame = function (index) {
    if (!frames.length) return;
    var i = Math.max(0, Math.min(index, frames.length - 1));
    var frame = frames[i];
    var url = 'https://tilecache.rainviewer.com' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
    var next = L.tileLayer(url, { opacity: 0.65, maxZoom: 18 });
    if (currentLayerName === 'Radar') next.addTo(map);
    if (radarLayer) map.removeLayer(radarLayer);
    radarLayer = next;
  };

  window.showLayer = function (name) {
    currentLayerName = name;
    if (radarLayer) map.removeLayer(radarLayer);
    map.removeLayer(alertLayer);
    map.removeLayer(placesLayer);
    if (name === 'Radar' && radarLayer) {
      radarLayer.addTo(map);
    } else if (name === 'Alertas') {
      alertLayer.addTo(map);
    } else if (name === 'Locais') {
      placesLayer.addTo(map);
    }
  };

  window.setAlert = function (data) {
    alertLayer.clearLayers();
    if (data && data.active) {
      var color = data.level === 'high' ? '#E53935' : data.level === 'moderate' ? '#FB8C00' : '#FDD835';
      L.circle([data.lat, data.lon], {
        radius: (data.radiusKm || 10) * 1000,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.18
      }).bindPopup(data.title).addTo(alertLayer);
    }
  };

  window.setPlaces = function (list) {
    placesLayer.clearLayers();
    (list || []).forEach(function (p) {
      L.marker([p.lat, p.lon]).bindPopup(p.name + ' — ' + p.temp + '°').addTo(placesLayer);
    });
  };

  fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var past = (data.radar && data.radar.past) || [];
      var nowcast = (data.radar && data.radar.nowcast) || [];
      frames = past.concat(nowcast);
      if (!frames.length) {
        post('error', 'Sem frames de radar disponíveis agora.');
        return;
      }
      var labels = frames.map(function (f, i) {
        var d = new Date(f.time * 1000);
        var hh = ('0' + d.getHours()).slice(-2);
        var mm = ('0' + d.getMinutes()).slice(-2);
        return { index: i, label: hh + ':' + mm, isForecast: i >= past.length };
      });
      var nowIndex = past.length > 0 ? past.length - 1 : 0;
      window.setRadarFrame(nowIndex);
      post('frames', { labels: labels, nowIndex: nowIndex });
    })
    .catch(function (e) {
      post('error', 'Falha ao carregar radar: ' + String(e));
    });

  post('ready', true);
</script>
</body>
</html>`;
}
