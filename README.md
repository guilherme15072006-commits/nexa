# NEXA

> Plataforma global de entretenimento interativo que une **apostas esportivas, gamificação, rede social e economia própria** em um único ecossistema.

NEXA não é uma bet, nem uma rede social. É um sistema fechado projetado para capturar, manter e monetizar a atenção do usuário através de um loop de comportamento:

**ver → interagir → apostar → evoluir → competir → voltar**

---

## Status do projeto

**Versão:** `0.2.0` · **Estágio:** Protótipo funcional de front-end (UI/UX completa, dados mockados)

| Camada | Estado | Observação |
|---|---|---|
| App React Native (UI/UX) | ✅ Funcional | 5 telas + navegação + design system completo |
| Estado global (Zustand) | ✅ Funcional | Store com dados mock + todas as actions |
| Mecânicas de retenção | ✅ Funcional | Check-in, missões, copy bet, quase-ganho, pressão social |
| Analytics (Amplitude) | ✅ Integrado | Funciona em modo log se sem API key |
| Linear (bug/feature tracking) | ✅ Integrado | Funciona em modo no-op se sem API key |
| API Client (`src/services/api.ts`) | 🟡 Scaffolding | Tipado e pronto, **ainda não conectado** ao app |
| Backend Edge (Cloudflare Workers) | 🟡 Esqueleto | Rotas existem, retornam dados vazios/placeholder |
| Landing page (`site/`) | ✅ Funcional | HTML/CSS estático pronto para deploy |
| CI/CD (GitHub Actions) | ✅ Configurado | Typecheck, testes, build e deploy |
| Projetos nativos (`android/`, `ios/`) | ❌ Ausentes | Precisam ser gerados para builds nativas |
| `assets/logo.png` | ⚠️ Vazio | Arquivo com 0 bytes — substituir pela arte real |

---

## O que está funcional hoje

Toda a experiência de **front-end** está implementada e operante com dados mockados. O app é navegável de ponta a ponta:

### Onboarding
- 5 passos animados com aposta simulada e XP inicial.
- Conclui chamando `completeOnboarding()` → libera as tabs.

### Feed (`FeedScreen`)
- Feed personalizado com abas **Para você / Seguindo**.
- Banner de **check-in diário** (+50 XP, +100 moedas, +1 streak) com celebração/confete.
- **Missões** com barra de progresso e gatilho de "quase-ganho" (*falta 1 missão*).
- Carrossel de **tipsters** em destaque com follow de 1 toque.
- Posts com **double-tap to like** (estilo Instagram), pick + odds, prova social (*"247 apostando agora"*).
- **Odds ao vivo** que oscilam a cada 5s (`simulateOddsChange`) com flash verde/vermelho.
- **Betslip flutuante** (estilo Bet365) com odds combinadas e botão apostar.

### Apostas (`ApostasScreen`)
- Lista de jogos ao vivo + de hoje + picks dos tipsters seguidos.
- Seleção de odds que alimenta o betslip global.
- **Missão oculta** revelada por ação do usuário.
- Confirmação de aposta com celebração e ganho de XP.

### Ranking (`RankingScreen`)
- Pódio animado (top 3) + leaderboard semanal/mensal.
- Card de temporada (season) e ranking de clãs.
- Destaque da posição do próprio usuário.

### Perfil (`PerfilScreen`)
- Hero com avatar, nível e progressão de XP.
- Carteira (saldo BRL + moedas NEXA).
- Grade de estatísticas (win rate, ROI, streak).
- **Heatmap de atividade**, grade de **conquistas/badges** por raridade e painel de missões.
- "DNA do apostador" + estado do usuário em tempo real.

### Serviços
- **Analytics:** fila com batching, flush automático, métricas de engajamento/risco de retenção. Sem `AMPLITUDE_API_KEY`, loga eventos no console em dev.
- **Linear:** cria issues de bug/feature/performance e **alertas de jogo responsável** automaticamente. Sem API key, opera em modo no-op.
- **Jogo responsável:** `detectUserState()` classifica o usuário (`motivated/frustrated/impulsive/disengaged`) e aciona alerta no Linear quando `frustrated`.

---

## O que ainda não está pronto

- **Persistência real:** o app consome `MOCK_*` direto do store. Não há chamadas de rede ativas — `src/services/api.ts` está tipado mas **não é importado** por nenhuma tela.
- **Backend:** os Workers (`workers/index.ts`) têm o roteador e as rotas, mas retornam arrays vazios / placeholders. Faltam KV, D1, R2 e Durable Objects (comentados no `wrangler.toml`).
- **Builds nativas:** não existem as pastas `android/` e `ios/`, então `run-android`/`run-ios` e o job de APK no CI falharão até que os projetos nativos sejam gerados.
- **Asset de logo:** `assets/logo.png` está vazio (0 bytes).
- **Auth/KYC, carteira real, Pix/cartão, WebSocket de odds:** definidos no contrato da API, mas não implementados.

---

## Stack

- **React Native** 0.73.4 (iOS + Android) · **React** 18.2
- **TypeScript** estrito (5.0.4)
- **Zustand** 4.5 — estado global (`src/store/nexaStore.ts`)
- **React Navigation** 6 (bottom-tabs)
- **Amplitude** — analytics
- **Cloudflare Workers** — backend edge (`workers/`)
- **Vercel** — landing page (`site/`)
- **Jest** + **ts-jest** — testes

---

## Estrutura de arquivos

```
App.tsx                          → entry point (splash → onboarding ou tabs)
src/
  theme/index.ts                 → cores, tipografia, espaçamento, sombras, animações
  store/nexaStore.ts             → estado global + actions (fonte de verdade)
  components/
    ui.tsx                       → biblioteca de componentes (Avatar, OddsBtn, Card, XPBar…)
    Logo.tsx                     → logo da marca
  navigation/TabNavigator.tsx    → tab bar com 4 abas
  screens/
    OnboardingScreen.tsx         → 5 passos animados
    FeedScreen.tsx               → feed, check-in, missões, tipsters, posts
    ApostasScreen.tsx            → apostas ao vivo, betslip, missão oculta
    RankingScreen.tsx            → leaderboard + clãs
    PerfilScreen.tsx             → stats, conquistas, carteira, DNA
  services/
    api.ts                       → client HTTP tipado (scaffolding p/ backend)
    analytics.ts                 → integração Amplitude
    linear.ts                    → integração Linear (bugs/features/jogo responsável)
  utils/index.ts                 → formatadores (número, odds, moeda)
workers/index.ts                 → Cloudflare Workers Edge API (esqueleto)
site/index.html                  → landing page estática
__tests__/                       → testes de store e estrutura
```

---

## Como rodar

### Pré-requisitos
- Node.js >= 18
- (Para builds nativas) Ambiente React Native configurado: Xcode / Android Studio

### Instalação

```bash
npm install
cp .env.example .env   # preencha as chaves que for usar (opcional em dev)
```

### Desenvolvimento do app

```bash
npm start              # inicia o Metro bundler
npm run ios            # roda no iOS    (requer pasta ios/  — ver nota abaixo)
npm run android        # roda no Android (requer pasta android/ — ver nota abaixo)
```

> **Nota:** as pastas nativas `android/` e `ios/` ainda não foram geradas neste repositório. Para builds nativas, gere-as a partir de um template React Native 0.73 antes de rodar `run-ios`/`run-android`.

### Qualidade

```bash
npm run typecheck      # tsc --noEmit
npm test               # jest (74 testes)
```

### Backend (Cloudflare Workers)

```bash
npm run workers:dev    # wrangler dev
npm run workers:deploy # wrangler deploy
```

### Landing page

```bash
npm run site:dev       # serve o site/ localmente
npm run site:deploy    # vercel --prod
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env`. Todas são **opcionais em desenvolvimento** — os serviços operam em modo log/no-op quando ausentes.

| Variável | Uso |
|---|---|
| `AMPLITUDE_API_KEY` | Envio de eventos de analytics |
| `LINEAR_API_KEY` / `LINEAR_TEAM_ID` / `LINEAR_PROJECT_ID` | Criação de issues no Linear |
| `LINEAR_LABEL_*` | IDs de labels para classificar issues |
| `NEXA_API_URL` / `NEXA_CDN_URL` / `NEXA_WS_URL` | Endpoints do backend NEXA |
| `CLOUDFLARE_*` | Deploy dos Workers |
| `VERCEL_*` | Deploy da landing page |

---

## Design system (regras obrigatórias)

- **Tema escuro sempre.** Fundo `#0D0B14`, cards `#16131F`.
- **Cor da marca:** roxo `#7C5CFC`. Acentos: gold, green, red, orange.
- **Bordas:** sempre `0.5px` (exceto item featured: `2px`).
- **Border radius:** `radius.lg` (14) em cards, `radius.full` em pills.
- **Tipografia:** SpaceGrotesk (títulos), Inter (corpo), JetBrainsMono (números/odds).
- Sempre usar as variáveis de `src/theme/index.ts` e os componentes de `src/components/ui.tsx`.

---

## Mecânicas psicológicas (núcleo — nunca remover)

| Mecânica | Onde |
|---|---|
| Pressão social (*"247 apostando agora"*) | Feed, Apostas |
| Quase-ganho (*"falta 1 missão"*) | Feed, Ranking, Perfil |
| Check-in diário (+XP, +moedas, streak) | Feed |
| Missão oculta | Apostas |
| Copy bet (1 toque) | Feed, Apostas |
| Raridade de badges | Perfil |
| DNA + estado do usuário em tempo real | Perfil / Store |
| Detecção defensiva de estado (`detectUserState`) | Store |

---

## Compliance e jogo responsável

Requisitos obrigatórios para produção (parcialmente preparados):

- KYC obrigatório e verificação de idade (+18) antes do primeiro depósito real.
- `detectUserState()` aciona alerta de jogo responsável quando o estado é `frustrated`.
- Limites de depósito configuráveis por usuário.
- Separação legal: NEXA Entertainment (holding) → módulo de apostas licenciado.
- Logs de auditoria para todas as transações financeiras.

---

## Roadmap (próximas telas)

**Alta prioridade:** `LiveScreen`, `TipsterProfileScreen`, `BetslipScreen`, `WalletScreen`, `NotificationsScreen`
**Média:** `ClanScreen`, `MarketplaceScreen`, `SearchScreen`, `SettingsScreen`
**Futuro:** `NexaPlayScreen` (PvP), `SeasonScreen`

Além das telas, os próximos passos técnicos são: conectar `api.ts` ao store, implementar o backend nos Workers (KV/D1/R2), gerar os projetos nativos e adicionar a arte do logo.

---

## Testes

```bash
npm test
```

- `__tests__/store.test.ts` — valida todas as actions do Zustand (XP, check-in, like, copy bet, follow, betslip, onboarding…).
- `__tests__/structure.test.ts` — valida a estrutura de pastas, resolução de imports e regressões de bugs conhecidos.

Estado atual: **74 testes passando**, typecheck limpo.
