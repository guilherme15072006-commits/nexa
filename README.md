# NEXA

> Plataforma global de entretenimento interativo que une **apostas esportivas, gamificação, rede social e economia própria** em um único ecossistema.

A NEXA não é uma bet, nem uma rede social. É um sistema fechado projetado para capturar, manter e monetizar a atenção do usuário através de um loop de comportamento:

**ver → interagir → apostar → evoluir → competir → voltar**

---

## Status do projeto

**Versão:** `0.2.0` · **Estágio:** Protótipo funcional de front-end (UI/UX completa, dados mockados)

> Verificado nesta análise: `tsc --noEmit` passa **limpo** e os **84 testes passam**.

| Camada | Estado | Observação |
|---|---|---|
| App React Native (UI/UX) | ✅ Funcional | 5 telas + navegação + design system completo |
| Estado global (Zustand) | ✅ Funcional | Store sem mocks de leitura — tudo vem do Supabase |
| **Dados reais (Supabase)** | 🟢 Fases 1–3 | **Matches, Feed, Tipsters, Missões, Clãs, Leaderboard e o Usuário** vêm do Postgres. Falta só persistir as escritas (Fase 4) |
| Mecânicas de retenção | ✅ Funcional | Check-in, missões, copy bet, quase-ganho, pressão social |
| Analytics (Amplitude) | ✅ Integrado | Usado pelo store; modo log se sem API key |
| Linear (bug/feature/jogo responsável) | ✅ Integrado | Usado pelo store; modo no-op se sem API key |
| API Client (`src/services/api.ts`) | 🟡 Scaffolding | Tipado e pronto, **não importado por nenhuma tela** (legado; o backend ativo é o Supabase) |
| Backend Edge (Cloudflare Workers) | 🟡 Esqueleto | 8 rotas existem, retornam vazio/placeholder |
| Landing page (`site/`) | ✅ Funcional | HTML/CSS estático pronto para Vercel |
| Preview do app (`preview/`) | ✅ Funcional | Maquete HTML navegável + screenshots |
| CI/CD (GitHub Actions) | ✅ Configurado | Typecheck, testes, build e deploy |
| Projetos nativos (`android/`, `ios/`) | ❌ Ausentes | Precisam ser gerados para builds nativas |
| `assets/logo.png` | ⚠️ Vazio | Arquivo com 0 bytes — substituir pela arte real |

---

## O que está funcional hoje

Toda a experiência de **front-end** está implementada e o app é navegável de ponta a ponta.

> **Migração de dados (em andamento):** os mocks estão sendo substituídos por dados reais do **Supabase** (Postgres), carregados no mount via `App.tsx → hydrate()` (camada em `src/services/supabase.ts`).
> - **Fase 1 ✅** — `matches` e `feed_posts`.
> - **Fase 2 ✅** — `tipsters`, `missions`, `clans` (lista do ranking) e `leaderboard` (derivado de `users`).
> - **Fase 3 ✅** — usuário logado real, carregado por **id fixo** (`SUPABASE_DEMO_USER_ID`) de uma linha em `users`. Auth (login) foi **adiado**.
> - **Pendente (Fase 4)** — persistir escritas (like/copy/bet/follow, check-in/XP) e o progresso de missões por usuário (`user_missions`); hoje ainda alteram só o estado local.

### Onboarding (`OnboardingScreen`)
- 5 passos animados (boas-vindas → aposta simulada → missão desbloqueada → tipsters → entrada).
- Concede **+100 XP** durante o fluxo (`addXP`) e conclui com `completeOnboarding()`, liberando as tabs.
- Botão de pular, progress dots, entrada animada de ícone e celebração de XP.

### Feed (`FeedScreen`)
- Top bar com **streak**, contador de **XP** animado e avatar; barra de XP do nível abaixo.
- Abas **Para você / Seguindo** (filtra por quem o usuário segue).
- **Trending bar**: contagem de jogos ao vivo + total apostando.
- Banner de **check-in diário** — `claimCheckin()` dá +50 XP, +100 moedas e +1 streak, com celebração/confete.
- **Missão** com barra de progresso e gatilho de quase-ganho (*"falta 1 missão"*) + timer de expiração.
- Carrossel de **tipsters** em destaque com follow de 1 toque (`followTipster`).
- Posts com **double-tap to like** (estilo Instagram), pick + odds, prova social (*"247 apostando agora"*) e **copy bet** (`copyBet`, +10 XP).
- **Odds ao vivo** que oscilam a cada 5s (`simulateOddsChange`) com flash verde/vermelho.
- **Betslip flutuante** (estilo Bet365) com odds combinadas e botão apostar.
- Partículas ambientes de fundo e pull-to-refresh.

### Apostas (`ApostasScreen`)
- Seções: **"X jogos ao vivo"**, **"Jogos de hoje"** e **"Apostas dos tipsters que você segue"**.
- Cards de jogo com placar ao vivo, minuto, odds 1/X/2 selecionáveis e prova social.
- **Missão oculta** revelada por ação do usuário (curiosidade/descoberta).
- Betslip com `placeBet()` / `clearBetslip()`, confirmação com celebração e +20 XP.

### Ranking (`RankingScreen`)
- **Pódio** animado dos top 3 com coroas (ouro/prata/bronze).
- **Leaderboard** semanal/mensal com a posição do próprio usuário destacada e gatilho de quase-ganho.
- **Season card** (temporada com recompensas) e **ranking de clãs**.

### Perfil (`PerfilScreen`)
- Hero com avatar, **DNA do apostador** (`aggressive`/`conservative`/`analytical`) e **estado** em tempo real.
- Progressão de nível com "faltam X XP" e prévia de recompensas.
- **Carteira**: saldo (R$) + moedas NEXA.
- **Grade de estatísticas** (win rate, ROI, streak, ranking), **heatmap de atividade**, **grade de badges** por raridade (common/rare/epic/legendary) e painel de missões.

### Serviços
- **Analytics** (`analytics.ts`): fila com batching, flush automático, métricas de engajamento e risco de retenção. Sem `AMPLITUDE_API_KEY`, loga eventos no console em dev.
- **Linear** (`linear.ts`): cria issues de bug/feature/performance e **alertas de jogo responsável** automaticamente. Sem API key, opera em modo no-op.
- **Jogo responsável:** `detectUserState()` classifica o usuário (`motivated`/`frustrated`/`impulsive`/`disengaged`) e dispara alerta no Linear quando `frustrated`.

---

## O que ainda não está pronto

- **Migração de dados:** as leituras (Matches, Feed, Tipsters, Missões, Clãs, Leaderboard e Usuário) já vêm do Supabase (Fases 1–3). **Pendente (Fase 4):** persistir as escritas (like/copy/bet/follow, check-in/XP) e o progresso de missões por usuário — hoje ainda só alteram o estado local. **Auth/login adiado:** o usuário é carregado por id fixo (`SUPABASE_DEMO_USER_ID`).
- **Legado:** `src/services/api.ts` (client REST para `api.nexa.bet`) continua tipado mas **não é usado** — o backend ativo passou a ser o Supabase.
- **Backend:** os Workers (`workers/index.ts`) têm o roteador e as rotas, mas retornam arrays vazios / placeholders. KV, D1, R2 e Durable Objects estão comentados no `wrangler.toml`.
- **Builds nativas:** não existem as pastas `android/` e `ios/`, então `run-android`/`run-ios` e o job de APK no CI falharão até que os projetos nativos sejam gerados.
- **Asset de logo:** `assets/logo.png` está vazio (0 bytes).
- **Auth/KYC, carteira real, Pix/cartão, WebSocket de odds:** definidos no contrato da API, mas não implementados.

---

## Stack

- **React Native** 0.73.4 (iOS + Android) · **React** 18.2.0
- **TypeScript** estrito (5.0.4)
- **Zustand** 4.5 — estado global (`src/store/nexaStore.ts`)
- **React Navigation** 6 (bottom-tabs) + react-native-screens / safe-area-context
- **react-native-reanimated** 3.7 · **@shopify/flash-list** · **react-native-linear-gradient**
- **Supabase** (`@supabase/supabase-js` 2) — backend de dados (Postgres) ativo
- **Amplitude** (`@amplitude/analytics-react-native`) — analytics
- **Cloudflare Workers** (Wrangler 3) — backend edge legado (`workers/`)
- **Vercel** — landing page (`site/`)
- **Jest** 29 + **ts-jest** — testes

---

## Estrutura de arquivos

```
App.tsx                          → entry point (splash → onboarding ou tabs)
src/
  theme/index.ts                 → cores, tipografia, espaçamento, sombras, animações, glass
  store/nexaStore.ts             → estado global + actions (fonte de verdade, dados mock)
  components/
    ui.tsx                       → biblioteca de componentes (Avatar, OddsBtn, Card, XPBar…)
    Logo.tsx                     → logo da marca
  navigation/TabNavigator.tsx    → tab bar com 4 abas
  screens/
    OnboardingScreen.tsx         → 5 passos animados
    FeedScreen.tsx               → feed, check-in, missões, tipsters, posts
    ApostasScreen.tsx            → apostas ao vivo, betslip, missão oculta
    RankingScreen.tsx            → leaderboard + clãs + temporada
    PerfilScreen.tsx             → stats, conquistas, carteira, DNA
  services/
    supabase.ts                  → cliente Supabase + mapeamento DB→tipos (matches + feed) [ATIVO]
    api.ts                       → client HTTP legado (não usado — substituído pelo Supabase)
    analytics.ts                 → integração Amplitude (usado pelo store)
    linear.ts                    → integração Linear (usado pelo store)
  utils/index.ts                 → formatadores (número, odds, moeda, clamp)
workers/index.ts                 → Cloudflare Workers Edge API (esqueleto)
site/index.html                  → landing page estática (Vercel)
preview/                         → maquete HTML navegável do app + screenshots
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

### Scripts disponíveis (`package.json`)

| Script | Comando | O que faz |
|---|---|---|
| `npm start` | `react-native start` | Inicia o Metro bundler |
| `npm run ios` | `react-native run-ios` | Roda no iOS *(requer pasta `ios/`)* |
| `npm run android` | `react-native run-android` | Roda no Android *(requer pasta `android/`)* |
| `npm run typecheck` | `tsc --noEmit` | Checagem de tipos |
| `npm test` | `jest` | Roda os testes (84 testes) |
| `npm run workers:dev` | `wrangler dev` | Backend Workers local |
| `npm run workers:deploy` | `wrangler deploy` | Deploy do backend |
| `npm run site:dev` | `npx serve site` | Serve a landing page local |
| `npm run site:deploy` | `vercel --prod` | Deploy da landing page |

> **Nota:** as pastas nativas `android/` e `ios/` ainda não foram geradas neste repositório. Para builds nativas, gere-as a partir de um template React Native 0.73 antes de rodar `run-ios`/`run-android`.

---

## Preview do app (sem ambiente React Native)

Para visualizar a interface sem montar o ambiente RN, há uma **maquete fiel em HTML**:

- **`preview/index.html`** — arquivo único, sem dependências. Abra no navegador (duplo-clique) e navegue entre as 4 abas; curtir, copiar aposta, seguir tipster, check-in e seleção de odds funcionam, e as odds ao vivo oscilam a cada 5s.
- **`preview/shot.js`** — script Puppeteer que gera os screenshots de cada tela (`preview/*.png`). O Puppeteer não está versionado nas dependências do projeto; instale-o sob demanda (`npm i -D puppeteer`) para regenerar as imagens.

> O preview é uma maquete de visualização — o app real roda em React Native. Cores, tipografia, telas e mecânicas batem 1:1 com o código em `src/screens/`.

---

## Variáveis de ambiente

Copie `.env.example` para `.env`. Todas são **opcionais em desenvolvimento** — os serviços operam em modo log/no-op quando ausentes.

| Variável | Uso |
|---|---|
| `AMPLITUDE_API_KEY` | Envio de eventos de analytics |
| `LINEAR_API_KEY` / `LINEAR_TEAM_ID` / `LINEAR_PROJECT_ID` | Criação de issues no Linear |
| `LINEAR_LABEL_*` | IDs de labels para classificar issues |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Backend de dados (Postgres). Chaves públicas, protegidas por RLS — já têm fallback embutido no código |
| `SUPABASE_DEMO_USER_ID` | Id fixo do usuário "logado" enquanto o auth está adiado (Fase 3) |
| `NEXA_API_URL` / `NEXA_CDN_URL` / `NEXA_WS_URL` | Endpoints do backend NEXA (legado) |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Deploy dos Workers |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Deploy da landing page |

---

## Backend (Cloudflare Workers)

Roteador próprio em `workers/index.ts` com edge caching. **Todas as rotas hoje retornam dados vazios ou placeholders** — falta conectar persistência.

| Método | Rota | Retorno atual |
|---|---|---|
| GET | `/v1/health` | `{ status: 'ok', service, timestamp }` |
| GET | `/v1/matches/live` | `[]` (com cache de 5s) |
| GET | `/v1/feed` | `[]` (com paginação) |
| POST | `/v1/bets` | `{ betId, xpGained: 20, status: 'confirmed' }` |
| POST | `/v1/missions/checkin` | `{ xp: 50, coins: 100, streak: 1 }` |
| GET | `/v1/leaderboard` | `[]` (com cache de 60s) |
| GET | `/v1/wallet/balance` | `{ brl: 0, coins: 0 }` |
| POST | `/v1/wallet/deposit` | `{ transactionId, status: 'pending' }` |

Infra preparada mas comentada no `wrangler.toml`: KV (`ODDS_CACHE`, `SESSION_STORE`), D1 (`DB`), R2 (`ASSETS`), Durable Objects (`LIVE_ODDS`) e rate limiting.

---

## CI/CD (GitHub Actions)

Pipeline em `.github/workflows/ci.yml` (Node 20), dispara em push para `main`/`develop` e PRs para `main`:

1. **quality** — `tsc --noEmit`
2. **test** — `npm test -- --ci --coverage` (depende de quality; sobe artefato de cobertura)
3. **build-android** — `gradlew assembleRelease` *(só em `main`; **falha enquanto `android/` não existir**)*
4. **deploy-site** — deploy na Vercel *(só em `main`)*
5. **deploy-api** — deploy dos Workers na Cloudflare *(só em `main`)*

---

## Design system (regras obrigatórias)

- **Tema escuro sempre.** Fundo `#0D0B14`, cards `#16131F`, elevados `#1E1A2E`.
- **Cor da marca:** roxo `#7C5CFC`. Acentos: gold `#F5C842`, green `#00C896`, red `#FF4D6A`, orange `#FF8C42`.
- **Bordas:** sempre `0.5px` (exceto item featured: `2px`).
- **Border radius:** `radius.lg` (14) em cards, `radius.full` em pills.
- **Tipografia:** SpaceGrotesk (títulos), Inter (corpo), JetBrainsMono (números/odds).
- Sempre usar as variáveis de `src/theme/index.ts` e os componentes de `src/components/ui.tsx` antes de criar novos.

---

## Mecânicas psicológicas (núcleo — nunca remover)

| Mecânica | Onde |
|---|---|
| Pressão social (*"247 apostando agora"*) | Feed, Apostas |
| Quase-ganho (*"falta 1 missão"* / *"quase subiu de nível"*) | Feed, Ranking, Perfil |
| Check-in diário (+XP, +moedas, streak) | Feed |
| Missão oculta | Apostas |
| Copy bet (1 toque, +10 XP) | Feed, Apostas |
| Raridade de badges | Perfil |
| DNA + estado do usuário em tempo real | Perfil / Store |
| Narrativa (*"sequência incrível"*, *"melhor semana"*) | Feed |
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

## Roadmap

**Alta prioridade:** `LiveScreen`, `TipsterProfileScreen`, `BetslipScreen`, `WalletScreen`, `NotificationsScreen`
**Média:** `ClanScreen`, `MarketplaceScreen`, `SearchScreen`, `SettingsScreen`
**Futuro:** `NexaPlayScreen` (PvP), `SeasonScreen`

Próximos passos técnicos:
1. Adicionar a arte real em `assets/logo.png`.
2. Gerar os projetos nativos (`android/`, `ios/`) a partir do template RN 0.73.
3. Conectar `src/services/api.ts` ao store (trocar mocks por chamadas reais).
4. Implementar o backend nos Workers (KV/D1/R2/Durable Objects) e o WebSocket de odds.

---

## Testes

```bash
npm test
```

- `__tests__/store.test.ts` — valida todas as actions do Zustand (XP, check-in, like, copy bet, follow, betslip, onboarding, odds…).
- `__tests__/structure.test.ts` — valida a estrutura de pastas, resolução de imports e regressões de bugs conhecidos.

Estado atual verificado: **84 testes passando**, typecheck limpo.

---

## Licença

Projeto privado · NEXA Entertainment. Jogue com responsabilidade. **+18 apenas.**
