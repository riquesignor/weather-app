# Weather Alert App - Especificação Técnica & Roadmap
**Platform:** Android (React Native) | **Focus:** Severe Weather Alerts (Granizo, Tornados, Rajadas)

---

## 1. ROADMAP DE PROJETO

### Phase 1: MVP (Semanas 1-4)
- Autenticação básica
- Tela de previsão atual
- Tela de alertas severos
- Notificações push
- Integração OpenWeatherMap + NOAA/INMET

### Phase 2: Enhanced UX (Semanas 5-8)
- Gráficos de severidade (radar visual)
- Histórico de alerts
- Múltiplas localizações (favoritos)
- Compartilhamento de alertas
- Dark mode

### Phase 3: Advanced Features (Semanas 9-12)
- Machine learning para previsão local refinada
- Integração com sirenes de alerta (se disponível na região)
- Analytics de padrões climáticos
- Offline-first (cache estratégico)

---

## 2. ARQUITETURA DE TELAS

### 2.1 Home Screen (Dashboard)
**Objetivo:** Visão geral rápida do clima atual + alertas críticos

```
┌─────────────────────────┐
│ [≡] Location Selector   │  ← Header com localização
├─────────────────────────┤
│  CURRENT CONDITIONS     │
│  ┌───────────────────┐  │
│  │ 28°C  Partly      │  │
│  │       Cloudy      │  │
│  │ 🌧️  Umid: 65%    │  │
│  └───────────────────┘  │
├─────────────────────────┤
│ 🚨 SEVERE ALERTS (if)   │  ← Red card se houver alert
│ ⚠️ Granizo esperado     │
│ 📍 Próximas 2h          │
├─────────────────────────┤
│ PRÓXIMAS 24h (Scroll)   │
│ Hora │ Temp │ Precipit │
│ 14h  │ 29°C │ ▓▓▓ 60%  │
│ 15h  │ 28°C │ ████ 80% │
│ 16h  │ 26°C │ ███ 50%  │
├─────────────────────────┤
│ [Weekly] [Alerts] [Map] │  ← Bottom nav
└─────────────────────────┘
```

**Componentes Técnicos:**
- Shimmer loading para dados em fetch
- Swipe para refresh
- Geolocalização automática ao abrir

---

### 2.2 Severe Weather Alert Screen
**Objetivo:** Detalhamento de alertas críticos com timeline

```
┌──────────────────────────┐
│ ⚠️  SEVERE WEATHER ALERT  │
├──────────────────────────┤
│ Tornado Watch Active     │
│ Level: HIGH (Amarelo)    │
│ ┌────────────────────┐   │
│ │ Vigência: 14:30-  │   │
│ │ 17:30              │   │
│ └────────────────────┘   │
├──────────────────────────┤
│ DETALHES                 │
│ • Velocidade vento: 70km │
│ • Probabilidade: 85%     │
│ • Raio afetado: 30km     │
│ • Granizo: Sim           │
├──────────────────────────┤
│ RECOMENDAÇÕES            │
│ ✓ Evitar áreas abertas   │
│ ✓ Prender objetos        │
│ ✓ Shelter indoor         │
├──────────────────────────┤
│ [Share] [Notif. ON]      │
└──────────────────────────┘
```

**Componentes Técnicos:**
- Cards color-coded por severidade (Red/Orange/Yellow)
- Timeline de validade com countdown
- Push notification trigger automático

---

### 2.3 Hourly Detailed Screen
**Objetivo:** Previsão hora-a-hora com indicadores de severidade

```
┌──────────────────────────┐
│ Previsão Detalhada       │
├──────────────────────────┤
│ 13:00 → 14:00            │
│ ┌────────────────────┐   │
│ │ Temp: 29°C         │   │
│ │ Sensação: 35°C     │   │
│ │ Umidade: 70%       │   │
│ │ Vento: 35km/h ➡️   │   │
│ │ Precipitação: 40%  │   │
│ │ Granizo: ⚠️ Sim    │   │
│ │ Tornado Risk: 🔴   │   │
│ └────────────────────┘   │
├──────────────────────────┤
│ 14:00 → 15:00            │
│ [Similar card...]        │
└──────────────────────────┘
```

---

### 2.4 Favorites/Locations Screen
**Objetivo:** Gerenciar múltiplas localizações monitoradas

```
┌──────────────────────────┐
│ Minhas Localizações      │
├──────────────────────────┤
│ ★ São Paulo, SP          │
│   📍 Atual: 28°C         │
│   ⚠️ Sem alertas          │
├──────────────────────────┤
│   Brasília, DF           │
│   📍 Atual: 26°C         │
│   🚨 Tornado Watch       │
├──────────────────────────┤
│ [+] Add Location         │
└──────────────────────────┘
```

---

### 2.5 Weather Map Screen
**Objetivo:** Visualização geoespacial de alertas

```
Integração: react-native-maps + overlay de radarWeather API
- Camadas: Radar, Alertas, Suas localizações
- Tap em alerta = detalhe quick
```

---

### 2.6 Settings Screen
**Objetivo:** Configurações de notificações e preferências

```
┌──────────────────────────┐
│ Configurações            │
├──────────────────────────┤
│ NOTIFICAÇÕES             │
│ ☑ Alertas Severos        │
│ ☑ Avisos de Granizo      │
│ ☑ Avisos de Tornado      │
│ ☑ Avisos de Rajadas      │
│ Volume: [=====>] Alta    │
├──────────────────────────┤
│ PRIVACIDADE              │
│ ☑ Localização contínua   │
│ Freq. update: 30min      │
│ ☑ Dados anônimos         │
├──────────────────────────┤
│ TEMA                     │
│ ● Automático ○ Escuro    │
├──────────────────────────┤
│ SOBRE                    │
│ Versão: 1.0.0            │
└──────────────────────────┘
```

---

## 3. PERMISSÕES ANDROID

```xml
<!-- AndroidManifest.xml -->

<!-- CORE PERMISSIONS -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- LOCATION -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- NOTIFICATIONS -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />

<!-- BACKGROUND EXECUTION -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

<!-- STORAGE (para cache/histórico) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- VIBRATION (para alertas críticos) -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- CALL LOGS (opcional - para integração com sirenes) -->
<!-- <uses-permission android:name="android.permission.READ_CALL_LOG" /> -->
```

**Runtime Permissions Strategy:**
```typescript
// Solicitação progressiva
- Localização: Na primeira abertura
- Notificações: Após primeira previsão carregada
- Armazenamento: Quando usuário salva favorito
```

---

## 4. SISTEMA DE NOTIFICAÇÕES

### 4.1 Tipos de Notificação

| Tipo | Trigger | Prioridade | Sound | Vibração |
|------|---------|-----------|-------|----------|
| **Critical Alert** | Tornado/Granizo detectado | 🔴 MAX | Sim | Padrão SOS |
| **Weather Alert** | Wind gusts > 60km | 🟠 HIGH | Sim | 2 pulsos |
| **Update** | Previsão mudou | 🟡 NORMAL | Não | 1 pulso |
| **Reminder** | Hora checagem automática | ⚪ LOW | Não | Não |

### 4.2 Implementação (Firebase Cloud Messaging)

```typescript
// Estrutura de payload
{
  "notification": {
    "title": "⚠️ Alerta de Tornado",
    "body": "Tornado watch ativo por 3h em SP",
    "sound": "severe_alert"
  },
  "data": {
    "alertId": "tor_20240315_sp",
    "severity": "high",
    "lat": "-23.5505",
    "lon": "-46.6333",
    "expiresAt": "1710516600000"
  },
  "android": {
    "priority": "high",
    "ttl": "3600s",
    "notification": {
      "channel_id": "severe_weather",
      "ticker": "🚨 Severe Weather Alert",
      "default_vibrate_timings": true,
      "default_sound": true,
      "color": "#FF0000"
    }
  }
}
```

### 4.3 Background Tasks (Scheduled Updates)

```typescript
// react-native-background-fetch
BackgroundFetch.configure(
  {
    minimumFetchInterval: 30, // 30 min
    stopOnTerminate: false,
    enableHeadless: true,
  },
  async (taskId) => {
    await checkForSevereAlerts() // Fetch NOAA/INMET
    BackgroundFetch.finish(taskId)
  }
)
```

---

## 5. DESIGN SYSTEM & UI GUIDELINES

### 5.1 Paleta de Cores

```
PRIMARY:
- #1E88E5 (Azul principal - céu)

SEVERITY INDICATORS:
- 🔴 #D32F2F (Crítico - Tornado/Granizo)
- 🟠 #F57C00 (Alto - Vento forte)
- 🟡 #FBC02D (Moderado - Chuva)
- 🟢 #388E3C (Baixo)
- ⚪ #78909C (Normal)

BACKGROUNDS:
- Light: #FAFAFA
- Dark: #121212
- Surface: #FFFFFF (Light) / #1E1E1E (Dark)

TEXT:
- Primary: #212121
- Secondary: #757575
- Disabled: #BDBDBD
```

### 5.2 Tipografia

```
Headings:
- H1: 32px, Bold, #212121
- H2: 24px, Semi-Bold
- H3: 20px, Semi-Bold

Body:
- Regular: 16px, 400 weight, 1.5 line-height
- Small: 14px, 400 weight
- Caption: 12px, 500 weight

Font Family: Inter / Roboto (Fallback)
```

### 5.3 Componentes Reutilizáveis

```typescript
// Components library structure
├── Alert/
│   ├── SevereWeatherCard.tsx
│   ├── AlertTimeline.tsx
│   └── AlertBadge.tsx
├── Weather/
│   ├── CurrentWeatherWidget.tsx
│   ├── HourlyForecast.tsx
│   └── WeatherIcon.tsx
├── Common/
│   ├── LocationHeader.tsx
│   ├── LoadingShimmer.tsx
│   ├── ErrorBoundary.tsx
│   └── BottomSheet.tsx
└── Maps/
    └── WeatherMap.tsx
```

### 5.4 Animações & Transições

```typescript
// Micro-interactions
- Alert appearance: Slide-in (300ms, easeOut)
- Temperature changes: Pulse effect (500ms)
- Map zoom: Spring animation (damping: 0.8)
- Loading: Shimmer effect (1.5s infinite)
- Navigation: Fade + Scale (250ms)
```

---

## 6. STACK TÉCNICO RECOMENDADO

### Backend
```
- Node.js + Express (API aggregation)
- OpenWeatherMap SDK + NOAA API client + INMET parser
- Redis (cache: 5min para normal, 1min para alerts)
- Firebase Admin SDK (FCM push notifications)
- PostgreSQL (histórico de alertas + user preferences)
```

### Mobile (React Native)
```
Dependencies críticas:
- react-native-maps (maps)
- react-native-geolocation-service (GPS)
- @react-navigation/native (routing)
- zustand (state management - mais leve que Redux)
- @react-native-firebase/messaging (FCM)
- react-native-svg (ícones/gráficos)
- react-native-linear-gradient (UI enhancement)
- axios (HTTP client)
- react-query (data fetching + caching)
```

### Development
```
- TypeScript (strict mode)
- ESLint + Prettier
- Jest + @testing-library/react-native
- Detox (E2E testing)
- Sentry (error tracking)
```

---

## 7. FLUXO DE DADOS & ESTADO

```
                    ┌─────────────────┐
                    │  Cloud Backend  │
                    │ (API Aggregator)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
          NOAA API    OpenWeatherMap   INMET API
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │   FCM Service   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼──────┐      ┌──────▼──────┐      ┌────▼─────┐
    │  Zustand │      │   AsyncStorage  │      │  HomeScreen│
    │  Store   │      │   (Offline)     │      │  (UI)      │
    └───┬──────┘      └──────┬──────┘      └────┬─────┘
        │                    │                   │
        └────────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  useLocationState│
                    │  + useWeatherData│
                    └─────────────────┘
```

---

## 8. CHECKLIST DE IMPLEMENTAÇÃO

### Sprint 1: Setup & Auth
- [ ] Inicializar RN project (Expo ou native)
- [ ] Configurar TypeScript + ESLint
- [ ] Setup Firebase (FCM + Auth)
- [ ] Criar screens básicas (navegação)
- [ ] Implementar geolocalização

### Sprint 2: Weather Integration
- [ ] Integrar OpenWeatherMap
- [ ] Integrar NOAA (ou INMET se BR)
- [ ] Criar CurrentWeatherScreen
- [ ] Implementar data refresh logic
- [ ] Setup Redis cache backend

### Sprint 3: Alerts & Notifications
- [ ] Criar SevereAlertScreen
- [ ] Implementar FCM notifications
- [ ] Background fetch setup
- [ ] Alert comparison logic
- [ ] Testing em device real

### Sprint 4: UX Polish
- [ ] Implementar Map screen
- [ ] Dark mode toggle
- [ ] Animations & transitions
- [ ] Favorites management
- [ ] Settings screen

### Sprint 5: Production Ready
- [ ] Performance optimization
- [ ] Sentry integration
- [ ] Beta testing (TestFlight/Play Console)
- [ ] App store submission
- [ ] Documentation

---

## 9. CONSIDERAÇÕES DE PERFORMANCE

### Bundle Size Target: < 35MB
```
- Usar react-native-svg em vez de PNG para ícones
- Code splitting para screens não-críticas
- Lazy load maps component
- Minify assets
```

### Memory Management
```typescript
// Cleanup em unmount
useEffect(() => {
  return () => {
    locationListener?.remove()
    notificationListener?.remove()
  }
}, [])
```

### API Rate Limiting
```
- OpenWeatherMap: 60 calls/min (free tier)
- NOAA: Unlimited
- Implementar request debouncing (2 seg entre calls)
- Cache agressivo para dados não-críticos
```

---

## 10. TESTING STRATEGY

```typescript
// Unit Tests (Jest)
- Weather data parsing
- Alert severity calculation
- Notification payload generation

// Integration Tests
- API response handling
- State management updates
- Database caching

// E2E Tests (Detox)
- User flow: Open → Detect location → View alerts
- Notification appearance
- Navigation between screens
```

---

**Próximos Passos:**
1. Definir qual região (Brasil/EUA/Global)
2. Escolher backend deployment (AWS/Vercel/Railway)
3. Configurar Firebase project
4. Validar com INMET/NOAA se Brasil/US
