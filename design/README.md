# Design — Weather Alert App

Protótipo estático (clicável) das telas do app, exportado do Claude Design.
Serve como referência visual para a implementação das telas em `src/app/` e `src/components/`.

## Conteúdo

- `weather-app.dc.html` — documento principal do protótipo (Home/Hoje, Semanal, Alertas, Mapa, Configurações, temas claro/escuro).
- `android-frame.jsx` — componente de moldura de dispositivo Android (Material 3), carregado via `x-import` pelo `weather-app.dc.html`.
- `support.js` — runtime do Design Components (carrega React/ReactDOM/Babel via CDN em tempo de execução).
- `preview.webp` — thumbnail estático do protótipo.

## Como visualizar

Este bundle depende de `fetch()` para carregar `android-frame.jsx` e os scripts do CDN (unpkg + Google Fonts), então **precisa ser servido via HTTP** — abrir o `.html` direto com `file://` não funciona (bloqueio de CORS do navegador) e exige conexão com a internet.

A partir desta pasta:

```bash
# opção 1
npx serve .

# opção 2
python3 -m http.server 8080
```

Depois abra `http://localhost:<porta>/weather-app.dc.html` no navegador.

## Referência

Ver `docs/weather_app_project_spec.md` para a especificação técnica completa (roadmap, permissões Android, sistema de notificações, stack técnico recomendado).
