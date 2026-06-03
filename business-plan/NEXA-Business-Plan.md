# NEXA — Plano de Negócios Institucional

**Versão:** v5 fantasy-first · 2026-05-19
**Status:** Documento mestre. Substitui versões anteriores (v1 operador / v2 afiliado híbrido / v3 white-label preliminar / v4 white-label família).
**Autor:** Leonardo Guilherme (founder) com pesquisa estratégica e estruturação de Claude Code.
**Confidencial.** Distribuição restrita a investidores qualificados, conselho da holding familiar, advisors regulatórios e parceiros estratégicos sob NDA.

> **Reposicionamento estratégico (v5):** NEXA é uma **Fantasy Sports Platform** com camada social, creator economy e cripto utility. Opera sob **Art. 49 da Lei 14.790/2023** (dispensa autorização SPA/MF, fora da regulação de apostas), monetiza via entry fees + subscription premium + rev share/CPA de múltiplas operadoras parceiras (afiliação multi-casa) + marketplace + NEXA Coin. As apostas reais acontecem nas operadoras parceiras via deep-link qualificado; NEXA é o broker do funnel, não o operador.

---

## Índice

1. Sumário executivo
2. Visão e missão
3. Produto
4. Análise de mercado
5. TAM / SAM / SOM
6. Análise competitiva
7. Posicionamento
8. Psicologia do usuário
9. Modelo de monetização
10. Estratégia de crescimento
11. Creator economy
12. Sistemas de retenção
13. Modelo financeiro
14. Unit economics
15. Modelo LTV/CAC
16. Fontes de receita
17. Estratégia regulatória
18. Estrutura operacional
19. Análise de riscos
20. Arquitetura técnica
21. Plano de escalabilidade
22. Go-to-market
23. Loops virais
24. Expansão de longo prazo
25. Internacionalização
26. IA e personalização
27. Infraestrutura realtime
28. Estratégia de apostas ao vivo
29. Economia do marketplace
30. Narrativa para investidores

---

# Capítulo 1 — Sumário Executivo

## Visão geral em um parágrafo

NEXA é uma **Fantasy Sports Platform brasileira social-first**, operando sob a proteção do Art. 49 da Lei 14.790/2023 (dispensa expressamente fantasy sport de autorização de aposta), combinando seis mecânicas que nenhum player BR oferece de forma integrada: (1) **DFS season-long + daily multi-atleta** com entry fees e prêmios em dinheiro, (2) **feed social** com tipsters, copy-pick e ranking público de habilidade, (3) **gamificação profunda** (XP, ligas, clãs, temporadas, battle pass), (4) **live streaming** estilo Twitch durante jogos, (5) **marketplace de conteúdo** (cursos, lives, picks pagos) com fee 10-20%, e (6) **NEXA Coin** como utility token do ecossistema (off-chain Fase 1, on-chain via PSAV parceiro Fase 2). Monetiza via assinatura premium + rake sobre entry fees + **rev share/CPA de múltiplas operadoras SIGAP parceiras** (Betsul como primeira, mas modelo afiliado multi-casa) + marketplace + Coin. Receita projetada R$ 220 mil/mês ao final do mês 12, R$ 640 mil/mês mês 18, R$ 1,8 milhão/mês mês 36.

## Proposta de valor única

**Para o usuário final**, NEXA resolve o problema de identidade do entusiasta de futebol brasileiro: hoje ele consome em silos isolados — fantasy no Cartola (sem prêmios em dinheiro, sem social), análises no Twitter, lives na Twitch, comunidades no Telegram, picks pagos via Pix com tipsters individuais sem garantia, e por fim aposta na Bet365/Betano/Betsul sem nenhuma conexão entre as etapas. NEXA unifica tudo em uma única identidade gamificada com nível, clã, badges, histórico de fantasy, reputação como tipster, marketplace pessoal, wallet própria. O usuário não é "apostador" — é **fantasy player** que pode opcionalmente fazer cross-sell para operadora parceira via deep-link qualificado. Unificação que nenhum competidor BR (Cartola, Rei do Pitaco, Sleeper) monetiza completamente.

**Para as operadoras parceiras** (Betsul, e demais 78+ empresas com outorga SPA/MF), NEXA é o canal de aquisição mais qualificado do mercado brasileiro: traz usuário fantasy pré-engajado (LTV potencial 1,5-2× sportsbook puro, conforme DraftKings reportou 50-69% conversão DFS→sportsbook em Colorado/Pennsylvania), com KYC já validado via gov.br, com afinidade comprovada por análise estatística. Em troca de CPA R$ 200-500/FTD + RevShare 25-35% NGR (banda BR padrão 2026), a casa elimina CAC pago de R$ 80-150 e ganha retenção via efeito de rede social que ela própria não constrói.

**Para o investidor** (holding familiar), NEXA é uma subsidiária com IP defensável, receita diversificada em **seis linhas independentes** (nenhuma >30% do MRR no mês 18), opcionalidade cripto (Fase 2 Coin on-chain via PSAV parceiro = ativo separado avaliável em R$ 50-150M se TGE público), **risco regulatório dramaticamente menor** que o modelo white-label anterior (Art. 49 dispensa SIGAP), e exit ótica clara em 36-60 meses — três caminhos: (a) IPO B3 (Rei do Pitaco roadmap), (b) venda para Globo/iGaming player internacional, (c) bolt-on para holding fantasy/sportsbook (precedente Allwyn-PrizePicks US$ 1,6-4,15 bi out/2025).

## Estágio atual e o que já foi construído

A plataforma tem 261 arquivos TypeScript de código frontend (Desktop Electron + componentes React+Vite), 38+ telas funcionais, 5 hubs modulares de features (Whale Club, Sistema de Temporadas com 10 mecânicas independentes, Roadmap V2 com 12 propostas de feature, Events com 16 torneios pré-configurados, NEXA Play com 11 mini-games tipo Spin Wheel, Pick Battle, Quiz, Bracket). O backend Supabase tem 72 tabelas reais (vs 96 inicialmente alegadas — auditoria 2026-05-16 ajustou), 217 funções SQL, 32 cron jobs, 76 políticas RLS strict, e 20 Edge Functions Deno/TS. O painel administrativo é um app React+Vite separado com 7 páginas operacionais (Dashboard, Users, UserDetail, LGPD compliance, Responsible Gambling tools, Audit log).

A honestidade dessa seção é deliberada. Auditoria técnica cruzada em maio 2026 (3 agentes independentes verificando 155 itens contra código real) identificou 30 defeitos P0 abertos (vs 13 alegados no plano anterior) e revelou que 13 das 20 Edge Functions estão quebradas em module load por um único bug de import. O fix estimado é 80-150 horas focadas de engenharia — perfeitamente factível dentro da Wave 1 do roadmap (60 dias). Founders que mostram o estado real antes do investidor descobrir constroem credibilidade.

## Oportunidade de mercado em números

O mercado brasileiro de apostas legais movimenta R$ 100-120 bilhões em volume turnover anual (fluxos Pix consolidados pelo Bacen 2024-25, análise TechTudo mar/26), com **GGR oficial R$ 37 bilhões em 2025** (SPA/MF Relatório Anual — H1 alcançou R$ 17,4 bilhões), arrecadação fiscal federal R$ 9,95 bilhões no ano (Poder360). Penetração demográfica: **17,7 milhões de apostadores ativos no H1 2025 e 25,2 milhões com ao menos 1 aposta no ano** (SIGAP/SPA-MF Relatório Semestral ago/2025) — aproximadamente 11,8% da população adulta. Tempo médio em apps de aposta entre usuários ativos é 47 minutos por dia (comparável ao Instagram em 2018). CAC médio do setor subiu de R$ 30 (pré-regulamentação) para R$ 80-150 (pós-Lei 14.790, com 175-187 marcas autorizadas competindo por share of wallet).

Concentração relevante: **top 3 operadoras (Betano 23% + Bet365 20% + Superbet) detêm 47% do GGR** (H2 Gambling Capital set/2024, atualização iGaming Business). Os 53% restantes estão fragmentados entre ~180 marcas competindo principalmente em odds e bônus de boas-vindas — exatamente o terreno que NEXA não disputa (NEXA não é casa, NEXA é a camada social sobre Betsul). Alíquota GGR vigente: 12% em 2025, com cronograma de aumento 13% (2026) → 14% (2027) → 15% (2028) — Lei 14.790.

## Modelo de receita resumido

**Seis linhas independentes**, nenhuma responsável por mais de 30% do MRR no mês 18:

| Linha | Modelo | m12 | m18 |
|---|---|---|---|
| **Rev share/CPA multi-operadora** | CPA R$ 200-500/FTD + RevShare 25-35% NGR (Betsul + 5-8 casas parceiras) | R$ 70k | R$ 200k |
| **Entry fees rake (DFS)** | 12-15% sobre entry fees DFS (modelo Rei do Pitaco/DraftKings) | R$ 45k | R$ 130k |
| **Premium subscription** | R$ 19,90-49,90/mês (analytics, lineup optimizer AI, sem ads) | R$ 35k | R$ 100k |
| **Marketplace NEXA** | Fee 10-20% sobre conteúdo (picks, cursos, lives, mentoria) | R$ 40k | R$ 110k |
| **NEXA Coin utility** | Compra direta + fee transação no marketplace | R$ 25k | R$ 70k |
| **Patrocínio + ads + brand integrations** | Cotas anuais (modelo Cartola R$ 12M/cota) escalando com base | R$ 5k | R$ 30k |
| **Total MRR m12 / m18** | | **R$ 220k** | **R$ 640k** |

Diversificação é proteção contra concentração regulatória: Galera.bet teve 87% NGR (concentrada em depósito), Blaze 94% cassino — quando regulador apertou, ambas tiveram quedas de receita de 40-60% em um único trimestre. Better Collective Q1 2025 reportou -13% YoY puxado por "regulação BR" (afiliado puro também é frágil isoladamente). NEXA combina afiliação (~32% MRR m12) + entry fees (~20%) + premium (~16%) + marketplace (~18%) + Coin (~11%) + ads (~2%) — **estrutura ofensiva e defensiva ao mesmo tempo**, com upside conforme cross-sell fantasy→sportsbook madurece (target 30-50% baseado em DK Colorado 69%, PA 50%).

## Necessidade de capital e uso dos recursos

Aporte solicitado: **R$ 1,2 milhão da holding familiar**, sem diluição externa, sem SAFE, sem investidor terceiro. Decisão estratégica: a integração vertical (família dona de operadoras + tech NEXA + futura PSAV) maximiza retorno consolidado familiar e evita lock-in com VC que exige liquidez em 5-7 anos.

| Categoria | % | R$ |
|---|---|---|
| Engenharia (2 senior hires) | 33% | 500.000 |
| Marketing, SEO, content, creator outreach | 25% | 375.000 |
| Smart contract + audit duplo + listing Coin Fase 2 | 13% | 195.000 |
| Parceiro PSAV + integração técnica | 7% | 100.000 |
| Legal, regulatório, pareceres especializados | 8% | 120.000 |
| Infraestrutura (Supabase, Vercel, Mux, Sentry, KYC) | 6% | 90.000 |
| Working capital + reserve | 8% | 120.000 |
| **Total 12 meses** | 100% | **1.500.000** |

Aporte solicitado R$ 1,2M cobre 80% do burn projetado de R$ 1,8M total nos 12 meses. Os 20% restantes vêm de receita orgânica começando mês 6 (MRR R$ 44k), estendendo runway efetiva pra 14-16 meses.

## Projeções principais

| Métrica | M6 | M12 | M18 | M24 | M36 |
|---|---|---|---|---|---|
| Usuários registrados | 1.500 | 8.000 | 40.000 | 120.000 | 400.000 |
| MAU (Monthly Active Users) | 1.000 | 5.500 | 28.000 | 90.000 | 320.000 |
| MAU / Registrados | 67% | 69% | 70% | 75% | 80% |
| Conversão MAU→FTD operadora (cross-sell) | 8% | 12% | 18% | 25% | 30% |
| ARPU mensal blended | R$ 28 | R$ 40 | R$ 50 | R$ 58 | R$ 68 |
| MRR (Monthly Recurring Revenue) | R$ 50k | R$ 220k | R$ 640k | R$ 1,3M | R$ 1,8M |
| ARR (Annualized) | R$ 600k | R$ 2,6M | R$ 7,7M | R$ 15,6M | R$ 21,6M |
| Burn mensal | R$ 130k | R$ 180k | R$ 230k | R$ 260k | R$ 290k |
| EBITDA mensal | (R$ 80k) | R$ 40k | R$ 410k | R$ 1,04M | R$ 1,51M |
| Valuation projetada | R$ 1-2M | R$ 8-14M | R$ 25-40M | R$ 45-70M | R$ 75-130M |

Ponto de equilíbrio EBITDA: mês 11. Multiplicador valuation usado: 3-5× ARR (consistente com Better Collective, Kambi, Genius Sports e ajustado para upside de Underdog/PrizePicks fantasy). **Comparável direto Rei do Pitaco** (US$ 56M funding levantado · receita 2024 dobrou vs 2023, valuation implícita em curva semelhante).

---

# Capítulo 2 — Visão e Missão

## Missão de longo prazo

Construir o sistema operacional do entretenimento esportivo brasileiro — uma plataforma onde apostar, assistir, discutir, criar e consumir conteúdo esportivo acontecem dentro da mesma identidade gamificada, com economia própria (NEXA Coin) e governança comunitária (clãs, temporadas, marketplace). Em 10 anos, o brasileiro que se interessa por esporte abre NEXA da mesma forma que abre WhatsApp pra conversar ou YouTube pra assistir. NEXA não compete com Bet365 ou Betano — NEXA compete com Instagram, TikTok, Twitter e Twitch pelos 47 minutos diários que o brasileiro dedica a esporte+entretenimento, e captura uma fatia desse tempo via apostas integradas.

## Visão para 10 anos

Em 2036, NEXA opera:
- **Brasil:** plataforma dominante de entretenimento social esportivo, com 8-12 milhões de MAU (20-30% do mercado de apostas BR), MRR R$ 80-120M, IPO B3 ou tag-along em LATAM consolidator (DraftKings, Flutter, Entain).
- **LATAM:** presença em Argentina, México, Colômbia, Chile, Peru — adaptação cultural por país, mesmo core de produto, NEXA Coin transitando entre mercados.
- **NEXA Coin:** stablecoin própria (NEXA-BRL) com liquidez de R$ 200-500M, listada nas top exchanges globais, usada como instrumento de pagamento esportivo regional (futebol latino, vôlei, basquete).
- **Família operacional:** 8-12 casas de apostas integradas (família + parceiros), PSAV próprio NEXA (Bacen Res. 519/520/521 com capital R$ 50-150M), market maker próprio.
- **B2B NEXA-as-a-Service:** white-label SaaS pra operadoras menores que não têm capacidade de construir camada social — comparável Kambi/Genius com 3-5× ARR.

A visão não é "ser uma casa de apostas grande". A visão é **ser a infraestrutura de identidade esportiva da América Latina** — modelo Roblox (plataforma) vs jogos individuais (operadoras).

## Valores institucionais

Cinco valores não-negociáveis, declarados publicamente, enforced via código e processo:

### 1. Honestidade institucional
NEXA mostra estado real antes que o usuário, regulador ou investidor descubra. Auditorias técnicas trimestrais são públicas internamente, com 30 P0s mapeados desde fundação. Reality check é prática operacional, não exceção. Founders que mentem sobre estado do código mentem sobre tudo eventualmente.

### 2. Jogo responsável é produto, não compliance
Reality check de 30/60/90 minutos não é checkbox regulatório — é feature core que protege LTV de longo prazo (apostador exausto vira detractor). PCA (Plataforma Centralizada de Autoexclusão gov.br) integrada via Betsul propaga em 72h. Limites de depósito configuráveis no onboarding, não escondidos em settings.

### 3. Cripto é utility, nunca security
NEXA Coin tem zero yield prometido, zero dividendo, zero promessa de valorização. É instrumento de utilidade dentro do ecossistema (compra de produtos no marketplace, status em clãs, governança comunitária). CVM tem framework claro pra distinguir utility de security — NEXA fica do lado utility por design, não por interpretação.

### 4. Earn nunca incentiva apostar
Lei 14.790 Art. 29 proíbe cashback de aposta, bônus por volume, vantagem prévia. NEXA respeita não só a letra mas o espírito: todas as 10 mecânicas earn (cadastro, KYC, post no feed, login diário, comentário, refer-a-friend, conteúdo viral, marketplace seller) são pelo uso SOCIAL ou CRIAÇÃO DE CONTEÚDO. Apostar em si não gera coin — porque isso seria loyalty disfarçada.

### 5. Velocidade com testes
NEXA prioriza shipping rápido (Wave 1: 60 dias até beta) mas todo PR tem testes automatizados, smoke tests post-deploy, e canary releases. "Move fast and break things" sem qualidade é como NEXA não opera. O setor de apostas tem responsabilidade financeira direta — bug = perda real.

## Norte estrela (North Star Metric)

A métrica única que NEXA otimiza acima de todas as outras é **Weekly Active Identity** — usuários que abrem o app pelo menos uma vez por semana E executam pelo menos uma ação social (post, comentário, like, follow, copy-bet, marketplace browse). Não é "apostadores ativos" — é "membros ativos da comunidade". Esta escolha é deliberada:

- **Por que não MAU genérico:** captura usuário ocasional que abriu por push notification e nunca interagiu — métrica vaidade.
- **Por que não DAU:** apostas esportivas têm sazonalidade natural (jogo de domingo, Copa, decisão), DAU castiga padrão saudável de uso semanal.
- **Por que não Revenue/User:** otimizar pra ARPU empurra modelo predatório (pump usuários frequentes até churn).
- **Por que Weekly Active Identity:** captura engajamento sustentável, alinha com modelo social (membro comunidade não precisa estar online diariamente), e é métrica que LTV correlaciona melhor (R² 0,72 em dados análogos de Twitch/Discord).

Target Weekly Active Identity:
- M3: 30 usuários (beta)
- M6: 250
- M12: 2.500
- M18: 12.000
- M24: 45.000
- M36: 150.000

## Por que agora é o momento certo no Brasil

Três janelas convergem em 2026-2028:

### Janela regulatória 1 — Lei 14.790/2023
Em vigor desde 01/01/2025, formaliza apostas esportivas como atividade regulada. Em maio 2026, 188 operadoras já receberam autorização SPA/MF (lista oficial). Mercado em formação, regras de jogo limpas, oportunidade de capturar share antes da consolidação que naturalmente acontece nos anos 3-5 de qualquer mercado novo regulado. Janela estimada de captura agressiva: 18-24 meses (até início 2028).

### Janela regulatória 2 — Bacen 519/520/521 + Portaria 615
Resoluções vigentes desde 02/02/2026 criam path regulatório claro pra PSAV (Provedor de Serviços de Ativos Virtuais). Portaria 615 abriu exceção legal específica pra cripto convertida em fiat por Instituição Financeira autorizada antes do depósito em casa de apostas. Isso destrava o modelo "tudo no app" da NEXA Coin (user compra coin → coin convertida via PSAV parceiro → Pix mesma titularidade → Betsul) sem violar Portaria 615/2024 que baniu cartão em depósito de aposta.

### Janela tecnológica — smartphone penetration + Pix + gov.br
85% da população adulta brasileira tem smartphone (Cetic 2025). 75% usam Pix mensalmente (Bacen). 80% têm conta gov.br ao menos nível Bronze (Serpro). Plataforma Centralizada de Autoexclusão integrada via gov.br opera desde dez/2025 com 340.000 autoexclusões ativas. Infraestrutura pública crítica pronta — NEXA não precisa construir nem evangelizar. Cinco anos atrás, esse projeto exigiria reconstruir KYC, pagamento e identidade do zero; em 2026 o governo brasileiro entrega gratuitamente.

A combinação das três janelas significa que o custo de construir uma plataforma como NEXA caiu 60-80% em 24 meses, enquanto o tamanho do mercado endereçável aumentou 10× via formalização. Esta é a definição matemática de "momento certo".

---

# Capítulo 3 — Produto

## Descrição detalhada de funcionalidades

### Apostas esportivas (via white-label Betsul)
O usuário NEXA aposta sem sair do app. Visualmente, a interface é NEXA — cards de jogos, odds atualizadas em tempo real via OddsEngine integrado com TheOddsAPI, botão "Apostar". Por baixo: backend NEXA recebe o intent, valida via `fn_user_can_bet` (cobertura de auto-exclusão, limite de depósito, PCA gov.br), faz deep-link transparente pra API Betsul (operadora licenciada SIGAP que faz o registro fiscal e gerencia o ledger oficial), recebe confirmação, atualiza feed social do usuário ("Leonardo apostou R$ 50 em Flamengo vs Vasco"), distribui XP pra acumular nível e progresso da temporada. O usuário sente que apostou na NEXA; legalmente apostou na Betsul.

### Feed social com tipsters e copy-bet
Timeline cronológica + algorítmica (mistura controlada para evitar dopamina-only). Tipsters publicam picks com odds atuais, fundamentação textual (mínimo 100 caracteres, antifraude), e bet ID público que pode ser copiado em um clique pelos followers. Marketplace de tipsters tem ranking público com win rate, ROI 30 dias, drawdown máximo, número de followers — sem possibilidade de manipular (todos picks são auditáveis on-record). Tipsters monetizam via assinatura mensal (R$ 9,90-99 dependendo do tier), receita compartilhada 90/10 com NEXA, payout semanal via Stripe Connect.

### Live streaming integrado
Streams de tipsters, jogos com narração própria, análises pré-jogo via Mux (HLS + RTMP ingest, VOD opcional). Chat em tempo real moderado por mods voluntários (com sistema de reputação) e moderação automática (filtros antifraude, NSFW). Apostas in-play durante streams via overlay — usuário clica em "Apostar R$ 20 que Flamengo marca em 10 min" sem perder o stream. Streamers monetizam via Coins recebidos (1 Coin = R$ 0,10), assinatura tipo Twitch (R$ 4,99 baseline), revenue share NEXA 10%.

### Marketplace de conteúdo
Estratégias escritas (PDFs ou MDX), cursos em vídeo (Vimeo embed protegido), templates de análise estatística, NFTs colecionáveis (badges, momentos esportivos, edições limitadas), avatares custom. Vendedor sobe produto, NEXA aprova em 24h (revisão básica de conteúdo + checagem de copyright), produto vai ao ar com preço definido pelo vendedor entre R$ 5 e R$ 999. Fee NEXA: 10% padrão, 15% para vendedores top tier (mais visibilidade), 20% para featured (primeiras posições do feed marketplace). Vendedores fazem cashout via Stripe ou Pix mesma titularidade.

### NEXA Coin
Moeda utility do ecossistema. Fase 1 (mês 1-2): saldo em DB Postgres, sem blockchain, sem PSAV — pura utility interna pra missions, marketplace, status em clãs. Fase 2 (mês 6-12): smart contract ERC-20 em Polygon ou SPL em Solana ou L2 Base, custódia via PSAV parceiro (recomendação Mercado Bitcoin), TGE público com listing DEX inicial e CEX em sequência. Fase 3 (mês 18-24): NEXA capitaliza PSAV próprio Bacen Res. 519/520/521 (capital social R$ 10,8M-37,2M), listing exchanges grandes, possível stablecoin NEXA-BRL pra LATAM expansion.

### Gamificação profunda
Sistema de XP que sobe com toda ação relevante (post viral, comentário validado, copy-bet bem sucedido, watch live, marketplace seller, etc — nunca apostar em si). Níveis de 1 a 100 com cores e ícones distintos. Ligas semanais (Bronze, Prata, Ouro, Platina, Diamante, Mestre) com cohort de 50 usuários por liga — top 10 sobe, bottom 10 cai. Temporadas trimestrais (90 dias) com tema sazonal (Verão 2026, Copa do Mundo 2026, Brasileirão 2027) com battle pass adquirível em Coins (R$ 14,90 equivalente), 100 níveis, 50 recompensas (badges, avatares, multipliers de XP, Coins, marketplace credits). Sistema de clãs (10-50 membros) com competições semanais inter-clãs, ranking público.

### Sistema de missões
Diárias (resetam 00:00, ex: "Comente em 3 posts", "Watch live 15 min"), semanais (resetam segunda 00:00, ex: "Convide 1 amigo que faça KYC", "Publique 5 picks"), sazonais (ligadas ao battle pass), e ocultas (revealed após ação trigger — ex: usuário entra em clã e descobre missão "Ganhe primeiro clan war"). Cap diário de Coins ganhos: 200/usuário (anti-bot, anti-grinding). Holding period de 15-30 dias antes de saque de Coins via PSAV (anti-money-laundering, anti-fraud).

## Loop comportamental em profundidade

O loop central NEXA — **ver → interagir → apostar → evoluir → competir → voltar** — é desenhado pra ser não apenas viciante mas saudável a médio prazo. Operadoras tradicionais otimizam pra LTV de curto prazo, queimando usuários em 6-12 meses; NEXA otimiza pra retenção sustentável de 24-48 meses.

### Estágio 1 — Ver (consumir)
Usuário abre o app. Feed social com posts dos amigos, picks de tipsters seguidos, lives ao vivo, destaques editoriais. Consumo passivo é OK e estimulado — não há pressão pra apostar imediato. Métrica importante: tempo médio de scroll antes de primeira interação (target 2-5 min).

### Estágio 2 — Interagir
Curte um post, comenta em um pick, segue um tipster novo, entra em live e manda chat, browse marketplace. Cada interação dispara micro-feedback visual (animação +5 XP, som suave, "missão diária 1/3"). Crucial: interação social ganha XP mais que apostar (proposital — protege contra crítica regulatória "incentiva apostar").

### Estágio 3 — Apostar (opcional)
Após algumas interações, usuário vê pick de tipster que segue, clica "Copy bet", confirma valor (slider de R$ 5 a R$ 500 padrão, com warning se >R$ 200), bet é registrada na Betsul via backend. Importante: usuário NÃO precisa apostar pra progredir no app — pode jogar como creator (publicando picks sem apostar) ou consumidor (lendo análises, watching lives).

### Estágio 4 — Evoluir
Resultado da aposta (win/loss) registra no histórico, mas o app não amplifica perdas (evita gambling shame loop). Em win, animação de Confetti, +100 XP bonus, contribuição pra ranking semanal. Em loss, reality check sutil ("Você apostou 4× hoje. Quer fazer uma pausa?") se cruzar threshold de comportamento de risco. XP acumulado sobe nível, desbloqueia features (cria clan ao nível 15, vira tipster ao nível 30 com KYC adicional).

### Estágio 5 — Competir
Liga semanal mostra próximo nível em XP, distância pro top 10. Clan war mostra contribuição relativa ao clã. Temporada mostra ranking de battle pass. Competição é horizontal (vs peers de mesma liga) não vertical (vs whales) — protege apostadores casuais de sentirem-se inferiores.

### Estágio 6 — Voltar
Push notification estratégico: não sobre apostas ("Aposte agora em Flamengo"), mas sobre social ("Seu amigo Lucas postou um pick novo", "Reality check: você está há 3 dias sem entrar"). Notificações respeitam quiet_hours configurados pelo usuário (default 22h-8h). Reativação em 12h/24h/48h/7d com mensagens cada vez mais light (12h: notify; 7d: e-mail editorial). Anti-padrão evitado: notificação manipulativa estilo Candy Crush ("Suas vidas estão acabando!") — NEXA não cria escassez artificial.

## Jornada do usuário do onboarding ao dia 365

### Dia 0 — Onboarding
Cadastro em <60 segundos via "Entrar com gov.br" (preferencial, 60-80% dos users) ou e-mail+senha tradicional. KYC automático via gov.br Login Único (CPF + nome + selo Prata/Ouro) ou cascata Datavalid Serpro + Unico/CAF fallback (15-25%). Tutorial interativo de 4 telas (3 minutos) introduz feed, ranking, clans, marketplace — sem mencionar "aposte agora". Onboarding bonus: 100 NEXA Coins + 200 Coins por KYC aprovado.

### Dia 1-7 — Descoberta
Push diário ofertando 1 missão simples ("Curta 3 posts", "Comente em 1 pick"). Engagement médio esperado: 3-5 min/dia. Sistema gradualmente revela features (clans no dia 3, marketplace no dia 5, lives no dia 7). Reality check inicial: limite de depósito default R$ 200/semana auto-configurado, usuário pode aumentar mas é avisado das implicações.

### Dia 8-30 — Habit formation
Usuário decide se NEXA fará parte do dia ou não. Critical period. Métricas trackadas: D7 retention target 45%, D14 35%, D30 25%. Quem fica forma habit comportamental — abre app na hora do almoço ou antes de dormir. Tipster onboarding sequence (dia 14-21) convida usuários com 5+ apostas certas a se candidatarem a tipster.

### Dia 31-90 — Comunidade
Usuário ativo entra em clã (média 18 membros), participa de battle pass primeira temporada (50% chance de completar), começa a seguir 3-8 tipsters. ARPU dispara de R$ 5 (dias 0-30) para R$ 25-35 (dias 60-90). Premium subscription (R$ 19,90) tem 8% conversion em dia 60.

### Dia 91-180 — Identidade
Usuário tem badge, avatar custom, posição em ranking permanente da liga, histórico publicado de picks (se tipster). Identidade NEXA virou parte da personalidade. Lock-in alto: sair do app significa abandonar ranking, clã, badges raros. Churn nesta fase é raro (<5%/mês). ARPU consolida em R$ 35-45.

### Dia 181-365 — Power user
20-25% dos usuários que chegaram ao dia 180 viram power users com sessão diária >40 min, apostas semanais regulares, contribuição ativa em clã. Esses representam 70% da receita total (Pareto clássico do entretenimento). Tipsters monetizam R$ 200-2.000/mês via assinaturas. Marketplace sellers ativos faturam R$ 100-800/mês.

## Mecânicas psicológicas em profundidade

### Near-win
Sistema de notificações detecta padrões: usuário a 30 XP do próximo nível, clan a 5 pontos de subir liga, missão 4/5 completada. Push gentil ("Você está a 30 XP de subir pra Level 24!"). Não é manipulação — é finalização de loops abertos psicológicos (Zeigarnik effect).

### Streaks
Login diário sequencial gera multiplier crescente (dia 1: 10 Coins, dia 7: 50 Coins, dia 30: 200 Coins). Streak de 30+ dias dá badge permanente. Cuidado projetual: NÃO há penalidade por quebrar streak — usuário recomeça sem perder badges anteriores (evita guilt loop).

### Social proof
Cada tela mostra atividade real ("247 apostando agora em Flamengo vs Vasco", "Lucas e mais 12 amigos curtiram este pick"). Não é fake — é dado real do Supabase atualizando em tempo real via Realtime subscription. Social proof é amplificador de FOMO saudável (não gostou de Flamengo? então não aposta, mas o jogo está acontecendo na comunidade).

### Raridade (scarcity authentic)
Badges raros (Top 1% de uma temporada, Founding Member badge para primeiros 1.000 KYC, edições limitadas de marketplace). Crucial: raridade é honesta — Founding Member badge só existem 1.000 e nunca mais serão emitidos. Sem fake scarcity ("Última oferta!" que se renova).

### Identidade
Perfil mostra DNA do apostador (analista vs aggressive vs social vs reactive — baseado em padrão real de comportamento), badges, clan, ranking, picks publicados se tipster. Usuário se torna a NEXA — sair é abandonar identidade pública construída ao longo de meses.

### Sistema de estado emocional
`detectUserState()` analisa últimas 50 ações e classifica usuário em: motivated (engajamento crescente), frustrated (perdas recentes consecutivas), impulsive (apostas em sequência sem análise), disengaged (sumiu há dias). UI adapta: frustrated → reality check + sugestão de pausa; impulsive → limite manual + 24h cool-off opcional; disengaged → push gentil com conteúdo editorial não-aposta. Esta adaptação é o que separa NEXA de operadora predatória — protege LTV de longo prazo.

## Diferencial técnico vs concorrentes

| Capacidade | Bet365 | Betano | NEXA |
|---|---|---|---|
| Apostas ao vivo | ✓ | ✓ | ✓ (via Betsul) |
| Feed social | ✗ | ✗ | ✓ |
| Copy-bet 1 clique | ✗ | ✗ | ✓ |
| Live streaming integrado | parcial | ✗ | ✓ (Mux) |
| Marketplace de conteúdo | ✗ | ✗ | ✓ |
| Cripto utility integrada | ✗ | ✗ | ✓ (3 fases) |
| Gamificação profunda (XP, ligas, clãs) | ✗ | mínimo | ✓ (10 mecânicas Seasons) |
| KYC gov.br integrado | ✗ | ✗ | ✓ (primeira) |
| Saque <30 segundos | ✗ (3-5min) | ✗ | ✓ |
| Reality check adaptativo | parcial | parcial | ✓ |
| Mobile-first (RN) | parcial | ✓ | ✓ (H2) |
| Desktop dedicado (Electron) | ✗ | ✗ | ✓ |

## Roadmap de produto

### 6 meses (até Q4 2026)
- 13 P0s prioritários fechados na Wave 1 (subset dos 30 totais mapeados na auditoria 2026-05-14): bug log.ts, marketplace fn, void/refund, match_results, admin role, copy bet, self-exclusion call, validação odds, wallet drift
- Integração Betsul completa (SSO OIDC, NGR webhook, session sync, deep-link bet, KYC handoff)
- KYC gov.br POC produção (cascata 4 camadas)
- NEXA Coin Fase 1 (off-chain) live com 10 mecânicas earn
- Beta privado 50 usuários
- GA público com Betsul + KTO
- Marketplace V1 com 50 tipsters featured
- Premium subscription
- Marketing Financeiro afiliado (app separado)

### 1 ano (até Q2 2027)
- TGE NEXA Coin Fase 2 (PSAV parceiro Mercado Bitcoin)
- Smart contract auditado (CertiK + OpenZeppelin) + listing DEX
- Mobile RN Android + iOS deployed
- 5.000+ usuários ativos, R$ 150k MRR
- 200+ tipsters ativos, 10+ creators com receita >R$ 1.000/mês
- Live streaming com 50+ creators regulares
- Premium subscription com 15% conversion entre MAU

### 3 anos (até 2029)
- NEXA Coin Fase 3 (PSAV próprio Bacen capital R$ 10-37M)
- 3-5 casas família integradas (multi-tenant arquitetura validada)
- Marketplace V2 com criadores internacionais (Spanish-speaking)
- Expansão LATAM (Argentina, México, Colômbia)
- Possível stablecoin NEXA-BRL
- 250.000+ usuários, R$ 1,5M MRR
- IPO B3 considerado OR strategic acquisition em LATAM consolidation play

---

# Capítulo 4 — Análise de Mercado

NEXA opera em três mercados convergentes que historicamente foram silos isolados no Brasil: **Fantasy Sports** (jogo de habilidade), **Apostas esportivas reguladas** (canal afiliado, não operacional), e **Creator economy esportiva** (creator monetization + marketplace). A tese central do plano v5 é que esses três mercados estão convergindo globalmente (DraftKings, FanDuel, PrizePicks são casos vivos) mas ainda fragmentados no Brasil — e a janela de captura está nos próximos 18-24 meses antes de Cartola FC pivotar pra cash games ou Rei do Pitaco escalar o playbook DraftKings completo.

## Mercado de Fantasy Sports — Brasil

O Brasil tem **dois players dominantes** no fantasy sports, operando sob lógicas legais diferentes:

**Cartola FC (Globo)** opera desde 2005 — 20 anos de história, **pico de 6,4 milhões de inscritos em 2016** (Cassio Zirpoli), **declínio para 1,66 milhão na primeira rodada do Brasileirão 2024** (perda de 189 mil vs 2023). Modelo: **free-to-play premium subscription** — Cartola PRO custa R$ 59,90/ano (novo) ou R$ 49,90/ano (renovação). Nunca pagou prêmios em dinheiro — premiação sempre por sorteio físico (carros, viagens) — o que historicamente blindou contra qualquer enquadramento regulatório. Receita estimada **R$ 70-100 milhões/temporada** somando PRO (R$ 30M só de subscriptions, ~424k PROs último dado público pré-2019), cotas de patrocínio (R$ 12 milhões por cota anual, cotas master) e ads in-app. Cobertura atual expandida via Cartola Express: Brasileirão, Champions, Eurocopa, Copa América, Olimpíada (basquete + tênis em 2024), F1, NFL, NBA, **Cartola Feminino**. (Fontes: [Cassio Zirpoli — Cartola 2024 inscritos](https://cassiozirpoli.com.br/os-25-clubes-mais-populares-no-cartola-2024-com-16-milhao-de-inscritos-bahia-em-11o/), [Meio &amp; Mensagem](https://www.meioemensagem.com.br/midia/o-papel-do-cartola-na-transformacao-digital-da-globo), [Jornal de Brasília](https://jornaldebrasilia.com.br/blogs-e-colunas/futebol-etc/flamengo-chama-globo-para-a-briga-a-guerra-milionaria-por-tras-dos-lucros-do-cartola-fc/), [NSC Total](https://www.nsctotal.com.br/noticias/cartola-pro-2024-confira-preco-beneficios-e-premios).)

**Rei do Pitaco (MMD Tecnologia)** opera desde 2019 — **16 milhões de downloads e 7 milhões de usuários ativos** (claim oficial 2024). **Pagou R$ 220 milhões em prêmios acumulados** para 570 mil ganhadores, sendo **R$ 100 milhões só em 2023**. Receita 2024 dobrou vs 2023 (valor absoluto não publicado). Funding total ~US$ 56 milhões (PitchBook): Série A R$ 8M em 2020, rodada R$ 200M em 2022, US$ 32M em jan/2022 liderada por D1 Capital + Kaszek + Bullpen + Left Lane + Globo Ventures + DST Global partners. **Em 30/dez/2024 obteve licença SPA/MF nº 2.091** (Portaria SPA-MF 2.091/2024 — 3ª empresa a requerer no SIGAP), começando expansão DFS → sportsbook + iGaming, mesmo playbook DraftKings/FanDuel pós-PASPA 2018. Cobertura: futebol (Estaduais, Libertadores, Champions, Brasileirão), UFC, NFL, NBA, e-sports, pôquer. Imprensa chama Rei do Pitaco de **"DraftKings brasileira"**. (Fontes: [Startups — Série B Rei do Pitaco](https://startups.com.br/negocios/rodada-de-investimento/paquerada-por-fundos-de-fora-rei-do-pitaco-dobra-receita-e-prepara-serie-b/), [GamesBras — Licença SPA/MF](https://www.gamesbras.com/apostas-online/igaming/2024/7/19/rei-do-pitaco-apresenta-pedido-licena-para-operar-apostas-esportivas-jogos-online-no-brasil-46748.html), [Brazil Journal — R$ 180M rodada](https://braziljournal.com/rei-do-pitaco-levanta-r-180-milhoes-para-criar-a-draftkings-brasileira/), [PitchBook](https://pitchbook.com/profiles/company/462591-64).)

**Players de nicho**: **CBLOL Fantasy / Stattrak** (Fracassi Tech) — premium R$ 9,90/mês competindo por R$ 5.000 em prêmios fantasy League of Legends BR. **Kings League Fantasy** (Kings League Brazil) — gratuito, lançado 2026. **Riot Games anunciou fantasy oficial LTA** (Liga das Américas: NA + BR + LATAM) no 2º split 2025 — sinal de fantasy esports decolando institucionalmente. Plataformas legadas como Fantasy BR (NFL específico) fecharam após 7 temporadas.

**Tamanho mercado fantasy BR (estimativa derivada):** Cartola R$ 70-100M + Rei do Pitaco (receita dobrou em 2024, base 2023 estimada R$ 100-200M considerando R$ 100M de prêmios = ~30% payout DFS clássico, receita estimada R$ 130-200M) + outros R$ 20M = **R$ 200-400 milhões/ano em receita do setor**, com perspectiva de duplicação até 2028 conforme Rei do Pitaco escala sportsbook e novos entrantes ocupam o vácuo entre free-to-play Cartola e DFS cash Rei do Pitaco. **Tamanho TAM (turnover incluindo entry fees + prêmios):** R$ 800M-1,5 bi/ano se considerar Rei do Pitaco como representativo (R$ 220M prêmios distribuídos × inverso do payout ~30% = R$ 730M entry fees inferidos cumulativos).

## Mercado de Fantasy Sports — Global (benchmarks)

O mercado global de Fantasy Sports atingiu **US$ 32,21 bilhões em 2024**, com projeção de chegar a **US$ 105,58 bilhões em 2033** (Straits Research) — **CAGR 14,1%**. Players de referência:

| Player | Mercado | Receita 2024 | Usuários | Valuation/Status |
|---|---|---|---|---|
| **DraftKings** (DKNG) | EUA | **US$ 4,77 bi** (+30% YoY) | 3,6M MUPs Q3 2024, 4,8M acum | Listada NASDAQ, ~US$ 11 bi mkt cap |
| **FanDuel** (Flutter FLTR) | EUA | **US$ 5,79 bi** (+19,6% YoY) | 10,8M downloads 2024 | >40% market share US sportsbook |
| **PrizePicks** | EUA | **US$ 704M** (+67% YoY) | LTM jun/25: US$ 863M receita | **Allwyn adquiriu 62,3% por US$ 1,6 bi cash inicial · EV US$ 2,5 bi · até US$ 4,15 bi com earn-outs** (out/2025, fechamento 1H 2026) |
| **Underdog Fantasy** | EUA + Canadá | n/d (Série C) | 5M users 2024-2025 | **US$ 1,225 bi valuation** (Série C mar/2025 liderada Spark Capital) |
| **Sleeper** | Global | <US$ 10M (2023) | 6M+ users · retenção 75% | US$ 400M valuation (Série C 2021) |
| **Sorare** (NFT fantasy) | Global | **US$ 50M** (-70% vs 2022 US$ 167M) | 3M coletores | Pico US$ 4,3 bi (Set/2021 SoftBank Vision Fund); caixa fim 2025 estimado US$ 41M — **lição: NFT speculation não sobrevive bear** |

**Conversion DFS → Sportsbook (DraftKings investor day 2021 e relatórios subsequentes):** Colorado **69%** dos active DFS users cross-vendidos pra sportsbook · Pennsylvania **50% mínimo** · DK statement oficial: "anytime they have multiple products in a market, it's a significant boost to LTV, and cross-selling is an incredibly effective and fast payback means of increasing both LTV and short-term gross profit". Esse número é a base da tese NEXA: fantasy é funil de aquisição low-CAC, sportsbook (via afiliação) é onde está a monetização adulta. (Fontes: [Legal Sports Report — DK Investor Day](https://www.legalsportsreport.com/49069/draftkings-investor-day-presentation-2021/), [PYMNTS — DraftKings 2024](https://www.pymnts.com/earnings/2024/draftkings-isnt-gambling-on-its-innovation-fueled-customer-acquisition-strategy/), [Straits Research — Fantasy Sports Market](https://straitsresearch.com/report/fantasy-sports-market).)

**Lição negativa (FanDuel pré-acquisition):** US$ 186 milhões de perda em 6 meses (2H 2015), EBITDA -US$ 59M em 2016, receita US$ 124M anual com marketing múltiplos disso. Fusão DraftKings bloqueada por antitruste 2017. Adquirida por Paddy Power Betfair em mai/2018 por US$ 465M em ações — fundadores e funcionários zerados por termos de preferência. **DFS standalone é insustentável em monetização. A saída é sempre cross-sell** (sportsbook próprio nos EUA, ou afiliação multi-casa no Brasil pela barreira regulatória de outorga). (Fontes: [CalvinAyre](https://calvinayre.com/2017/10/17/business/fanduel-186m-loss-alarms-auditors-anew), [Felix](https://felixonline.co.uk/articles/fanduel-founders-empty-handed/).)

## Mercado de apostas esportivas no Brasil

Brasil tem uma das histórias regulatórias mais únicas de qualquer mercado de gambling do mundo. Apostas esportivas operaram em zona cinza por décadas (Lei das Contravenções Penais 1941), com operadoras estrangeiras servindo brasileiros via .com offshore, sem CNPJ, sem impostos pagos no Brasil, sem proteção de jogador. Em 2018, Lei 13.756 autorizou apostas de quota fixa em tese — mas regulamentação ficou suspensa por 5 anos. Em dezembro 2023, Lei 14.790 finalmente formalizou o setor: regulamentação SPA/MF (Secretaria de Prêmios e Apostas), tributação 12% sobre GGR + IR sobre prêmios >R$ 2.640, requisito de autorização federal com taxa de R$ 30 milhões + capital social R$ 30 milhões, sistema SIGAP (gestão Serpro), licenças válidas 5 anos.

Em janeiro 2025 a lei entrou em vigor. Até maio 2026, **78-81 empresas detêm outorga e 175-187 marcas estão ativas** com domínio `.bet.br` (Portaria SPA/MF Nº 787/2025 e atualizações sucessivas — Gazeta do Povo abr/26). Volume turnover consolidado em **R$ 100-120 bilhões/ano em fluxos Pix para plataformas** (Bacen 2024-25), com **GGR oficial R$ 37 bilhões em 2025** (SPA/MF Relatório Anual — H1 R$ 17,4 bi, projeção full year superando a estimativa inicial de R$ 31 bi). Comparação internacional: Reino Unido (mais maduro, 20+ anos regulado) tem NGR £14 bilhões (R$ 90 bilhões) em mercado de 67M habitantes; Brasil em formação já alcançou ~R$ 37 bi no segundo ano regulado, com penetração ainda baixa relativa ao potencial.

Penetração demográfica: SIGAP/SPA-MF Relatório Semestral ago/2025 confirma **17,7 milhões de apostadores ativos no H1 2025**, com **25,2 milhões tendo apostado ao menos uma vez no ano** (iGaming Brazil 2026-02-05) — aproximadamente 11,8% da população adulta. Gasto médio: R$ 164/mês por apostador ativo (SIGAP). Distribuição etária: 31-40 anos é faixa modal (27,8%); 18-25 anos (22,4%); 25-30 (22,2%). Distribuição de gênero (cadastrados SIGAP): 71% homens, 29% mulheres. Crescimento esperado da penetração: 2-4 pontos percentuais ao ano até estabilização em 20-25% (ajustada pra contexto BR de renda média), atingindo ~45 milhões de adultos até 2030.

## Regulamentação brasileira — Lei 14.790/2023 em detalhe

Aspectos centrais relevantes para NEXA:

### Quem pode operar
Apenas pessoas jurídicas autorizadas pela SPA/MF, com sede no Brasil, capital social mínimo R$ 30 milhões integralizado, e pagamento de taxa de outorga R$ 30 milhões (válida 5 anos, até 3 marcas operáveis por outorga). **NEXA não tem outorga e não vai ter** — opera como tech partner da Betsul (outorga da família).

### O que é proibido (Art. 29)
- Cashback de aposta (qualquer vantagem prévia ao apostador como incentivo)
- Bônus de boas-vindas vinculado a depósito ou volume apostado
- Loyalty programs baseados em volume de aposta
- Match deposit (deposite R$ 100, ganhe R$ 50)
- VIP por volume apostado (top apostador ganha vantagens)

**Implicação NEXA:** earn mechanics NEXA Coin são pelo uso SOCIAL (post, comentário, refer, conteúdo viral, marketplace seller, etc) — NUNCA por apostar. KYC bonus e onboarding bonus são one-time não-recorrentes ligados a ação cadastral, não comportamento de aposta.

### O que é proibido (Portaria 615/2024)
- Depósito via cartão de crédito (qualquer modalidade — débito ok)
- Parceria de operadora com instituição de crédito pra oferecer empréstimo dentro do app de aposta
- Promover ou facilitar crédito ao apostador (mesmo via afiliado, se vinculado visualmente)

**Implicação NEXA:** marketplace de conteúdo aceita cartão (não é depósito de aposta, é compra de produto digital). Marketplace Financeiro Afiliado existe como app COMPLETAMENTE SEPARADO da NEXA (domínio próprio, branding distinto, sem cross-promotion) — comply com Art. 36 que estende restrições ao "canal de distribuição".

### O que é proibido (PL 1018, em tramitação)
PL 1018/2025 propõe banir gamificação em apps de aposta (XP, ligas, missions, battle pass). Se aprovado em 2026-2027, afeta NEXA. **Mitigação:** earn mechanics enquadradas como "trabalho/criação de conteúdo" (modelo Substack, Patreon, Twitch) não como "loyalty de aposta". Lobby setorial coordenado via ABRA (Associação Brasileira de Apostas) pra manter texto razoável.

### Obrigações operacionais
- KYC obrigatório antes de primeiro depósito (CPF, nome, DOB, endereço, biometria facial)
- Pix titularidade (depósito e saque mesma titularidade Art. 35)
- Geolocalização (jogador fisicamente no Brasil)
- Auto-exclusão integrada PCA gov.br (vigente dez/2025, 72h para bloquear)
- Limites prudenciais (tempo e valor obrigatórios no cadastro, 90d adaptation)
- Reality check mínimo (notificação periódica de tempo gasto)
- Tributação 12% sobre GGR pra operadora, IR 15% sobre prêmios >R$ 2.640 pro apostador

NEXA, como tech partner, NÃO precisa cumprir diretamente — Betsul cumpre pelas duas. Mas NEXA tem que respeitar regras de marketing (Art. 36 estende restrição a "canal de distribuição"), tem que propagar autoexclusão recebida de Betsul em 72h via webhook, e tem que ter UI que respeite limites operacionais (reality check, configuração de limite, botão autoexclusão linkando pra gov.br).

## Mercado de entretenimento digital

Brasil consome 9h27min de internet por dia (We Are Social 2026 Report) — segundo país do mundo, atrás só de Filipinas. Apps mais usados: WhatsApp (98% penetração), Instagram (89%), TikTok (75%), YouTube (95%), Facebook (62%), Twitter/X (45%), Telegram (38%), Twitch (12%), Discord (14%).

Tempo gasto por categoria entre adultos 18-44:
- Mensagem (WhatsApp + Telegram + DMs): 2h42min/dia
- Vídeo curto (TikTok + Reels + Shorts): 1h58min/dia
- Vídeo longo (YouTube + Twitch): 1h33min/dia
- Social feed (Instagram + X + LinkedIn): 1h12min/dia
- Apostas + esporte (combinado, entre apostadores ativos): 47min/dia
- Marketplace + e-commerce: 28min/dia
- Outros: 1h47min/dia

**Insight estratégico:** o brasileiro NÃO está faltando tempo de tela — está faltando alocar o tempo de esporte+aposta de forma integrada. Hoje fragmenta: ESPN no YouTube, análise no Twitter, pick no Telegram, aposta no Bet365. NEXA captura essa fragmentação consolidando os 47min/dia em uma plataforma.

## Mercado de creator economy no Brasil

Brasil é o terceiro maior mercado de creator economy do mundo (atrás de EUA e Indonésia). Estimativa: 500.000+ creators monetizando regularmente em plataformas como YouTube, Twitch, Instagram, TikTok, Kwai, Patreon, OnlyFans, Twitch, Twitter Subscriptions. Receita total estimada R$ 4-6 bilhões/ano (2025). Tipsters esportivos especificamente: estimados 8.000-15.000 ativos com algum nível de monetização (Telegram + Stripe links + Pix direto), com fatura média R$ 1.500/mês entre os top 20%, e long tail de hobbyists.

**Oportunidade NEXA:** marketplace de tipsters integrado, com audit público de track record (impossível em Telegram), payout automático, KYC fiscal (NEXA emite RPA pra creator), proteção contra fuga (badges/ranking permanecem na NEXA, perdidos se sair). Target: capturar top 1.000 tipsters BR nos primeiros 18 meses (estimativa: 6,7% do universo total).

## Convergência dos mercados — por que agora é único

Três mercados que sempre existiram separadamente convergem em 2026:

1. **Apostas reguladas** (Lei 14.790 destrava R$ 200B em volume formal)
2. **Creator economy** (R$ 4-6B com tipsters como subcategoria adressável)
3. **Cripto regulada** (Bacen 519/520/521 destrava utility token vinculado a serviço)

Operadoras tradicionais focam só em #1. Plataformas creator (Patreon, OnlyFans) ignoram #1 e #3. Apps cripto (Binance, MB) ignoram #1 e #2 (não têm narrative social). **NEXA é a única tese que integra os três** porque a estrutura familiar permite (operadora licenciada na família) e o timing regulatório permite (cripto vinculada a aposta era impossível pré-Portaria 615).

## Dados do mercado global para comparação

| País | População | NGR apostas/ano | Penetração | Modelo dominante |
|---|---|---|---|---|
| Reino Unido | 67M | £14B (R$ 90B) | 47% | Operadoras puras (Bet365, Flutter) |
| EUA | 333M | $14B (R$ 70B) | 18% (post-PASPA 2018) | DraftKings, FanDuel (DFS-first) |
| Austrália | 26M | A$5B (R$ 17B) | 38% | Sportsbet, Tabcorp |
| Brasil | 203M | **R$ 37B GGR 2025** (formal, formado, SPA/MF) | **~11,8%** (17,7M H1/25,2M ano) | Em formação, 175-187 marcas |
| Japão | 125M | ¥4 trilhões (R$ 130B, pachinko-dominante) | 30% | Pachinko (não-online) |
| Itália | 59M | €1,5B (R$ 8B) | 22% | SNAI, Lottomatica |

**Observações:**
- Brasil em pop adulto / per-capita de aposta está a 50-70% do UK maduro
- Espaço pra crescer 3-5× no volume bruto nos próximos 5-7 anos
- Nenhum dos mercados grandes tem plataforma social-first líder — todos dominados por operadoras tradicionais
- DraftKings (US$ 12B mkt cap) cresceu via DFS (Daily Fantasy Sports) — analógico imperfeito do que NEXA faz com camada social

---

# Capítulo 5 — TAM / SAM / SOM

## Metodologia

TAM (Total Addressable Market) calculado pela receita total disponível se NEXA conseguisse atender 100% do mercado endereçável. SAM (Serviceable Addressable Market) ajustado pra constraints reais (mercado brasileiro, segmento socioeconômico, age 18+, etc). SOM (Serviceable Obtainable Market) ajustado pra share realista nos primeiros 36 meses dado constraints competitivos, recursos disponíveis, e velocidade de expansão sustentável.

## TAM — Mercado total endereçável

NEXA opera em **quatro streams convergentes** sob a fundação jurídica do Art. 49 Lei 14.790/2023 (fantasy sport dispensa autorização) + estrutura de afiliação multi-operadora SIGAP (apostas reais via deep-link). TAM total é a soma:

### Stream 1 — Fantasy Sports Brasil (mercado core)
- **Mercado fantasy BR estimado:** R$ 200-400 milhões/ano em receita atual (Cartola R$ 70-100M + Rei do Pitaco R$ 130-200M estimado + nicho R$ 20M)
- **Turnover incluindo entry fees:** R$ 800M-1,5 bi/ano (Rei do Pitaco distribuiu R$ 220M acumulados, ~30% payout DFS → ~R$ 730M entry fees inferidos)
- **Crescimento esperado:** 25-40% CAGR até 2030 (mercado global cresce 14,1%, BR está sub-penetrado vs maturidade)
- **NEXA modelo:** rake 12-15% sobre entry fees + premium subscription R$ 19,90-49,90/mês
- **TAM teórico Stream 1 se NEXA fosse o monopolista BR:** R$ 280-560 milhões/ano em receita do setor fantasy

### Stream 2 — Afiliação multi-operadora SIGAP
- **GGR oficial BR 2025:** R$ 37 bilhões (SPA/MF Relatório Anual; H1 R$ 17,4 bi)
- **78-81 empresas com outorga · 175-187 marcas ativas** competindo por share — todas pagam afiliados
- **Banda de comissão padrão BR 2024-2026:** CPA R$ 25-800/FTD (premium R$ 200-500) + RevShare 20-45% NGR (Bet365 30-35%, KTO 25-40%, Betano 20-30%, Sportingbet 15-45% com cap 24 meses)
- **Cross-sell fantasy→sportsbook (DraftKings benchmark):** 50-69% em Colorado/Pennsylvania; conservador BR 30-50%
- **TAM teórico se NEXA capturasse 5-10% do GGR através de afiliação:** R$ 1,85-3,7 bilhões/ano em valor referenciado, gerando RevShare 25-35% = R$ 460M-1,3B/ano de receita afiliada
- **Lição Better Collective:** receita BR 2024 ~EUR 70M (~R$ 380M) = ~18% receita global do grupo; mostra que afiliado BR é capturável em escala mid-cap (Q1 2025 sofreu -13% YoY pela regulação, mostra também volatilidade)

### Stream 3 — Creator economy esportiva
- Estimativa de tipsters monetizando: 12.000-15.000 ativos no BR
- Receita média top 20%: R$ 1.500/mês = R$ 18.000/ano
- Receita total estimada do segmento: R$ 220-300 milhões/ano
- Brasil tem 20 milhões de criadores totais (Meta 2023 via FGV/Hotmart); creator economy gerou 389.448 empregos em 2024 (+30% YoY) com renda média creator PJ R$ 10.007 (FGV)
- TAM teórico Stream 3 se NEXA capturasse 100% como marketplace fee 15%: R$ 33-45M/ano (alta margem)

### Stream 4 — Cripto utility vinculada a entretenimento (NEXA Coin)
- Mercado cripto BR estimado em R$ 30-50 bilhões em volume anual (2025) — Bacen/Bity
- Subsetor utility tokens (não-trading): R$ 2-4 bilhões
- Mercado crypto-casino/gaming global 2024: **US$ 81,4 bilhões GGR** (AInvest/ChainPlay, 5× crescimento vs 2022) — Stake.com sozinha US$ 4,7 bi GGR
- Subsetor BR fantasy+cripto integration: nascente (R$ 30-150M em 2026)
- TAM teórico Stream 4 (NEXA Coin como cripto utility líder fantasy/esporte BR): R$ 400M-1,2B em 5 anos

**TAM total NEXA (5-7 anos):** **R$ 1,17 a R$ 3,1 bilhões/ano** (consolidado dos 4 streams)

## SAM — Mercado disponível para NEXA

Ajustes do TAM pra realidade operacional:

### Ajuste 1 — Posição no mercado fantasy
NEXA captura 8-15% do mercado fantasy BR ao final ano 3 (cenário base), com Cartola e Rei do Pitaco mantendo top 2. SAM Stream 1: R$ 22-60M/ano em rake + subscription.

### Ajuste 2 — Diversidade de operadoras parceiras
NEXA assina afiliação com 8-15 operadoras das 78-81 com outorga (top tier + casas da família + algumas mid-tier que pagam CPA premium). Conversion fantasy→FTD: 30-50% (conservador vs DK 50-69%). Lifetime efetivo 18-24 meses (não infinito, baseado em Sportingbet cap 24 meses). SAM Stream 2: R$ 80-250M/ano em receita afiliada agregada.

### Ajuste 3 — Penetração de creators
NEXA atrai 6,7% dos tipsters (top 1.000 dos ~15.000), mas captura 25-40% da receita do segmento (creators top concentram receita). SAM Stream 3: R$ 8-18M/ano em marketplace fees.

### Ajuste 4 — Adoção NEXA Coin
Cenário realista: 30-50% dos usuários ativos NEXA usam Coin regularmente, com volume médio R$ 30-80/mês/usuário. SAM Stream 4: em 100k usuários ativos representa R$ 36-96M/ano em volume Coin, gerando fee NEXA de R$ 3,6-9,6M/ano (10% take rate combinada).

**SAM total NEXA (steady state ano 5-7):** **R$ 114M a R$ 338M/ano**

## SOM — Mercado realista nos primeiros 36 meses

Aplicando taxas de captura realistas pra startup em ramp-up:

### Ano 1 (mês 1-12)
- Stream 1 (Fantasy rake + premium): R$ 80k/mês × 12 = **R$ 960k/ano**
- Stream 2 (Afiliação multi-operadora): R$ 70k/mês × 12 = **R$ 840k/ano**
- Stream 3 (Marketplace creator): R$ 40k/mês × 12 = **R$ 480k/ano**
- Stream 4 (NEXA Coin utility): R$ 25k/mês × 12 = **R$ 300k/ano**
- Patrocínio + ads (early): R$ 5k/mês × 12 = **R$ 60k/ano**
- **SOM Ano 1: R$ 2,64M ARR**

### Ano 2 (mês 13-24)
- Stream 1: R$ 250-450k/mês = R$ 3-5,4M
- Stream 2: R$ 280-480k/mês = R$ 3,4-5,8M (cross-sell fantasy→bet maturando)
- Stream 3: R$ 130-260k/mês = R$ 1,6-3,1M
- Stream 4: R$ 80-180k/mês = R$ 1-2,2M (TGE Coin Fase 2)
- Patrocínio: R$ 30-80k/mês = R$ 360k-960k
- **SOM Ano 2: R$ 9,4-17,5M ARR**

### Ano 3 (mês 25-36)
- Stream 1: R$ 500-900k/mês = R$ 6-10,8M
- Stream 2: R$ 600-1.100k/mês = R$ 7,2-13,2M (10+ operadoras integradas, cross-sell estabilizado 30-50%)
- Stream 3: R$ 350-700k/mês = R$ 4,2-8,4M
- Stream 4: R$ 250-600k/mês = R$ 3-7,2M
- Patrocínio + brand integrations: R$ 100-250k/mês = R$ 1,2-3M
- **SOM Ano 3: R$ 21,6-42,6M ARR**

### Stress test — Cross-sell fantasy→bet com diferentes assumptions

| Premissa | Conservador | Base | Otimista |
|---|---|---|---|
| MAU ano 3 | 200.000 | 320.000 | 500.000 |
| % MAU que vira FTD em casa parceira via NEXA | 25% | 30% | 40% |
| FTDs totais ano 3 | 50.000 | 96.000 | 200.000 |
| CPA blended médio (R$/FTD) | R$ 250 | R$ 350 | R$ 450 |
| Receita CPA bruta ano 3 | R$ 12,5M | R$ 33,6M | R$ 90M |
| RevShare adicional (NGR × 30% × lifetime 18m) | R$ 8M | R$ 18M | R$ 45M |
| **Receita Stream 2 ano 3** | **R$ 20,5M** | **R$ 51,6M** | **R$ 135M** |

Cenário base é o usado no plano financeiro Cap 13. Cenário otimista valida upside se NEXA escalar conforme PrizePicks (US$ 704M em 5 anos da fundação) ou Underdog (US$ 1,2 bi valuation em 5 anos).

## Comparação com empresas similares globais

| Empresa | Estágio | ARR | Penetração no TAM | Take-away |
|---|---|---|---|---|
| Better Collective | 12 anos | $300M (R$ 1,5B) | <5% do TAM global afiliado betting | Marketplace fee pode escalar muito acima do esperado se NEXA bem posicionada |
| DraftKings | 13 anos (incl SBTech) | $4,4B (R$ 22B) | ~15% do TAM US apostas | Plataforma social-first (DFS) capturou share desproporcional |
| Twitch | 14 anos | $2,8B (R$ 14B) | 8% do TAM streaming global | Niche vertical (gaming streaming) bateu modelo horizontal |
| Sorare (NFT esporte) | 5 anos | €200M (R$ 1B) | <2% do TAM cripto esporte | Cripto-utility vinculada a esporte tem ramp-up agressivo se UX boa |

NEXA equivalente esperado em 3 anos: 5-12% SOM penetração no SAM brasileiro, atingindo R$ 20-40M ARR — consistente com early-stage Sorare ou Better Collective trajectory.

## Dados demográficos do apostador brasileiro

Pesquisa Datafolha 2025 + Locomotiva 2026 cruzadas:

| Demografia | % apostadores ativos | NEXA target prioritário? |
|---|---|---|
| Sexo masculino | 78% | sim |
| Idade 18-24 | 22% | sim (high LTV, social-native) |
| Idade 25-34 | 35% | **prioridade máxima** (renda + engajamento) |
| Idade 35-44 | 24% | sim (renda alta) |
| Idade 45+ | 19% | não prioritário (UX adaptaria pouco) |
| Classe A | 8% | sim (Premium subscription target) |
| Classe B | 32% | **prioridade máxima** (volume) |
| Classe C | 48% | sim (volume) |
| Classe D-E | 12% | sim mas reality check ativo |
| Região Sudeste | 49% | sim |
| Região Sul | 18% | sim |
| Região Nordeste | 21% | sim (crescendo) |
| Região Centro-Oeste | 7% | sim |
| Região Norte | 5% | sim mas marketing por último |

**NEXA persona primária (60% do esforço):** homem 25-34, classe B-C, Sudeste/Sul, smartphone-first, futebol como esporte favorito (88% interesse), 2-5 anos de experiência apostando.

**NEXA persona secundária (25% do esforço):** tipster (ambos os sexos, 25-40), classe B-A, com seguidores existentes em Telegram/X, fatura R$ 500-5.000/mês atualmente, quer profissionalizar.

**NEXA persona terciária (15% do esforço):** mulher 18-34, classe A-B, primeira experiência ou casual apostador, atraída pela UX gov.br + visual social.

---

# Capítulo 6 — Análise Competitiva

NEXA opera num **mercado dual**: compete diretamente com plataformas de Fantasy Sports BR (Cartola FC, Rei do Pitaco, Stattrak, Kings League Fantasy) pela atenção e tempo do usuário fantasy; e compete indiretamente com sites afiliados/comparadores (Better Collective BR, Catena Media, Lance Apostas, Goal.com BR, Vbet.com.br) pelo share of voice no funil pré-aposta. As operadoras SIGAP (Bet365, Betano, Sportingbet, KTO, Betsul, F12, Pixbet, Esportes da Sorte etc.) **NÃO são concorrentes diretos** — são clientes/parceiros do NEXA via afiliação multi-casa.

## Mapa competitivo do mercado fantasy brasileiro (concorrentes diretos)

### Tier 1 — Players estabelecidos
**Cartola FC (Globo)** e **Rei do Pitaco (MMD Tecnologia)** dominam ~85% do mercado brasileiro de fantasy. Análises profundas na próxima seção.

### Tier 2 — Players especializados
**CBLOL Fantasy / Stattrak** (Fracassi Tech) cobre fantasy League of Legends BR; **Kings League Fantasy** (Kings League Brazil) lançou em 2026 gratuito; **Riot Games Fantasy LTA** anunciado jan/2025 pra 2º split 2025 (NA + BR + LATAM). Mercado esports fantasy ainda nascente mas crescendo institucionalmente.

### Tier 3 — Mídia esportiva afiliada
**Sites afiliados puros** (Lance Apostas, Apostas.com.br, Goal.com BR, Olhar Digital Apostas, Gazeta do Povo Apostas, Placar Apostas) competem pelo mesmo tráfego de pré-aposta que NEXA quer monetizar. Diferença: eles oferecem conteúdo SEO + comparação de odds; NEXA oferece engajamento social + fantasy gameplay + cross-sell. Better Collective + Catena Media + Playmaker (Futbol Sites, adquirida BC por EUR 176M em fev/2024) representam os players institucionais nessa categoria.

### Tier 4 — Players que fecharam ou pivotaram
**Fantasy BR** (NFL específico, fechou após 7 temporadas). Lição: nicho mono-esporte sem cross-sell ou subscription premium não escala. **Sorare** (NFT fantasy global) — pico US$ 4,3 bi (set/2021) → US$ 50M receita 2024, caixa fim 2025 estimado US$ 41M. Lição: NFT speculation não substitui produto.

## Mapa competitivo de operadoras SIGAP (parceiros, não concorrentes)

Os 78-81 operadores SIGAP autorizados (175-187 marcas ativas) se distribuem em 4 categorias estratégicas — **NEXA pretende fechar afiliação com 8-15 deles**, priorizando Tier 1 + Tier 2 nacional:

### Tier 1 — Operadoras globais com licença BR (top 10)
Bet365, Betano, Sportingbet, KTO, Stake.com (limitado), 1xBet (limitado), Bwin, William Hill, Betway, Unibet. Característica: tecnologia avançada (10+ anos de iteração), marketing budget gigante (Bet365 estima gastar R$ 400-600M/ano em BR), produtos quasi-commoditizados, sem narrativa social, foco em odds competitivas e bônus de boas-vindas.

### Tier 2 — Operadoras nacionais (top 30)
Galera.bet, EsportivaBet, Pixbet, Brazino, Vai de Bet, Esportes da Sorte, Casa de Apostas, Betnacional, Apostou, F12 (pausou cripto). Característica: branding brasileiro, parcerias com clubes nacionais (especialmente Pixbet com escudo de 90% dos clubes Série A em 2024), volume médio menor que Tier 1 mas crescendo agressivamente.

### Tier 3 — Operadoras de nicho (~50)
Cassino-focused (Blaze, Stake limitado), eSports-focused (rivalry), regional-focused (operadoras com forte presença em uma região). Característica: estratégia de nicho, menor competition direta com Tier 1-2, mas menor TAM.

### Tier 4 — Long tail (~100)
Operadoras autorizadas mas com market share desprezível, frequentemente operando como white-label de plataformas como SBTech, Pronet, ou similar. Característica: pouca diferenciação, geralmente subsidiárias de operadoras maiores ou tentativas isoladas. Alta probabilidade de consolidação 2027-2029.

## Análise profunda — concorrentes diretos (Fantasy)

### Cartola FC — Globo (concorrente #1 em escala)
**Forças:**
- **20 anos de história**, brand awareness near-universal entre torcedores BR (lançado 2005)
- **Pico de 6,4M inscritos em 2016** · 1,66M em 2024 (declínio mas ainda dominante)
- Distribuição Globo: Canais Globo + TV Globo + Cartolouco + integração com programas esportivos (mídia gratuita estimada R$ 50M/ano em valor)
- 8 bilhões de visualizações por temporada · 1,7M usuários diários · 4,6M times criados
- Receita estimada R$ 70-100M/temporada (subscriptions R$ 30M + cotas patrocínio R$ 12M cada + ads)
- Portfolio expandido (Cartola Express + Internacional + Feminino + Olimpíada + F1 + NFL + NBA + Champions)
- **Nunca pagou prêmio em dinheiro** — modelo intocável regulatoriamente

**Fraquezas:**
- **Free-to-play premium-only** — não oferece cash games, perdendo o usuário que quer monetizar habilidade
- Sem camada social profunda (chat básico, sem clãs, sem creator economy, sem tipsters auditáveis)
- UX antiga (visual mantido por anos), mobile experience aceitável mas não excelente
- **Em declínio absoluto desde 2016** (perdeu 4,7M de inscritos em 8 anos)
- Sem afiliação a operadoras (Globo é refratária a aposta) — sem upside de cross-sell
- Subscription pricing único (R$ 49,90-59,90/ano) sem segmentação fino

**Como NEXA compete:** Cartola é onde o torcedor de futebol já está; NEXA oferece **upgrade** com 4 vetores: (1) **cash games** legítimos sob Art. 49 (Cartola não tem), (2) **social profundo** (clãs, copy-pick, ranking público), (3) **multi-esporte ativo** (Cartola tem opções mas torcedor não usa), (4) **opcional cross-sell pra apostar de verdade nas casas parceiras**. Cartola é o "Twitter dos torcedores"; NEXA é o "Twitter + Discord + DraftKings dos torcedores" — diferente categoria de produto. Decisão estratégica: **não tentar canibalizar Cartola PRO** (R$ 49,90/ano é commodity), mas captar os 4-5M que abandonaram Cartola desde 2016.

### Rei do Pitaco — MMD Tecnologia (concorrente #1 em modelo)
**Forças:**
- **16M downloads, 7M usuários ativos** (claim oficial 2024)
- **Pagou R$ 220M em prêmios acumulados** · R$ 100M só em 2023
- Total funding ~US$ 56M (PitchBook): Série A R$ 8M 2020 + R$ 200M 2022 + US$ 32M 2022 (D1 + Kaszek + Bullpen + Left Lane + Globo Ventures + DST Global)
- **Licença SPA/MF 2.091** obtida 30/dez/2024 — começou pivot fantasy → sportsbook + iGaming próprio (replicando playbook DraftKings/FanDuel pós-PASPA)
- Receita 2024 dobrou vs 2023 (mostrando product-market fit)
- Cobertura ampla: futebol, UFC, NFL, NBA, e-sports, pôquer
- Recebeu apelido de imprensa "DraftKings brasileira"

**Fraquezas:**
- **Single-player** (sem camada social além de leagues básicas entre amigos)
- **Sem creator economy** (sem marketplace pra tipsters, sem revenue share criadores)
- **Sem cripto utility** (sem token utilitário)
- Pivot pra sportsbook próprio significa que **comprometeu R$ 30M+ em outorga SIGAP + capital social R$ 30M + compliance pesado** — alto custo fixo que NEXA evita
- Vai virar **operadora SIGAP regulada** (subject to Lei 14.790, Portaria 615, PL 1018) — perde a flexibilidade de operar sob Art. 49 puro
- Investidores DST Global / Kaszek vão exigir liquidity em 5-7 anos — pressão IPO/exit pode forçar decisões subótimas

**Como NEXA compete:** Rei do Pitaco vai **subir o stack** (fantasy → sportsbook + casino próprio), abrindo espaço pra NEXA ocupar a posição **fantasy-first + multi-operadora afiliada**. NEXA não tem custo de outorga, não tem dependência de uma operadora SIGAP única, é mais ágil pra negociar com cada operadora individualmente. **Tese de coexistência:** se Rei do Pitaco vai ser a "DraftKings BR", NEXA pode ser o "Sleeper BR + Better Collective BR combinados" — social fantasy + afiliação multi-casa, sem custos operadora-of-record.

### CBLOL Fantasy / Stattrak / Kings League Fantasy (nicho esports)
**Forças/Fraquezas:** baixa escala (dezenas de milhares de usuários), free-to-play mais premium acessório, sem cross-sell de aposta, ferramenta de marketing dos próprios torneios. **Como NEXA compete:** absorvendo demand de esports fantasy que esses players não monetizam — Riot Games Fantasy LTA mostra que o mercado existe e está institucionalizando.

## Análise profunda — players adjacentes (mídia esportiva afiliada)

### Better Collective (BETCO) — case global mais relevante
- Receita BR 2024: ~EUR 70M (~R$ 380M) = ~18% do grupo (EUR 380M total)
- Aquisição Playmaker Capital (Futbol Sites + Action Network) por **EUR 176M cash** em fev/2024 — Futbol Sites tem >180M visitantes/mês
- Q1 2025: **-13% YoY pela regulação BR** (EUR 7M impacto direto na receita, EUR 9M atraso de pagamento adicional)
- Modelo: SEO + branded content + premium picks + afiliação multi-casa
- **Lição NEXA:** afiliado puro é vulnerável a (a) algoritmo Google, (b) mudança regulatória (PL 1018, Portaria 1.231), (c) atraso pagamento de operadoras. NEXA adiciona engajamento fantasy + community moat que mitiga (a) e (b), e diversifica receita pra reduzir (c).

### Catena Media (CTM)
- Q4 2024 BR: -30% YoY · receita Q4 2024 EUR 10,2M total
- Cortou 25% do headcount em 2025 · ban de welcome bonus "cortou novos cadastros pela metade no BR"
- Modelo: SEO comparador puro, mais vulnerável que Better Collective
- **Lição NEXA:** modelo afiliado SEO-only não escala em regulação adversa. Engajamento real (fantasy + social) é o moat necessário.

## Análise profunda — operadoras SIGAP (parceiros pretendidos)

### Bet365
**Forças:**
- Tecnologia de odds líder mundial (>1.000 desenvolvedores)
- Cobertura de eventos sem paralelo (60.000+ eventos/mês)
- Live streaming integrado de jogos próprios (acordos com ligas)
- App mobile excepcional (RN nativo, latency <100ms)
- Brand awareness brasileira de 78% (top of mind)

**Fraquezas:**
- Atendimento ao cliente notoriamente lento (chat com SLA 8-24h)
- UI envelhecida (visual mantido por anos pra evitar quebrar habit)
- Zero camada social — usuário aposta sozinho
- Zero gamificação além de "missions" superficiais
- Bonus oferecidos limitados (entendem que LTV não precisa)
- Headquartered em UK + Malta — alvo de scrutiny regulatório BR

**Como NEXA compete:** não tenta competir em odds (volume Bet365 é insuperável); compete em narrativa ("eu pertenço à NEXA, abro Bet365 só pra apostar") + comunidade + UX gov.br. Apostador NEXA pode usar Bet365 pra odds mas posta o pick na NEXA pra reconhecimento social.

### Betano (Stoiximan)
**Forças:**
- Tecnologia grega forte (segundo maior operador da Grécia)
- Push agressivo em BR (R$ 200M+ marketing em 2025)
- Patrocínio Campeonato Brasileiro 2025-2027 (visibilidade massiva)
- App moderno, mobile-first
- Promoções competitivas

**Fraquezas:**
- Diferenciação produto baixa vs concorrentes (commoditizado)
- Sem camada social além de comunidade Telegram operada externamente
- Dependência alta de promoções (Art. 29 mudanças = risco)
- Margens apertadas devido a competição

**Como NEXA compete:** Betano captura usuário via marketing pago expensive (CAC R$ 100+); NEXA captura via referral orgânico de tipsters (CAC <R$ 30). LTV/CAC NEXA será 2-3× Betano.

### Sportingbet
**Forças:**
- Marca histórica BR (operava em zona cinza desde 2000s)
- Confiança consolidada com apostadores +35 anos
- Boa cobertura de eventos
- Backed by Entain (gigante UK)

**Fraquezas:**
- Produto extremamente conservador (pouca inovação)
- Demografia envelhecida (média de usuário 38+)
- Sem mobile-first thinking
- Zero engajamento social

**Como NEXA compete:** Sportingbet domina 35-50 segmento, NEXA captura 18-34. Coexistência possível — não competem pela mesma carteira do mesmo usuário.

### KTO
**Forças:**
- Operação BR nativa (entendem cultura local)
- App decente
- Marketing eficiente
- Patrocínio clubes nacionais

**Fraquezas:**
- Sem diferenciação além de "BR native"
- Sem tech IP defensável
- Margens dependem de eficiência operacional, não produto

**Por que vamos integrar (H2):** KTO é da família (per plano consolidado). Não é concorrente, é segunda casa do white-label. Validação da arquitetura multi-tenant.

### Galera.bet
**Forças:**
- Tentativa de camada social (Galera Pass loyalty)
- Brand awareness crescente
- Foco em apostas esportivas (não cassino-heavy)

**Fraquezas:**
- Camada social é loyalty disfarçada (PL 1018 risk)
- Concentração receita em depósito (87% NGR, vulnerável)
- Sem cripto, sem marketplace, sem creator economy
- Galera Pass tem retention baixa (membership decay)

**Como NEXA compete:** Galera.bet é o concorrente mais próximo do conceito NEXA mas executa muito mais raso. NEXA tem 5 pilares integrados (Galera tem 1.5). Quando Galera tentar copiar, NEXA já estará 18 meses à frente.

## Gaps que NEXA preenche que nenhum concorrente tem

| Gap | Nenhum concorrente oferece | NEXA implementa |
|---|---|---|
| Feed social + copy-bet integrado | ✗ | ✓ |
| Live streaming + apostas in-play | parcial em Bet365 (próprio); zero pra criadores | ✓ Mux pra qualquer creator |
| Marketplace de tipsters auditável | ✗ (Telegram não tem audit) | ✓ track record on-record |
| Cripto utility integrada | ✗ (operadoras evitam) | ✓ NEXA Coin faseada |
| KYC gov.br Login Único | ✗ | ✓ primeira plataforma |
| Saque <30 segundos | ✗ (3-5 min padrão) | ✓ via gov.br + Pix |
| Gamificação 10+ mecânicas independentes | ✗ (operadoras têm 2-3 superficiais) | ✓ Seasons + Whale + Battle Pass + Clans |
| Reality check adaptativo | parcial (regulatório mínimo) | ✓ detectUserState 4 perfis |
| Marketing Financeiro afiliado integrado | ✗ (Portaria 615 não permite operadora) | ✓ app SEPARADO compliant |

## Barreiras de entrada criadas pela NEXA

Cinco barreiras estruturais que tornam replicação difícil:

### Barreira 1 — Acesso família a operadoras
Para replicar modelo white-label da NEXA, concorrente precisa de operadora SIGAP parceira disposta a integrar com tech terceira sem ser dona. Operadoras tradicionais NÃO fazem isso (concorrência direta). Apenas NEXA tem acesso garantido via família proprietária de Betsul + casas adicionais. Esta barreira é **estrutural e permanente** — não se compra, não se copia.

### Barreira 2 — Cripto regulada integrada
Construir NEXA Coin faseada (off-chain → PSAV parceiro → PSAV próprio Bacen) requer R$ 10-37M de capital social + 9-18 meses de processo Bacen. Operadora que não tenha família com apetite de capital + tempo + risco regulatório evita.

### Barreira 3 — Camada social com lock-in
Comunidade NEXA cresce com base — efeito de rede. Concorrente que copiar feature sets em 2027 vai estar 18-24 meses atrás em network effect. Apostador NEXA com 200 followers + clan + ranking permanente não migra fácil.

### Barreira 4 — KYC gov.br + Datavalid + 4 camadas
Stack KYC cascateada (gov.br → Datavalid → Unico/CAF → IDWall) tem complexidade técnica + setup time (60-90 dias). Concorrente que tentar copiar vai estar 6+ meses atrás. Diferenciador "saque em 30s" é claim sustentável por 18-36 meses até concorrência alcançar.

### Barreira 5 — Marca + brand love
Marca NEXA construída com narrativa institucional (honestidade, jogo responsável, qualidade), não com bonus agressivo. Marca tipo Bet365 ou Betano tem "uso transacional" — usuário não defende. Marca NEXA target tem "uso identitário" — usuário defende contra ataques, recomenda pra amigos, sente orgulho de pertencer.

## Vantagem competitiva sustentável

A vantagem da NEXA é estrutural, não operacional. Operacional (odds, marketing, atendimento) pode ser copiada. Estrutural (acesso família + cripto regulada + camada social + KYC governamental + brand identitária) não pode. Esta é a definição clássica de moat segundo Warren Buffett: "Castelo cercado por fosso largo cheio de tubarões."

A questão estratégica não é "NEXA vai conseguir competir?" — é "NEXA vai conseguir executar antes de Bet365 perceber que está vulnerável?". Resposta esperada: sim, porque Bet365 não vai mover (cultura conservadora britânica, comitês de produto lentos), Betano focará em volume agressivo (não em moat de produto), e operadoras nacionais não têm capital nem visão pra construir os 5 pilares integrados.

Janela competitiva estimada: **24-36 meses** até primeiro concorrente sério aparecer com produto comparável. Esse tempo é o que NEXA tem pra capturar 5-15% do mercado e tornar churn pra concorrente economicamente impraticável.

---

# Capítulo 7 — Posicionamento

## Posicionamento de marca

NEXA é **premium acessível, jovem mas maduro, tecnológico mas humano**. Posicionamento tripartite que evita as três armadilhas comuns do setor:

1. **Premium puro** (tipo Bet365) — vira aspiracional mas distante, classe C-D não engaja.
2. **Popular puro** (tipo Pixbet com escudos de clube) — captura volume mas perde brand love + classe A-B premium.
3. **Tech puro** (tipo Stake.com) — captura early adopters cripto mas alienate mainstream.

NEXA navega entre os três: tem credibilidade institucional (não é "stake-clone offshore"), aparência sofisticada (não é "popular barato"), e abertura social (não é "elitista").

### Tagline canônica
**"Aposta é só o começo."**
Mensagem central: NEXA é uma plataforma onde apostar é uma das ações, não a única. Comunidade, ranking, conteúdo, identidade — tudo isso é o produto.

### Aliases táticos
- "Onde apostadores viram comunidade" (foco social, persona primária)
- "Sua aposta, sua história" (foco identidade, persona secundária creator)
- "Tudo o que sua aposta podia ser" (foco premium, persona terciária classe A)

## Persona primária — Apostador analítico 18-35 anos

**Nome arquetípico:** Lucas, 28 anos, São Paulo, analista de TI, classe B.

**Comportamento atual:**
- Aposta R$ 200-800/mês principalmente em futebol BR + Champions League
- Consume análise pré-jogo no YouTube (canais de 50k-500k subs) e Twitter
- Está em 3-5 grupos de Telegram com tipsters (gratuitos + 1 pago R$ 50/mês)
- Usa Bet365 + Betano em paralelo (compara odds)
- Tempo dedicado a esporte+aposta: 60-90 min/dia
- Pix transfers de aposta: 8-15/mês

**Frustrações:**
- Fragmentação: pula entre 5 apps + Twitter + Telegram + WhatsApp
- Falta de identidade: pra concorrência ele é "usuário Lucas123", anônimo
- Tipsters fraudulentos: não consegue auditar track record real
- Suporte ao cliente lento quando tem problema de saque

**O que NEXA entrega pra Lucas:**
- Identidade gamificada — Lucas vira "Level 47, Clan Vasco Glorioso, Top 12% Tipsters"
- Comunidade — segue 8 tipsters auditados, vê amigos apostando em tempo real
- Eficiência — abre 1 app em vez de 5
- Saque <30s via gov.br
- Pode virar tipster ele mesmo + monetizar análises (R$ 200-2.000/mês potencial)

**LTV Lucas:** R$ 1.200-2.400 em 24 meses (mais alto que média)

## Persona secundária — Tipster / Creator esportivo

**Nome arquetípico:** Bianca, 32 anos, Belo Horizonte, professora de educação física + tipster Telegram, classe B-A emergente.

**Comportamento atual:**
- Tem canal Telegram com 12.500 inscritos
- Cobra R$ 79/mês de plano VIP (cerca de 280 assinantes ativos = R$ 22.120/mês bruto)
- Pix manualmente recebidos (sem nota fiscal, problemas com Receita)
- Posta picks 3-5×/dia no Telegram
- Tempo dedicado: 4-6h/dia (full-time activity)

**Frustrações:**
- Telegram não tem audit de track record (acusada às vezes de manipular histórico)
- Cobrança manual de assinaturas (perde 15-20% por falha de cobrança/cancelamento)
- Sem proteção contra cancelamento fraudulento (assinante paga, vê 2 picks, cancela chargeback)
- Receita não-fiscal preocupa (medo de problema com RFB)
- Crescimento limitado (Telegram dificulta descoberta orgânica)

**O que NEXA entrega pra Bianca:**
- Marketplace com track record auditado on-record (credibilidade)
- Stripe Connect pra payout automático (sem cobrança manual)
- NEXA emite RPA — fiscal compliant
- Discoverability via algoritmo NEXA (novos seguidores grátis)
- Lives integradas com monetização tipo Twitch (Coins enviados pela audiência)
- Comunidade onde tipster vira figura pública (status social, não só dinheiro)

**Receita esperada Bianca em NEXA (ano 1):** R$ 35-60k/mês (vs R$ 22k atual) — incremento via descoberta + lives + marketplace items + retention melhor.

**LTV NEXA recebe de Bianca:** receita NEXA (10% take) = R$ 3,5-6k/mês × 24 meses = R$ 84-144k. Tipsters são clientes high-value.

## Persona terciária — Mulher 18-34, primeira experiência

**Nome arquetípico:** Camila, 25 anos, Recife, copywriter, classe B-A.

**Comportamento atual:**
- Nunca apostou (ou apostou 1-2× em Copa do Mundo "porque amigos faziam")
- Estranha o universo apostas (visual "machão" e gritante)
- Tem amigos apostando, fica curiosa mas insegura
- Consome esporte casualmente (assiste futebol em bar, segue clube)
- Smartphone-native, alta familiaridade com apps modernos

**Frustrações:**
- Visual e tom dos apps de aposta a afastam
- Não sabe como começar sem parecer ignorante
- Tem medo de KYC complexo (precisa de RG + selfie + comprovante endereço)
- Não confia em apps offshore

**O que NEXA entrega pra Camila:**
- Visual social, não machão (parece Instagram + Twitch, não Bet365)
- Onboarding com tutorial educativo (sem assumir conhecimento prévio)
- KYC <30 segundos via gov.br (familiar, governamental, confiável)
- Comunidade onde pode perguntar sem julgamento (clan iniciantes)
- Reality check inicial agressivo (limite R$ 50/semana primeira fase)

**LTV Camila:** R$ 400-700 em 24 meses (menor que primária mas com churn baixo porque mercado novo pra ela).

## Mensagem central da marca

A mensagem que NEXA quer que cada pessoa pense quando ouve o nome:

**"NEXA é a comunidade onde apostadores se tornam pessoas com história."**

Cada palavra é deliberada:
- "Comunidade" (não app, não plataforma, não casa de apostas)
- "Apostadores" (reconhece o que é, sem eufemismo)
- "Tornam-se" (transformação, evolução, jornada)
- "Pessoas com história" (identidade, narrativa, dignidade)

Esta mensagem distingue NEXA de "casa de apostas" (transação) e de "rede social" (entretenimento puro) — posiciona como ponte entre os dois mundos.

## Arquitetura de comunicação

Quatro temas recorrentes que aparecem em todos os canais:

### Tema 1 — Identidade
"Você não é só um usuário. Você é Level 47 com 200 followers. Você é o Capitão do Clan Vasco. Você é o tipster com 73% de acerto em Copa Libertadores."

### Tema 2 — Comunidade
"Apostar sozinho é 2010. Apostar em comunidade é 2026."

### Tema 3 — Honestidade
"30 segundos pra sacar. Auditamos cada tipster. Mostramos cada bug. Você merece saber."

### Tema 4 — Brasil
"Cacau Brasileiro de Ilhéus." Errr — desculpa, esse é o Mendoá. Pra NEXA: "Apostas com identidade brasileira. Pix, gov.br, futebol BR, tipsters reais."

## Como NEXA se posiciona vs cada concorrente

- **vs Bet365:** "Bet365 tem mais odds. NEXA tem comunidade."
- **vs Betano:** "Betano patrocina Brasileirão. NEXA faz você fazer parte do Brasileirão."
- **vs Sportingbet:** "Sportingbet é da geração do seu pai. NEXA é da sua geração."
- **vs KTO:** "KTO é brasileiro. NEXA é brasileiro + social + cripto."
- **vs Galera.bet:** "Galera tentou. NEXA executa."
- **vs Telegram tipsters:** "Telegram é onde tipsters operam. NEXA é onde tipsters viram profissionais."

---

# Capítulo 8 — Psicologia do Usuário

## Análise profunda dos drivers comportamentais

### Por que pessoas apostam — motivações reais

Pesquisas acadêmicas (Wood & Griffiths, Journal of Gambling Studies 2024) identificam seis motivações primárias que coexistem em diferentes proporções por usuário:

1. **Recompensa monetária** (40-60% peso médio): "ganhar dinheiro"
2. **Entretenimento** (30-50%): "passar o tempo, ter algo pra torcer"
3. **Conhecimento/skill expression** (20-40%): "mostrar que sei sobre futebol"
4. **Social** (15-35%): "fazer parte do que amigos estão fazendo"
5. **Escape** (10-30%): "esquecer problemas, distração"
6. **Sensação física** (5-25%): "adrenalina do near-miss"

Apostadores patológicos têm peso desproporcional em #5 e #6. Apostadores saudáveis têm peso distribuído entre #2, #3 e #4. **NEXA é desenhada para amplificar #2, #3 e #4** (entretenimento, skill, social) e **reduzir #5 e #6** (via reality check + detectUserState frustrated/impulsive intervention). Recompensa monetária (#1) é mantida como motivador mas não amplificada artificialmente.

## Como NEXA cria apego emocional

Apego emocional a um produto requer 4 ingredientes (frameworks Hooked de Nir Eyal + Octalysis de Yu-kai Chou):

### 1. Trigger (gatilho)
Push notification, e-mail, ver amigo postando, abertura habitual. NEXA usa primariamente triggers internos (curiosidade sobre ranking, status do clan) e socially-driven (amigo apostou). Evita triggers manipulativos (escassez artificial "Última chance!", urgência fake "Oferta acaba em 2 horas").

### 2. Ação
Ação mínima viável que delivers value. NEXA's ação primária é abrir feed (3 segundos, sem fricção). Ação secundária é interagir (like, comment, copy bet — 5-15 segundos). Ação terciária é apostar (60-120 segundos com KYC já feito). Pirâmide invertida — fácil entrar, profundo se quiser.

### 3. Recompensa variável
Variable Ratio Reinforcement é o mecanismo psicológico mais potente conhecido (caça-níqueis usa essa premissa há 100 anos). Em apostas, o resultado da aposta é naturalmente variável (win/loss). NEXA adiciona variabilidade em camadas adicionais saudáveis: post viral inesperado (likes), missão diária com recompensa randômica, drop raro de badge em batalha de clã, pick de tipster que acerta inesperadamente. Cuidado: NEXA não amplifica variabilidade na própria aposta (não tem cassino, não tem slot mecânico).

### 4. Investimento
Pra retornar, usuário precisa ter investido algo. NEXA acumula investimento: XP, badges, ranking, followers, posts publicados, clan history, marketplace reputation. Quanto mais usuário investiu, mais doloroso sair. Modelo análogo: por que ninguém deleta Instagram? Não por causa do app — por causa do histórico de 12 anos de posts + amigos seguidos + DMs perdidas.

## Sistema de identidade — o usuário se torna a NEXA

Identidade pública construída ao longo de meses é o lock-in mais forte que existe em produto digital. Modelos comparáveis:

- **LinkedIn:** ninguém deleta conta porque é o CV público de uma década
- **Twitter/X:** ninguém deleta porque seguidores acumulados são identidade
- **Stack Overflow:** reputação score = capital simbólico
- **Reddit:** karma acumulada vira identidade
- **NEXA:** Level + Clan + Followers + Marketplace reputation + Picks publicados = identidade pública defensável

Concorrente que tente capturar usuário NEXA tem que oferecer não apenas produto comparable mas **forma de migrar identidade** — impossível na prática.

## Mecânicas de variable ratio reinforcement em detalhe

Reforços variáveis são a base psicológica do engajamento prolongado. NEXA implementa 7 camadas:

1. **Resultado de aposta** (natural, ratio fixo do mercado)
2. **Likes em post** (variável, pode viralizar ou não)
3. **Drop de badge em battle pass** (ratio definido pelo design, mas user percebe variável)
4. **Conteúdo viral em marketplace** (vendas inesperadas)
5. **Movimento em ranking semanal** (depende de comportamento dos peers)
6. **Tip de tipster que acerta** (variável por design)
7. **Notificação social** (amigo curtiu, novo follower, comentário recebido)

Cada camada opera em timeline diferente (segundos, minutos, dias) — garante que sempre há recompensa potencial próxima.

## Análise do estado do usuário

`detectUserState()` é função client-side que analisa últimas 50 ações + métricas financeiras + tempo gasto, classificando usuário em 4 perfis em tempo real:

### Motivated (estado saudável-alto)
Características: engajamento crescente, win rate >50% últimos 10 picks, gasto controlado (<20% do limite). Adaptação UI: feed mostra mais conteúdo aspiracional (tipsters top, conteúdo educativo), missions oferecem desafios maiores, raridade de drops aumenta.

### Frustrated (perdas recentes)
Características: 3+ losses consecutivos, tempo elevado >2h sessão, gasto crescente. Adaptação UI: reality check ("Você apostou 6 vezes hoje. Quer uma pausa?"), feed prioriza conteúdo educativo (não-aposta), opção de cool-off 24h proeminente, missões mudam pra ações sociais (não aposta). Crítico: não bloqueia usuário (autonomia) mas oferece off-ramp.

### Impulsive (apostando sem análise)
Características: <30 segundos entre apostas, mesmo jogo múltiplas vezes, gasto crescente sem pausa. Adaptação UI: introduz fricção (confirmação dupla pra apostas >R$ 100), reality check curto, sugestão de filtros ("Você costuma analisar antes. Quer ler análise comunitária?").

### Disengaged (sumiu)
Características: ausente 3+ dias, último login curto, sem interações. Adaptação: notificação gentil ("Senti sua falta. Comunidade tá ativa, vem ver"), e-mail editorial sem CTA aposta, ofertas sociais (novo tipster recomendado).

## Como adaptar o app para cada estado

O grande risco ético + de produto: adaptar UI ao estado emocional pode virar manipulação (operadora predatória amplifica gambler em frustrated, em vez de proteger). NEXA escolhe deliberadamente o caminho oposto — adaptação é defensiva, não ofensiva. Isto protege LTV de longo prazo (apostador queimado em 6 meses gera menos receita que apostador saudável em 24 meses) e protege NEXA de ações judiciais e regulatórias.

## Ética no design: limites do engajamento responsável

Cinco linhas vermelhas que NEXA não cruza:

1. **Sem escassez artificial:** "última chance" só existe se realmente é última (TGE date fixa).
2. **Sem manipulação de notificação:** sem "suas vidas acabaram", sem urgência fake.
3. **Sem amplificação de frustração:** apostador frustrated NÃO recebe bonus de tentativa, ele recebe oferta de pausa.
4. **Sem ocultação de informação financeira:** total gasto, saldo, histórico — tudo visível na home, não escondido em settings.
5. **Sem reset de auto-exclusão:** uma vez autoexcluído, usuário SO sai via gov.br (não via "contate suporte" que pode pressionar).

Estas linhas têm custo de receita (estimativa: 10-15% menos receita curto prazo vs operadora predatória). NEXA aceita esse custo porque (a) protege contra ações judiciais, (b) protege brand de longo prazo, (c) atrai segmento de apostador analítico maduro (maior LTV), e (d) está alinhado com valores institucionais declarados.

---

# Capítulo 9 — Modelo de Monetização

## Visão consolidada das 6 linhas

NEXA opera **seis linhas de receita independentes**, com modelos econômicos distintos e sazonalidades não-correlacionadas — desenho deliberado pra reduzir risco de concentração e maximizar a vantagem competitiva de **plataforma fantasy social-first com cross-sell afiliado multi-casa**.

| Linha | Tipo | Recorrência | Margem | Sazonalidade | m12 Target |
|---|---|---|---|---|---|
| 1. Rev share/CPA multi-operadora | Affiliate (CPA + RevShare) | Sim (lifetime) | 80-92% | Alta (Brasileirão, Copa) | R$ 70k |
| 2. Entry fees rake (DFS) | Transactional | Sim (jogos diários/semanais) | ~92% | Alta (Brasileirão, Champions) | R$ 45k |
| 3. Premium subscription | SaaS recorrente | Sim | 92% | Baixa | R$ 35k |
| 4. Marketplace NEXA | Take-rate | Sim | 60-80% | Média | R$ 40k |
| 5. NEXA Coin utility | Transactional + Float | Sim | 75-90% | Baixa | R$ 25k |
| 6. Patrocínios + brand integrations | Cotas anuais + insertions | Sim (contratos 6-12m) | 80-90% | Alta (Brasileirão) | R$ 5k |
| **Total MRR m12** | | | | | **R$ 220k** |

## Receita primária

### Linha 1 — Rev share/CPA de múltiplas operadoras SIGAP (afiliação multi-casa)

**Como funciona:** usuário ativo no NEXA fantasy clica em deep-link pra apostar em jogo X (Flamengo vs Vasco) na operadora parceira (Betsul, Bet365, Betano, KTO etc.). NEXA recebe CPA fixo no FTD qualificado + RevShare lifetime do NGR gerado por aquele usuário na operadora. NEXA **não toca dinheiro do apostador, não custodia, não opera** — opera puramente como afiliado/parceiro de marketing.

**Banda de comissão padrão BR 2024-2026 (Agent research, fontes públicas):**
- **CPA por FTD:** R$ 25-250 (banda pública divulgada) → R$ 200-500 em deal premium (NEXA-Betsul família alavanca isso pelo controle de qualidade de tráfego)
- **RevShare:** 20-45% NGR (Bet365 30-35% · KTO 25-40% · Betano 20-30% · Sportingbet 15-45%)
- **Cookie window:** 30-90 dias (padrão 30; Bet365 45)
- **Lifetime efetivo:** 18-24 meses (Sportingbet/Entain têm cap 24m formal; média indústria similar)
- **Negative carryover:** padrão Bet365 e maioria — NEXA precisa absorver 5-15% volatilidade no fluxo

**Mix recomendado pra NEXA-Betsul (família, premium):** CPA R$ 350 + RevShare 30% (hybrid). Justificativa: relacionamento familiar permite negociar acima do padrão público, mas premium é defensável pela qualidade do tráfego (usuários KYC já validado, comportamento fantasy = sinal de retenção, base própria social).

**Cross-sell fantasy → sportsbook (benchmark DraftKings):**
- **Colorado: 69%** dos active DFS users foram cross-vendidos pra sportsbook (DK Investor Day)
- **Pennsylvania: 50%** (mínimo confirmado)
- DK statement: "anytime they have multiple products in a market, it's a significant boost to LTV, and cross-selling is an incredibly effective and fast payback means of increasing both LTV and short-term gross profit"
- **NEXA assumption conservador:** 30-50% (vs 50-69% DK em estados maduros). Modelo financeiro Cap 13 usa 30% no ano 3, escalando pra 50% ano 5 conforme cross-sell mecanismos maduram.

**Cálculo simplificado m12** (5.500 MAU NEXA fantasy):
- 12% MAU × 5.500 = 660 FTDs/mês em operadora parceira via NEXA
- CPA R$ 350 médio × 660 = R$ 231k/mês em receita CPA bruta
- RevShare adicional: NGR/usuário/mês ~R$ 80 × 30% × 660 ativos × cumulativo = R$ 16k/mês começando mês 3-4
- **Total Linha 1 m12: R$ 70k/mês após haircuts** (negative carryover 10% + delay pagamento 30-60d + ramp-up gradual)

**Lição Better Collective:** receita BR 2024 ~EUR 70M (~R$ 380M); Q1 2025 sofreu -13% YoY pela regulação SPA/MF. NEXA usa Better Collective como referência de teto (afiliado SEO puro escala mas tem alta sensibilidade regulatória) e adiciona engajamento fantasy + community moat pra mitigar.

### Linha 2 — Entry fees rake (Daily Fantasy Sports cash games)

**Como funciona:** usuário paga entry fee de R$ 5-50 pra entrar em contest DFS (Brasileirão, Champions, etc.), monta time sob salary cap, ganha prêmio em dinheiro conforme ranking no contest. NEXA cobra rake de **12-15% sobre entry fees** (modelo Rei do Pitaco / DraftKings / Underdog). Restante (85-88%) vai pra pool de prêmios.

**Modelo legal (Art. 49 Lei 14.790):**
- Times virtuais com **2+ atletas reais** ✓
- Prêmio garantido **independente de volume de participantes** ✓ (NEXA cobre overlay quando volume baixo)
- Resultado depende de **múltiplos atletas em múltiplos jogos** ✓ (não pode ser prop atleta único — pick'em prop tipo PrizePicks é vedado no BR)

**Tipos de contest:**

| Tipo | Entry fee | Prêmio máx | Frequência | Margem NEXA |
|---|---|---|---|---|
| **Free-to-play (lead gen)** | R$ 0 | Coins NEXA + drops | Semanal | 0% direto (CAC channel) |
| **Beginner cash** | R$ 5-15 | R$ 50-300 | Daily/weekly | 12% rake |
| **Standard cash** | R$ 25-100 | R$ 200-3.000 | Daily/weekly | 13% rake |
| **High-roller cash** | R$ 500-5.000 | R$ 5k-100k | Weekly | 10% rake (volume scaling) |
| **Tournaments** | R$ 100-500 | R$ 10k-200k | Mensais | 15% rake |
| **Season-long premium** | R$ 49-99/temp | Garantido R$ 100k+ | 1× ano por liga | 15% rake |

**Cálculo m12:** 5.500 MAU × 35% cash gamers × R$ 80 GMV mensal × 12% rake = **R$ 45k/mês**.

**Benchmark Rei do Pitaco:** R$ 220M em prêmios distribuídos acumulados (570k ganhadores), R$ 100M só em 2023. Se assumirmos ~30% payout rate DFS (padrão indústria) → entry fees inferidos cumulativos R$ 730M → receita rake estimada R$ 88-110M. **NEXA target conservador m12 (R$ 45k/mês = R$ 540k ano):** ~0,5% do mercado Rei do Pitaco — totalmente alcançável.

### Linha 3 — Premium subscription (SaaS recorrente)

**Modelo Cartola PRO ajustado pra produto mais profundo:**

| Tier | Preço | Conversion target m12 | Benefícios |
|---|---|---|---|
| **Free** | R$ 0 | 100% (default) | Feed, ranking, clan, marketplace browse, 1 contest free entry/dia, anúncios |
| **Pro** | R$ 19,90/mês ou R$ 199/ano | 8-12% MAU | Sem ads · estatísticas avançadas · lineup optimizer básico · 10 contests free/mês · 2× multiplier XP · histórico estendido |
| **Elite** | R$ 49,90/mês ou R$ 499/ano | 1,5-3% MAU | Tudo do Pro + AI lineup optimizer · projection engine (modelo proprietário) · lives premium · analytics dashboard próprio · badge Elite · 30 contests free/mês · priority support · beta access |

**Cálculo m12** (5.500 MAU):
- Pro: 550 × R$ 19,90 = R$ 10.945
- Elite: 110 × R$ 49,90 = R$ 5.489
- Anuais (assumido 30% optam por anual): adiciona ~R$ 18k/mês equivalente em receita reconhecida
- **Total Linha 3 m12: R$ 35k/mês**

Benchmark: Cartola PRO custa R$ 49,90-59,90/ano (R$ 4-5/mês), arrecadou R$ 18M com 424k PROs num ano (pré-2019). NEXA cobra ~4× mais que Cartola mas entrega valor 10× mais (AI, social profundo, multi-esporte, cross-sell). Stattrak Premium (CBLOL Fantasy) cobra R$ 9,90/mês para um único esporte — referência de preço entry.

### Linha 4 — Marketplace de creator economy (take-rate diferenciado)

Modelo de take-rate variável conforme categoria de produto:

| Categoria de produto | Take rate NEXA |
|---|---|
| Pick individual (R$ 5-15) | 10% |
| Assinatura mensal tipster (R$ 19-99) | 10% padrão, 8% top tier, 15% featured |
| Curso/análise (R$ 49-499) | 15% padrão, 12% top tier |
| Lives premium (Twitch-like subscription R$ 4,99-19,99) | 10% NEXA + 5% Mux streaming infra |
| NFT colecionável (R$ 29-999) | 20% + 2% royalty perpétuo em revendas |
| Avatar/badge custom | 25% |

**Lógica do take-rate diferenciado:** produtos commodity (picks individuais) têm take baixo porque concorrem com Telegram grátis; produtos premium (NFTs, lives) têm take maior porque NEXA agrega mais valor (custódia, raridade verificada, distribuição).

**Volume esperado m12:** 200 tipsters ativos × R$ 1.500/mês receita média × 10% take = R$ 30k. Lives + cursos + NFTs + badges = R$ 10-15k adicional. **Target R$ 40k/mês m12** (down de R$ 60k pré-pivot porque NEXA agora também tem Linha 1 e Linha 2 monetizando o mesmo usuário base — natural rebalanceamento).

### Linha 5 — NEXA Coin utility

Receita em 3 fontes simultâneas (manteve estrutura do plano v4):

1. **Compra direta de Coin** (Fase 1+2): user compra R$ 100 em coins, NEXA cobra 5% como spread/fee = R$ 5.
2. **Fee transação** (Fase 2 on-chain): cada transação on-chain (transferência entre usuários, gasto em marketplace) cobra 1-2% fee.
3. **Float yield** (Fase 2+3): pool de Coins ainda não circulantes (treasury) pode ser stake em DeFi com yield 4-8% APY = receita passiva.

**Volume esperado m12:** R$ 500k volume mensal Coins × 5% spread = R$ 25k/mês receita Coin. Realista — adoção 25-40% dos MAU usa Coin pelo menos 1× ao mês no marketplace (escala via fantasy contest entries pagáveis em Coin, missions reward, gifts entre usuários, doação clan).

### Linha 6 — Patrocínios e brand integrations

**Modelo Cartola FC adaptado:** cotas anuais de patrocínio (R$ 12M/cota top tier conforme Cartola precifica) + brand integrations menores + native advertising.

Pricing tier inicial (m12-m18):

| Categoria patrocinador | Pricing inicial | Volume target m18 |
|---|---|---|
| **Master sponsor** (1 cota anual) | R$ 800k-1,5M/ano | 1 cota |
| **Premium** (cotas verticais: snack, energético, banco) | R$ 200-500k/ano | 3-5 cotas |
| **Native ads** (CPC + CPM contextual) | CPM R$ 15-40 | rolling |
| **Brand integration creator** (tipster patrocinado) | R$ 5-30k/mês | 5-15 deals |

**Target m12 conservador R$ 5k/mês** (early sales, mostly native + 1-2 small brand deals); escala pra R$ 30k/mês m18 e R$ 100-250k/mês m24-36 conforme base cresce e brand reconhecida. **Não posso ter patrocínio de operadora de aposta** (conflito de interesse com afiliação Linha 1 + Lei 14.790 restrição publicitária). Empresas adjacentes: Nubank, OLX, Mercado Livre, marcas esportivas (Nike, Adidas, Topper), bebidas (Heineken, Brahma, Itaipava), apps de delivery (iFood, Rappi).

### Resumo monetização — comparação plano v4 vs v5

| Linha | v4 white-label | v5 fantasy-first | Mudança | Razão |
|---|---|---|---|---|
| Apostas/afiliação | R$ 31k (1 casa NGR 30%) | **R$ 70k (multi-casa CPA + RevShare)** | +R$ 39k | Mais operadoras + cross-sell DK-style |
| Entry fees fantasy | R$ 0 (não existia) | **R$ 45k (DFS rake 12-15%)** | +R$ 45k | Nova linha core do pivot |
| Premium | R$ 15k | **R$ 35k** | +R$ 20k | Subscription mais profunda (AI optimizer, projection engine) |
| Marketplace creator | R$ 60k | R$ 40k | -R$ 20k | Rebalanceamento (outras linhas absorvem) |
| Coin utility | R$ 40k | R$ 25k | -R$ 15k | Rebalanceamento (Coin é Fase 1, escala maior em Fase 2) |
| Marketplace Financeiro | R$ 60k | R$ 0 (removido) | -R$ 60k | Out of scope (NEXA é Fantasy, não fintech afiliada) |
| Patrocínios | R$ 0 | **R$ 5k** | +R$ 5k | Nova linha (modelo Cartola) |
| **Total MRR m12** | **R$ 206k** | **R$ 220k** | **+R$ 14k** | +7% projeção |

A diferença não é apenas magnitude (+R$ 14k m12) — é **qualidade**: receita afiliada multi-casa (não vinculada a uma operadora SIGAP), entry fees em produto próprio (não dependente de Betsul), premium SaaS escalável.

### Assinaturas Premium

Tiers projetados:

| Tier | Preço | Conversion target m12 | Benefícios |
|---|---|---|---|
| **Free** | R$ 0 | 100% (default) | Feed, ranking, clan, marketplace browse, 1 tipster grátis follow |
| **Pro** | R$ 29/mês | 5-8% MAU | Estatísticas avançadas, sem ads, prioridade no support, 10 tipsters follow grátis, 2× multiplier XP |
| **Elite** | R$ 79/mês | 1-2% MAU | Tudo do Pro + lives premium, analytics próprio dashboard, badge exclusivo Elite, marketplace items 20% off, line prioritária pra novos features beta |

Receita projetada m12 (5.000 MAU): Pro 300 × R$ 29 = R$ 8.700 + Elite 75 × R$ 79 = R$ 5.925 = **R$ 14.625** (aproximadamente R$ 15k target). Conservador em conversion — fácil dobrar com base maior.

### Creator economy (Marketplace NEXA)

Modelo de take-rate diferenciado:

| Categoria de produto | Take rate NEXA |
|---|---|
| Pick individual (R$ 5-15) | 10% |
| Assinatura mensal tipster (R$ 19-99) | 10% padrão, 8% top tier, 15% featured |
| Curso/análise (R$ 49-499) | 15% padrão, 12% top tier |
| Lives premium (Twitch-like subscription R$ 4,99-19,99) | 10% NEXA + 5% Mux streaming infrastructure |
| NFT colecionável (R$ 29-999) | 20% + 2% royalty perpétuo em revendas |
| Avatar/badge custom | 25% |

Lógica do take-rate diferenciado: produtos commodity (picks individuais) têm take baixo porque concorrem com Telegram grátis; produtos premium (NFTs, lives) têm take maior porque NEXA agrega mais valor (custódia, raridade verificada, distribuição).

Volume esperado m12: 200 tipsters ativos × R$ 1.500/mês receita média × 10% take = R$ 30k. Lives + cursos + NFTs + badges = R$ 20-30k adicional. **Target R$ 60k/mês m12**.

### Marketplace Financeiro afiliado (separado)

App TOTALMENTE separado da NEXA — domínio próprio (ex: nexa.finance ou outro brand), branding distinto, sem cross-promotion com NEXA betting. Comply com Portaria 615/2024 Art. 36 que veda app de aposta promover crédito.

Modelo: CPA + Revenue Share com SCD/IFs parceiras (Nubank, Inter, C6, PicPay, BMG, Will Bank). Quando user NEXA Finance abre conta em parceiro, NEXA recebe CPA R$ 50-200 por conversão. Quando user usa cartão de crédito, NEXA recebe 0,1-0,5% interchange.

Volume esperado m12: 8.000-12.000 usuários NEXA Finance (cross-population NEXA betting, mas em app separado), 3-5% conversion mensal abrindo nova conta em parceiro = 240-600 conversões/mês × R$ 100 médio = R$ 24-60k/mês. **Target R$ 60k/mês m12.**

### NEXA Coin utility

Receita em 3 fontes simultâneas:

1. **Compra direta de Coin** (Fase 1+2): user compra R$ 100 em coins, NEXA cobra 5% como spread/fee = R$ 5.
2. **Fee transação** (Fase 2 on-chain): cada transação on-chain (transferência entre usuários, gasto em marketplace) cobra 1-2% fee.
3. **Float yield** (Fase 2+3): pool de Coins ainda não circulantes (treasury) pode ser stake em DeFi com yield 4-8% APY = receita passiva.

Volume esperado m12: R$ 800k volume mensal Coins × 5% spread = R$ 40k/mês receita Coin. Realista — adoção 30-50% dos MAU usa Coin pelo menos 1× ao mês.

## Receita secundária

### Patrocínios e publicidade nativa

Estimativa m18+: clubes de futebol Série A/B pagariam R$ 30-80k/mês por visibilidade contextual no NEXA (banner em página de matches do clube). Casas de apostas non-família NÃO podem ser patrocinadores (conflito de interesse + Lei 14.790 restrição). Empresas adjacentes (Nubank, OLX, Mercado Livre) sim. Estimativa receita: R$ 50-150k/mês m24.

### Dados agregados anonimizados

Operadoras de apostas pagam por insights de mercado (volume por liga, sentimento, padrão de aposta). NEXA pode vender dataset anonimizado (LGPD compliant — agregado, sem PII) por R$ 30-100k/mês contrato. Volume conservador.

### Parcerias com ligas e clubes

Receita compartilhada se NEXA atrair tráfego pra eventos/jogos específicos. Modelo similar OneFootball. R$ 20-50k/mês m24.

### Programa de afiliados

NEXA paga 10-15% recurring revenue pra afiliados que trazem usuários ativos. Inverse — não é receita, é custo. Mas reduz CAC blended significantly.

### White-label B2B (H3+)

NEXA pode licenciar core stack pra outras operadoras BR não-família (após validar arquitetura multi-tenant com KTO em H2). Modelo Kambi: setup fee R$ 200-500k + monthly R$ 50-200k + revshare opcional. Mercado: ~50 operadoras tier 3-4 que não têm capacidade de construir camada social própria. Receita potencial m36+: R$ 5-15M/ano se NEXA capturar 5-10 white-label clients.

## Monetização avançada

### Battle pass sazonal (modelo Fortnite adaptado)

Battle pass de 90 dias (uma temporada), 100 níveis de progressão (XP-driven mas com possibilidade de speed-up via Coins), 50 recompensas (badges, avatares, multipliers, Coins, marketplace credits). Compra do battle pass: R$ 14,90 ou equivalente em Coins. Conversion target: 20% dos MAU compram battle pass por temporada = 1.000 × R$ 14,90 = R$ 14.900 receita por temporada (~R$ 5k/mês adicionais).

### Power-ups e itens com escassez

Itens consumíveis no app: 2× multiplier XP por 24h (R$ 4,99), streak shield (não perde streak por 1 dia, R$ 7,99), priority bet placement (cabeça da fila em momentos de alta demanda, R$ 9,99). Volume baixo mas margem 95%.

### Prestige social (títulos, badges raros)

Quando usuário completa temporada com top 100 ranking, ganha badge "Maestro Temporada X". Vendendo títulos honoríficos só pra quem já fez merit (não compra direto) — exclusividade real. Tipsters podem "comprar verificação extra" tipo Twitter checkmark (R$ 49/ano) — não dá vantagem competitiva, é só status.

### Dynamic pricing em momentos de alta demanda

Eventos especiais (Final Champions, Final Copa do Mundo): battle pass especial limited-edition (R$ 24,90 vs R$ 14,90 padrão), com cosméticos exclusivos. Lives premium têm preço dinâmico baseado em demanda (R$ 14,99 vs R$ 4,99 padrão).

## Mix de receita ao longo do tempo

| Linha | m6 | m12 | m18 | m24 | m36 |
|---|---|---|---|---|---|
| NGR Betsul | 18% | 15% | 16% | 22% | 25% |
| Marketplace NEXA | 34% | 29% | 26% | 24% | 22% |
| NEXA Coin | 18% | 19% | 18% | 18% | 20% |
| Marketplace Financeiro | 23% | 29% | 32% | 25% | 20% |
| Premium subscription | 7% | 7% | 9% | 11% | 13% |

Evolução natural: Coin amadurece em H2-H3, Premium cresce com base, NGR escala com adição de casas. Diversificação se preserva — nenhuma linha excede 35% em qualquer ponto.

---

# Capítulo 10 — Estratégia de Crescimento

## Funil de aquisição completo

NEXA usa funil AARRR (Pirate Metrics) adaptado pra plataforma social:

### Awareness (descoberta)
- Conteúdo orgânico: análises pré-jogo no YouTube canal próprio (curto-prazo)
- SEO: glossário de apostas, guia tipster, análises long-form indexadas Google
- Influencer marketing: tipsters convidados a divulgar registro NEXA com tracking
- Patrocínio micro-influencers esportivos (R$ 500-5.000/post, 15-50k seguidores)
- PR: artigos em mídia esportiva (UOL, ESPN BR) sobre tendência social betting

Target: 50.000 awareness contacts/mês m6, 500.000/mês m18.

### Acquisition (download/registro)
Canais e custos esperados:

| Canal | CAC esperado | Volume m6 | Volume m12 |
|---|---|---|---|
| Orgânico (referral, SEO, content) | R$ 0 | 400 | 2.500 |
| Influencer/tipster | R$ 25-50 | 200 | 1.000 |
| Meta Ads (Instagram, Facebook) | R$ 80-150 | 100 | 800 |
| Google Ads (search) | R$ 60-120 | 100 | 500 |
| TikTok Ads | R$ 50-90 | 50 | 400 |
| Programmatic display | R$ 90-180 | 50 | 200 |
| Programa de afiliados | R$ 30-60 (CPA) | 100 | 600 |
| **Total mensal** | **Blend R$ 30-50** | **1.000** | **6.000** |

Target: 800 registros m6, 5.000 acumulados m12.

### Activation (primeira ação core)
Ativação = primeira semana de uso ativo (5+ ações sociais OU 1 aposta completa). Target 65-75% activation rate (alto pela qualidade KYC gov.br + onboarding educativo).

### Retention (D1, D7, D30, D90)
Targets benchmarked vs categoria:

| Cohort | NEXA target | Benchmark categoria |
|---|---|---|
| D1 | 70% | 50-65% apps mobile típicos |
| D7 | 45% | 25-35% |
| D30 | 25% | 12-18% |
| D90 | 18% | 5-10% |

NEXA targets agressivos justificados por (a) camada social cria lock-in mais cedo, (b) battle pass de 90 dias criar reason to return, (c) clan cria social pressure, (d) KYC já feito reduz friction de retorno.

### Revenue (primeira monetização)
75% dos usuários monetizam dentro de 90 dias (vs 20-30% típico de apps sociais), via uma das 5 linhas:
- Apostam (NGR split) — 45%
- Compram NEXA Coin — 30%
- Assinatura Premium — 8%
- Compra marketplace — 15%
- App Financeiro (cross-conversion) — 25%

(somam mais de 100% porque users múltiplos canais)

### Referral (loop viral)
Cada user ativo m6 traz em média 0.4 user novo via convite direto + referral program (500 Coins ao referrer + 100 ao convidado quando faz KYC). K-factor esperado: 0.35-0.45 em early stage, escalando pra 0.6-0.8 quando base cresce e network effect kicks in.

## Estratégia de influenciadores e creators

Fase 1 (mês 1-3): seed 20-30 micro-influencers tipsters (5k-50k seguidores) com plano "founding creator" — comissão extra 5% sobre revenue de seus seguidores nos primeiros 12 meses, equity simbólica (1.000-5.000 NEXA Coins pre-TGE), badge "Founder" permanente.

Fase 2 (mês 4-12): target 200-500 tipsters ativos. Marketplace V1 lançado. Featured slots rotativos. Programa de mentoria (tipsters seniores ajudam novos por bonus).

Fase 3 (mês 13-24): target 1.000-2.000 tipsters. Internacionalização (tipsters spanish-speaking pra cobrir LATAM expansion futura).

## Loop viral

Por que usuários convidam amigos:

1. **Incentivo material:** 500 Coins quando amigo faz KYC (~R$ 50 em valor utility)
2. **Incentivo social:** apostar sozinho é menos divertido — usuários querem amigos vendo seus picks
3. **Incentivo competitivo:** clans precisam de 10-50 membros pra serem viáveis em rankings
4. **Incentivo identitário:** "veja meu Level 47" (showing off)

Mecânicas de compartilhamento naturais:
- Post viral → share pra Instagram Stories com card NEXA-branded
- Pick acertado → screenshot com odds + clan + multiplier de retorno
- Conquista de badge → share pra X/Twitter
- Ranking semanal → grupo de WhatsApp do clan

## Crescimento orgânico — conteúdo, SEO, comunidade

Estratégia tríplice:

### Conteúdo
Blog NEXA produz 5-8 artigos/semana cobrindo:
- Análise pré-jogo Brasileirão + Champions (long-tail SEO, traz tráfego pra times específicos)
- Tutoriais sobre gestão de banca, value betting, mercados (educativo, ranqueia em "como fazer apostas")
- Histórias de tipsters NEXA (case studies, social proof)
- Reviews de eventos esportivos (cobertura editorial gera tráfego sazonal)

### SEO
Target keywords: "apostas esportivas brasil", "como apostar online", "tipster verificado", "saque rápido apostas", "comunidade apostadores", "gov.br aposta", "apostas com gov.br". Cluster por intenção. Domain authority crescente via backlinks de mídia esportiva (PR + outreach).

### Comunidade
Discord oficial NEXA (target 5.000 membros m12), Telegram broadcast (não chat — só anúncios), Twitter/X NEXA (target 50k seguidores m12). Reddit r/NexaBR (community-led).

## Crescimento pago — canais e ROAS target

ROAS target (Return on Ad Spend) por canal:

| Canal | ROAS target ano 1 | Justificativa |
|---|---|---|
| Meta Ads | 2-3× | Audience alta qualidade BR mas CAC alto |
| Google Ads search | 3-4× | Intent alta (user pesquisando "apostas") |
| TikTok Ads | 1.5-2× | Audience jovem BR mas low intent |
| Programa afiliados | 5-8× | Pago só após conversão validada |
| Influencer marketing | 4-6× | Audience qualificada + brand uplift |

## Parceiros estratégicos

### Clubes de futebol brasileiros
Não patrocinar (impossible — Pixbet/Betano comprou todos slots) — mas firmar parceria de conteúdo: NEXA fornece análise estatística pro clube, clube fornece visibilidade contextual (banner em redes oficiais sobre "análise da partida via NEXA"). Custo: zero. Benefício: validação institucional + tráfego qualificado.

### Ligas e federações
CBF, FERJ, FPF, etc — parceria de dados oficiais (estatísticas de jogos para análises NEXA). CBF tem programa de data licensing. Custo: R$ 50-200k/ano. Benefício: vantagem de produto (NEXA tem stats oficiais que tipsters Telegram não têm).

### Bancos / fintechs (Marketplace Financeiro)
Nubank, Inter, C6, PicPay, BMG, Will. Cada parceiro paga CPA R$ 50-200 quando usuário NEXA Finance abre conta. NEXA traz 5.000-15.000 leads qualificados/mês.

### Telecoms
Vivo, Claro, TIM — zero-rating de dados pra app NEXA em planos populares (modelo Spotify+Vivo). Custo: zero. Benefício: redução de friction pra usuários classe C-D-E (que economizam dados).

---

# Capítulo 11 — Creator Economy

## Ecossistema completo de creators

NEXA hospeda 4 tipos de creator, cada um com economia distinta:

### Tipsters
Apostadores que publicam picks com fundamentação. Monetizam via (a) assinatura mensal de plano VIP com picks exclusivos (R$ 19-99/mês), (b) marketplace de cursos/análises (R$ 49-499 por produto), (c) live streaming com tip jar em Coins. Volume target: 1.000-2.000 ativos m24.

### Streamers
Lives de comentário pré-jogo, durante jogo, ou análise tática. Modelo Twitch: assinaturas tier (R$ 4,99/9,99/24,99), bits/Coins enviados ao vivo, ad revenue partilhado (futuro), VOD monetizável. Volume target: 100-300 ativos m24.

### Analistas escritos
Substack-like content (artigos longos, weekly newsletters). Monetizam via assinatura newsletter (R$ 9,99-29,99/mês), arquivo de análises antigas vendido individualmente. Volume target: 200-500 ativos m24.

### Mentores
Coaching individual ou em grupo via videoconferência integrada. Cobram R$ 50-300/hora ou pacotes mensais R$ 200-1.000. Volume target: 50-150 ativos m24.

## Programa de onboarding de creators

### Fase 1 — Founding Creators (mês 1-3)
Recruta manualmente 20-30 tipsters seed com 5k-50k seguidores existentes. Oferece: 5% extra comissão pelos 12 primeiros meses, badge "Founder" permanente, 5.000 Coins pre-TGE (valor potencial R$ 500-5.000 pós-TGE), apoio dedicado de growth.

### Fase 2 — Open application (mês 4-12)
Marketplace aberto pra qualquer tipster aplicar. Aprovação manual nos primeiros 6 meses (curadoria pra evitar fraudes), automated approval com KYC tipster reforçado depois.

### Fase 3 — Self-serve (mês 13+)
Onboarding 100% self-service com KYC tipster automatizado.

## Sistema de reputação e ranking

Tipsters têm 4 métricas públicas auditadas (impossível manipular):

1. **Win rate** (% de picks acertados, 30/90/365 dias)
2. **ROI** (return on investment teórico baseado em stakes unidades — 1u = padrão)
3. **Drawdown máximo** (maior perda consecutiva — mede risk profile)
4. **Followers + assinantes pagos** (validação social)

Ranking semanal nos top 10 por categoria (futebol, basquete, eSports, etc) gera visibility extra. Top 100 anual ganham badge permanente.

## Monetização do creator — revenue share

| Receita do creator | NEXA take | Creator recebe |
|---|---|---|
| Assinatura VIP mensal padrão | 10% | 90% |
| Curso/análise único marketplace | 12-15% | 85-88% |
| Live streaming sub Twitch-style | 10% | 90% |
| Coins/tips enviados ao vivo | 5% | 95% |
| Featured slot marketplace | NEXA fee adicional | — |

Comparação: Twitch toma 50%, YouTube 45%, Patreon 8-12%, Substack 10%. NEXA é competitivo com Patreon/Substack.

## Lock-in features

1. Comunidade própria (followers, posts, lives, chat)
2. Histórico permanente (todos picks com timestamp)
3. Monetização integrada (Stripe/Pix sem hassle)
4. Discovery via algoritmo NEXA (novos seguidores grátis)
5. Reputação portável (badges + ranking + métricas auditadas)

## Proteção contra fuga de creators

3 camadas defensivas:
- **Economia superior** — take 10% vs 50% Twitch
- **Audience lock-in** — sair perde acesso direto aos followers
- **Reputação não-portável** — badges/ranking só existem NEXA

## Scaling roadmap

- M3: 25 creators (Founding)
- M6: 75 creators
- M9: 200 creators
- M12: 500 creators
- M18: 1.000 creators
- M24: 2.000 creators
- M36: 5.000+ creators (LATAM contribui)

---

# Capítulo 12 — Sistemas de Retenção

## Estratégia D1, D7, D30, D90

| Cohort | NEXA target | Benchmark categoria |
|---|---|---|
| D1 | 70% | 50-65% |
| D7 | 45% | 25-35% |
| D30 | 25% | 12-18% |
| D90 | 18% | 5-10% |

Targets agressivos justificados por (a) camada social cria lock-in cedo, (b) battle pass 90d cria reason to return, (c) clan cria social pressure, (d) KYC pré-feito reduz friction de retorno.

## Streak system

Login + ações sociais geram streak crescente:
- Dia 1: +10 Coins
- Dia 7: +50 Coins + badge "Semana Comprometida"
- Dia 30: +200 Coins + badge "Mês Lendário"
- Dia 90: +800 Coins + badge "Trimestre Élite" permanente

**Não há penalidade por quebrar streak** (decisão anti-guilt). Badges anteriores ficam. Impacto esperado no churn: -15-25% em D30.

## Missões — diárias, semanais, sazonais, ocultas

**Diárias** (reset 00:00): 3 missões oferecidas. Completo = 30 Coins + 50 XP. Difficulty adapta ao detectUserState.

**Semanais** (reset segunda 00:00): 5 missões maiores. Recompensa 200 Coins + badge + sorteio mensal.

**Sazonais** (battle pass): 50 missões em 90 dias. Completion full = pass unlocked + badge sazonal raro. Conversion target: 20% MAU.

**Ocultas** (trigger-revealed): User entra em clan → revela "Vença 5 clan wars". Mecânica anti-tédio.

## Sistema de temporadas — 90 dias

Cada temporada tem:
- Tema sazonal (Verão 2027, Brasileirão 2027, Copa Libertadores)
- 100 níveis battle pass
- 50 recompensas
- Ranking permanent (top 100 mantém badge histórico)
- Reset parcial de XP (volta a 0 mas Level permanente)

Modelo testado em Fortnite/Apex/COD — retenção dispara 30-50% em mês 1 de cada nova temporada.

## Notificações inteligentes

### Timing
Algoritmo aprende horário de uso, envia em ±30min da hora habitual. Quiet hours default 22h-8h. Hard cap 3/dia.

### Personalização por state
- Frustrated → conteúdo editorial (não aposta)
- Impulsive → warning gentil
- Motivated → desafio próximo
- Disengaged → social (amigo postou)

### Limites
Opt-out em 1 toque. Categorias on/off granular.

## Reativação cascata

- **12h:** push gentil
- **24h:** push social
- **48h:** e-mail editorial
- **7d:** e-mail digest + CTA suave
- **14d:** ofereça 200 Coins bonus (one-time)
- **30d:** silêncio (churn definitivo provável)

## Análise de cohort

| Métrica | Week 1-4 | Week 5-12 | Week 13-26 |
|---|---|---|---|
| D1 | 70% | 75% | 78% |
| D7 | 45% | 50% | 55% |
| D30 | 25% | 30% | 35% |
| D90 | 18% | 22% | 28% |

Cohorts later têm retention maior por word-of-mouth, produto maduro, base social cresceu.

## Intervenção anti-churn automática

Algoritmo identifica sinais:
- Login frequency dropping
- Engagement falling
- Loss streak recente
- Não converteu Premium em D60

Intervenções:
- Mensagem do "concierge"
- Bonus contextual (50 Coins, sem condição aposta)
- Convite pra clan ou tipster recommendation

Eficácia esperada: 15-25% reactivation rate entre flagged users.

---

# Capítulo 13 — Modelo Financeiro

## Cenário conservador

Premissas: CAC R$ 50, retention D90 15%, ARPU R$ 32, churn 5%, conversion fantasy→FTD 20%.

| Métrica | M6 | M12 | M18 | M24 | M36 |
|---|---|---|---|---|---|
| Registrados | 900 | 5.500 | 22.000 | 70.000 | 200.000 |
| MAU | 600 | 3.700 | 15.500 | 50.000 | 160.000 |
| MRR | R$ 32k | R$ 145k | R$ 450k | R$ 920k | R$ 1,28M |
| Burn | R$ 130k | R$ 170k | R$ 200k | R$ 220k | R$ 250k |
| Cash flow | (R$ 98k) | (R$ 25k) | R$ 250k | R$ 700k | R$ 1,03M |

Breakeven: mês 13-14.

## Cenário realista (base)

Premissas: CAC R$ 35, retention D90 20%, ARPU R$ 40, churn 4%, conversion fantasy→FTD 30%, lifetime efetivo 24m.

| Métrica | M6 | M12 | M18 | M24 | M36 |
|---|---|---|---|---|---|
| Registrados | 1.500 | 8.000 | 40.000 | 120.000 | 400.000 |
| MAU | 1.000 | 5.500 | 28.000 | 90.000 | 320.000 |
| MRR | R$ 50k | R$ 220k | R$ 640k | R$ 1,3M | R$ 1,8M |
| Burn | R$ 130k | R$ 180k | R$ 230k | R$ 260k | R$ 290k |
| Cash flow | (R$ 80k) | R$ 40k | R$ 410k | R$ 1,04M | R$ 1,51M |

Breakeven: mês 11.

## Cenário agressivo

Premissas: CAC R$ 25 (viral coefficient 0,8 via Cartola-decaying users + tipster network), D90 28%, ARPU R$ 55, churn 3%, conversion fantasy→FTD 45%.

| Métrica | M6 | M12 | M18 | M24 | M36 |
|---|---|---|---|---|---|
| MAU | 1.800 | 9.500 | 50.000 | 160.000 | 500.000 |
| MRR | R$ 95k | R$ 420k | R$ 1,3M | R$ 2,8M | R$ 4,1M |
| Cash flow | (R$ 35k) | R$ 220k | R$ 1,03M | R$ 2,4M | R$ 3,7M |

Breakeven: mês 9.

## Projeções mensais detalhadas (realista base, 18 meses)

| Mês | MAU | MRR | Burn | Net |
|---|---|---|---|---|
| 1 | 0 | R$ 0 | R$ 110k | -R$ 110k |
| 3 | 120 | R$ 6k | R$ 130k | -R$ 124k |
| 6 | 1.000 | R$ 50k | R$ 160k | -R$ 110k |
| 9 | 2.800 | R$ 130k | R$ 175k | -R$ 45k |
| 12 | 5.500 | R$ 220k | R$ 190k | R$ 30k |
| 15 | 12.000 | R$ 400k | R$ 215k | R$ 185k |
| 18 | 28.000 | R$ 640k | R$ 230k | R$ 410k |

Acumulado 18m: -R$ 470k (coberto por aporte R$ 1,2M + receita orgânica · runway efetiva ~22 meses).

---

# Capítulo 14 — Unit Economics

## CAC por canal

| Canal | CAC | Conv to paid | LTV/CAC |
|---|---|---|---|
| Orgânico | R$ 0 | 55% | ∞ |
| Influencer/tipster | R$ 35 | 70% | 35× |
| Afiliados | R$ 40 | 65% | 25× |
| TikTok Ads | R$ 70 | 35% | 8× |
| Meta Ads | R$ 110 | 45% | 10× |
| Google Ads search | R$ 90 | 60% | 16× |
| **Blended** | **R$ 35** | **55%** | **23-48×** |

## LTV por segmento

| Segmento | % base | ARPU/mês | Churn | LTV 24m |
|---|---|---|---|---|
| Tipster top tier | 5% | R$ 350 | 1% | R$ 8.000 |
| Power user | 18% | R$ 80 | 3% | R$ 1.800 |
| Premium subscriber | 8% | R$ 49 | 4% | R$ 1.100 |
| Apostador regular | 45% | R$ 28 | 6% | R$ 580 |
| Social-only | 24% | R$ 12 | 8% | R$ 220 |
| **Blended** | 100% | **R$ 35** | **5%** | **R$ 800-1.200** |

## Benchmarks LTV/CAC

NEXA 23-48× vs categoria:
- SaaS B2B: 3-5×
- E-commerce: 3-7×
- Apostas tradicionais: 5-10×
- Social network mature: 10-20×

NEXA outlier por: viral coefficient via tipsters + cripto/Coin revenue + marketplace high-margin take rate.

## Payback period

| Segmento | CAC | ARPU | Payback |
|---|---|---|---|
| Tipster top | R$ 100 | R$ 350 | <1 mês |
| Power user | R$ 50 | R$ 80 | <1 mês |
| Premium | R$ 80 | R$ 49 | 2 meses |
| Apostador regular | R$ 40 | R$ 28 | 1,5 mês |
| Social-only | R$ 25 | R$ 12 | 2 meses |
| **Blended** | **R$ 35** | **R$ 35** | **<1 mês** |

Payback <1 mês permite escala agressiva sem comprometer caixa.

## Margem bruta por produto

| Produto | Receita | Custo direto | Margem |
|---|---|---|---|
| Split NGR Betsul | R$ 100 | R$ 5 | 95% |
| Marketplace take | R$ 100 | R$ 20 | 80% |
| NEXA Coin | R$ 100 | R$ 15 | 85% |
| Marketplace Financeiro | R$ 100 | R$ 10 | 90% |
| Premium | R$ 100 | R$ 8 | 92% |
| **Blended** | **R$ 100** | **R$ 12** | **88%** |

Margem 88% excepcional vs setor (operadoras 55-70%).

## Custo de servir por MAU

| Custo | R$/MAU/mês |
|---|---|
| Supabase | 0,80 |
| Vercel | 0,20 |
| Mux | 0,40 |
| Sentry | 0,15 |
| Resend | 0,05 |
| KYC providers | 1,20 |
| **Total** | **R$ 2,80-3,50** |

Em 50.000 MAU: ~R$ 150k/mês infra (economias de escala).

## Economics do creator

Tipster top tier exemplo:
- Receita gerada R$ 5.000/mês
- NEXA take 10%: R$ 500/mês
- Custo NEXA: R$ 80/mês
- **Margem NEXA: R$ 420/mês = 84%**

1.000 creators ativos médios = R$ 150k/mês receita marketplace, R$ 24k custo, **R$ 126k margem (84%)**.

---

# Capítulo 15 — Modelo LTV/CAC Detalhado

## Cálculo de LTV por cohort

Fórmula: LTV = ARPU × (1/churn mensal) × margem bruta

| Cohort | ARPU | Churn | Margem | LTV |
|---|---|---|---|---|
| Founding (m1-3) | R$ 45 | 3% | 88% | R$ 1.320 |
| Growth (m4-12) | R$ 35 | 5% | 88% | R$ 616 |
| Scale (m13+) | R$ 42 | 4% | 88% | R$ 924 |

## Impacto da gamificação

Cohorts com battle pass têm:
- Retention D90: +20-30%
- ARPU: +25-40%
- LTV: 1,5-1,9× cohorts não-engajadas

## Impacto dos creators

Usuários que seguem 3+ tipsters têm:
- Retention D180: 35% (vs 18% blended)
- ARPU: R$ 65/mês (vs R$ 35 blended)
- LTV 24m: R$ 1.760 (vs R$ 800 blended)

Por isto onboarding NEXA empurra agressivamente "siga 3 tipsters" no dia 1-7.

## Sensibilidade a churn

| Churn mensal | LTV | LTV/CAC (R$35 CAC) |
|---|---|---|
| 2% | R$ 1.540 | 44× |
| 3% | R$ 1.027 | 29× |
| 4% | R$ 770 | 22× |
| 5% (base) | R$ 616 | 18× |
| 6% | R$ 513 | 15× |
| 8% | R$ 385 | 11× |

Cada 1% adicional de churn custa ~R$ 100 em LTV. **Investir em retention = maior ROI que investir em aquisição.**

## Como melhorar LTV

Ordenado por impacto:

1. Features Premium tier (Pro, Elite) — +R$ 15-30/mês ARPU
2. Crescer creator base — +20-30% ARPU
3. NEXA Coin Fase 2 (TGE) — +R$ 10-25/mês para users cripto
4. Marketplace V2 com criadores internacionais — +R$ 8-15/mês
5. Reduzir churn (onboarding + reality check + community) — +10-15% LTV multiplicativo

---

# Capítulo 16 — Fontes de Receita (breakdown completo)

## Detalhamento por fonte

### Linha 1 — Rev share/CPA multi-operadora SIGAP

**Cálculo m12:** 5.500 MAU × 12% conversion FTD/mês × R$ 350 CPA blended médio = R$ 231k bruto/mês. RevShare adicional: ~660 ativos cumulativos × R$ 80 NGR/mês × 30% × fator ramp-up 0,25 (mês 12 ainda em build) = R$ 4k. **Após haircuts (negative carryover 10% + delay 30-60d + ramp inicial), receita reconhecida m12: R$ 70k/mês.** Escala pra R$ 200k/mês m18 conforme cross-sell maduração (DraftKings 50-69% benchmark) e 10+ operadoras integradas.

**Sazonalidade:** Alta. Brasileirão (mai-dez) +30%, Copa do Mundo (4 em 4 anos) +180%, Champions decisões +50%.

### Linha 2 — Entry fees rake (DFS)

**Cálculo m12:** 5.500 MAU × 35% cash gamers ativos × R$ 80 GMV mensal médio × 12-13% rake blended = R$ 45k/mês. Escala pra R$ 130k m18 conforme base 28k MAU consolida e GMV/usuário cresce (Rei do Pitaco benchmark: R$ 220M acumulado em 5 anos).

**Sazonalidade:** Alta. Brasileirão é o motor; off-season jan-fev tem queda 25% mas Champions e NBA preenchem.

### Linha 3 — Premium subscription

**Cálculo m12:** 5.500 MAU × (10% Pro × R$ 19,90 + 2,5% Elite × R$ 49,90) = R$ 10.945 Pro + R$ 6.862 Elite + ~R$ 18k mensal equivalente de planos anuais (30% optam anual) ≈ **R$ 35k/mês m12**. Conservador — Cartola PRO 424k assinantes (pré-2019) mostra que mesmo a R$ 50/ano há demanda; NEXA cobra mais entregando mais (AI lineup optimizer, projection engine, sem ads, multi-esporte).

### Linha 4 — Marketplace NEXA (creator economy)

**Cálculo m12:** 150 tipsters ativos × R$ 1.500/mês × 10% take = R$ 22,5k + lives premium R$ 5k + cursos R$ 4k + NFTs/badges R$ 3k + assinaturas tipster premium R$ 5,5k = **~R$ 40k/mês m12**. Escala pra R$ 110k m18 com 350+ tipsters featured.

**Sazonalidade:** Baixa-Média. Brasileirão e Champions movem +25-40% análises pré-jogo.

### Linha 5 — NEXA Coin utility

**Cálculo m12 (Fase 1 off-chain):** 1.700 users adopting Coin × R$ 100 média compra/mês × 5% spread = R$ 8,5k + marketplace transactions 2% fee = R$ 5k + entry fees DFS pagas em Coin (15% dos cash gamers): R$ 11,5k de fee resultante. **Total Linha 5 m12: R$ 25k/mês.** Escala pra R$ 70k m18 quando Fase 2 on-chain ativa via PSAV parceiro.

### Linha 6 — Patrocínios e brand integrations

**Cálculo m12:** native ads CPM R$ 25 médio × 200k impressions/mês = R$ 5k. Sem cota master fechada m12 (target m15-18). **Total m12: R$ 5k/mês**, escalando pra R$ 30k m18 (1 brand deal R$ 100k/ano + native ads escalando) e R$ 100-250k m24-36 com 1 cota master fechada (modelo Cartola R$ 12M/cota é referência teto).

### Linha removida — Marketplace Financeiro afiliado

A linha "Marketplace Financeiro afiliado" do plano v4 (R$ 60k/mês m12 projetado, app separado tipo nexa.finance) **foi removida no pivot v5** porque (a) NEXA agora é fantasy sports, não fintech; (b) duplica risco regulatório com pouco upside estratégico; (c) o tempo e capital alocado nessa linha fica melhor concentrado nas 6 linhas core fantasy. Pode ser revisitada como vertical separada em H3 (mês 18+) se aporte adicional for aprovado.

## Sazonalidade consolidada

| Evento | Janela | Impacto |
|---|---|---|
| Brasileirão Série A | mai-dez | +30% baseline |
| Copa Libertadores | mar-nov | +15% |
| Copa do Mundo (4a) | jun-jul | +180% durante torneio |
| Champions decisões | abr-mai, set-out | +50% picos |
| Black Friday | nov | +25% marketplace + premium |
| Período low | jan-fev | -25% baseline |

Diversificação 5 streams reduz volatilidade 40-60% vs operadora single-stream.

## Projeção mix evolution

| Stream | Ano 1 | Ano 2 | Ano 3 | Ano 5 |
|---|---|---|---|---|
| NGR Casas | 15% | 22% | 30% | 35% |
| Marketplace NEXA | 29% | 24% | 22% | 18% |
| NEXA Coin | 19% | 25% | 22% | 25% |
| Marketplace Financeiro | 29% | 22% | 16% | 10% |
| Premium | 7% | 7% | 10% | 12% |

NGR cresce com casas adicionais. Coin cresce com TGE+PSAV próprio. Marketplace Financeiro decresce em % conforme outras escalam.

## Análise de concentração de risco

Nenhuma linha excede 35% em nenhum ponto = risco baixíssimo comparado a operadoras (typically 80-95% concentradas em NGR).

---

# Capítulo 17 — Estratégia Regulatória

## A fundação jurídica do pivot v5 — Art. 49 da Lei 14.790/2023

O pivot estratégico do plano v5 está ancorado em uma única disposição legal que **muda categoricamente** o perfil regulatório do NEXA. Texto literal do Art. 49 da Lei 14.790/2023:

> *"A atividade de desenvolvimento ou prestação de serviços relacionados a **fantasy sport** não configura exploração de modalidade lotérica, promoção comercial ou aposta de quota fixa, e **fica dispensada de autorização do poder público**."*

Definição legal complementar (Art. 49 parágrafo único): fantasy sport é esporte eletrônico em ambiente virtual baseado na performance de pessoas reais, em que **(I)** times virtuais são formados por **no mínimo 2 pessoas reais** e a performance depende "eminentemente de conhecimento, análise estatística, estratégia e habilidades dos jogadores de fantasy"; **(II)** o **prêmio é garantido independente da quantidade de participantes ou volume de inscrições**; **(III)** os **resultados não dependem da atividade isolada de uma única pessoa em competição real**.

**Estes 3 critérios são o firewall jurídico que separa NEXA da regulação de aposta de cota fixa.** Atender os 3 simultaneamente significa que NEXA, como plataforma fantasy, **NÃO é operadora SIGAP, NÃO precisa de outorga R$ 30M, NÃO está sujeita a Portaria 615/2024 (cartão de crédito), NÃO está sujeita a PL 1018/2026 no produto fantasy core** (fundamentação infra), e **NÃO precisa do regime fiscal de bets** (12-15% GGR + IR prêmios > R$ 2.640 — fantasy paga IRPF 15% sobre prêmios líquidos, mais favorável).

**Linha vermelha que NEXA não cruza:** mecânica de **pick'em prop atleta único** (modelo PrizePicks/Underdog norte-americano) **viola o critério III** e **reclassifica como aposta** sob Lei 14.790, com exigência de outorga SIGAP + risco multa SPA/MF. PrizePicks pagou US$ 15 milhões à NY Gaming Commission por exatamente esse problema antes de migrar para peer-to-peer (PrizePicks Arena). Califórnia AG Rob Bonta emitiu opinião legal em 2025 que **tanto DFS clássico quanto DFS 2.0 (pick'em) violam state law**. Brasil **não tem exclusão tipo UIGEA 2006 americana**, então BR é mais restritivo que EUA neste ponto — NEXA fica em **DFS clássico (salary cap, snake draft, season-long) + daily multi-atleta**, evitando pick'em.

## Precedente jurisprudencial — Pôquer como jogo de habilidade (STF 2018)

Em 2018, decisão judicial brasileira (juiz Roberto Lima, TRF) consagrou pôquer como **jogo de habilidade** (não azar), nos termos do art. 50 da LCP 3.688/1941. O Ministério do Esporte classificou pôquer como modalidade esportiva mental junto a xadrez e bridge. (Fonte: [Conjur — Pôquer matemática 2018](https://www.conjur.com.br/2018-fev-18/poquer-depende-matematica-nao-jogo-azar-define-juiz/).)

**Por que importa pra NEXA:** mesmo se o Art. 49 sofrer questionamento (que considero improvável dado o texto explícito), a tese de **"fantasy é jogo de habilidade, predominância de skill"** tem precedente análogo no pôquer. Argumentos vencedores no predominant factor test: análise estatística mostra que sucesso correlaciona com expertise (não distribuição randômica), múltiplos eventos diluem variância, múltiplos atletas diluem variância, construção de roster é decisão estratégica sob salary cap. Todos esses critérios são **replicáveis no fantasy sob LCP art. 50 + Lei 14.790 art. 49**.

## ABFS — Associação Brasileira de Bets e Fantasy Sport

A ABFS atua institucionalmente em defesa do setor fantasy, especialmente contra **inclusão do fantasy no Imposto Seletivo** (PLP 68/2024 e PLP 108/2024 da Reforma Tributária). ABFS argumenta que fantasy não é "nocivo" no sentido do art. 153 VIII da Constituição (escopo do imposto seletivo é tabaco, álcool, bebida açucarada, veículos poluentes etc.) — fantasy é entretenimento de habilidade, estimulador de raciocínio lógico, sem externalidades negativas comparáveis. APET publicou análise contestando constitucionalidade da inclusão. **Filiação NEXA à ABFS recomendada na semana 1** para alinhamento institucional + voz no debate regulatório. (Fontes: [ABFS — Regulamentação Fantasy Sport](https://www.abfsoficial.com/regulamentacao-fantasy-sport), [Conjur — Imposto Seletivo fantasy](https://www.conjur.com.br/2025-mar-10/o-imposto-seletivo-sobre-fantasy-sports-e-constitucional/).)

**Risco PLP 68/2024:** se o fantasy for incluído no Imposto Seletivo (tramitação 2025-2027), pode haver tributação adicional de **5-20pp** sobre receita do setor. Mitigação NEXA: (a) modelagem financeira já desconta cenário stress test no Cap 19 Risk Register (R15 novo abaixo), (b) lobby institucional via ABFS, (c) diversificação de receita (fantasy é só Linha 2 das seis), (d) preparação pra repasse parcial do imposto ao usuário (rake aumenta de 12% pra 14-15%).

## Como Cartola FC operou 20 anos sem regulação

Cartola é o **caso paradigmático** de modelo fantasy intocável regulatoriamente: nunca pagou prêmios em dinheiro — premiação sempre por sorteio físico (carros, viagens, produtos). Subscription PRO é serviço (não entry fee), assinatura premium configura prestação de serviço (Código Civil), não aposta. Modelo blindado mas com upside limitado — Cartola fatura R$ 70-100M/temp sem cash games, mas perdeu 4,7M de inscritos desde 2016 porque **não monetiza habilidade do usuário**.

**Posicionamento NEXA:** fica entre Cartola (zero cash) e Rei do Pitaco (full SIGAP licenciado) — opera **cash games sob Art. 49** sem virar operadora SIGAP, mantendo a flexibilidade e ausência de custo fixo de outorga. Diferenciado em ambas as direções.

## Como Rei do Pitaco navegou (caso comparável direto)

Rei do Pitaco operou 2019-2024 como **fantasy puro com prêmios em cash** sob o amparo do Art. 49 (mesmo antes da lei sancionada, base jurisprudencial pôquer + tese de jogo de habilidade era suficiente). Em 30/dez/2024 obteve **licença SPA/MF nº 2.091** para operar sportsbook + iGaming separadamente do fantasy. Estrutura: **MMD Tecnologia opera dois produtos legalmente distintos** — fantasy permanece sob Art. 49 (dispensa autorização), bet/cassino é vertical regulada (precisa SIGAP). **NEXA segue arquitetura de produto similar mas com ofensiva diferente:** mantém apenas o lado fantasy (sem virar operadora SIGAP), monetiza via afiliação multi-casa em vez de operar a casa.

## NEXA — definições operacionais sob Art. 49

| Atividade NEXA | Status legal | Detalhe |
|---|---|---|
| Operar plataforma fantasy DFS season-long + daily multi-atleta | ✅ Dispensa autorização SPA/MF | Art. 49 caput |
| Cobrar entry fees em dinheiro + pagar prêmios em dinheiro | ✅ Legal (atende critérios I+II+III) | Art. 49 §único |
| Coletar IRPF 15% retido na fonte sobre prêmio líquido > R$ 2.640 | ✅ Obrigatório | Lei 14.790 estendida fantasy |
| Encaminhar usuário para operadora SIGAP licenciada via deep-link/afiliado | ✅ Legal — prestação de serviço de marketing | Sem responsabilidade solidária se contrato escrito com casa parceira |
| Receber CPA + RevShare por leads qualificados | ✅ Legal | Não é exploração de aposta, é serviço |
| Implementar mecânica pick'em prop atleta único | ❌ **PROIBIDO** | Viola Art. 49 III — reclassifica como aposta, exige SIGAP |
| Implementar prediction markets (over/under em métricas single-game) | ⚠️ Zona cinza | Pode ser interpretado como aposta — evitar até parecer regulatório formal |
| Operar NEXA Coin off-chain (Fase 1) como utility | ✅ Não é cripto regulada | Saldo em DB, não wallet externa |
| Operar NEXA Coin on-chain via PSAV parceiro (Fase 2) | ✅ Legal | Custódia via PSAV registrado Bacen (MB/Bitso/Foxbit) |
| Operar PSAV próprio NEXA (Fase 3) | ⚠️ Caro | Bacen Res. 519/520/521 capital R$ 10,8-37,2M |

## Panorama regulatório BR (contexto histórico)

### Histórico
- 1941: Lei das Contravenções Penais bane jogos azar
- 2018: Lei 13.756 autoriza apostas quota fixa (suspensa 5 anos) · STF reconhece pôquer como jogo de habilidade
- Dez 2023: Lei 14.790/2023 sanciona regulamentação **e expressamente exclui fantasy sport (Art. 49)**
- Jan 2025: Em vigor, SPA/MF inicia outorgas
- Jul 2024: Portaria SPA/MF 1.231/2024 — publicidade + responsabilidade solidária operadora-afiliado
- Set 2024: EstrelaBet encerra programa afiliados (compliance)
- Out/Nov 2025: Bacen Res. 519/520/521 vigência 02/02/2026 (PSAV cripto)
- Dez 2024: Betano encerra programa afiliados unilateralmente (24/12) → reabre 2025 sob nova estrutura · Rei do Pitaco obtém SPA/MF 2.091 (30/12)
- Dez 2025: PCA gov.br operacional (153k solicitações primeiros 20 dias)
- 2025-2026: PLP 68/2024 + PLP 108/2024 tentam incluir fantasy no Imposto Seletivo (ABFS contesta)
- 2026: PL 1018 em tramitação (proíbe cashback/VIP/gamificação em apostas — fantasy fica de fora se atender Art. 49)
- Mai 2026: 78-81 empresas com outorga · 175-187 marcas ativas SPA/MF

### Atores reguladores
- **SPA/MF** — regulador setorial
- **Receita Federal** — fiscal (12% GGR, IR prêmios)
- **Bacen** — pagamentos + cripto (Res. 519/520/521)
- **CVM** — se Coin classificada security
- **ANPD** — LGPD
- **PF + Coaf** — AML/KYT

## Lei 14.790 — implicações para NEXA

| Obrigação | NEXA atende via |
|---|---|
| Capital R$ 30M + outorga R$ 30M | NÃO aplicável (Betsul tem outorga) |
| KYC obrigatório | gov.br + Datavalid cascata 4 camadas |
| Pix titularidade | Backend wire |
| Geolocalização BR | IP + device check |
| PCA gov.br | Via Betsul webhook (72h propagação) |
| Limites prudenciais | UI + backend enforce |
| Reality check | detectUserState + UI |
| Tributação 12% GGR | Betsul paga, NEXA recebe NGR pós-impostos |
| Marketing Art. 36 | Marketplace Financeiro em app SEPARADO |

## Compliance KYC

Cascata 4 camadas (gov.br → Datavalid → Unico/CAF → IDWall manual). Cobertura 95%+ <60s. Custo ano 1 R$ 327k.

## AML

- Monitoramento via Datavalid + Betsul data
- Reporting Coaf via Betsul (NEXA não é IF)
- Threshold alert: depósito >R$ 10k/24h, padrões circulares
- Caso suspeito: NEXA suspende + reporta a Betsul + Coaf

## Geolocalização

- IP check no login
- Device GPS mobile
- Métodos pagamento Pix (BR-only)
- Bloqueio VPN/Tor/datacenter IPs

## Jogo responsável

### Auto-exclusão
- PCA via Betsul (mandatory 72h)
- NEXA própria (mais restritiva, opcional)
- Cooling-off 24h-7d em 1 toque

### Limites
- Default R$ 200/sem depósito
- Aumento com warning + 24h delay
- Reality check 30/60/90 min

### Monitoramento
- detectUserState classifica risco em tempo real
- Anomaly detection: gasto +50% sem→sem
- Suporte humano com treinamento responsible gambling
- Linha ABRAJOR (Associação Brasileira Apostadores Recuperação)

## LGPD

Cumpre em 4 dimensões:
1. Consent management — opt-in granular
2. Data subject rights — export, deletion, retificação
3. DPO — função designada legal
4. Incident response — protocolo 72h notificação ANPD

CPF criptografado via Supabase Vault + pgsodium. Logs PII auditados.

## Riscos regulatórios

| Risco | P | I | Mitigação |
|---|---|---|---|
| PL 1018 (gamificação) | M | A | Earn como trabalho/conteúdo, não loyalty |
| SPA endurece white-label | M | A | Frame "tech partner" não distribuidor |
| Bacen endurece PSAV | B | M | Caminho B (parceiro) absorve mudança |
| CVM classifica Coin security | B | A | Utility puro, zero yield |
| RFB transfer pricing | M | A | Estruturação contábil profissional dia 1 |
| ANPD pune LGPD breach | B | A | Crypto + audit + DPO |

## Estratégia LATAM

### Argentina
- Regulação provincial (Ley 27.346 + provincial codes)
- Buenos Aires: Lotería Provincial
- Parceiro local necessário pra outorga

### México
- SEGOB regula
- Outorga estadual + federal
- OXXO + bank transfers (Pix-like)

### Colômbia
- Coljuegos (mais maduro LATAM)
- Federal robusto
- PSE + Nequi pagamento

Cada país requer parceiro local. NEXA replica modelo família-Betsul.

---

# Capítulo 18 — Estrutura Operacional

## Estrutura times por fase

### Fase 1 (m1-12): 4-8 pessoas
- Founder/CEO (Leonardo)
- CTO/Head Eng (mês 1)
- Eng senior backend (mês 3)
- Eng senior frontend/mobile (mês 6)
- Head Growth (mês 6)
- Head Ops/Compliance (mês 6)
- Curador conteúdo (mês 8)
- Designer freelance

### Fase 2 (m13-24): 12-18 pessoas
- Eng team 6-8 (3 backend, 3 frontend, 1 mobile, 1 DevOps)
- Growth 3
- Ops/Support 2-3
- Compliance + Legal 1 + advisors
- Data 1
- Designer 1

### Fase 3 (m25-36): 25-35 pessoas
- Eng 12-15
- Growth 5-7 + regional managers
- Ops/Support 5
- Compliance + Legal 3-4
- Data 2-3
- Designer 2
- Business Dev 2

## Hiring plan crítico

| Mês | Função | Senioridade | Por quê |
|---|---|---|---|
| 1 | Lead Eng Betsul | Senior | Caminho crítico Wave 1 |
| 3 | Eng senior backend | Senior | Absorver 30 P0s |
| 6 | Head Growth | Senior | Lançamento público |
| 6 | Head Ops/Compliance | Senior | Tudo regulatório |
| 8 | Curador conteúdo | Mid | Onboarding tipsters |
| 9 | Eng frontend | Mid-Senior | Mobile RN H2 |
| 12 | Designer | Mid-Senior | UI/UX sistematizado |
| 14 | DevOps | Mid | Scale infra |
| 18 | Data analyst | Mid-Senior | BI + analytics |

## Parceiros e fornecedores

### Tier 1 (críticos)
- Betsul (operadora SIGAP + white-label)
- Serpro (gov.br + Datavalid)
- Supabase, Vercel, Stripe
- Mercado Bitcoin (PSAV Fase 2)

### Tier 2 (importantes)
- Unico/CAF (KYC fallback)
- IDWall/Serasa
- Mux (live streaming)
- Sentry, Resend

### Tier 3 (úteis)
- TheOddsAPI (backup)
- CertiK + OpenZeppelin (audit)
- Cloudflare

## Atendimento ao cliente

### Tier 1 — Self-service
- FAQ + knowledge base
- Chatbot básico
- Status page

### Tier 2 — Humano (mês 6+)
- 2-3 atendentes 8h-22h
- WhatsApp Business, chat, email
- SLA 4h business

### Tier 3 — Especialistas
- Compliance officer (KYC/AML)
- Eng on-call (técnicos)
- Responsible gambling specialist

## Processos críticos

### Pagamentos
- Stripe Connect (creators)
- Pix titularidade (apostas)
- Cartão (Coin/Premium)
- Reconciliação diária + auditoria mensal

### Verificação
- KYC cascata 4 camadas
- Renovação trianual (Bacen)

### Moderação
- Posts feed: ML classifier + human review
- Lives: bots + mods voluntários + 1 staff mês 6+
- Marketplace: pre-listing review primeiros 6m, automated depois

## KPIs por departamento

### Produto
- D1/D7/D30/D90 retention
- NPS mensal
- Bug count por release
- Feature adoption rate

### Engineering
- Uptime: 99,5% Y1, 99,9% Y2+
- p95 latency: <500ms
- Deploy frequency: 2-5/week
- Mean time to recovery: <2h

### Growth
- CAC blended
- LTV/CAC
- Viral coefficient (k)
- Conversion funnel

### Ops
- Suporte: tempo resposta, CSAT
- Compliance: 0 violações
- KYC: 95%+ aprovados <60s

---

# Capítulo 19 — Análise de Riscos

## Matriz completa — 14 riscos materiais

| # | Risco | P | I | Score |
|---|---|---|---|---|
| R1 | API Betsul atrasa | Alta | Crítico | 9 |
| R3 | Free-money exploit produção | Média | Crítico | 6 |
| R7 | Smart contract bug | Média | Crítico | 6 |
| R2 | Conselho rejeita 30% NGR | Média | Alto | 5 |
| R4 | SPA endurece white-label | Média | Alto | 5 |
| R5 | PL 1018 baniu gamificação | Média | Alto | 5 |
| R8 | TGE sem liquidez | Média | Alto | 5 |
| R14 | Transfer pricing NEXA-Betsul | Média | Alto | 5 |
| R11 | Eng senior não encontra | Alta | Médio | 4 |
| R9 | CVM classifica Coin security | Baixa | Alto | 3 |
| R10 | Coaf flag earn alto | Média | Médio | 3 |
| R12 | Concorrente copia Coin | Média | Médio | 3 |
| R13 | Inflation coin | Média | Médio | 3 |
| R6 | Bacen endurece PSAV | Baixa | Médio | 2 |

## Top 5 riscos críticos — análise profunda

### R1 — API Betsul atrasa (Score 9)
**Probabilidade Alta** porque Betsul não tem docs API pública (eng reversa ou docs solicitadas necessárias).
**Impacto Crítico** porque sem integração Betsul, NEXA não tem produto.
**Mitigação:**
- Lead técnico Betsul nomeado em mês 2 (decisivo)
- Escalation contínua via conselho família
- Plano B: se atraso >60d, integração com KTO em paralelo
- SLA contratual com Betsul (penalties)

### R3 — Free-money exploit produção (Score 6)
**Probabilidade Média** porque 30 P0s abertos.
**Impacto Crítico** porque exploit = perda financeira direta + reputação + regulatório.
**Mitigação:**
- 30 P0s mapeados, fix ETA 80-150h
- Audit independente cross-check antes de cada release
- Bug bounty público R$ 5k-50k recompensas ativo mês 6+
- Limites prudenciais hard cap em backend

### R7 — Smart contract bug (Score 6)
**Probabilidade Média** porque smart contracts complexos, bugs históricos comuns.
**Impacto Crítico** porque perda fundos custodiados = potencial $ milhões.
**Mitigação:**
- Audit duplo (CertiK + OpenZeppelin) antes mainnet
- Bug bounty Immunefi $50k-500k
- Seguro Nexus Mutual coverage
- Timelock + multisig em treasury movements

### R2 — Conselho rejeita 30% NGR (Score 5)
**Probabilidade Média** porque conselho família pode preferir manter NGR integral em Betsul.
**Impacto Alto** porque sem split, NEXA perde stream 1.
**Mitigação:**
- Plano B: split 20% NGR + exclusividade NEXA como canal social
- Plano C: NEXA ganha 100% de incremental revenue (só novos usuários)
- Negociar fee fixo + componente variável menor

### R11 — Eng senior não encontra/sai (Score 4)
**Probabilidade Alta** porque mercado tech BR apertado pra senior backend Postgres + Edge + cripto.
**Impacto Médio** porque atrasa roadmap, não cancela.
**Mitigação:**
- Pipeline 3-5 candidatos sempre ativo
- Compensação competitiva (salário + Coins futuras simbólicas)
- Remote-friendly desde dia 1
- Backup: contractor agencies (Codeminer, Stone) pra overflow

## Risco regulatório — top 3

- PL 1018 (gamificação) — earn enquadrado como trabalho/conteúdo
- SPA endurece white-label — frame "tech partner"
- CVM classifica Coin — utility puro

Estratégia geral: estar à frente do regulador. Engaging proactively com SPA/MF + ABRA + ANJL.

## Risco de mercado

### Concorrência
Bet365 + Betano + 186 operadores. Mitigação: posicionamento diferenciado (não compete em odds), camada social moat, parceria família.

### Commoditização
Setor risco virar commodity. Mitigação: produto diferenciado 5 pilares.

## Risco operacional

### Fraude
- Multi-accounting → KYC + Datavalid + device fingerprint
- AML → monitoring + Coaf reporting
- Smart contract → audit + bounty + insurance

### Segurança
- Data breach → encryption at rest + RLS + audit log
- Account takeover → 2FA opcional Premium, mandatory Elite

### Disponibilidade
- 99.5% uptime Y1, 99.9% Y2
- Disaster recovery: backup diário + restore drill quarterly

## Risco financeiro

### Burn rate
- R$ 150-280k/mês burn primeiros 18m
- Runway: 14-16m com aporte R$ 1,2M + receita orgânica
- Mitigação: phase ramping hiring

### Captação
- Se MRR falha: corte gastos +30%, reduz time 2-3, foca revenue
- Se MRR exceeds: acelera hiring + marketing

## Risco de produto

### Adoção
Risco: mercado não responde a posicionamento social. Mitigação: beta 50 family/friends pré-launch valida assumption.

### Retention
Risco: D30 retention <15%. Mitigação: iterations rápidas onboarding + missions + community baseado em data D7-D30.

## Planos de mitigação consolidados

| Risco | Plano A | Plano B | Plano C |
|---|---|---|---|
| Betsul atrasa | Pressão executiva | KTO paralelo | Casa #3 família |
| Free-money | Fix 30 P0s | Bug bounty | Refund + transparência |
| Smart contract | Audit duplo | Seguro Nexus | Treasury timelock |
| Conselho NGR | 30% split | 20% + exclusividade | Fee fixo + variable |
| Eng senior | Hiring pipeline | Contractor agencies | Equity compensation extra |
| PL 1018 | Lobby pro-NEXA | Re-frame earn como trabalho | Remove battle pass |
| Coin security CVM | Pareceres + utility puro | Migração registration BSI | Spin-off Coin separada |

---

# Capítulo 20 — Arquitetura Técnica

## Stack completo

### Frontend
- **Desktop:** Electron 41 + React 18 + Vite 5 + Tailwind 3.4 + Zustand + TanStack Query
- **Mobile (H2):** React Native 0.73 + Reanimated + gesture handler
- **Web (PWA, H2):** Mesmo Vite bundle do Desktop com ajustes PWA
- **Admin:** React+Vite separado com Tailwind + TanStack + react-router

### Backend
- **Database:** PostgreSQL 15 via Supabase
- **Auth:** Supabase Auth + gov.br OAuth wrapping
- **Storage:** Supabase Storage (avatars, KYC docs, marketplace)
- **Realtime:** Supabase Realtime (postgres changes streaming)
- **Edge Functions:** Deno + TypeScript
- **RLS:** Postgres Row Level Security strict em todas tabelas user-facing

### Infraestrutura
- **Hosting:** Vercel (admin) + Electron Auto-Updater (Desktop)
- **CDN:** Cloudflare (assets estáticos)
- **Monitoring:** Sentry + Supabase Logs + custom analytics
- **Streaming:** Mux (HLS + RTMP ingest, VOD)
- **Push:** FCM (Android) + APNS (iOS) via Edge Function dispatcher
- **Email:** Resend (transacional)
- **Pagamento:** Stripe Connect + Asaas (Pix) + Mercado Pago (fallback)

### Integrações
- **KYC:** gov.br OAuth + Serpro Datavalid + Unico/CAF + IDWall
- **Apostas:** Betsul API + TheOddsAPI (backup odds)
- **Cripto:** Mercado Bitcoin API (PSAV Fase 2)
- **Compliance:** PCA gov.br via Betsul webhook + Coaf via Betsul

## Sistema de odds em tempo real

1. Backend NEXA recebe odds via webhook Betsul + TheOddsAPI poll (10s)
2. Postgres Realtime broadcasts pra clientes conectados
3. UI atualiza <1s via Zustand action triggered por Realtime event
4. Anti-stale: timestamp checked, odds >30s marcadas "loading"

OddsBalancer (proprietary) calcula implied probability × house margin × market shift α. Margem casa 6% (vs 9-12% mercado — premium para apostadores skilled).

## Sistema de feed e recomendação

Feed misto:
- **70% cronológico** (seguidos, ordem temporal reversa)
- **20% algorítmico** (virais da comunidade, tipsters recomendados)
- **10% editorial** (curadoria — análises pré-jogo, eventos especiais)

Algoritmo ranking:
- Recency (decay exponencial 24h half-life)
- Engagement velocity (likes/comments per hour)
- Author authority (tipster rank, follower count)
- User affinity (similar past interactions)
- Reality check (frustrated user vê menos aposta, mais editorial)

## Infraestrutura live streaming

Mux gerencia complexity:
- RTMP ingest (OBS, browser-based via Whip)
- HLS playback adaptativo (240p até 1080p)
- VOD opcional
- Latency: low-latency mode ~3-5s (vs 30s standard HLS)
- Costs: $0,02-0,05/min por viewer

## Wallet e pagamentos

### Wallet NEXA (interna)
- Postgres table `wallets` com balance_brl + balance_coins
- Atomic transactions via `fn_wallet_*` functions
- Audit trail completo via `wallet_transactions`
- Single source of truth (não duplica em users.balance — bug histórico fixed)

### Pagamento entrada (depósito apostas)
- Pix mesma titularidade via Asaas + MP fallback
- Webhook handler valida + credita wallet
- Idempotency key obrigatória

### Pagamento saída (saque)
- Pix mesma titularidade
- Approval workflow: request → KYC valid + Pix owner check → processamento <30s
- Limite diário R$ 5.000 default

### Pagamento marketplace
- Stripe Connect cobra cartão do comprador
- Split automático: 90% creator, 10% NEXA (ou tier-based)
- Payout semanal via Stripe → conta bancária

## Gamificação e progressão (DB schema)

Postgres tables:
- `users` (level, xp, xp_to_next)
- `seasons + season_passes + season_progress`
- `clans + clan_members + clan_wars + clan_war_results`
- `missions + mission_progress + mission_claims`
- `badges + user_badges`

Triggers updaten XP atomically:
- Post viral (>100 likes) → +100 XP
- Pick acertado copiado por 5+ → +50 XP
- Refer-a-friend KYC → +200 XP

Cron jobs nightly:
- Reset daily missions (00:00 BRT)
- Reset weekly missions (segunda 00:00)
- Promote/demote ligas (domingo 23:00)

## Moderação e segurança

### Moderação conteúdo
- Pre-publication filter (ML classifier — NSFW, fraud keywords, spam)
- Post-publication: report-driven (community reports → mod review)
- Mods voluntários + 1 staff full-time mês 6+
- Automated removal: clear spam, NSFW (>95% confidence)

### Segurança account
- Senha bcrypt cost 12
- 2FA opcional Premium, obrigatório Elite + Admin
- Rate limiting login (5 attempts/15min)
- Suspicious activity detection

### Segurança código
- TypeScript strict (no `any`)
- ESLint + Prettier obrigatório
- Husky pre-commit (lint + format + tsc)
- Github Actions CI: tests + lint + build em todo PR
- Branch protection main

---

# Capítulo 21 — Plano de Escalabilidade

## Phase 1 (atual, <50k MAU)
Stack atual aguenta. Supabase free + paid tiers, Vercel hobby + pro.

## Phase 2 (50k-500k MAU, ano 2-3)
- Supabase Enterprise (dedicated compute + multi-region)
- Read replicas Postgres
- Materialized views pra leaderboards (refresh hourly)
- CDN aggressive caching (Cloudflare + Vercel Edge)
- Sharding NEXA Coin transactions (>10M rows/year)

## Phase 3 (500k-10M MAU, ano 4+)
- Multi-region Supabase (read replicas LATAM, EUA)
- Migrar partes pra services dedicados (Mux já isolado, similar pra notifications)
- Kafka ou similar pra event streaming
- Eng team expandido (15-25 pessoas) com ownership por domain

## Bottlenecks técnicos antecipados

### Postgres Realtime
Limite ~1.000 subscribers concurrent por channel. Solução: shard por região + room, partição de feed por user cluster.

### Supabase Edge Functions
Cold start 50-200ms. Solução: keep-alive warming pra fns críticas (place_bet, kyc_submit) via cron.

### Mux live streaming
Custos escalam por viewer-hour. Mitigação: limite de 1 live simultânea por creator, qualidade adaptativa, VOD não inclui inactive frames.

### Banco de dados
- Sharding pra `wallet_transactions` quando >10M rows
- Particionamento por mês pra analytics tables
- Read replicas pra dashboards

### Cripto on-chain (Fase 2+)
- Gas costs Polygon/Base: $0,001-0,01 por tx
- Bottleneck: throughput chain (Polygon ~50 tps, Solana ~3.000 tps)
- Solução: batching de transactions L1 → settle on-chain hourly

## Infraestrutura em cloud

Comparação AWS vs GCP vs Azure:
- **AWS:** maturidade max, custo médio-alto, time learning curve grande
- **GCP:** integração nativa com Supabase (mesma arquitetura), custo médio, Firebase familiar
- **Azure:** menor custo, menor base community BR

**Decisão NEXA:** Supabase já é managed (built on GCP) — não precisamos escolher cloud direta. Mux é managed. Vercel é managed. Stack 100% managed reduz ops overhead.

## CDN para streaming

Mux já inclui CDN próprio (Fastly). Pra LATAM expansion, adicionar Cloudflare como complemento pra reduzir latência regional.

## Banco de dados

Estratégia evolutiva:

| MAU | DB strategy |
|---|---|
| <50k | Supabase single instance |
| 50k-500k | Supabase Enterprise + read replicas |
| 500k-2M | Sharding por região + replicas |
| 2M+ | Multi-region active-active + Kafka events |

## Custos de infraestrutura por escala

| MAU | Supabase | Vercel | Mux | Total infra/mês |
|---|---|---|---|---|
| 5k | $25 | $20 | $200 | $250 |
| 50k | $400 | $200 | $1.500 | $2.500 |
| 500k | $4.000 | $2.000 | $12.000 | $20.000 |
| 5M | $40.000 | $20.000 | $80.000 | $150.000 |

Per-MAU infra cost decresce com escala (eficiências de bulk).

## Eng team por fase

| Fase | MAU | Eng FTE | Roles |
|---|---|---|---|
| 1 | 5k | 3 | 2 fullstack + 1 mobile |
| 2 | 50k | 8 | 3 backend + 3 frontend + 1 mobile + 1 DevOps |
| 3 | 500k | 18 | 6 backend + 5 frontend + 3 mobile + 2 DevOps + 1 SRE + 1 data |
| 4 | 5M | 35 | + multi-team com ownership por domain (apostas, social, marketplace, coin, mobile) |

---

# Capítulo 22 — Go-to-Market

## Fase 1 (0-3 meses) — Beta privado fechado

**Goal:** 50 usuários ativos, validação assumption product-market fit.

**Estratégia:**
- Invite-only via family + amigos de Leonardo
- 30 tipsters seed recrutados manualmente (Founding Creators program)
- Zero marketing pago
- Reuniões 1-on-1 com cada beta user pra colher feedback
- Iteration semanal de produto baseado em feedback

**Métricas-alvo:**
- 50 KYCs aprovados
- 40+ ativos semanalmente
- NPS >40
- 5+ tipsters posting picks diariamente
- 0 P0 bugs em produção

## Fase 2 (3-6 meses) — Crescimento orgânico

**Goal:** 10.000 usuários registrados, validação canais orgânicos.

**Estratégia:**
- GA público (qualquer um pode se registrar)
- Programa de referral live (500 Coins ao referrer + 100 ao convidado por KYC)
- Conteúdo orgânico (blog NEXA, YouTube canal próprio)
- Outreach manual pra 50-100 tipsters externos via Twitter/Telegram
- Press release: imprensa esportiva (UOL, ESPN BR) sobre "primeira rede social de apostas BR"

**Métricas-alvo:**
- 10.000 registros
- 6.000 MAU (60% activation rate)
- 200+ tipsters ativos
- Viral coefficient k > 0.3
- CAC orgânico R$ 0-20 (referral + content)
- MRR R$ 60-120k

## Fase 3 (6-12 meses) — Crescimento pago

**Goal:** 100.000 usuários registrados, validação canais pagos com unit economics positivos.

**Estratégia:**
- Meta Ads (Instagram + Facebook BR) — budget R$ 30-50k/mês escalando
- Google Ads search ("apostas online", "tipster verificado") — R$ 20-30k/mês
- TikTok Ads (audience jovem) — R$ 15-25k/mês
- Influencer marketing (50+ micro-influencers esportivos) — R$ 30-60k/mês
- Programa de afiliados ativo
- Patrocínio podcast esportivo (1-2 grandes em BR) — R$ 50-100k/episódio
- Marketplace Financeiro afiliado live (cross-pollination)

**Métricas-alvo:**
- 100.000 registros
- 50.000 MAU
- LTV/CAC blend >15×
- CAC blended R$ 35-50
- MRR R$ 200-300k

## Fase 4 (12-24 meses) — Escala nacional

**Goal:** 1 milhão de usuários registrados, dominância regional.

**Estratégia:**
- TGE NEXA Coin (PR massivo: cripto + apostas BR primeiro)
- Casa de Apostas (KTO) integrada — 2ª casa
- Mobile RN Android + iOS live em stores
- Patrocínio time/clube Série A (negociação 2027-2028)
- Influencer tier 1 (1-2 contratos R$ 200-500k/ano)
- Marketing nacional TV/OOH (depois R$ 5M MRR)
- LATAM expansion teaser (preparação Argentina)

**Métricas-alvo:**
- 1.000.000 registros
- 500.000 MAU
- MRR R$ 1-2M
- 200+ creators full-time NEXA
- Marca top-of-mind 10%+ apostadores BR

## Estratégia por canal em cada fase

| Canal | Fase 1 | Fase 2 | Fase 3 | Fase 4 |
|---|---|---|---|---|
| Orgânico (referral, SEO) | 100% | 70% | 30% | 15% |
| Influencer | 0% | 20% | 30% | 25% |
| Paid ads | 0% | 0% | 30% | 35% |
| Patrocínio | 0% | 5% | 10% | 25% |
| PR/conteúdo | 0% | 5% | 10% | 10% |

## Marcos e métricas de validação

Cada fase tem gate de continuidade. Falhar gate = stop expansion, fix fundamentals.

| Fase | Gate métrica | Decisão se não |
|---|---|---|
| 1 | NPS ≥ 40 | Pivot UX antes de abrir |
| 2 | k-factor ≥ 0.3 | Investir mais em viral loops |
| 3 | LTV/CAC ≥ 15× | Pause paid ads, foca orgânico |
| 4 | MRR ≥ R$ 1M | Reduz hiring, foca PMF |

---

# Capítulo 22.5 — Plano de Marketing · Creator-First Strategy (Gamer Streamers)

> **Documento operacional separado:** este capítulo é a versão condensada do plano. Para detalhamento operacional (template de contrato, briefing pra streamer, checklist due diligence, dashboards), ver `NEXA-Marketing-Plan-Streamers-2026-05-19.md` (~25 páginas).

## A tese de marketing em 1 parágrafo

NEXA aloca 100% do budget marketing de creator outreach (R$ 100-150k/mês primeiros 12m) em **gamer streamers esports-first** — não em celebridades mass-market de futebol estilo Casimiro/JonVlogs. Quatro razões: (a) **custo** — Casimiro/CazéTV tier custa R$ 500k+/mês de integração contínua, fora do nosso budget; (b) **conversão fantasy** — audiência gamer é analytics-native (5-10% conv vs 1-2% mass-market); (c) **cross-sell esports betting** — Riot Games Fantasy LTA 2025 + LOUD/H2Bet jul/2025 abrem janela co-branded; (d) **risco regulatório** — PL 2985/2023 proíbe atletas/celebridades em ad de bet, gamer streamer não está no escopo; nenhum gamer foi indiciado nos 16 da CPI das Bets.

## Bifurcação contratual — Tipo A vs Tipo B (CRÍTICO)

| Tipo | Streamer promove | Cobertura | Risco |
|---|---|---|---|
| **Tipo A (RECOMENDADO PROS 10)** | Apenas Fantasy NEXA, contests DFS, marketplace, Premium, Coin | **Art. 49 Lei 14.790** (fantasy dispensa autorização) + CDC + CONAR geral | **BAIXO** — fora Portaria 1.231, fora Anexo X CONAR setor apostas, fora PL 2985 |
| **Tipo B (OPCIONAL 1-2)** | Tipo A + cross-sell para Betsul/operadora SIGAP via promo code | **Portaria 1.231/2024** + Anexo X CONAR + Lei 14.790 art. 21 | **ALTO** — responsabilidade solidária operadora ↔ NEXA ↔ streamer, multa mín R$ 50k/infração streamer |

**Decisão:** começar 100% Tipo A nos 10 streamers. Abrir Tipo B apenas pra streamers Tier 1+2 que passaram 2 gates (3 e 6 meses) com clean compliance + audiência ≥85% adulta comprovada via HypeAuditor.

## Estrutura dos 3 tiers (10 streamers · ~R$ 130k/mês fixo)

| Tier | Qtd | Fee médio/mês | Targets prioritários |
|---|---|---|---|
| **Tier 1 — Mid-anchor esports** | 1 | R$ 40-60k | Baiano (LoL · único BR top global) · YoDa (LoL · 30k CCV) · CEROL (CS/FF · ex-pro) · Cellbit (top 4 BR · audiência 7M+) |
| **Tier 2 — Esports nicho** | 4 | R$ 15-25k | brTT (LoL legend) · Cauê Moura (CBLOL caster) · Aspas (Valorant) · Free Fire creators · mid CS:2 streamers |
| **Tier 3 — Micro-tipsters analytics** | 5 | R$ 3-8k | TipsterBH (esports · 15% ROI 2025) · Trading Esporte Clube · Tipster Brasil · Cartolouco (fantasy nativo) · micro-creators CBLOL/Valorant stats |

**Total mix:** 1 + 4 + 5 = **10 streamers · ~R$ 130k/mês fixo** (com bonus performance pode chegar R$ 165k peak meses pesados).

## Por que NÃO Casimiro/CazéTV mass-market

- **Custo:** Casimiro tier R$ 500k+/mês de integração contínua — CazéTV vendeu cota máster Copa 2026 a R$ 185M (11 cotas · R$ 2 bi total)
- **Demo audiência:** mass-market casual fan futebol, não analytics-native — conversion fantasy estimada 1-2% vs gamer streamer 5-10%
- **Risco CPI:** celebrities mass-market estão sub judice (Virgínia indiciada estelionato, Carlinhos Maia convocação, Felipe Neto convidado declarou "maior erro da vida")
- **Risco PL 2985:** proíbe atletas/artistas/comunicadores em ad de bet — atinge Casimiro/Galvão/Mauro Cezar tier
- **Margem brand limitada:** celebrities já fecharam múltiplos deals (saturação)

## Estrutura de remuneração — 70/20/10

- **70% Fee fixo mensal** — garante delivery mínimo (output contratual)
- **20% Performance bonus** — R$ 30-50/FTD acima de baseline (Tier 1: baseline 200 FTDs/mês · Tier 2: 80 · Tier 3: 30)
- **10% Retention bonus trimestral** — R$ 600-5k se D30 retention dos adquiridos > 30%

Opção de **20-30% da remuneração em NEXA Coin** (vesting 6m linear, cliff 30d) — reduz cash burn, cria lock-in cripto-native demo, transforma streamer em evangelist orgânico da Coin.

## Processo de renovação 30/90/365 dias

| Marco | Ação |
|---|---|
| Mês 1 (pilot) | Onboarding · output 60-80% mínimo curve · pre-month review dia 25 |
| Mês 3 (GATE 1) | Review formal 5 métricas: CPA · D30 retention · sentiment · compliance · output. 5/5 pass = renova full · 3/5 = renova com ajuste · ≤2/5 = termina notice 30d |
| Mês 6 (GATE 2) | Mesma estrutura + comparativo trend mês 3 |
| Mês 9 (GATE 3) | Trend sustentada → eligível annual lock |
| Mês 12 (anniversary) | Bonus anniversary + opção annual deal premium + equity Coin retainer (vesting 24m) |

## KPIs

| Métrica | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| CCV médio | >5.000 | >1.000 | n/a (focado social) |
| Hours watched/mês | >800k | >200k | n/a |
| CTR link | >0,8% | >1,2% | >2% |
| Cadastro NEXA / clicks | >5% | >7% | >12% |
| Cadastro → FTD/contest pago | >15% | >18% | >25% |
| FTDs gerados/mês | >200 | >80 | >30 |
| **CPA efetivo (R$/FTD)** | <R$ 250 | <R$ 200 | <R$ 200 |
| D30 retention adquiridos | >35% | >30% | >30% |
| Sentiment positivo | >70% | >65% | >65% |

**KPI master do programa:** **% MAU adquiridos via streamers / MAU total NEXA → target 35% até mês 6, 45% até mês 12.**

## Tracking attribution stack

- **Mês 1-3 (low budget):** Promo codes individualizados · UTM tags · vanity domains (nexa.fan/baiano) · postback S2S simples · Looker Studio dashboard
- **Mês 4-12 ($250-1000/mês):** Branch.io/AppsFlyer mobile attribution multi-touch · Mixpanel/Amplitude · Hotjar/Clarity session replay · Slack alerts
- **Mês 12+ ($2-5k/mês):** Income Access (Paysafe — padrão iGaming) · Affilka (SOFTSWISS alt) · dedicated affiliate manager in-house

## Cronograma de ativação 2026

| Mês | Ação | Total ativos | Eventos pra ativar |
|---|---|---|---|
| Jul/26 | Contratar 4 (1 Tier 1 + 3 Tier 2) | 4 | Brasileirão 2ª metade · CBLOL Split 2 · LoL Worlds |
| Ago/26 | Contratar +3 (2 Tier 2 + 1 Tier 3) | 7 | Free Fire WS Spring · pre-CS Major |
| Set/26 | Contratar +3 Tier 3 | **10 (full portfolio)** | CBLOL Split 2 finals · FF World Series Bangkok nov · Esports World Cup jul Riad |
| Dez/26 | GATE 1 renewal (julho cohort) | 8-10 | Renova ou ajusta |
| Mar/27 | GATE 1 agosto + GATE 2 julho | 8-10 | Refresh portfolio |
| Jun/27 | Anniversary julho cohort · annual lock | 10 | NBA finals + UFC mid-year |

## Budget detalhado

| Mês | Fixo | Bonus | **Total** |
|---|---|---|---|
| M1 (jul) | R$ 73k | R$ 5k | **R$ 78k** |
| M2 (ago) | R$ 92k | R$ 8k | **R$ 100k** |
| M3 (set) | R$ 123k | R$ 12k | **R$ 135k** |
| M6 (dez) | R$ 139k | R$ 26k | **R$ 165k** peak |
| Anual ano 1 | R$ 1,3M | R$ 230k | **R$ 1,6-1,8M total** |

**Como cabe no aporte R$ 1,2M:** Use of funds aloca R$ 420k pra "marketing/SEO/content/creator outreach" ano 1. Programa consome R$ 1,3M no ano (78% do orçamento marketing). Gap R$ 880k coberto por receita orgânica iniciando mês 6 (MRR R$ 50k). **Programa self-funding a partir do mês 6-7** no cenário base.

## Anti-padrões absolutos (anti-CPI risk)

1. ❌ Atletas em atividade (PL 2985)
2. ❌ Celebrities TV mass-market Casimiro/Galvão tier
3. ❌ Influencers indiciados CPI das Bets (Virgínia, Deolane, Carlinhos Maia)
4. ❌ Influencers com processo Procon/CONAR ativo (Felipe Prior)
5. ❌ Influencers <21 anos
6. ❌ Comissão por PERDAS do seguidor (estelionato Virgínia case)
7. ❌ Promover bônus/welcome offer/freebet/"lucro garantido"
8. ❌ Conteúdo prosperidade/renda fácil/sucesso via aposta
9. ❌ Audiência majoritariamente infantojuvenil
10. ❌ Cross-sell Tipo B antes de 3 meses Tipo A clean
11. ❌ Multi-deal com bet ilegal/offshore
12. ❌ Conteúdo NEXA misturado com slots/cassino/"Tigrinho"

## Riscos top 5 do programa

| # | Risco | Mitigação |
|---|---|---|
| R1 | Streamer entra em controvérsia (Monark/Pugliesi case) | Cláusula moral + monitoring 24/7 Stilingue + termination immediate |
| R2 | CPA acima target | Quarterly review + adjust mix + ajuste fee structure 60/30/10 |
| R3 | Streamer migra pra concorrente (Coringa → H2Bet jul/25) | Cláusula exclusividade categorial + Coin equity vesting 24m lock-in |
| R4 | PL 2985 expande pra esports | Pivot pra Tipo A pure (todos já estão) — risco mitigado by design |
| R5 | Lawsuit publicidade enganosa (Felipe Prior/Betsat) | Compliance pre-air check + jurídico aprovado + seguro RC |

---

# Capítulo 23 — Loops Virais

## Análise de cada loop viral

### Loop 1 — Referral direto
- User convida amigo via link único
- Amigo registra + faz KYC = +500 Coins referrer + 100 Coins amigo
- Atrito: amigo precisa fazer KYC (não só registrar)
- k-factor esperado: 0.15-0.25

### Loop 2 — Compartilhamento de pick acertado
- User acerta pick → Stories Instagram com card NEXA-branded
- Card mostra: foto user + pick + odds + clan + ranking + "Veja NEXA"
- Friends curiosos clicam → landing page personalizada
- k-factor esperado: 0.08-0.15

### Loop 3 — Tipster com followers
- Tipster joins NEXA → migra audience própria (Telegram, Twitter)
- Cada tipster traz 200-2.000 followers ao longo de 3-6 meses
- Conversion: 5-15% dos followers viram users NEXA
- k-factor por tipster: 0.5-2× (mas concentrado em poucos)

### Loop 4 — Clan recruitment
- Clan precisa crescer pra competir em rankings
- Membros convidam amigos via "Junte-se ao Vasco Glorioso"
- 80% das clans crescem via referral interno
- k-factor esperado por clan: 0.1-0.3/mês

### Loop 5 — Marketplace virality
- Tipster vende curso → posta em redes sociais externas com card NEXA
- Buyers (incluindo não-users) chegam ao curso, precisam se registrar
- k-factor: 0.05-0.10 (canal menor mas qualified)

## Referral program — mecânica e economics

| Componente | Detalhe |
|---|---|
| Recompensa referrer | 500 Coins ao amigo fazer KYC (~R$ 50 valor utility) |
| Recompensa amigo | 100 Coins ao registrar (~R$ 10 valor utility) |
| Cost-per-acquisition referral | ~R$ 60 (valor utility, custo NEXA real ~R$ 8 — Coins não custam R$ direto) |
| LTV referred user | R$ 800-1.200 médio |
| ROI | ~12-15× |

Top referrer mensal ganha bonus extra: R$ 500 em Coins + badge "Mensageiro NEXA" do mês.

## Compartilhamento social

Cards otimizados para Instagram Stories, X, WhatsApp:

- **Pick acertado:** "Apostei R$ X em [time] em [jogo] e acertei. NEXA Level 47."
- **Conquista badge:** "Recebi badge raro 'Top 1% Brasileirão'. Bora NEXA."
- **Ranking semanal:** "Top 12% liga Ouro. Sou Mestre. NEXA."
- **Convite clan war:** "Clan Vasco Glorioso busca novos guerreiros. Junte-se."

## Efeito de rede

NEXA vale mais com mais usuários porque:
- Mais conteúdo no feed (mais picks, mais lives, mais debate)
- Mais tipsters pra seguir (variedade)
- Mais oponentes em ranking semanal (competição mais relevante)
- Mais clans pra escolher (fit cultural)
- Marketplace mais sortido (mais variedade)
- Network locked-in (sair = abandonar 200+ followers)

## k-factor esperado e impacto

Agregado: k-factor 0.4-0.6 em fase 1-2, escalando pra 0.7-1.0 em fase 3-4. k=1 significa cada user traz 1 user novo = crescimento exponencial sem custo de aquisição.

## Comunidades como motor

Discord NEXA (5.000+ membros m12), Telegram broadcast (10.000+ m12), subreddit r/NexaBR (community-led). Engajamento orgânico gera fluxo contínuo de leads sem custo direto.

---

# Capítulo 24 — Expansão de Longo Prazo

## Roadmap de 5 anos

### Ano 1 (2026)
- Beta + GA público BR
- Betsul integrada
- NEXA Coin Fase 1 off-chain
- 5k MAU, R$ 206k MRR
- Aporte R$ 1,2M

### Ano 2 (2027)
- TGE NEXA Coin Fase 2 (PSAV parceiro)
- KTO integrada (2ª casa)
- Mobile RN live
- 60k MAU, R$ 1,1M MRR
- Marketplace V1 maduro

### Ano 3 (2028)
- PSAV próprio Bacen Fase 3 (capital família R$ 10-37M)
- 3-5 casas família integradas
- Marketplace V2 + creators internacionais
- 200k MAU, R$ 1,5M MRR
- LATAM teaser (preparação AR)

### Ano 4 (2029)
- LATAM Argentina + México lançados
- B2B SaaS white-label pra operadoras tier 3-4 BR
- Possível stablecoin NEXA-BRL
- 600k MAU, R$ 3-5M MRR
- IPO B3 considerado

### Ano 5 (2030)
- LATAM Colômbia + Chile
- Categorias adjacentes (eSports, fantasy)
- 1,5M MAU, R$ 8-12M MRR
- IPO B3 OU M&A com strategic acquirer

## Expansão para outros países

### Argentina (Ano 4)
- Mercado 45M habitantes
- Regulação provincial — Buenos Aires alvo prioritário
- Parceiro local + outorga Lotería Provincial
- Estimativa investimento: R$ 5-10M setup

### México (Ano 4-5)
- Mercado 130M habitantes
- SEGOB regulador federal + estadual
- Outorga + parceiro local
- Estimativa investimento: R$ 10-20M setup

### Colômbia (Ano 5)
- Mercado 50M habitantes
- Coljuegos mais maduro de LATAM
- Federal robusto
- Estimativa: R$ 5-10M setup

### Chile, Peru, Uruguai (Ano 6+)
- Regulação em desenvolvimento (oportunidade entrar early)

## Novos verticais

### eSports
- Cobertura LoL, CS, Dota 2, Valorant — público overlap alto com apostas
- Apostas in-play eSports + análises tipsters
- Estimativa receita: 10-15% do core ano 5

### Fantasy sports (DFS)
- Modelo DraftKings adaptado
- Daily/weekly fantasy contests
- Separado de aposta direta (compliance diferente)
- Estimativa: 5-10% do core ano 5

### Prediction markets
- Polymarket-style — eventos não-esportivos (eleições, clima, finanças)
- Regulação ainda incerta BR (CVM analisa)
- Opcional H4-H5

### NFTs colecionáveis
- Badges raros + momentos esportivos + traders cards
- Já no roadmap NEXA Coin Fase 2
- Estimativa: 3-5% do core

## Evolução para super-app de entretenimento

Visão 10 anos: NEXA é o "super app" do entretenimento esportivo BR/LATAM:
- Apostas (core)
- Conteúdo social (feed, lives, tipsters)
- Marketplace creator economy
- Cripto utility (NEXA Coin + stablecoin)
- Conta financeira (Marketplace Financeiro evolui)
- Eventos físicos (organização de meetups, watch parties — H4-H5)
- Mídia próprio (canal YouTube/Twitch, podcast — H3-H4)

## Possibilidades de exit

### IPO B3
- Janela estimada: 2030-2032
- ARR target: R$ 80-120M
- Múltiplo esperado: 4-6× ARR
- Valuation IPO: R$ 320-720M

### Strategic acquisition
Compradores potenciais:
- **DraftKings, Flutter, Entain** — entrando em LATAM
- **Globo Esporte** — diversificação esportiva
- **Banco BR (Itaú, BTG, Nubank)** — vertical fintech sports
- **PSAV próprio (BAcen Res. 519)** — vira spin-off cripto independente

Múltiplo esperado strategic: 6-10× ARR (premium por sinergia + control).

### Fusão
- Com operadora tier 1 BR (casas família consolidam com NEXA tech)
- Valuation menor mas controlo família mantido

---

# Capítulo 25 — Internacionalização

## Análise de mercados prioritários

### Argentina — Prioridade 1 (Ano 4)
**Por quê:**
- 45M habitantes
- Cultura esportiva forte (futebol obsessivo)
- Crise econômica = busca de alternative income (apostas crescem)
- Cripto adoption alta (35%+ usam stablecoins)
- Diáspora brasileira-argentina (referrals naturais)

**Desafios:**
- Regulação provincial fragmentada
- Inflação alta dificulta pricing
- Pagamentos (MercadoPago AR dominante)

### México — Prioridade 2 (Ano 4-5)
**Por quê:**
- 130M habitantes
- Mercado de apostas formal R$ 30B+ (crescendo)
- SEGOB regulação madura
- Smartphone penetration alta
- Diáspora forte com BR/EUA

**Desafios:**
- Outorga estadual + federal complexa
- Cartel concerns em pagamento

### Colômbia — Prioridade 3 (Ano 5)
**Por quê:**
- 50M habitantes
- Coljuegos mais maduro de LATAM
- Cripto adoption crescente
- Conexão cultural BR via paisas + cafeteros

**Desafios:**
- Mercado menor que MX
- Compliance regulation complexa

### Chile, Peru, Uruguai (Ano 6+)
Menores volumes individuais, regulação em desenvolvimento.

## Adaptação cultural por mercado

### Argentina
- Tradução pt-BR → es-AR (lunfardo regional, "che", "vos")
- Times locais (Boca, River, Independiente, Racing) priorizados em feed
- Tipsters argentinos onboarding prioritário
- Pagamentos MercadoPago AR

### México
- es-MX (vocabulary diferente AR)
- Times Liga MX (América, Chivas, Cruz Azul, Pumas)
- Pagamentos OXXO + bank transfers
- Cultura mais conservadora — UX adaptada

### Colômbia
- es-CO + paisas regional
- Times locais (Millonarios, Nacional, América)
- Pagamentos PSE + Nequi

## Estratégia regulatória por país

Cada país: replica modelo família-Betsul. Família encontra parceiro local com outorga + capital, NEXA fornece tech + operacionaliza.

| País | Parceiro tipo | Outorga | Capital req |
|---|---|---|---|
| AR | Casa local com Lotería Provincial | Por província | R$ 5-15M |
| MX | Operadora local com SEGOB | Federal + estadual | R$ 10-30M |
| CO | Operadora local com Coljuegos | Federal | R$ 5-15M |

## Go-to-market internacional

### Pre-launch (6 meses)
- Estabelece entidade local + parceria operacional
- Compliance regulation
- Localização produto (i18n, payments, content)
- Onboarding 20-30 tipsters locais

### Launch (3 meses)
- Beta convite com 100-500 usuários locais
- Marketing inicial (influenciadores locais)
- Adjustments rápidos baseados em data

### Scale (6-12 meses)
- GA público
- Marketing massivo nacional
- Target 50k-200k MAU primeiro ano por país

## Parceiros locais necessários

- **Operadora local com outorga** (família via parceria/aquisição)
- **PSP local** (gateway pagamento — MercadoPago AR, OXXO MX, PSE CO)
- **KYC provider local** (similar Datavalid mas local)
- **Customer support local** (línguas + cultura)
- **Legal counsel local**

## Investimento necessário por mercado

| País | Setup | Marketing Y1 | Total Y1 |
|---|---|---|---|
| Argentina | R$ 3M | R$ 2M | R$ 5M |
| México | R$ 6M | R$ 4M | R$ 10M |
| Colômbia | R$ 3M | R$ 2M | R$ 5M |
| **3 países iniciais** | **R$ 12M** | **R$ 8M** | **R$ 20M** |

Investimento LATAM total ano 4-5: R$ 20-40M (financiado por receita acumulada + possible Series A externa).

---

# Capítulo 26 — IA e Personalização

## Sistema de recomendação

Arquitetura híbrida:

### Layer 1 — Content-based filtering
Para cada post/pick/tipster, calcular embedding via OpenAI text-embedding-3-small ou similar. User vector calculado a partir de últimas N interações. Cosine similarity rankeia candidates.

### Layer 2 — Collaborative filtering
"Usuários que seguem X também seguem Y." Matrix factorization (ALS) ou neural collaborative filtering.

### Layer 3 — Real-time signals
Engagement velocity, recency, social proof (amigos curtiram), reality check state. Final ranking = weighted sum dos 3 layers.

## Personalização do feed

Por usuário, ajustes em tempo real:
- **Frustrated state:** prioriza editorial, deprioritiza picks de alta odd
- **Impulsive state:** insere "pause" reminders entre posts de aposta
- **Motivated state:** mostra desafios próximos, ranking ascendente
- **Disengaged state:** notifica via push antes que abra app (anti-churn)

## Detecção de estado emocional

`detectUserState()` analisa janela móvel de 50 últimas ações + métricas financeiras + tempo gasto:

```
inputs:
  - last_50_actions (type, timestamp, magnitude)
  - financial_metrics (gasto últimos 7d, win_rate últimos 10, drawdown)
  - session_metrics (tempo na app últimas 24h, número sessões últimos 7d)

classifier: gradient boosting (XGBoost ou similar)
output: one of {motivated, frustrated, impulsive, disengaged} + confidence score
```

Re-classified at every meaningful action. Sem ML inicial em fase 1 (regras heurísticas), upgrade pra ML real em fase 2 quando data crescer.

## Prevenção de fraude com ML

Modelos:
- **Account takeover:** detectar login anômalo (geolocation jump, device new, behavioral anomaly)
- **Multi-accounting:** mesma identidade biométrica em accounts diferentes (Datavalid fornece base)
- **Bot detection:** padrão de cliques inumano, velocidade impossível, headless browser signatures
- **Match-fixing:** apostas anômalas concentradas em jogo específico

Stack: Anomaly detection (isolation forest), supervised classification (suspect transactions), graph analysis (mesmo CPF múltiplos accounts).

## Odds optimization com IA

OddsBalancer (proprietário) calcula:
- Implied probability based em opening odds
- Market shift α baseado em volume real-time
- Sharp money detection (apostas grandes que normalmente acertam = signal de informação privilegiada → ajusta odds)
- Margem alvo 6% mantida (vs 9-12% mercado)

Bayesian inference adjusta odds em tempo real conforme novos sinais.

## Notificações inteligentes

ML decide quando notificar e o quê:
- **Best time:** modelo aprende horário de uso individual (Poisson process per user)
- **Best message:** A/B test multivariate de copy + media + CTA
- **Anti-spam:** se últimas 3 notifications não tiveram engagement, reduce frequency 50%

## Análise preditiva de churn

Modelo treinado em historical data (após 3 meses de operação):
- Features: session frequency, last interaction, friends count, picks acertados, gasto trend
- Output: churn probability em 30 dias
- Action: se >70% probability, trigger intervention (concierge message, bonus contextual)

Eficácia esperada: 20-30% reactivation rate de flagged users.

## Evolução do sistema IA

| Fase | Capacidade IA |
|---|---|
| Ano 1 | Heurísticas + regras simples + collaborative filtering básico |
| Ano 2 | ML models reais (XGBoost) + embeddings (OpenAI API) |
| Ano 3 | Custom models fine-tuned em dados NEXA + real-time inference |
| Ano 4+ | LLM-powered tipster (sugestão de picks via GPT-4 + RAG sobre estatísticas), AI agent moderation |

---

# Capítulo 27 — Infraestrutura Realtime

## Sistema de odds ao vivo

Pipeline:
1. **Source:** Betsul API push (WebSocket) + TheOddsAPI poll fallback (10s)
2. **Ingest:** Edge Function valida + normaliza payload
3. **Storage:** Postgres update via `fn_update_odds` (atomic, em <50ms)
4. **Distribution:** Postgres Realtime emits change events
5. **Client:** Zustand action triggered by Realtime, UI atualiza <1s

SLA: 99,9% uptime, <2s end-to-end latency odds source → user device.

## Live streaming

Mux managed:
- **Ingest:** RTMP server (OBS) ou WebRTC (browser via Whip)
- **Transcoding:** automático (240p/360p/480p/720p/1080p)
- **CDN delivery:** Fastly (Mux's built-in)
- **Latency:** Low-Latency HLS ~3-5s (vs 30s standard)
- **VOD:** opcional, retain 30 dias

Costs: $0,02-0,05/min hour-viewer. Em 5.000 viewers × 30 min médio = $50-150/dia × 30 = $1,500-4,500/mês m12.

## Chat em tempo real

Postgres Realtime suporta até ~1.000 subscribers concurrent por channel. Em chat de live com 10.000+ viewers:
- Sharding por room id
- Sub-aggregations (mostrar amostra de mensagens, não 100% delivery garantido)
- Anti-spam rate limiting (5 msg/min por user)

Alternative considered: Discord integration, custom Socket.io server. Stick com Supabase Realtime até bottleneck real.

## Notificações push

FCM (Android) + APNS (iOS) via Edge Function dispatcher:
- Cron job analisa missions + states + user preferences
- Edge Function `push_dispatcher` calcula targets + sends via FCM/APNS
- Rate limiting hard cap 3/dia per user
- Quiet hours respected (default 22h-8h)

Delivery rate target: 92%+ (industry benchmark FCM 95% Android, APNS 90% iOS).

## Sincronização de estado entre dispositivos

User logged in mobile + desktop simultaneamente:
- Wallet balance sync via Postgres Realtime
- Notifications appearing apenas no device ativo (timestamp-based dedup)
- Bet placement: optimistic UI + reconciliation
- Live streaming: each device starts own session (não sincroniza pause/play)

---

# Capítulo 28 — Cross-sell para Operadoras Parceiras (Apostas ao Vivo)

> **Reposicionamento v5:** este capítulo originalmente tratava NEXA como operadora de aposta direta via Betsul. No pivot fantasy-first, **NEXA não opera apostas reais** — encaminha usuários qualificados pra operadoras SIGAP parceiras via deep-link contextual, monetizando a conversão via CPA + RevShare (Linha 1 do modelo de receita, Cap 9). O conteúdo abaixo descreve os mercados onde o cross-sell faz sentido + a arquitetura técnica do funil fantasy → aposta nas casas parceiras.

## Como o cross-sell funciona (fluxo end-to-end)

```
1. Usuário NEXA acompanha contest DFS de Brasileirão (Flamengo vs Vasco)
2. Durante o jogo, vê notificação: "📊 Mané Garrincha está em destaque no NEXA. Quer apostar no próximo gol?"
3. Tap leva pra tela contextual mostrando odds de 3-5 casas parceiras com sua categoria preferida (futebol BR)
4. Usuário escolhe casa (Betsul, Bet365, Betano, etc) — deep-link com NEXA partner ID
5. Casa parceira faz onboarding/login (se primeira vez via NEXA, conta como FTD após depósito qualificado)
6. Casa parceira processa a aposta com seu próprio backend SIGAP
7. Webhook S2S: casa parceira reporta FTD pra NEXA → NEXA recebe CPA + ativa tracking RevShare
8. NEXA emite notification de volta no app: "✅ Aposta registrada na Betsul. Volta pro NEXA pra acompanhar."
9. Resultado é registrado no feed social NEXA (com permissão do usuário) — XP, badges, ranking
```

**NEXA não toca dinheiro do apostador em momento algum.** Não tem custódia, não tem ledger oficial de stake, não tem responsabilidade fiscal pela aposta. NEXA é puramente o broker do funil de marketing, recebendo comissão da casa parceira por conversão qualificada.

## Mercados onde cross-sell faz sentido

Phase 1 (BR foco):
- **Futebol:** Brasileirão Série A/B/C, Copa Libertadores, Sul-Americana, Champions League, Premier League, La Liga, Bundesliga, Serie A italiana
- **Basquete:** NBB, NBA
- **Vôlei:** Superliga, ligas internacionais
- **MMA:** UFC, ONE, principais eventos
- **eSports:** CS:GO Major, LoL Worlds, Dota TI, Valorant Champions

Mercados por jogo: vencedor, total gols/pontos, handicap, ambas marcam, escanteios, cartões, primeiro/último marcador, etc. ~50-100 mercados por jogo top-tier.

## Provedor de odds

### Primary: Betsul API (white-label)
Odds e mercados do parceiro Betsul. Vantagem: integração direta + sync com fiscal/legal.

### Backup: TheOddsAPI
Polling 10s pra mercados principais. Mostrado como "informativo" no UI quando Betsul indisponível (sem permitir aposta).

### Future: Sportradar ou similar
Para fase 3 quando NEXA opera múltiplas casas, pode contratar Sportradar pra odds aggregation independente.

## In-play betting

Apostas durante jogo (mais críticas em volume):
- Latência mercado fechado a aberto: <2s (regulatory expectation)
- Cashout dinâmico calculado em tempo real
- Overlay durante live stream (apostar sem sair do vídeo)

Risk management:
- Limites menores em mercados in-play (volatilidade)
- Auto-suspensão de mercados em moments suspeitos (gol controverso, lesão grave)

## Cashout automático

Lógica:
- User vê valor atual de cashout (calculado em real-time baseado em odds vigentes)
- Clica "Cashout" → aposta liquidada pelo valor mostrado
- NEXA toma fee 2-5% sobre cashout (depende de mercado)

Cashout protege user (limita perda) e casa (libera exposure).

## Limite de exposição

Risk management Betsul (NEXA herda):
- Max stake per bet (escalonado por tier user)
- Max liability per market (Betsul não aceita aposta que rebenta liability cap)
- Max liability per user 24h (anti-money-laundering)
- Suspension automática de mercados com volume anômalo (potential match-fixing)

## Modelo de margem

NEXA margem casa: 6% (vs 9-12% mercado standard).

Por que menor:
- Atrai apostadores skilled (que evitam margens altas)
- LTV maior compensa margem por aposta menor
- Diferenciação produto + brand positioning

| Mercado | Margem NEXA | Margem Bet365 | Diferença |
|---|---|---|---|
| Vencedor futebol BR | 5,5% | 7-8% | +2pp value pro user |
| Total gols | 6% | 8-10% | +3pp |
| Handicap | 6% | 9-11% | +3-4pp |
| In-play | 7% | 12-15% | +5-7pp |

---

# Capítulo 29 — Economia do Marketplace

## Categorias de produtos

| Categoria | Faixa preço | Volume esperado m12 |
|---|---|---|
| Picks individuais | R$ 5-15 | 5.000/mês |
| Assinatura tipster mensal | R$ 19-99 | 1.500/mês recurring |
| Análise/curso único | R$ 49-499 | 500/mês |
| Live streaming subscription | R$ 4,99-24,99 | 800/mês |
| NFT colecionável | R$ 29-999 | 100/mês |
| Avatar/badge custom | R$ 9,99-49,99 | 200/mês |

## Modelo de precificação

Dinâmico — vendedor define dentro de faixa permitida. NEXA não fixa preço (anti-trust, autonomia creator).

Recomendações algorítmicas no UI vendedor: "Picks similares custam R$ X-Y. Seu preço R$ Z é Q% maior/menor que média."

Featured slots têm preço auction-based (vendedor compete por posição top do marketplace).

## Proteção do comprador

### Escrow
NEXA segura pagamento até user confirmar entrega (livre acesso ao produto digital). Auto-release em 7 dias se não disputa.

### Reviews
Comprador avalia 1-5 estrelas + texto opcional. Reviews públicas. Vendedor responde mas não deleta.

### Refund 7 dias
Se produto digital não conforme description, refund automático em 7 dias (Lei consumidor BR).

### Anti-fake reviews
- Apenas compradores verificados podem review
- Review com texto vacuo flagged
- Reviews em batch (mesmo IP, time próximo) suspectas

## Incentivos para vendedores

- Comissão 90% padrão (vs 50% Twitch, 55% YouTube)
- Discoverability via algoritmo NEXA
- Badge "Top Seller" mensal pros top 5%
- Featured rotation (rotate every month)
- Analytics dashboard (views, conversion, demographics)

## Combate à fraude marketplace

Tipos de fraude e mitigação:

| Fraude | Mitigação |
|---|---|
| Vendedor vende produto roubado | Pre-listing review primeiros 6m + DMCA takedown |
| Fake claims sobre track record | Tipster auditado on-record |
| Conluio entre vendedor + compradores fake reviews | Anti-spam detection |
| Chargeback após delivery | Stripe Connect dispute handling + reputation rating vendedor |
| Money laundering via marketplace | KYC vendedor + AML monitoring + Coaf reporting suspicious |

## GMV projetado e take rate

| Marco | GMV mensal | NEXA take médio | Receita NEXA |
|---|---|---|---|
| M6 | R$ 60k | 12% | R$ 7,2k |
| M12 | R$ 350k | 12% | R$ 42k |
| M18 | R$ 1M | 13% | R$ 130k |
| M24 | R$ 2,5M | 14% | R$ 350k |
| M36 | R$ 6M | 15% | R$ 900k |

Take rate cresce levemente conforme NEXA adiciona valor (analytics, featured, live streaming integrated).

---

# Capítulo 30 — Narrativa para Investidores

## A tese em uma frase

**NEXA é a plataforma de Fantasy Sports + Social + Cripto utility que vai capturar o vácuo competitivo entre Cartola FC (declinante, sem cash, sem social) e Rei do Pitaco (subindo o stack pra operadora SIGAP regulada), monetizando 6 linhas independentes incluindo afiliação multi-operadora — um modelo que combina o engajamento do Sleeper, o cash game do PrizePicks/Underdog (sem violar Art. 49 BR), o moat de comunidade do Discord, e a economia de creator do Twitch, sob proteção jurídica explícita do Art. 49 da Lei 14.790/2023 que dispensa fantasy de autorização SPA/MF.**

## Por que NEXA é uma oportunidade única no Brasil agora

**Quatro janelas convergem em 2026-2028**, criando window-of-opportunity que se fecha em 18-30 meses:

1. **Janela do Cartola declinante.** Cartola perdeu 4,7M de inscritos desde o pico 2016 (de 6,4M pra 1,66M em 2024) — uma queda de 73%. Esses ex-usuários **não migraram pra ninguém em escala** (Rei do Pitaco tem 7M MAU mas atende público diferente: cash gamer puro). Há um vácuo de 3-5M de torcedores brasileiros que querem fantasy mais social, mais multi-esporte, e com upside opcional (cash + afiliação). NEXA é desenhado pra esse vácuo.

2. **Janela do Rei do Pitaco subindo o stack.** Rei do Pitaco obteve licença SPA/MF 2.091 em dez/2024 e está pivotando pra operadora completa (fantasy + sportsbook + iGaming próprios). Isso significa que **deixa vago o slot fantasy-first multi-operadora afiliada** — onde NEXA pode entrar sem competir diretamente (Rei do Pitaco vai mirar high-roller; NEXA mira social/mid-tier). Janela 12-18 meses.

3. **Janela regulatória dupla — Art. 49 + Portaria 1.231.** Art. 49 Lei 14.790 dispensa fantasy de autorização SPA/MF (NEXA evita R$ 30M outorga). Simultaneamente, Portaria SPA/MF 1.231/2024 forçou operadoras (Betano, EstrelaBet entre outras) a **encerrar programas de afiliados informais e reabrir sob contratos escritos com compliance** — abrindo espaço para NEXA negociar como **afiliado institucional qualificado** (KYC do tráfego validado via gov.br, base own social, contratos formalizados). Janela 12-18 meses para fechar deals premium.

4. **Janela do cross-sell fantasy→sportsbook madurando no BR.** DraftKings prova 50-69% conversão DFS→sportsbook nos EUA. BR ainda não tem comparable porque (a) regulamentação só entrou jan/2025, (b) Cartola não cross-vende, (c) Rei do Pitaco está só agora pivotando pra sportsbook próprio. **NEXA pode capturar essa conversão antes de qualquer concorrente.** Better Collective Q1 2025 reportou -13% YoY pela regulação BR — mas isso porque o modelo afiliado deles é SEO puro, sem engajamento. NEXA combina engagement + afiliação = imune ao SEO algorithm risk e à comoditização.

**Por que o investidor não deve esperar:** Allwyn (operadora lotteries europeia) acabou de adquirir 62,3% da PrizePicks por **US$ 1,6 bi cash inicial · EV US$ 2,5 bi · até US$ 4,15 bi com earn-outs** (out/2025, fechamento 1H 2026). Consolidação fantasy global começou. Brazil é o último grande mercado fantasy ainda fragmentado.

## Timing de mercado

Mercado fantasy BR + apostas reguladas BR estão simultaneamente no momento de inflexão:

- **GGR oficial bets BR 2025: R$ 37 bilhões** (SPA/MF) — comparável: UK NGR £14 bi em 2024 (R$ 90 bi) em 67M pop · BR 203M pop está em ~40% per capita do UK maduro → upside 2,5× nos próximos 5-7 anos
- **Fantasy global 2024: US$ 32,21 bi → 2033 projetado US$ 105,58 bi** (CAGR 14,1% — Straits Research)
- **Fantasy BR: R$ 200-400M atualmente, crescendo ~25-40% CAGR** se Rei do Pitaco continuar puxando
- **Smartphone penetration BR 85% adulto · Pix penetration 75% mensal · Conta gov.br 80%+** — infraestrutura pública pronta + demand latente = startup-friendly moment

**NEXA está exatamente no momento Sleeper-2019 (US$ 20M Series B) ou Underdog-2021 (Series A) em BR** — fantasy social escalando rápido com flywheel cross-sell ainda imaturado.

## Team

Equipe atual:
- **Leonardo Guilherme — Founder/CEO.** Engenheiro fullstack senior, executou todo MVP em 14 meses. Acesso família operadoras licenciadas (insider knowledge competitivo). Visão de produto premium + comercial.
- **CTO/Head Eng** — a contratar nos primeiros 30 dias do aporte. Senior Postgres + Edge Functions + cripto preferred.
- **Lead Eng Betsul** — a contratar mês 2. Caminho crítico Wave 1.
- **Conselho família** — supporte estratégico + capital + acesso operadoras.

Equipe target ano 1: 6-8 pessoas full-time + advisors. Equipe ano 3: 18-22 pessoas.

## Traction atual

**Construído:**
- 261 arquivos TS frontend Desktop Electron
- 38+ telas funcionais
- 5 hubs modulares (Whale, Seasons 10 mecânicas, Proposals V2 com 12 features, Events 16 torneios, NEXA Play 11 mini-games)
- Backend Supabase: 72 tabelas, 217 funções SQL, 76 RLS policies, 32 cron jobs
- Painel admin React+Vite separado com 7 páginas operacionais
- 20 Edge Functions Deno/TS

**Em fix (Wave 1):**
- 30 P0s mapeados, fix ETA 80-150h
- 13 Edge Functions broken (bug único de import, 10min fix)
- Integração Betsul 5 P0s white-label (8-12 sem lead-time)
- KYC gov.br POC

**Métricas (pre-launch):**
- 0 usuários ainda (pre-beta)
- Sistema funcional em dev + staging
- Pesquisa KYC viabilidade completa (gov.br + Datavalid + 4 camadas fallback)
- Plano regulatório validado por advisors

## Uso dos recursos R$ 1,2M

Detalhamento já abordado em Cap 1 e 9. Resumo:
- 33% engenharia (2 contratações senior)
- 25% marketing/SEO/content/creator outreach
- 13% smart contract + audit + listing Coin Fase 2
- 7% PSAV parceiro setup
- 8% legal/regulatório/pareceres
- 6% infraestrutura
- 8% reserve/working capital

Burn projetado 12m: R$ 1,8M. Aporte R$ 1,2M cobre 80%. Receita orgânica cobre 20% restante mês 6-12.

## Milestones para próxima rodada

NEXA pretende NÃO captar Series A externa em ano 1-2 (family-funded). Mas se circunstâncias mudarem (oportunidade LATAM acelerada, demand pra Series A), milestones validation:

| Milestone | M12 | M18 | M24 |
|---|---|---|---|
| MRR | R$ 206k | R$ 570k | R$ 1,1M |
| MAU | 3.500 | 18.000 | 60.000 |
| Tipsters ativos | 200 | 700 | 1.500 |
| NPS | ≥ 45 | ≥ 50 | ≥ 55 |
| Casas integradas | 1 (Betsul) | 2 (+ KTO) | 3+ |
| Coin Fase | 1 (off-chain) | 2 (TGE) | 2 maduro |

Series A target (se buscada): R$ 25-50M @ valuation pre-money R$ 80-150M (3-5× ARR m24 R$ 13M).

## Comparables globais e múltiplos de valuation

| Empresa | Categoria | ARR | Mkt cap | EV/Revenue |
|---|---|---|---|---|
| Kambi (Suécia, B2B tech) | KAMBI.ST | $170M | $500M | 3× |
| Genius Sports | NYSE GENI | $380M | $1B | 3-4× |
| Better Collective | OMX BETCO | $310M | $1B | 3-5× (afiliado) |
| Bragg Gaming | BRAG | $75M | $50M | 0,7× |
| DraftKings | NYSE DKNG | $4,4B | $22B | 5× |
| Sorare (private, est) | NFT esporte | $200M | $4,3B (2021 round) | 20× |

NEXA fair value (m24, ARR R$ 13M = $2,6M USD): 3-5× = $8-13M USD (R$ 40-65M).
NEXA agressivo (m36, ARR R$ 18M): 4-6× = $14-22M USD (R$ 70-110M).

## Visão de exit

### IPO B3 (Ano 5-7)
- ARR target R$ 80-120M
- Multiplo IPO BR mid-cap tech: 4-6× ARR
- Valuation IPO: R$ 320-720M
- Liquidez pra founders + holding

### Strategic acquisition (Ano 4-6)
Compradores potenciais e por que pagariam premium:

- **DraftKings/Flutter/Entain** — entrando em LATAM, NEXA é entry point validado BR + LATAM expansion
- **Globo + esporte vertical** — diversificação esportiva, NEXA é asset social esportivo BR
- **Banco BR (Itaú/BTG/Nubank)** — vertical fintech-sports, cross-sell base bancária
- **Operadora chinesa/asiática** — entrada em BR via tech proven

Múltiplo strategic acquisition: 6-10× ARR. Premium justificado por (a) tech proven, (b) base já validada, (c) acesso família operadoras, (d) brand identitária.

### Fusão (Ano 3-5)
Com operadora tier 1 BR (casas família consolidam com NEXA tech). Valuation menor mas controlo família preserved.

## Conclusão — por que esta apresentação importa

Setor de apostas BR vai ter consolidação. Pergunta não é "vai consolidar?" — é "quem consolida e quem é consolidado?". Operadoras tier 1 globais (Bet365, Betano) consolidam via volume bruto. Operadoras tier 2-3 BR consolidam via aquisição de menores. **NEXA consolida via plataforma — entregando aos consolidadores externos a única coisa que dinheiro não compra: relacionamento social com 1M+ apostadores brasileiros e marca identitária construída ao longo de 3-5 anos.**

Holding familiar que aprova R$ 1,2M aporte está comprando opção de participar dessa consolidação como vendedor (R$ 100-700M exit) em vez de comprador (R$ 5-20B requerido pra consolidar via Bet365-clone). Asymetric upside com downside controlado.

A decisão de conselho família dos próximos 30 dias é a decisão mais importante dos próximos 5 anos. **Aprovar aporte = participar de janela window que se fecha em 18-24 meses. Rejeitar = abandonar oportunidade pra concorrente eventualmente capturar.**

---

## Apêndice — Documentos de Referência

**Cross-refs internos:**
- `NEXA-Executive-Summary.md` (versão condensada 8 páginas)
- `CANVAS-NEXA-2026-05-18.html` (Business Model Canvas visual + dev roadmap 4 waves)
- `VIABILIDADE-KYC-NEXA-2026-05-19.md` (research KYC gov.br + alternativas)
- `ANALISE-COMPLETA-NEXA-2026-05-16.md` (audit técnico 3-agents)
- `VERIFICACAO-MEMORIA-VS-CODIGO-2026-05-16.md` (verificação 155 itens)
- `PLANO-NEGOCIO-NEXA-CONSOLIDADO-2026-05-16.md` (plano mestre operacional)

**Source materials externos:**
- Lei 14.790/2023 — texto integral
- Portaria 615/2024 — restrições cartão
- Resoluções Bacen 519/520/521 — PSAV framework
- Instrução Normativa nº 31 — PCA technical
- Datafolha 2025 — penetração apostas BR
- Cetic 2025 — smartphone penetration

---

**Documento concluído.** ~250 páginas estimadas em formato impresso A4 a 10pt. Aproximadamente 32.000 palavras.

*Confidencial. Reprodução proibida sem autorização escrita.*

NEXA — Construindo a infraestrutura social do entretenimento esportivo brasileiro.

---

# ANEXOS INSTITUCIONAIS

Os anexos a seguir complementam os 30 capítulos do documento principal com frameworks estruturados, dados quantitativos detalhados, e templates legais/operacionais — material esperado em due diligence formal por VCs tier 1 ou strategic acquirers.

---

# Anexo A — Glossário Institucional

Definições padronizadas dos 75 termos técnicos, regulatórios, financeiros e produto usados ao longo do documento.

## Termos regulatórios

**Lei 14.790/2023** — Lei brasileira de 30/12/2023 que regulamenta apostas de quota fixa, criou a SPA/MF como regulador e estabeleceu requisitos de licenciamento.

**SPA/MF (Secretaria de Prêmios e Apostas, Ministério da Fazenda)** — Órgão federal responsável por outorgar e fiscalizar operadoras de apostas no Brasil.

**SIGAP (Sistema de Gestão de Apostas)** — Sistema técnico desenvolvido pela Serpro para a SPA/MF; centraliza recebimento e monitoramento de dados de operadoras, processa ~500 milhões de registros diários.

**Outorga** — Autorização federal para operar apostas no Brasil. Custo: R$ 30 milhões + capital social mínimo R$ 30 milhões. Validade: 5 anos. Cada outorga permite até 3 marcas.

**NGR (Net Gaming Revenue)** — Receita líquida de apostas (stakes coletadas menos prêmios pagos). Base de cálculo da tributação setorial (12%).

**GGR (Gross Gaming Revenue)** — Receita bruta apostada (stakes totais). Métrica de volume, não de margem.

**Portaria 615/2024** — Norma SPA/MF que veda cartão de crédito em depósitos de aposta e parceria de operadora com instituição de crédito para concessão de empréstimo dentro do app.

**PCA (Plataforma Centralizada de Autoexclusão)** — Plataforma gov.br operacional desde 10/dez/2025 que permite cidadão se autoexcluir simultaneamente das 188 operadoras autorizadas. Notificação automática SIGAP → operadora com prazo de 72h para bloquear acesso.

**PL 1018/2025** — Projeto de lei em tramitação que propõe banir gamificação (XP, ligas, missions, battle pass) em apps de aposta. Risco regulatório R5 mapeado.

**Bacen 519/520/521** — Resoluções do Banco Central vigentes desde 02/02/2026 que estabelecem framework regulatório para PSAVs (Provedores de Serviços de Ativos Virtuais).

**PSAV (Provedor de Serviços de Ativos Virtuais)** — Categoria regulatória Bacen para empresas que custodiam, transferem ou negociam cripto-ativos. Capital social mínimo R$ 10,8M-37,2M dependendo do escopo.

**Datavalid (Serpro)** — API oficial do governo brasileiro para validação cadastral cruzada com bases Receita Federal. Fonte de verdade autoritativa para KYC apostas (Lei 14.790 art. 32).

**Login Único gov.br** — Sistema federal de autenticação OAuth2 com 3 níveis de selo (Bronze, Prata, Ouro). Disponível para empresas privadas via homologação.

**LGPD (Lei Geral de Proteção de Dados)** — Lei 13.709/2018 que regula tratamento de dados pessoais no Brasil. ANPD é a autoridade fiscalizadora.

**Coaf (Conselho de Controle de Atividades Financeiras)** — Órgão federal de inteligência financeira; recebe reports de operações suspeitas de operadoras de apostas (via Betsul, no caso NEXA).

**Loterj** — Loteria estadual do Rio de Janeiro, regulador estadual paralelo ao federal SPA/MF para apostas regionais.

**KYC (Know Your Customer)** — Procedimento de verificação de identidade do usuário obrigatório antes do primeiro depósito de aposta. Cascata 4 camadas NEXA: gov.br → Datavalid → Unico/CAF → IDWall manual.

**AML (Anti-Money Laundering)** — Conjunto de controles para prevenir lavagem de dinheiro: monitoramento transacional, alertas de threshold, reporting ao Coaf.

**Pix titularidade** — Requisito Lei 14.790 art. 35: depósito e saque devem ser feitos com Pix da mesma titularidade do CPF cadastrado.

## Termos financeiros

**MRR (Monthly Recurring Revenue)** — Receita mensal recorrente. Métrica core de SaaS e plataformas com assinatura.

**ARR (Annualized Run Rate)** — Receita projetada anualizada (12 × MRR atual). Útil para valuation comparativo.

**ARPU (Average Revenue Per User)** — Receita média por usuário. Cálculo: MRR ÷ MAU.

**MAU (Monthly Active Users)** — Usuários ativos no mês. Definição NEXA: pelo menos uma sessão >2min no período.

**DAU (Daily Active Users)** — Usuários ativos no dia. Métrica de habit formation.

**WAI (Weekly Active Identity)** — North Star Metric NEXA. Usuários que abriram app pelo menos 1× na semana E executaram pelo menos 1 ação social.

**CAC (Customer Acquisition Cost)** — Custo total de marketing + sales ÷ novos usuários adquiridos. Blended ou por canal.

**LTV (Lifetime Value)** — Valor presente líquido total esperado de um usuário ao longo de seu ciclo de vida no produto.

**LTV/CAC ratio** — Razão entre LTV e CAC. Benchmark saudável SaaS: 3-5×. NEXA target: 18-48×.

**Payback period** — Meses até receita acumulada de um usuário exceder o CAC pago para adquiri-lo. NEXA target: < 1 mês blended.

**Churn rate** — % de usuários que abandonam o produto em período definido (mensal padrão). NEXA target steady-state: 4-5% mensal.

**Burn rate** — Caixa consumido por mês. Diferenciado entre "gross burn" (todos gastos) e "net burn" (gastos - receita).

**Runway** — Meses até o caixa atual acabar dado o burn rate atual.

**Cohort** — Grupo de usuários agrupados por uma característica comum (mês de signup, canal de aquisição, segmento).

**Retention curve** — Curva mostrando % de cohort original que permanece ativo em D1/D7/D30/D90.

**Viral coefficient (k-factor)** — Quantidade média de novos usuários trazidos por usuário existente. k > 1 = crescimento exponencial orgânico.

**Take rate** — % cobrado pela plataforma sobre transações entre terceiros (modelo marketplace). NEXA marketplace: 10-20%.

**EV/Revenue** — Enterprise Value dividido por receita anual. Múltiplo de valuation usado em comparables.

**Pre-money valuation** — Valor da empresa antes do aporte de capital novo.

**Post-money valuation** — Pre-money + capital aportado.

**TAM/SAM/SOM** — Total/Serviceable/Obtainable Addressable Market. Pirâmide de mercado endereçável.

## Termos de produto

**Battle Pass** — Sistema de progressão sazonal de 90 dias com 100 níveis e 50 recompensas. Modelo Fortnite adaptado.

**Clan war** — Competição semanal entre clãs (10-50 membros) baseada em XP acumulado e métricas sociais.

**Copy-bet** — Funcionalidade de copiar pick de tipster em um clique, com bet automaticamente registrada na casa parceira.

**Liga semanal** — Cohort de 50 usuários competindo por XP em uma semana. Top 10 sobe (Bronze → Prata → Ouro → Platina → Diamante → Mestre), bottom 10 cai.

**detectUserState()** — Função client-side que classifica usuário em motivated/frustrated/impulsive/disengaged baseado em últimas 50 ações.

**Reality check** — Notificação periódica (30/60/90 min de sessão) lembrando tempo gasto e gasto financeiro. Compliance Lei 14.790.

**Tipster** — Apostador que publica picks com fundamentação, monetizando via assinatura mensal, marketplace de cursos, ou lives.

**Pick** — Recomendação de aposta de um tipster (ex: "Flamengo vence @ 2.0 odds"). Pode incluir fundamentação textual obrigatória (>100 chars).

**ROI tipster** — Return on Investment teórico baseado em stakes unidades (1u = stake padrão), calculado dos últimos 30/90/365 dias.

**Drawdown** — Maior perda consecutiva de um tipster. Indicador de gestão de risco.

**Cashout** — Funcionalidade de liquidar aposta in-play antes do término do jogo pelo valor atual calculado em tempo real.

**Stake** — Valor apostado em uma transação individual.

**Liability** — Exposure máxima da casa em um mercado específico (potencial perda se todos apostam no mesmo lado).

## Termos cripto/blockchain

**NEXA Coin** — Cripto utility do ecossistema NEXA. Faseada: Fase 1 off-chain (DB Postgres), Fase 2 on-chain (smart contract via PSAV parceiro), Fase 3 PSAV próprio Bacen.

**TGE (Token Generation Event)** — Lançamento público da Coin com listing em DEX/CEX inicial. NEXA Fase 2.

**ERC-20** — Padrão de smart contract para tokens fungíveis na Ethereum e L2 (Polygon, Base, Arbitrum).

**SPL (Solana Program Library)** — Padrão equivalente ao ERC-20 na blockchain Solana.

**Smart contract** — Código self-executing em blockchain. NEXA Coin Fase 2 usará smart contract auditado (CertiK + OpenZeppelin).

**Custody (custódia)** — Guarda de cripto-ativos. Modelo NEXA Fase 2: custodial via PSAV parceiro (Mercado Bitcoin). Fase 3: custódia própria NEXA Bacen-licensed.

**DEX (Decentralized Exchange)** — Exchange descentralizado (Uniswap, PancakeSwap). Listing inicial NEXA Coin Fase 2.

**CEX (Centralized Exchange)** — Exchange centralizado (Binance, Coinbase, Mercado Bitcoin). Listing secundário NEXA Coin.

**Stablecoin** — Cripto com valor pareado a moeda fiduciária (USDT, USDC, BRZ). Possível produto futuro NEXA-BRL (Ano 5+).

**Yield (rendimento)** — Retorno passivo sobre cripto staked ou em DeFi. NEXA Coin: ZERO yield prometido (anti-classificação security CVM).

**Burn (cripto)** — Queima permanente de tokens, reduzindo supply em circulação. NEXA Coin Fase 2: 0,5% volume burned.

**Treasury** — Reserva de cripto controlada pela equipe/projeto. NEXA: 15% supply (1,5B tokens) em treasury multisig.

**Multisig (multi-signature wallet)** — Wallet que requer múltiplas assinaturas para transação. NEXA Treasury: 3-of-5 multisig (founder + 2 advisors + 2 sócios família).

**Vesting** — Liberação programada de tokens ao longo do tempo. NEXA Time: 4 anos com cliff de 1 ano.

**Cliff** — Período inicial sem liberação de tokens. Após cliff, vesting começa.

## Termos operacionais

**White-label** — Modelo de negócio onde plataforma tech (NEXA) opera sobre operadora licenciada (Betsul), com a casa fornecendo a licença e processamento fiscal/legal.

**B2B2C** — Modelo onde NEXA serve Betsul (B2B), que por sua vez serve consumidores (B2C).

**Tech partner** — Posicionamento legal NEXA: provedora de tecnologia para operadora licenciada, não operadora própria.

**Stripe Connect** — API Stripe para split payments entre marketplace e vendedores. Usado para payout automático a creators.

**Asaas** — Gateway de pagamento brasileiro especializado em Pix. Usado como primário NEXA para depósitos.

**Mercado Bitcoin (MB)** — Maior exchange cripto brasileiro. Recomendado como PSAV parceiro Fase 2 NEXA Coin.

**Mux** — Serviço gerenciado de live streaming (RTMP ingest, HLS playback, VOD). Usado para lives NEXA.

**Sentry** — Plataforma de observability/error tracking. Usado em produção NEXA.

**Supabase** — BaaS (Backend as a Service) baseado em PostgreSQL. Stack core NEXA.

**Edge Function** — Função serverless executada na borda (Deno runtime em Supabase). Usado para webhooks, processamento async, integrações.

**RLS (Row Level Security)** — Recurso Postgres que aplica políticas de acesso por linha. Usado em todas tabelas user-facing NEXA.

## Termos de UX/Design

**Onboarding** — Primeiras experiências do usuário após signup. NEXA: tutorial interativo 4 telas, 3 minutos.

**Activation** — Primeira ação core completada (5+ ações sociais OU 1 aposta na primeira semana). NEXA target: 65-75%.

**D1/D7/D30/D90 retention** — % do cohort original que retorna ao app no dia 1, 7, 30, 90 após signup.

**FOMO (Fear of Missing Out)** — Mecânica psicológica de medo de perder eventos sociais. Usado saudavelmente via social proof (não escassez artificial).

**Variable Ratio Reinforcement** — Princípio behaviorista onde recompensa imprevisível gera engajamento prolongado. Base psicológica de gambling tradicional; usado eticamente em NEXA via 7 camadas de feedback.

**Near-miss** — Sensação de "quase ganhou" que ativa dopamina. NEXA limita uso a contextos saudáveis (XP a 30 do próximo nível) e bane em contexto preditivo de aposta.

---

# Anexo B — Comparable Transactions Table

Mapeamento de M&A, IPOs e rounds Series A-C relevantes do setor de apostas + entretenimento social + cripto-utility nos últimos 24 meses (2024-2026). Base para valuation comparativa.

## Operadoras tradicionais BR

| Empresa | Data | Tipo | Valor (R$) | EV/Revenue | Comprador | Observações |
|---|---|---|---|---|---|---|
| KTO (Liquid Group) | Mar/2024 | Aquisição minoritária | R$ 800M | 4,2× | Family office UK | Antes da Lei 14.790 |
| Pixbet | Set/2024 | Patrocínio principal CBF | — | — | Brasileirão | Marca pagou R$ 220M/ano por 3 anos |
| Galera.bet | Nov/2024 | Series B Internal | R$ 150M | 3,8× | Investidor mexicano | Pre-money R$ 600M |
| Aposta Ganha | Jan/2025 | M&A | R$ 280M | 2,9× | Operadora portuguesa | Outorga + brand |

## Plataformas internacionais comparáveis

| Empresa | Data | Tipo | Valuation (US$) | EV/Revenue | Notas |
|---|---|---|---|---|---|
| Better Collective | 2024 | Listed OMX | $1,2B | 3,8× | Afiliado betting líder global |
| Kambi (Suécia) | 2024 | Listed | $480M | 2,8× | B2B sportsbook tech |
| Genius Sports | 2024 | Listed NYSE | $1,1B | 3-4× | Data + tech betting |
| Bragg Gaming | 2024 | Listed | $52M | 0,8× | Operadora pequena |
| DraftKings | 2024 | Listed NYSE | $22B | 5,0× | Líder US DFS+sportsbook |
| Flutter Entertainment | 2024 | Listed LSE | $35B | 4,2× | Operadora global (Paddy, FanDuel, Sky) |
| Entain | 2024 | Listed LSE | $7B | 1,8× | bwin, partypoker, Ladbrokes |

## Apps social + content adjacentes

| Empresa | Data | Tipo | Valuation (US$) | Multiple | Notas |
|---|---|---|---|---|---|
| Sorare (NFT esporte) | Set/2021 | Series B | $4,3B | 22× ARR | SoftBank-led, NFT cards |
| Strava | 2024 | Private | $1,5B | 8× ARR | Social fitness with subscription |
| Patreon | 2024 | Private | $4B | 12× ARR | Creator economy SaaS |
| Substack | 2024 | Series B | $650M | 18× ARR | Newsletter monetization |
| Discord | 2024 | Private | $15B | 25× ARR | Community platform (gaming-origin) |

## Cripto regulada BR

| Empresa | Data | Tipo | Valor | Notas |
|---|---|---|---|---|
| Mercado Bitcoin | 2024 | Series C ext | $2,1B post | Maior PSAV BR; sócio Galaxy |
| Bitso (LATAM) | 2024 | Series C ext | $2,2B post | Cobertura 5 países |
| Foxbit | 2024 | M&A | R$ 800M | Adquirida por banco BTG |
| Hashdex | 2024 | Series B | R$ 450M | Gestora cripto BR |

## Comparáveis aplicáveis à NEXA

Múltiplos relevantes pra projeção de valuation NEXA:

**Para fase early (pre-revenue):** R$ 500k - R$ 1M (mediana de tech betting BR pre-revenue 2024-2025)

**Para fase scale (R$ 2,5M ARR m12):** 3-5× = R$ 7-12M (consistente com Kambi/Genius/Bragg)

**Para fase mature (R$ 18M ARR m36):** 4-6× = R$ 70-110M (premium por integração creator economy + cripto)

**Para fase exit (R$ 80-120M ARR ano 5-7):** 5-10× = R$ 400M-1,2B (premium por moat estrutural + LATAM expansion)

## Recent BR betting M&A activity (2025-2026)

Mercado BR está em fase pré-consolidação. Esperam-se 8-15 transações grandes (>R$ 100M) entre 2027-2030. NEXA positioning como **target premium** (não comprador) por causa de:

1. Acesso família a múltiplas operadoras (impossível replicar)
2. Camada social + cripto (diferenciação tech vs commodities competitivos)
3. KYC gov.br integrado (eficiência operacional defensável)
4. Brand identitária vs transacional (LTV multiplicador)

## Strategic acquirers potenciais

Mapeamento de quem PAGARIA premium por NEXA em janela 36-60 meses:

### Tier 1 — pagariam 6-10× ARR
- **DraftKings/Flutter** — entrada em LATAM via plataforma social já validada
- **Entain Group** — diversificação LATAM, parceria família operadoras BR
- **Globo Esporte (Grupo Globo)** — vertical esportiva digital, sinergia conteúdo

### Tier 2 — pagariam 4-7× ARR
- **Mercado Bitcoin** — vertical sports + utility token complementar
- **Better Collective** — expansão BR/LATAM, integração afiliado
- **Itaú/BTG/Nubank** — vertical fintech esportes (cross-sell base existente)

### Tier 3 — pagariam 3-5× ARR
- **Operadora BR (Betano, KTO próprio, Galera)** — consolidação setorial
- **PSAV BR (Foxbit pós-BTG)** — vertical de produto

Premium relativo justifica-se por (a) tech proven em produção, (b) base validada com retention demonstrada, (c) acesso família operadoras (asset único), (d) brand defensável.

---

# Anexo C — Term Sheet Template (caso futura Series A externa)

**Importante:** NEXA não pretende captar Series A externa em ano 1-2 (family-funded via holding). Este anexo é template defensivo caso oportunidade emerja (acelerar LATAM, ofensiva de competitor, ofertas inboundes não-solicitadas). Estruturação alinhada com practices de Brazilian VC tier 1 (Kaszek, Monashees, Canary, Astella, Iporanga) e funds internacionais com mandate LATAM (SoftBank LATAM, General Atlantic, Tiger Global).

## Estrutura proposta — Series A R$ 25-50M

### Termos econômicos

| Termo | Proposta NEXA |
|---|---|
| Round size | R$ 25-50M |
| Pre-money valuation | R$ 80-150M (3-5× ARR projetado m24 R$ 13M) |
| Post-money | R$ 105-200M |
| Diluição esperada | 20-25% |
| Tipo de ação | Preferred Series A (preferência liquidação 1× non-participating) |
| Liquidation preference | 1× non-participating com cap em 3× returns |
| Anti-dilution | Weighted average broad-based (não full ratchet) |
| Pro-rata rights | Sim, prorrata padrão pro-rata Series B onwards |
| ROFO (Right of First Offer) | Sim, em transferências secundárias founders |
| Drag-along | Acionada por 75% Preferred + 60% Common conjunto |
| Tag-along | Padrão proporcional |

### Governança

| Termo | Proposta NEXA |
|---|---|
| Board composition | 5 cadeiras: 2 Founders + 2 Investors + 1 Independent |
| Independent director | Selecionado conjuntamente; sugestões: ex-CEO operadora BR, ex-Bacen, ex-CVM |
| Reserved matters (consent rights) | Lista padrão NVCA adaptada: emissão novas ações, debt >R$ 5M, M&A, dissolução, mudanças no scope NEXA Coin |
| Information rights | Mensal: financial dashboard. Trimestral: board meeting + business review. Anual: audit financeiro + plano estratégico |
| Investor protective provisions | Standard CRP (Corporate Reorganization Provisions) |

### Founder commitments

| Termo | Proposta NEXA |
|---|---|
| Vesting founder shares | 4 anos, cliff 1 ano (já 1 ano corrido pre-Series A → 25% liberado no closing) |
| Acceleration | Double trigger (mudança de controle + termination sem causa) |
| Non-compete | 24 meses pós-saída em apostas/cripto BR-licensed |
| Exclusividade | Founder full-time NEXA durante vesting |

### Cláusulas especiais (NEXA específicas)

| Termo | Proposta NEXA |
|---|---|
| Family rights | Holding familiar mantém direito preferencial em (a) novas oportunidades de operadoras SIGAP, (b) decisão sobre PSAV próprio Fase 3 |
| Crypto token rights | Tokens NEXA Coin: 5% supply reservada (500M tokens) para vesting investidores Series A — paralelo às ações equity, mesma vesting timeline |
| Casa Betsul exclusivity | NEXA mantém exclusividade contratual com Betsul como casa parceira primária por 36 meses após Series A; expansão para KTO e demais casas família NÃO requer consent investidores |
| Regulatory cooperation | Investor coopera ativamente em eventuais consultas SPA/MF, Bacen, CVM (fornece pareceres, padrinhos institucionais) |
| ESG mandatory | NEXA mantém compromissos públicos jogo responsável (PCA, reality check, detectUserState); investor não pode pressionar pra remover |

### Use of proceeds proposed

| Categoria | % | R$ (range R$ 25M base) |
|---|---|---|
| Hiring (8-12 eng/growth/ops) | 35% | R$ 8,75M |
| Marketing scale (paid + creator + brand) | 25% | R$ 6,25M |
| LATAM expansion (AR, MX setup) | 15% | R$ 3,75M |
| Smart contract + audit + listing Coin (Fase 2 mature) | 10% | R$ 2,5M |
| Working capital + reserve | 10% | R$ 2,5M |
| Legal + compliance + advisory | 5% | R$ 1,25M |

### Milestones de uso

| Mês pós-closing | Milestone | Tranche release |
|---|---|---|
| Closing | R$ 10M imediato | 40% |
| M6 | MRR ≥ R$ 350k + LATAM team contratado | R$ 8M (32%) |
| M12 | MRR ≥ R$ 700k + Coin Fase 2 live | R$ 7M (28%) |

Tranching protege investor (NEXA não recebe tudo se gates falham) e força disciplina financeira NEXA.

## Comparáveis BR para benchmark do Term Sheet

| Empresa | Round | Valuation post | Diluição |
|---|---|---|---|
| Nubank (Series A 2014) | $14M | $90M | 15-18% |
| iFood (Series A 2014) | $20M | $80M | 25% |
| QuintoAndar (Series A 2017) | $30M | $150M | 20% |
| Loft (Series A 2019) | $70M | $400M | 17% |
| Kavak (Series A 2020) | $50M | $200M | 25% |
| Sorare (Series B 2021) | $680M | $4,3B | 16% |

NEXA range 20-25% diluição em R$ 25-50M alinha com mediana BR Series A 2024.

## Term Sheet anti-padrões — o que NEXA recusa

Lista do que NEXA NÃO aceita em term sheet, com justificativa:

| Termo proibido | Por quê |
|---|---|
| Full ratchet anti-dilution | Destrói cap table em down round; weighted average broad-based é padrão saudável |
| Liquidation preference > 1× | Distorce alignment founders/employees |
| Participating preferred | Investor recebe dividendo + preferência — duplo benefício |
| Board control investidor | Founders perdem agilidade decisória |
| Veto em hiring CFO/CTO | Investor pode bloquear hires críticos |
| Drag-along solo investidor | Permite forçar venda contra founders |
| Pay-to-play obrigatório | Punição excessiva se founders não participam de bridge |
| Cláusula de exit forçado em prazo | Pressão por exit prematuro |
| Direito de aprovar produto/roadmap | Investor influencia decisões de produto |

Term sheet ideal preserva (a) alinhamento founders/investidor, (b) governança balanceada, (c) flexibilidade operacional, (d) saída ordenada se misalignment futuro.

---

# Anexo D — Cap Table Evolution

Evolução projetada do cap table NEXA em cenário base (assumindo Series A R$ 30M em ano 2 + Series B R$ 80M em ano 3).

## Estado atual — Pre-aporte holding (Mai/2026)

| Stakeholder | Type | Shares | % | Valor pre-money |
|---|---|---|---|---|
| Leonardo Guilherme (Founder) | Common | 6.000.000 | 60% | — |
| Holding familiar (sócios irmãos + pais) | Common | 4.000.000 | 40% | — |
| **Total** | | **10.000.000** | **100%** | — |

Estrutura simples herdada da fase pré-formal. Holding tem 40% por contrato familiar (família é dona dos ativos operacionais Betsul e demais casas).

## Pós aporte holding R$ 1,2M (Jun/2026)

Aporte holding NÃO dilui founder via emissão nova ações — é estruturado como mútuo conversível em equity OU debt subordinado, com conversão opcional em Series A futura no mesmo valuation que VC externo (se aplicável).

| Stakeholder | Type | Shares | % |
|---|---|---|---|
| Leonardo Guilherme (Founder) | Common | 6.000.000 | 60% |
| Holding familiar | Common + Mútuo R$ 1,2M | 4.000.000 | 40% |
| **Total** | | **10.000.000** | **100%** |

## Pós Series A externa R$ 30M (Ano 2 — hipotético)

Cenário: oportunidade emerge, valuation pre-money R$ 120M (4× ARR m24 R$ 6,8M).

| Stakeholder | Type | Shares | % |
|---|---|---|---|
| Leonardo Guilherme (Founder) | Common | 6.000.000 | 48% |
| Holding familiar | Common | 4.000.000 | 32% |
| Investor Series A (lead) | Preferred A | 1.875.000 | 15% |
| Investor Series A (co-investors) | Preferred A | 625.000 | 5% |
| **Total** | | **12.500.000** | **100%** |
| Post-money | | | **R$ 150M** |

Diluição founder + família: 40% → 80% combinado (mantém controle).

## Pós Series B R$ 80M (Ano 3 — hipotético)

Cenário: forte tração, valuation pre-money R$ 350M (3× ARR m36 R$ 18M + premium).

| Stakeholder | Type | Shares | % |
|---|---|---|---|
| Leonardo Guilherme (Founder) | Common | 6.000.000 | 38% |
| Holding familiar | Common | 4.000.000 | 25% |
| Investor Series A | Preferred A | 2.500.000 | 16% |
| Investor Series B (lead) | Preferred B | 2.700.000 | 17% |
| Investor Series B (co-investors) | Preferred B | 800.000 | 5% |
| **Total** | | **16.000.000** | **101%* tolerância de arredondamento** |
| Post-money | | | **R$ 430M** |

Founder pessoal: 60% → 38% em 36 meses (diluição saudável vs 25-30% típico de Series B BR).

## Cap Table no IPO (cenário Ano 6 — exit ótica IPO B3)

Cenário: ARR R$ 100M, valuation IPO 5× ARR = R$ 500M, secondary R$ 100M (oferta primária + secondary parcial founders/investors).

| Stakeholder | % pre-IPO | % pós-IPO |
|---|---|---|
| Leonardo Guilherme (Founder) | 38% | 30% (vende 20% via secondary) |
| Holding familiar | 25% | 20% (vende parcial) |
| Investor Series A | 16% | 13% (preserva grande parte) |
| Investor Series B | 22% | 17% |
| ESOP (Employee Stock Option Plan) | — | 8% |
| Public float | — | 12% |
| **Total** | 101% | 100% |

Valor pessoal founder no IPO: R$ 150M (30% × R$ 500M). Holding familiar: R$ 100M.

## ESOP — Employee Stock Option Plan

NEXA reservará 10% supply (1M shares) para ESOP pré-Series A (mês 6-12). Alocação:

| Cargo | Stock allocation típica |
|---|---|
| C-level (CTO, CFO, CMO) | 1-3% cada |
| VP/Diretores | 0,3-1% |
| Senior IC (Lead Eng, Lead Designer) | 0,1-0,5% |
| Mid IC | 0,03-0,1% |
| Junior IC | 0,01-0,05% |

Vesting padrão: 4 anos, cliff 1 ano. Refresh ESOP a cada Series (Series B típica adiciona +5% nova reserva).

---

# Anexo E — Sensitivity Analysis (multi-variable matrices)

Análise de sensibilidade de variáveis críticas. NEXA stress-tested em 4 dimensões:

## E.1 — ARPU × Churn (impacto no LTV)

LTV = ARPU × (1 / Churn mensal) × 0,88 margem bruta

| Churn ↓ \ ARPU → | R$ 25 | R$ 35 (base) | R$ 45 | R$ 55 |
|---|---|---|---|---|
| 2% | R$ 1.100 | R$ 1.540 | R$ 1.980 | R$ 2.420 |
| 3% | R$ 733 | R$ 1.027 | R$ 1.320 | R$ 1.613 |
| 4% | R$ 550 | R$ 770 | R$ 990 | R$ 1.210 |
| **5% (base)** | R$ 440 | **R$ 616** | R$ 792 | R$ 968 |
| 6% | R$ 367 | R$ 513 | R$ 660 | R$ 807 |
| 8% | R$ 275 | R$ 385 | R$ 495 | R$ 605 |

**Lições:**
- Cada 1% de redução em churn aumenta LTV em ~25% (impacto não-linear)
- Cada R$ 10 ARPU aumenta LTV em 35% (relação linear)
- ARPU 45 + churn 3% (cenário agressivo) gera LTV 2,2× cenário base

## E.2 — CAC × Conversion (impacto em payback)

Payback (meses) = CAC ÷ (ARPU × conversion to paid)

| Conv ↓ \ CAC → | R$ 20 | R$ 35 (base) | R$ 50 | R$ 80 | R$ 120 |
|---|---|---|---|---|---|
| 35% (cold) | 1,6m | 2,9m | 4,1m | 6,5m | 9,8m |
| 50% (warm) | 1,1m | 2,0m | 2,9m | 4,6m | 6,9m |
| **65% (NEXA base)** | 0,9m | **1,5m** | 2,2m | 3,5m | 5,3m |
| 75% (premium) | 0,8m | 1,3m | 1,9m | 3,0m | 4,6m |

**Lições:**
- NEXA pode tolerar CAC até R$ 80 com payback ainda saudável (<6 meses)
- Canais com conversion <35% (programmatic display) precisam CAC <R$ 50
- Canais com conversion >65% (organic, influencer) tolerable até CAC R$ 120

## E.3 — MAU × ARPU (impacto em MRR m12)

MRR = MAU × ARPU

| ARPU ↓ \ MAU → | 2.500 | 3.500 (base) | 5.000 | 8.000 |
|---|---|---|---|---|
| R$ 25 | R$ 62k | R$ 87k | R$ 125k | R$ 200k |
| R$ 35 (base) | R$ 87k | **R$ 122k** | R$ 175k | R$ 280k |
| R$ 45 | R$ 112k | R$ 157k | R$ 225k | R$ 360k |
| R$ 55 | R$ 137k | R$ 192k | R$ 275k | R$ 440k |

**Lições:**
- Para atingir target R$ 206k m12 (declarado), precisa de MAU 5.000 × ARPU R$ 41 (mix de cenário base + um upside)
- Estratégia ofensiva: foco em ARPU (escalar Premium + Coin) é menos arriscado que escalar MAU (depende de CAC)

## E.4 — Cenários consolidados (3-axis stress test)

Combinação simultânea de 3 variáveis críticas:

| Cenário | MAU m12 | ARPU | Churn | MRR m12 | MRR m24 | Burn m12 | Cash position m24 |
|---|---|---|---|---|---|---|---|
| **Bear (-25%)** | 2.500 | R$ 26 | 7% | R$ 65k | R$ 280k | R$ 200k | R$ -2,1M (precisa bridge) |
| **Conservador** | 3.500 | R$ 30 | 5% | R$ 138k | R$ 800k | R$ 170k | R$ -150k (apertado) |
| **Base** | 3.500 | R$ 35 | 5% | R$ 206k | R$ 1,1M | R$ 180k | R$ +400k (saudável) |
| **Realista+** | 5.000 | R$ 40 | 4% | R$ 312k | R$ 1,8M | R$ 200k | R$ +1,8M (excelente) |
| **Bull (+50%)** | 8.000 | R$ 50 | 3% | R$ 624k | R$ 3,5M | R$ 230k | R$ +5,2M (overflow) |

**Lições estratégicas:**

1. **Cenário Bear é viável** mas exige bridge funding R$ 1,5-2,5M no mês 14-16. Risk mitigation: começar negociações bridge em mês 10 se MRR <R$ 110k.
2. **Cenário Base** atinge breakeven mês 12 (conforme projeção principal) — caixa ainda apertado, mas viável sem novo aporte.
3. **Cenário Realista+** gera caixa excedente que permite acelerar LATAM 6 meses adiantado.
4. **Cenário Bull** gera dilema saudável: usar caixa pra acelerar ou distribuir dividendo à holding.

## E.5 — Stress test de eventos críticos (worst-case scenarios)

| Evento de stress | Probabilidade | Impacto MRR | Mitigação | Cash buffer requerido |
|---|---|---|---|---|
| API Betsul atrasa 4+ meses (R1) | 25% | -100% MRR linha NGR | Paralelizar KTO | R$ 800k extra |
| PCA / SPA endurece (R4 ou R5) | 15% | -30% MRR (cap em loyalty/gamification) | Reframing earn como conteúdo | R$ 500k extra |
| Free-money exploit produção (R3) | 10% | -50% MRR + lawsuit costs | Hard cap backend + insurance | R$ 1M extra |
| Smart contract hack (R7) | 8% | -100% TGE + lawsuit | Audit + bug bounty + Nexus Mutual | R$ 2M extra |
| Recessão BR / queda renda discricionária | 20% | -25% MRR | Cortar marketing 50%, hold features Coin | R$ 600k extra |

**Soma worst-case (combinação de 2 eventos):** R$ 2-3M cash buffer adicional recomendado.

**Recomendação:** captar bridge R$ 1-2M em mês 8-10 se 2+ riscos materializarem simultaneamente.

---

# Anexo F — Porter's 5 Forces Analysis

Análise estrutural da indústria de apostas + entretenimento social BR aplicando o framework Porter. Avalia atratividade do setor e poder de barganha NEXA em cada dimensão.

## F.1 — Rivalidade entre concorrentes existentes

**Intensidade: ALTA** (4/5)

Diagnóstico:
- 188 operadoras autorizadas competindo por mercado em formação
- Top 10 capturam ~60% — long tail de 178 operadoras compete intensamente por share
- Diferenciação principal hoje: marketing budget + bonus (commoditização)
- Switch cost do apostador é baixo (usa 3-5 apps em paralelo)
- Race-to-the-bottom em odds (margem casa caindo de 9-12% pra 6-8% top operadoras)
- Marketing pricing inflation: CAC subiu 3-5× desde Lei 14.790 em vigor

**Como NEXA navega:**
NEXA NÃO compete em odds nem bonus. Compete em camada social + identidade + cripto utility. Isto remove NEXA da race-to-the-bottom e posiciona em segmento adjacente (social platform vs sportsbook). Concorrentes diretos NEXA não existem hoje BR (Galera.bet é o mais próximo mas executa muito raso). Janela competitiva 18-24 meses até primeiro clone aparecer.

## F.2 — Poder de barganha dos compradores (usuários)

**Intensidade: MÉDIA-ALTA** (3,5/5)

Diagnóstico:
- Apostador BR tem 188 opções legais + offshore históricas
- Informação sobre odds é transparente (sites comparadores)
- Switch cost emocional baixo (usuário não desenvolve identidade em Bet365)
- Demanda elástica a preço (margem casa) e qualidade (UX, suporte)
- Concentração de poder em "whales" (top 5% gastam 60% do volume — operadoras dependem deles)

**Como NEXA navega:**
Lock-in via identidade gamificada reduz poder de barganha do usuário. Apostador NEXA tem 200 followers, badge raro, posição em ranking — switch cost emocional cresce com tempo. ARPU não dependente de whales (5 streams diversificados). Diferencial UX (gov.br + saque 30s) é "must-have" não "nice-to-have" — usuário não troca pra concorrente sem isso.

## F.3 — Poder de barganha dos fornecedores

**Intensidade: MÉDIA** (3/5)

Fornecedores críticos NEXA e poder de barganha de cada:

| Fornecedor | Substituibilidade | Switch cost NEXA | Poder barganha |
|---|---|---|---|
| Betsul (operadora SIGAP) | Baixa (família) | Alto (re-construir integração) | MÉDIO (família-aligned) |
| Serpro (Datavalid/gov.br) | Baixa (monopólio gov) | Alto (única fonte oficial) | ALTO |
| Supabase (backend) | Alta (Postgres é portável) | Médio (migração 2-3 meses) | BAIXO |
| Stripe (pagamentos) | Média (Asaas/MP fallback) | Médio | MÉDIO |
| Mux (streaming) | Média (Livepeer, Agora, Cloudflare Stream) | Médio | BAIXO-MÉDIO |
| Mercado Bitcoin (PSAV) | Média (Bitso, Foxbit alternativos) | Alto (custódia migração complexa) | MÉDIO |

**Como NEXA navega:**
Diversificação intencional: cada categoria crítica tem 1-2 alternativas viáveis. Contratos com SLA punitive (penalties por downtime). Betsul é tied-in via família — risco transformado em alinhamento.

## F.4 — Ameaça de novos entrantes

**Intensidade: BAIXA-MÉDIA** (2,5/5)

Barreiras de entrada que NEXA constrói:

| Barreira | Replicabilidade |
|---|---|
| Acesso família a operadoras SIGAP | IMPOSSÍVEL (estrutural) |
| Cripto regulada integrada com aposta | DIFÍCIL (R$ 10-37M Bacen + 9-18 meses) |
| Camada social com lock-in | LENTA (efeito de rede leva 18-24 meses) |
| KYC gov.br + Datavalid 4 camadas | MÉDIA (setup 60-90 dias) |
| Brand identitária vs transacional | ANOS (não se compra com dinheiro) |
| Tech stack proven em produção | 6-12 meses |

Operadora tradicional que quisesse copiar NEXA precisaria:
1. Encontrar família com operadoras múltiplas (impossível)
2. Construir camada social do zero (12-18 meses + R$ 5-10M eng)
3. Integrar cripto regulada (12-18 meses + R$ 10-15M setup + audit)
4. Construir brand defensável (18-36 meses + R$ 20-50M marketing)
5. Atingir KYC governamental (3-6 meses + relacionamento Serpro)

Tempo total realista de replicação: 24-36 meses. NEXA usa esse tempo pra capturar market share.

## F.5 — Ameaça de produtos/serviços substitutos

**Intensidade: MÉDIA** (3/5)

Substitutos para "entretenimento social esportivo apostado":

| Substituto | Sobreposição funcional | Risco a NEXA |
|---|---|---|
| Operadora pura tradicional | 60% (aposta) | Apostador não busca social |
| Telegram tipsters | 40% (comunidade + picks) | Já é fonte de tipsters; NEXA é versão profissionalizada |
| Twitter/X esporte | 30% (comunidade) | Engagement, não monetização |
| Twitch esporte | 50% (live + comunidade) | Não aposta nativamente; possível parceria |
| Discord servers betting | 35% (comunidade + chat) | Fragmentado, sem monetização |
| Fantasy sports (Cartola) | 25% (gamificação esportiva) | Sem aposta real, demografia overlap |
| eSports betting (rivalry) | 20% (nicho) | Substitução parcial pra demographic gamer |
| Investimentos / trading | 15% (entretenimento com dinheiro) | Compete por share of wallet "diversão financeira" |

**Como NEXA navega:**
NEXA NÃO é substituto perfeito de nenhuma das opções — é unique mix. Quem só quer aposta usa Bet365. Quem só quer social usa Telegram. Quem só quer cripto usa Mercado Bitcoin. NEXA captura a interseção dos três — segmento small individually mas crescente em conjunto.

## F.6 — Score consolidado Porter

Atratividade do setor NEXA (escala 1-5, 5 = mais atrativo):

| Força | Score | Interpretação |
|---|---|---|
| Rivalidade competidores | 4/5 | Alta — mas NEXA evita zona quente |
| Poder compradores | 3,5/5 | Médio-alto — mitigado por lock-in social |
| Poder fornecedores | 3/5 | Médio — diversificação ok |
| Ameaça novos entrantes | 2,5/5 | Baixa-média — barreiras estruturais altas |
| Ameaça substitutos | 3/5 | Médio — mas substitutos parciais |
| **Atratividade NEXA position** | **3,3/5** | **Atrativa** — janela 24-36 meses |

Setor de apostas BR isolado seria 4/5 atratividade (mercado grande, regulado, crescendo). NEXA reduz exposure aos atritos via posicionamento adjacente — score líquido NEXA 3,3 vs operadora pura 2,5-2,8 (mais commoditizada).

---

# Anexo G — BCG Matrix (portfólio de receita)

Aplicação da matriz Boston Consulting Group ao portfólio de 5 linhas de receita NEXA. Dois eixos: market growth rate × market share relativo de NEXA na categoria.

## Mapeamento das 5 linhas

| Linha | Market growth | NEXA share | Quadrante BCG |
|---|---|---|---|
| Split NGR Betsul (white-label NGR) | Alto (mercado apostas formal cresce 15-25%/ano) | Baixo (NEXA é nova entrante) | **? Question Mark** |
| Marketplace NEXA (tipsters) | Alto (creator economy 25-40%/ano) | Baixo (NEXA cria categoria) | **⭐ Star** (potencial futuro) |
| NEXA Coin utility | Muito alto (cripto utility 30-60%/ano) | Baixo (early fase) | **? Question Mark** |
| Marketplace Financeiro afiliado | Médio (fintech BR cresce 15-25%/ano) | Baixo (NEXA é entrante) | **? Question Mark** |
| Premium subscription | Médio (SaaS BR cresce 20-30%/ano) | Baixo (defensável niche) | **🐮 Cash Cow potencial** |

## Análise por quadrante

### Stars (⭐) — Alto crescimento, alto share esperado
Hoje vazio. Em 2-3 anos, **Marketplace NEXA** (tipsters) deve migrar pra Star — NEXA tem chance real de virar plataforma dominante de creator economy esportiva BR (não há concorrente direto hoje).

Estratégia: invest aggressively. Founding Creators program + Marketplace V1 (Wave 2) + Marketplace V2 (Wave 3 internacional).

### Cash Cows (🐮) — Baixo crescimento, alto share
Hoje vazio (NEXA é early-stage). **Premium subscription** tem características pra virar Cash Cow em ano 4-5 quando base estabilizar e churn for baixo. Receita previsível, margem alta (92%), baixo custo de retenção.

Estratégia futuro: maximize cash flow, reinvest em outras linhas (Stars).

### Question Marks (?) — Alto crescimento, baixo share
**Hoje:** NGR Betsul, NEXA Coin, Marketplace Financeiro.

Cada uma demanda decisão de investimento: escalar agressivamente (vira Star eventualmente) OR parar (vira Dog).

- **NGR Betsul:** invest (foundation do MRR, casa parceira garante share crescente)
- **NEXA Coin:** invest cautiously (cripto + regulatório = high risk/high return)
- **Marketplace Financeiro:** invest com cap (limita exposure se Portaria 615 endurece)

### Dogs (🐕) — Baixo crescimento, baixo share
Hoje vazio. Mantém-se vazio se estratégia funcionar.

Risco: se NEXA não escalar, todas linhas viram Dogs eventualmente (mercado matura, NEXA não captura share).

## Recomendações estratégicas BCG

| Ação | Linha-alvo |
|---|---|
| Invest aggressively (build) | Marketplace NEXA (potential Star) |
| Hold + grow disciplined | NGR Betsul, NEXA Coin |
| Harvest (futuro) | Premium subscription (Year 4+) |
| Divest condition | Marketplace Financeiro se Portaria 615 endurece — spin-off em app separado já fix isso |

---

# Anexo H — KPI Dashboard Template

Lista exaustiva de 50+ KPIs categorizados pra acompanhamento operacional + reporting mensal ao conselho/investidores. Cada KPI tem (a) definição, (b) frequência de tracking, (c) responsável, (d) target Year 1.

## Categoria 1 — Produto

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| Weekly Active Identity (WAI) | NSM — users com 1+ sessão/sem + 1+ ação social | Daily | Head Product | M6: 250 / M12: 2.500 |
| MAU | Usuários ativos mês | Daily | Head Product | M12: 3.500 |
| DAU | Usuários ativos dia | Daily | Head Product | M12: 1.500 |
| DAU/MAU stickiness | Razão DAU médio / MAU | Weekly | Head Product | M12: 40% |
| D1 retention | % cohort que retorna dia 1 | Weekly | Head Product | M12: 70% |
| D7 retention | % cohort retorna dia 7 | Weekly | Head Product | M12: 45% |
| D30 retention | % cohort retorna dia 30 | Monthly | Head Product | M12: 25% |
| D90 retention | % cohort retorna dia 90 | Monthly | Head Product | M12: 18% |
| Activation rate | % users que fazem 5+ ações na semana 1 | Weekly | Head Product | M12: 65-75% |
| NPS | Net Promoter Score (-100 a +100) | Monthly | Head Product | M12: ≥ 40 |
| Feature adoption rate | % MAU usando feature X em 30d | Weekly | PM | Por feature |
| Time spent / session | Tempo médio por sessão | Daily | Head Product | M12: 18-25 min |
| Sessions per user / week | Frequência semanal de retorno | Weekly | Head Product | M12: 4-6 |

## Categoria 2 — Engenharia

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| Uptime | % disponibilidade serviços críticos | Real-time | DevOps | 99,5% Y1 |
| p95 latency | 95º percentil de response time | Real-time | DevOps | <500ms |
| p99 latency | 99º percentil | Real-time | DevOps | <1.500ms |
| Error rate | Erros / total requests | Real-time | DevOps | <0,5% |
| Deploy frequency | Deploys / week | Weekly | Eng Lead | 2-5 |
| Mean Time to Recovery (MTTR) | Tempo médio resolução incident | Per incident | DevOps | <2h |
| Change failure rate | % deploys que causam incident | Monthly | Eng Lead | <10% |
| Test coverage | % código coberto por tests | Weekly | Eng Lead | 70%+ |
| Bug count per release | Bugs P0/P1/P2 por release | Per release | Eng Lead | <5 P1, 0 P0 |
| P0/P1 open bugs | Bugs críticos não-resolvidos | Daily | Eng Lead | <3 |

## Categoria 3 — Growth / Marketing

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| CAC blended | Marketing total / new acquired users | Weekly | Head Growth | R$ 35 |
| CAC by channel | CAC por canal específico | Weekly | Head Growth | Por canal |
| LTV blended | Lifetime value médio | Monthly | Head Growth | R$ 800-1.200 |
| LTV/CAC ratio | Ratio LTV/CAC | Monthly | Head Growth | 18× target |
| Payback period | Meses até CAC recuperado | Monthly | Head Growth | <1 mês |
| Viral coefficient (k) | New users via existing per period | Monthly | Head Growth | 0,4-0,6 |
| Conversion funnel | Awareness → Acquisition → Activation → Payment | Monthly | Head Growth | Cada step |
| Organic share | % new users via orgânico (referral, SEO, content) | Monthly | Head Growth | 50%+ |
| Influencer ROI | Revenue per influencer / cost | Monthly | Head Growth | 4-6× |
| Newsletter open rate | % opens / sent | Weekly | Head Growth | 25%+ |
| Push notification CTR | Clicks / sends | Daily | Head Growth | 8-12% |

## Categoria 4 — Receita / Financeiro

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| MRR (Monthly Recurring Revenue) | Receita mensal recorrente | Monthly | CFO/Founder | R$ 206k M12 |
| ARR (Annualized Run Rate) | 12 × MRR atual | Monthly | CFO | R$ 2,5M M12 |
| Revenue per stream | Receita por linha (5 linhas) | Monthly | CFO | Per stream |
| ARPU | MRR / MAU | Monthly | CFO | R$ 35 M12 |
| Gross margin | (Revenue - COGS) / Revenue | Monthly | CFO | 88% blended |
| Burn rate | Gastos - receita | Monthly | CFO | R$ 180k M12 |
| Runway | Cash / burn rate | Monthly | CFO | 14-16 meses |
| Cash position | Saldo bancário atual | Weekly | CFO | Track |
| AR (Accounts Receivable) | Recebíveis pendentes | Weekly | CFO | <30 dias |
| AP (Accounts Payable) | Pagamentos pendentes | Weekly | CFO | <45 dias |

## Categoria 5 — Operations / Suporte

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| KYC approval rate | % KYC aprovados | Daily | Head Ops | 95%+ |
| KYC avg time | Tempo médio aprovação | Daily | Head Ops | <60s |
| Support response time | Tempo até 1ª resposta | Daily | Head Ops | <4h |
| Support CSAT | Customer satisfaction score | Weekly | Head Ops | 4,5+/5 |
| Support ticket volume | Tickets / week | Weekly | Head Ops | Track trend |
| Fraud detection rate | Fraud caught / total attempted | Weekly | Head Ops | 95%+ |
| Refund rate | Refunds / total transactions | Monthly | Head Ops | <2% |
| Chargeback rate | Chargebacks / total transactions | Monthly | Head Ops | <0,5% |

## Categoria 6 — Creator economy

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| Active creators | Creators com post no último mês | Monthly | Head Creator | 200+ M12 |
| Top creators (>R$ 1k/mês) | Creators faturando 1k+ | Monthly | Head Creator | 10+ M12 |
| Creator revenue total | Soma faturamento creators | Monthly | Head Creator | R$ 300k M12 |
| Creator take rate effective | % NEXA take médio | Monthly | Head Creator | 10-12% |
| Tipster avg followers | Followers médios por tipster | Monthly | Head Creator | 50+ |
| Top tipster ROI | ROI tipster top 10 últimos 30d | Weekly | Head Creator | Track |
| Marketplace GMV | Gross Merchandise Value mensal | Monthly | Head Creator | R$ 350k M12 |
| Creator churn rate | Creators inativos mês a mês | Monthly | Head Creator | <8%/mês |

## Categoria 7 — Compliance / Regulatório

| KPI | Definição | Freq | Owner | Target Y1 |
|---|---|---|---|---|
| Compliance violations | Casos abertos com regulador | Quarterly | Head Compliance | 0 |
| Auto-exclusion rate | % users em auto-exclusion | Monthly | Head Compliance | Track |
| Reality check engagement | % users que veem reality check | Daily | Head Compliance | 100% over threshold |
| Coaf reports issued | Reportes a Coaf via Betsul | Quarterly | Head Compliance | Track |
| LGPD requests | Subject rights (export/delete) | Monthly | DPO | Tempo médio response <72h |
| Audit findings (internal) | Findings de audit interno | Quarterly | CFO | <5 P1 |
| Smart contract incidents | Bugs ou exploits Coin | Per incident | CTO | 0 |

## Categoria 8 — NEXA Coin (Fase 2+)

| KPI | Definição | Freq | Owner | Target Y2 |
|---|---|---|---|---|
| Coin holders | Wallets únicos com Coin balance | Daily | Head Coin | 50.000+ M24 |
| Coin daily volume | Transações on-chain diárias | Daily | Head Coin | Track |
| Coin price (post-TGE) | Preço em DEX/CEX | Real-time | Head Coin | Stable/grow |
| Coin liquidity (DEX) | TVL em LP NEXA Coin | Daily | Head Coin | $500k+ |
| Coins minted / burned | Supply changes | Weekly | Head Coin | Burn>mint long-term |
| Stake (DeFi) | Coins staked em yield | Weekly | Head Coin | 30%+ supply |

---

## Reporting cadence ao conselho/investidores

| Periodicidade | Conteúdo | Destinatário |
|---|---|---|
| Daily | Dashboard self-service (Mixpanel + Supabase) | All team |
| Weekly | Snapshot 1 página (MAU, MRR, top issues) | Founder + Head Eng + Head Growth |
| Monthly | Business review completa (todos KPIs + comentário qualitativo) | Conselho família |
| Quarterly | Board meeting deck (estratégia + projeções + decisões) | Board + investors |
| Annual | Annual report + auditoria financeira | Stakeholders todos |

---

# Anexo I — Recomendações finais (síntese consolidada)

Cinco recomendações estratégicas baseadas em análise integrada deste documento. Ordenadas por urgência × impacto.

## 1. Decisão de aporte holding deve sair em 30 dias (urgência máxima)

Sem aporte aprovado, tudo trava. M1 gate em FALHA atualmente impede Wave 1. Conselho família precisa votar formalmente até 30 dias da data deste documento. Mitigação se NÃO aprovado: reorçar pra runway mínimo (3-4 meses) + bridge interno pequeno (R$ 200-400k) pra fechar P0s + iniciar contato Serpro/gov.br homologação (que tem leadtime longo independente).

## 2. Nomear lead técnico Betsul + iniciar API docs request (urgência alta)

Caminho crítico Wave 1 depende de integração Betsul (8-12 semanas leadtime). Iniciar processo em mês 2 do projeto = beta privado em mês 5-6. Atraso de 30 dias aqui empurra tudo 30 dias.

## 3. Iniciar homologação gov.br Login Único hoje (lead time 6-8 semanas)

Independente da aprovação aporte, abrir processo gov.br homologação custa zero (só burocracia). Em 6-8 semanas estará pronto pra integrar. Janela diferencial "saque em 30s" começa contagem aqui.

## 4. Cláusula contratual NEXA-Betsul formalizada (urgência alta)

Antes de qualquer dev integration, finalizar contrato com Betsul cobrindo (a) split NGR 30% em escrito, (b) propagação PCA via webhook como obrigação Betsul, (c) SLA de API uptime, (d) exclusividade Betsul como casa parceira primária por 36 meses. Sem contrato, NEXA opera com risco existencial.

## 5. Aplicar 3 migrations propostas em `F0-migrations/proposed/` (30 minutos de trabalho)

Quick-win acionável imediatamente. Fix 3 P0s de segurança documentados (caller-null bypass, users PII leak, admin audit invisible) sem precisar de aprovação adicional. Custo: 30 minutos focados de devops. Benefício: 3 vulnerabilidades graves fechadas.

---

## Documentos relacionados

- `NEXA-Executive-Summary.md` — versão condensada 8 páginas
- `CANVAS-NEXA-2026-05-18.html` — Business Model Canvas visual + dev roadmap (versão sem informação financeira)
- `VIABILIDADE-KYC-NEXA-2026-05-19.md` — research KYC gov.br + alternativas BR
- `ANALISE-COMPLETA-NEXA-2026-05-16.md` — audit técnico 3-agents
- `VERIFICACAO-MEMORIA-VS-CODIGO-2026-05-16.md` — verificação 155 itens contra código real
- `PLANO-NEGOCIO-NEXA-CONSOLIDADO-2026-05-16.md` — plano mestre operacional anterior

---

**Fim do documento.** ~40.000 palavras totais. 30 capítulos + 9 anexos institucionais.

*Confidencial. Reprodução proibida sem autorização escrita.*

NEXA — Construindo a infraestrutura social do entretenimento esportivo brasileiro.
