# NEXA — Executive Summary

**Versão:** v5 fantasy-first · 2026-05-19
**Confidencial.** Distribuição restrita a investidores qualificados, conselho da holding familiar e parceiros estratégicos sob NDA.

---

## A tese em três linhas

O Brasil tem 25,2 milhões de apostadores ativos legais (SIGAP H1 2025), 1,66 milhão de cartoleiros (Globo), 7 milhões de usuários ativos no Rei do Pitaco — e nenhuma plataforma que combine fantasy sports + camada social + creator economy + cripto utility, monetizando simultaneamente entry fees em produto próprio (Art. 49 Lei 14.790/2023 — dispensa autorização) **e** afiliação multi-operadora SIGAP (cross-sell qualificado fantasy → aposta real nas casas parceiras). **NEXA é a tese de que o vencedor desse mercado não será uma operadora de aposta com camada social, nem uma fantasy free-to-play como Cartola — será uma plataforma fantasy social-first que monetiza via afiliação multi-casa, evitando custo de outorga R$ 30M e risco regulatório de operador SIGAP.**

## A empresa

NEXA é uma subsidiária da holding familiar do founder Leonardo Guilherme, opera **sob proteção do Art. 49 da Lei 14.790/2023** (fantasy sport dispensa autorização do poder público), monetiza via **seis linhas independentes** sem precisar ser operadora SIGAP licenciada. As apostas reais acontecem nas operadoras parceiras (Betsul como primeira, Bet365/Betano/KTO/Sportingbet/Pixbet etc. em sequência) via deep-link contextual — NEXA é o broker do funil de marketing, recebendo CPA por FTD qualificado + RevShare lifetime sobre NGR gerado.

A plataforma combina **seis mecânicas** que nenhum player BR oferece integradas:

1. **DFS season-long + daily multi-atleta** — fantasy cash games sob Art. 49, com entry fees R$ 5-500 e prêmios garantidos
2. **Feed social** com tipsters, copy-pick, clãs, ranking público de habilidade (modelo Sleeper + Better Collective combinados)
3. **Live streaming** estilo Twitch durante jogos + lives de tipsters featured
4. **Marketplace de creator economy** (cursos, lives, picks pagos, NFTs) com fee 10-20%
5. **NEXA Coin** — utility token off-chain (Fase 1) → on-chain via PSAV parceiro (Fase 2) → PSAV próprio (Fase 3 H3)
6. **Afiliação multi-operadora SIGAP** — cross-sell fantasy → aposta real (DraftKings benchmark: 50-69% conversão)

Loop comportamental central: **ver fantasy → montar time → competir → social → cross-sell aposta real → voltar pra próxima rodada**.

## Estado atual (honesto)

Esta seção é deliberadamente conservadora. Audit técnico cruzado em 2026-05-16 (verificação exaustiva de 155 itens contra código real) revelou estado parcial do que documentação anterior alegava:

| Métrica | Plano alegava | Realidade auditada | Cobertura |
|---|---|---|---|
| Tabelas Postgres | 96 | 72 | 75% |
| Functions SQL | 323 | 217 | 67% |
| Edge Functions | 20 deployáveis | 7 funcionais (13 quebradas por bug único de import) | 35% |
| Defeitos P0 abertos | 13 efetivos | 30 confirmados | 230% subestimado |
| Última migration | 2026-05-16 | 2026-05-08 | 11 dias estagnado |

**Esta tabela não é fraqueza — é o diferencial.** Founders que mostram o estado real antes do investidor descobrir constroem credibilidade. Os 30 P0s estão mapeados, com fix ETA de 80-150 horas focadas (R$ 30-50k em eng), perfeitamente factível dentro do horizonte da Wave 1 (60 dias).

O que **está construído**: 261 arquivos TSX/TS no frontend Desktop (Electron), 38+ telas funcionais, 5 hubs modulares (Whale Club, Seasons com 10 mecânicas, Proposals V2 com 12 features, Events com 16 torneios, NEXA Play com 11 mini-games), painel admin React separado com 7 páginas (Dashboard, Users, LGPD, Responsible Gambling, Audit), backend Supabase com RLS strict (76 policies), 32 cron jobs agendados, infraestrutura Sentry-ready. **A estrutura é a mesma da versão anterior do plano** — o pivot v5 é de framing legal e modelo de monetização, não de produto.

## A oportunidade de mercado

### Fantasy Sports BR (mercado core)

- **Cartola FC (Globo)**: 1,66M inscritos primeira rodada Brasileirão 2024 (pico 6,4M em 2016 — declínio 73%), receita R$ 70-100M/temporada, Cartola PRO R$ 49,90-59,90/ano, nunca pagou prêmios em dinheiro real
- **Rei do Pitaco (MMD Tecnologia)**: 16M downloads, 7M usuários ativos, R$ 220M acumulados em prêmios pagos, R$ 100M só em 2023, total funding ~US$ 56M (D1 Capital + Kaszek + Globo Ventures + DST Global), licença SPA/MF 2.091 obtida 30/dez/2024 — pivot fantasy → sportsbook próprio
- **Mercado fantasy BR estimado: R$ 200-400M/ano em receita**, R$ 800M-1,5 bi em turnover (entry fees + prêmios)
- **Mercado fantasy global: US$ 32,21 bi em 2024 → US$ 105,58 bi 2033** (Straits Research, CAGR 14,1%)

### Apostas esportivas reguladas BR (mercado de afiliação)

- **78-81 empresas com outorga · 175-187 marcas autorizadas** pela SPA/MF (Portaria 787/2025 e atualizações)
- **GGR oficial 2025: R$ 37 bilhões** (SPA/MF Relatório Anual · H1 R$ 17,4 bi)
- **Arrecadação fiscal 2025: R$ 9,95 bilhões** em tributos federais (Poder360)
- **Volume turnover anual: R$ 100-120 bi** (fluxos Pix Bacen 2024-25)
- **17,7 milhões de apostadores ativos H1 2025 · 25,2 milhões ano** (~11,8% pop adulta)
- **Concentração: top 3 (Betano 23% + Bet365 20% + Superbet) = 47% GGR**

### Banda padrão afiliação BR (Agent research, fontes públicas)

- **CPA por FTD:** R$ 25-250 (público) → R$ 200-500 (premium negociado)
- **RevShare:** 20-45% NGR (Bet365 30-35% · KTO 25-40% · Betano 20-30% · Sportingbet 15-45% com cap 24 meses)
- **Cookie window:** 30-90 dias
- **Cross-sell fantasy → sportsbook (DraftKings benchmark):** 50-69% em Colorado/Pennsylvania
- **Better Collective receita BR 2024: ~EUR 70M** (~R$ 380M, 18% receita global do grupo)

### Por que agora

**Quatro janelas convergem em 2026-2028**, fechando em 18-30 meses:

1. **Cartola declinante** — 4,7M ex-usuários sem destino claro (vácuo de 3-5M torcedores)
2. **Rei do Pitaco subiu o stack** — licenciou SPA/MF, vai mirar high-roller, deixa vago slot fantasy-first afiliado multi-operadora
3. **Art. 49 Lei 14.790 + Portaria 1.231/2024** — fantasy dispensado de autorização **e** afiliação institucionalizada com contratos escritos (NEXA fecha deals premium qualificados)
4. **Cross-sell fantasy→sportsbook ainda imaturado no BR** — Cartola não cross-vende, Rei do Pitaco só agora pivota, ninguém capturou o flywheel DraftKings-style

**Sinal de mercado vivo:** Allwyn (lotteries europeia) adquiriu 62,3% da PrizePicks por US$ 1,6 bi cash · EV US$ 2,5 bi · até US$ 4,15 bi com earn-outs (out/2025). Consolidação fantasy global iniciada.

## Concorrentes — análise estrutural

Mercado dual: **competidores diretos fantasy** (NEXA disputa o tempo do usuário) vs **adjacentes afiliados/mídia** (NEXA disputa o share of voice).

| Player | Categoria | Forças | Fraquezas vs NEXA |
|---|---|---|---|
| **Cartola FC** | Fantasy free-to-play | 20 anos, Globo, 1,66M base | Sem cash, sem social profundo, sem multi-esporte ativo, sem cross-sell |
| **Rei do Pitaco** | Fantasy + sportsbook próprio | 7M MAU, US$ 56M funding, R$ 220M prêmios | Single-player, sem creator economy, sem cripto, pivot operadora = custo fixo alto |
| **CBLOL Fantasy / Stattrak / Kings League Fantasy** | Fantasy nicho esports | Coverage esports | Baixa escala, sem cross-sell |
| **Better Collective BR** | Mídia afiliada SEO | ~EUR 70M BR 2024 · Playmaker Capital EUR 176M | Q1 2025 -13% YoY pela regulação · sem engajamento real (vulnerável SEO algo + PL 1018) |
| **Catena Media** | Mídia afiliada SEO | Q4 2024 EUR 10M | -30% YoY · 25% headcount cortado · "ban welcome bonus cortou cadastros pela metade" |
| **Operadoras SIGAP (Bet365, Betano, KTO, etc.)** | Apostas | Brand, capital, scale | **NÃO são concorrentes** — são parceiros via afiliação multi-casa |
| **NEXA** | Fantasy social + afiliado multi-casa | Cobertura 6 mecânicas integradas + Art. 49 dispensa autorização | Pre-revenue, fix de 30 P0s em curso |

**O moat estrutural NEXA** é a combinação de quatro fatores que tornam replicação difícil:

1. **Acesso família a operadoras licenciadas** — não pra operar (esse era plano v4), mas pra negociar **CPA + RevShare premium com Betsul + casas adicionais da família** acima da banda padrão BR
2. **Art. 49 cobertura jurídica** — fantasy dispensa autorização SPA/MF, evita R$ 30M outorga, escapa de Portaria 615 e PL 1018 (que miram apostas, não fantasy)
3. **Engajamento real (social + DFS + community)** — moat defensável vs Better Collective/Catena que dependem só de SEO (vulnerável a Google algo, AI overviews, regulação)
4. **6 linhas de receita independentes** — nenhuma >30% MRR mês 18, eliminando risco concentração (Galera 87% NGR, Blaze 94% cassino caíram 40-60% num trimestre quando regulador apertou)

## Modelo de negócio — seis fontes de receita

Receita projetada R$ 220k/mês ao final do mês 12, escalando pra R$ 640k/mês no mês 18 e R$ 1,8M/mês no mês 36.

| Linha de receita | Modelo | m6 | m12 | m18 |
|---|---|---|---|---|
| Rev share/CPA multi-operadora | CPA R$ 200-500/FTD + RevShare 25-35% NGR (8-15 casas parceiras) | R$ 18k | R$ 70k | R$ 200k |
| Entry fees rake (DFS) | 12-15% sobre entry fees (Rei do Pitaco/DraftKings model) | R$ 12k | R$ 45k | R$ 130k |
| Premium subscription | R$ 19,90-49,90/mês (sem ads, AI lineup optimizer, projection engine) | R$ 8k | R$ 35k | R$ 100k |
| Marketplace NEXA | Fee 10-20% sobre conteúdo creator | R$ 8k | R$ 40k | R$ 110k |
| NEXA Coin utility | Compra + fee transação no marketplace | R$ 3k | R$ 25k | R$ 70k |
| Patrocínios + brand integrations | Cotas + native ads (modelo Cartola R$ 12M/cota é teto) | R$ 1k | R$ 5k | R$ 30k |
| **Total mensal (MRR)** | | **R$ 50k** | **R$ 220k** | **R$ 640k** |
| **Anualizado (ARR)** | | R$ 600k | R$ 2,64M | R$ 7,68M |

**Cross-sell fantasy → sportsbook (Linha 1) é o motor de longo prazo.** DraftKings reporta 50-69% conversão em estados maduros (Colorado, Pennsylvania). NEXA usa premissa conservadora 30-50% no modelo financeiro. **Cada FTD vale R$ 350 CPA + lifetime RevShare R$ 800-1.500** em 18-24 meses — alavanca direta sobre cada usuário fantasy convertido.

## Unit economics

| Métrica | Valor m12 |
|---|---|
| CAC blend (orgânico + pago) | R$ 25-35 |
| CAC pago (Meta/Google) | R$ 60-90 |
| ARPU mensal blended (fantasy + premium + marketplace + coin + afiliação atribuída) | R$ 40 |
| LTV 24 meses | R$ 920-1.380 |
| **LTV / CAC ratio** | **26-55×** |
| Payback period | < 1 mês |
| Margem bruta consolidada | 72-78% |
| Burn mensal médio (12m) | R$ 150k |
| Conversion fantasy→FTD operadora (cross-sell) | 12% m12 · 30% m24 · 45% m36 |

O LTV/CAC de 26-55× é radicalmente superior ao benchmark do setor (5-10× pra operadoras tradicionais · 3-7× pra afiliados puros tipo Better Collective) por causa do efeito multiplicador da camada fantasy + social + cross-sell: fantasy é low-CAC, social retém via lock-in identitário, e cross-sell para operadora parceira gera CPA + RevShare lifetime que melhora payback dramaticamente.

## Roadmap até GA público

### Horizon 1 — Beta privado (0-60 dias · Q3 2026)
Beta com 5-8 P0s prioritários da Wave 1 fechados + NEXA Coin Fase 1 off-chain + KYC gov.br POC + primeira casa parceira integrada (Betsul, depois Bet365 ou Betano via programa de afiliados oficial) + 13 P0s prioritários fechados (subset dos 30 mapeados). 20-50 usuários família + amigos jogando contests DFS reais. **Gate H1→H2:** 0 P0 prioritários abertos, smoke 100%, NPS ≥ 40, conselho aprovou R$ 1,2M.

### Horizon 2 — GA público + cross-sell ativo (60-180 dias · Q4 26 / Q1 27)
Lançamento público, 5-8 operadoras parceiras integradas com programas de afiliados ativos, Fase 2 Coin: TGE NEXA Coin via PSAV parceiro (recomendação: Mercado Bitcoin · alternativas Bitso/Foxbit), Marketplace V1 com 50 tipsters featured, Premium subscription live, primeira cota de patrocínio fechada (R$ 100-300k anual com brand adjacente: Nubank/iFood/marca esportiva). Target: 5.000-8.000 usuários reais · R$ 220k MRR.

### Horizon 3 — Escala + LATAM (180-540 dias · 2027-28)
PSAV próprio NEXA opcional (família capitaliza Bacen Res. 519/520/521, capital R$ 10,8-37,2M se justificável). Demais casas família + 10+ operadoras adicionais integradas. Marketplace V2 com criadores internacionais. Expansão LATAM (AR/MX/CO). Possível stablecoin NEXA-BRL. Target: 100k+ usuários · R$ 800k MRR.

## Ask e uso de capital

**Aporte holding familiar: R$ 1,2 milhão** (aprovação interna do conselho família, sem diluição externa, sem SAFE, sem term sheet). Decisão estratégica: subsidiária da holding com integração vertical maximiza retorno consolidado familia e evita lock-in com VC.

Uso dos R$ 1,2M nos primeiros 12 meses:

| Categoria | % | R$ |
|---|---|---|
| Engenharia (2 contratações senior + 1 mid) | 35% | 525k |
| Marketing, SEO, content, creator outreach + influencers fantasy | 28% | 420k |
| Smart contract + audit duplo + listing Coin Fase 2 | 11% | 165k |
| Parceiro PSAV setup + integração técnica | 5% | 75k |
| Legal, regulatório, pareceres (Art. 49 + ABFS filiação) | 8% | 120k |
| Infraestrutura (Supabase, Vercel, Mux, Sentry, KYC) | 5% | 75k |
| Working capital + reserve | 8% | 120k |

Burn projetado mensal médio R$ 150k. **Runway estendida com receita:** começando mês 6 (MRR R$ 50k), runway efetiva esticada pra 18-22 meses.

## Comparáveis e valuation

Sem comparável BR direto. Referências globais (Agent research, financials 2024 SEC/IR):

| Empresa | Categoria | Receita 2024 | Mkt cap / Valuation |
|---|---|---|---|
| Kambi | B2B sportsbook (Sweden) | €176,4M (+2%) | ~SEK 3,5 bi mkt cap |
| Genius Sports (GENI) | Sportsdata/B2B | US$ 511M (+24%) | ~US$ 1 bi mkt cap |
| Sportradar (SRAD) | Sportsdata | €1.090M (+24%) | US$ 3,73-4,07 bi mkt cap |
| Better Collective (BETCO) | Mídia afiliada | €371,5M (+13,7%) | ~US$ 1 bi mkt cap |
| **Underdog Fantasy** | DFS / pick'em | n/d | **US$ 1,225 bi** (Série C mar/2025) |
| **PrizePicks** | Pick'em fantasy | US$ 704M (+67%) | **US$ 1,6-4,15 bi** (Allwyn out/2025) |
| **Sleeper** | Social fantasy | <US$ 10M | US$ 400M (Série C 2021) |
| **Rei do Pitaco** | Fantasy + sportsbook (BR) | n/d (dobrou 2024) | Estimado >US$ 200M post Series B |
| DraftKings (DKNG) | Fantasy + sportsbook (US) | US$ 4,77 bi (+30%) | ~US$ 11,32 bi mkt cap |

Múltiplos esperados pra NEXA (subsidiária holding, não independente):

| Estágio | MRR | ARR | Valuation projetada |
|---|---|---|---|
| Hoje (pre-revenue) | R$ 0 | R$ 0 | R$ 1-2M |
| Mês 12 | R$ 220k | R$ 2,64M | R$ 8-14M (3-5× ARR) |
| Mês 24 | R$ 1,3M | R$ 15,6M | R$ 45-70M |
| Mês 36 | R$ 1,8M | R$ 21,6M | R$ 75-130M |

## Riscos materiais

Mapeamento completo de 14 riscos no plano integral (Cap 19). Top 6 com maior probabilidade × impacto no pivot fantasy:

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | API Betsul/operadoras atrasa (sem docs públicas) | Alta | Médio | Lead técnico nomeado · negociar 3-4 operadoras paralelo, não single |
| R3 | Free-money exploit em produção (1 dos 30 P0s) | Média | Crítico | 13 P0s fechadas antes do beta · audit independente |
| R5 | PLP 68/2024 inclui fantasy no Imposto Seletivo | Média | Alto | Filiação ABFS · diversificação receita (fantasy é Linha 2 das 6) · repasse parcial via rake |
| R7 | Smart contract bug com perda de fundos (Fase 2 Coin) | Média | Crítico | Audit duplo CertiK + OpenZeppelin · seguro Nexus Mutual · bug bounty Immunefi |
| R8 | Cross-sell fantasy→bet conversion <20% (vs DK 50-69%) | Média | Alto | Otimização funil + UX contextual + benchmarks A/B · modelo financeiro stress test no Cap 14 |
| R12 | Cartola ou Rei do Pitaco lança feature copiando NEXA | Média | Médio | Velocidade + lock-in via clans + missions + creator economy |
| R15 (NOVO) | Mecânica NEXA acidentalmente vira pick'em prop atleta único | Baixa | Crítico | Arquitetura legal review explicitamente proibindo prop single-athlete · compliance officer monitora roadmap |

## Decision gates (kill criteria)

| Quando | Métrica | Decisão se não atingida |
|---|---|---|
| Mês 1 | Conselho aprova R$ 1,2M | Re-orça pra runway menor |
| Mês 2 | Primeira operadora parceira contratada (Betsul ou outra) | Sem deal, modelo Linha 1 reavalia |
| Mês 3 | 0 P0 abertos · beta live com primeiro contest DFS pago | Adia GA |
| Mês 6 | NPS beta ≥ 40 · 100+ MAU · primeiro FTD via NEXA registrado em casa parceira | Pivot UX antes do TGE |
| Mês 9 | MRR ≥ R$ 80k · conversion fantasy→FTD ≥ 8% | Reavalia premissas Linha 1 |
| Mês 12 | MRR ≥ R$ 150k · 5+ operadoras parceiras ativas | Reavalia viabilidade |
| Mês 18 | MRR ≥ R$ 500k · cross-sell ≥ 20% MAU | Reduz time pra runway 18m |

## Por que esta é uma oportunidade defensável

1. **Estrutura familiar + Art. 49** — holding controla operadora licenciada SIGAP (Betsul) que entra como **primeira casa parceira de afiliação premium** (CPA + RevShare acima da banda pública). Simultaneamente, NEXA fica fora da regulação SIGAP via Art. 49 — combinação impossível pra concorrentes externos.
2. **Cartola declinante + Rei do Pitaco subindo o stack** — vácuo competitivo de 3-5M ex-cartoleiros + slot fantasy-first afiliado multi-operadora que Rei do Pitaco está abandonando.
3. **Multi-operadora afiliada vs dependência única** — Better Collective Q1 2025 -13% YoY mostra fragilidade afiliado SEO puro; NEXA diversifica entre 8-15 operadoras + 5 outras linhas de receita.
4. **Cross-sell DK-style ainda imaturado no BR** — janela 18-24 meses pra capturar antes da consolidação Rei do Pitaco/Betano/etc.
5. **Coin faseada A→B→C** — utility off-chain Fase 1 sem risco regulatório, on-chain Fase 2 via PSAV parceiro, PSAV próprio opcional em Fase 3.
6. **Reality check institucional** — founder mostra 30 P0s reais antes do investidor descobrir. Credibilidade construída pela honestidade.

## Próximos 30 dias — checklist do conselho

1. **Aprovar aporte R$ 1,2M** (decisão conselho família)
2. **Confirmar com Betsul deal preliminar de afiliação premium** (CPA R$ 350-450 + RevShare 30% NGR + lifetime 24m + 5 anos exclusividade família)
3. **Filiação ABFS** (Associação Brasileira de Bets e Fantasy Sport) — alinhamento institucional + voz no PLP 68/2024
4. **Iniciar homologação gov.br Login Único** (acesso.gov.br/roteiro-tecnico)
5. **Parecer regulatório formal** sobre Art. 49 cobertura + mecânicas NEXA específicas (Mattos Filho / Tozzini Freire / Demarest)
6. **Aplicar 3 migrations propostas** (fecha 3 P0s em 30 minutos focados) + fix `_shared/log.ts:2` import (destrava 13 Edge Functions de uma vez)
7. **Negociar 2-3 deals de afiliação adicionais** com Bet365 BR, Betano (programa reaberto 2025), KTO ou Pixbet

Estes sete itens, executados em 30 dias corridos, validam todos os gates M1-M2 e destravam Wave 1.

---

**Documento integral:** `NEXA-Business-Plan.md` (30 capítulos · 7 anexos institucionais · ~260 páginas)
**Apêndices técnicos:** `ANALISE-COMPLETA-NEXA-2026-05-16.md` · `VIABILIDADE-KYC-NEXA-2026-05-19.md` · `PLANO-NEGOCIO-NEXA-CONSOLIDADO-2026-05-16.md` · `NEXA-Audit-Findings-2026-05-19.md`

*Confidencial. Reprodução proibida sem autorização escrita.*
