# NEXA — Contexto para Claude Code

## O que é a NEXA

A NEXA é uma plataforma global de entretenimento interativo que une apostas esportivas,
gamificação, rede social e economia própria em um único ecossistema.

Não é uma bet. Não é uma rede social. É um sistema fechado que captura, mantém e
monetiza a atenção do usuário através de um loop infinito de comportamento:

**ver → interagir → apostar → evoluir → competir → voltar**

---

## Stack atual

- React Native 0.73 (iOS + Android)
- TypeScript estrito
- Zustand para estado global (`src/store/nexaStore.ts`)
- Design system próprio em `src/theme/index.ts`
- Componentes reutilizáveis em `src/components/ui.tsx`

---

## Estrutura de arquivos

```
App.tsx                              → entry point (onboarding ou tabs)
src/
  theme/index.ts                     → cores, tipografia, espaçamento, sombras
  store/nexaStore.ts                 → estado global: usuário, feed, matches, tipsters, missões, clãs
  components/ui.tsx                  → Avatar, Pill, LiveBadge, OddsBtn, Card, XPBar, etc.
  navigation/TabNavigator.tsx        → tab bar com 4 abas
  screens/
    OnboardingScreen.tsx             → 5 passos animados, aposta simulada, XP inicial
    FeedScreen.tsx                   → feed personalizado, check-in, missões, tipsters, posts
    ApostasScreen.tsx                → apostas ao vivo, copy bet, missão oculta
    RankingScreen.tsx                → leaderboard semanal/mensal, clãs
    PerfilScreen.tsx                 → stats, conquistas, missões, saldo, DNA do usuário
```

---

## Design system — regras obrigatórias

### Paleta de cores (sempre usar as variáveis do theme)
```ts
primary:      '#7C5CFC'   // roxo — cor principal da marca
gold:         '#F5C842'   // conquistas, ranking top
green:        '#00C896'   // sucesso, XP, acerto
red:          '#FF4D6A'   // ao vivo, erros, perigo
orange:       '#FF8C42'   // tier gold, destaques
bg:           '#0D0B14'   // fundo principal
bgCard:       '#16131F'   // cards
bgElevated:   '#1E1A2E'   // elementos elevados
textPrimary:  '#F0EDF8'
textSecondary:'#9B95B8'
textMuted:    '#5C5780'
border:       '#2A2545'
```

### Tipografia
- **Display/títulos:** SpaceGrotesk-Bold ou SpaceGrotesk-Medium
- **Corpo:** Inter-Regular, Inter-Medium, Inter-SemiBold
- **Números/odds:** JetBrainsMono-Medium ou JetBrainsMono-Bold

### Princípios visuais
- Tema escuro sempre — nunca fundo claro
- Cards com `backgroundColor: bgCard`, `borderWidth: 0.5`, `borderColor: border`
- Bordas sempre `0.5px` — nunca mais grossas (exceto item featured: `2px`)
- Border radius padrão: `radius.lg` (14) para cards, `radius.full` para pills
- Sem gradientes decorativos, sem sombras excessivas
- Espaçamento: sempre usar `spacing.xs/sm/md/lg/xl/xxl`

---

## Estado global — nexaStore

O store Zustand em `src/store/nexaStore.ts` é a fonte de verdade.

### Entidades principais
```ts
User        → id, username, avatar, level, xp, xpToNext, streak, balance, coins,
               rank, winRate, roi, clan, badges, following, dna, state
Match       → id, league, homeTeam, awayTeam, status, minute, score, odds, bettors, trending
Tipster     → id, username, winRate, roi, followers, streak, tier, isFollowing, recentPick
FeedPost    → id, type, user, content, match, pick, odds, likes, comments, copies, isLiked
Mission     → id, title, xpReward, progress, target, type (daily/weekly/hidden), completed
Clan        → id, name, tag, members, rank, xp, weeklyXp
```

### Actions disponíveis
```ts
setActiveTab(tab)
likePost(postId)
copyBet(postId)          // +10 XP automático
followTipster(tipsterId)
selectOdd(matchId, side)
claimCheckin()           // +50 XP +100 coins +1 streak
completeOnboarding()
addXP(amount)
detectUserState()        // classifica: motivated | frustrated | impulsive | disengaged
```

---

## Mecânicas psicológicas — NUNCA remover

Estas mecânicas são o núcleo da retenção. Sempre preservar e expandir:

| Mecânica | Implementação | Tela |
|---|---|---|
| Pressão social | "247 apostando agora" | Feed, Apostas |
| Quase-ganho | "falta 1 missão" / "quase subiu de nível" | Feed, Ranking, Perfil |
| Check-in diário | +50 XP +100 coins + streak | Feed |
| Missão oculta | objetivo secreto, revelado por ação | Apostas |
| Copy bet | 1 toque para copiar tipster | Feed, Apostas |
| Raridade | badges common/rare/epic/legendary | Perfil |
| Identidade do usuário | DNA apostador + estado em tempo real | Perfil |
| Narrativa | "sequência incrível", "melhor semana" | Feed |
| Sistema de estado | detectUserState adapta UX defensivamente | Store |

---

## Padrões de código obrigatórios

### Componentes
```tsx
// SEMPRE usar StyleSheet.create — nunca inline styles pesados
// SEMPRE usar componentes do ui.tsx antes de criar novos
// SEMPRE tipar props com TypeScript

interface Props {
  item: Match;
  onPress: () => void;
}

export function MatchCard({ item, onPress }: Props) {
  // ...
}
```

### Store
```ts
// SEMPRE acessar store com selector — nunca desestruturar tudo
const user = useNexaStore(s => s.user);           // ✅
const { user, feed, matches } = useNexaStore();   // ❌ causa re-renders desnecessários
```

### Navegação
```ts
// Tab navigation via setActiveTab no store
// Modal/Stack navigation: usar @react-navigation/native-stack quando necessário
```

---

## Módulos planejados — próximas telas a construir

### Alta prioridade
- `LiveScreen.tsx` — transmissões ao vivo com chat integrado e apostas em tempo real
- `TipsterProfileScreen.tsx` — perfil público, histórico, seguir, copy bet em lote
- `BetslipScreen.tsx` — carrinho de apostas, múltiplas, confirmação, cashout
- `WalletScreen.tsx` — saldo, depósito (Pix/cartão), saque, histórico de transações
- `NotificationsScreen.tsx` — missões, resultados, atividade social, alertas de odds

### Média prioridade
- `ClanScreen.tsx` — página do clã, membros, ranking, desafios coletivos
- `MarketplaceScreen.tsx` — comprar/vender estratégias e análises com moedas NEXA
- `SearchScreen.tsx` — buscar jogos, tipsters, usuários, clãs
- `SettingsScreen.tsx` — conta, notificações, jogo responsável, KYC

### Futuro
- `NexaPlayScreen.tsx` — jogos PvP com apostas integradas (tipo Steam)
- `SeasonScreen.tsx` — temporadas com ranking resetado e recompensas exclusivas

---

## Compliance e jogo responsável — obrigatório em produção

- KYC obrigatório antes do primeiro depósito real
- Verificação de idade (+18) no onboarding
- `detectUserState()` deve acionar pause sugerido quando estado = 'frustrated'
- Limites de depósito configuráveis por usuário
- Separação legal: NEXA Entertainment (holding) → Bet (módulo licenciado)
- Logs de auditoria para todas as transações financeiras

---

## Backend — o que precisa ser construído

Atualmente tudo é mock. Para produção, substituir por:

```ts
// Exemplo: likePost vira chamada de API
likePost: async (postId) => {
  await api.post(`/feed/${postId}/like`);
  set((s) => ({ feed: s.feed.map(...) }));
}
```

### Endpoints necessários
- `POST /auth/login` + `POST /auth/kyc`
- `GET /feed` — feed personalizado pelo Decision Engine
- `GET /matches/live` + WebSocket para odds em tempo real
- `POST /bets` — registrar aposta
- `GET /users/:id` — perfil público
- `GET /leaderboard` — ranking
- `POST /wallet/deposit` + `POST /wallet/withdraw`
- `GET /missions` — missões ativas do usuário

---

## Instruções para o Claude Code

Quando receber uma tarefa:

1. **Leia os arquivos relevantes antes de editar** — nunca assuma o estado atual do código
2. **Mantenha o design system** — sempre usar cores e tipografia do `theme/index.ts`
3. **Preserve as mecânicas psicológicas** — check-in, quase-ganho, pressão social nunca saem
4. **Tipagem TypeScript estrita** — sem `any`, sem `@ts-ignore`
5. **Componentes do ui.tsx primeiro** — antes de criar um novo componente, verifique se já existe
6. **Estado no store** — lógica de negócio no Zustand, não dentro dos componentes
7. **Performance** — usar `useCallback` em handlers, `memo` em listas pesadas, FlashList para feeds longos
8. **Acessibilidade** — `accessibilityLabel` em botões de ação, contraste mínimo 4.5:1

---

## Comandos úteis durante o desenvolvimento

```bash
# Iniciar metro bundler
npx react-native start

# Rodar no iOS
npx react-native run-ios

# Rodar no Android
npx react-native run-android

# Verificar tipos TypeScript
npx tsc --noEmit

# Instalar dependência nova
npm install <pacote> && cd ios && pod install && cd ..
```
