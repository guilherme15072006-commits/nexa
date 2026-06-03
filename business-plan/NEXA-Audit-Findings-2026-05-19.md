# NEXA — Audit de Consistência do Plano de Negócios

**Data:** 2026-05-19
**Escopo:** `NEXA-Business-Plan.md` (3.917 linhas · 196 KB · v4 institucional) + `NEXA-Executive-Summary.md` (219 linhas)
**Metodologia:** Cross-check entre (a) plano existente, (b) vault completo `Desktop/site/nexa/` via Explore agent, (c) fontes externas verificáveis 2024-2026 via WebSearch
**Status:** Documento de referência — listagem de discrepâncias com recomendação. Não aplica correções automaticamente.

---

## 1. Discrepâncias críticas — corrigir antes de circular para investidor

### 1.1 Outorga SIGAP — valor errado em múltiplas seções

| Onde | Plano diz | Realidade | Fonte |
|---|---|---|---|
| Executive Summary L14 | "R$ 47M e 18 meses" | **R$ 30M por autorização · 5 anos · até 3 marcas** | Lei 14.790/2023; Cordeiro, Lima e Advogados; Correio do Estado (KTO pagou R$ 30M dez/2024) |
| Cap 1 (Sumário Executivo) | — | — | — |
| Anexo F.4 (Porter — barreiras de entrada) | "R$ 10-37M Bacen + 9-18 meses" para cripto integrada | Esse número é correto para Bacen Res. 519/520/521 PSAV (não SIGAP) | Bacen 519 capital R$ 10,8-37,2M conforme escopo |

**Correção sugerida:** trocar "R$ 47M outorga SIGAP" por "R$ 30M outorga SIGAP por 5 anos" em todos os locais. Manter "R$ 10-37M Bacen PSAV" separadamente (são realidades distintas).

### 1.2 Tamanho de mercado — números do plano são 1,7-2× maiores que dados oficiais

| Métrica | Plano diz | Realidade oficial 2025 | Fonte |
|---|---|---|---|
| Volume bruto anual | R$ 200 bilhões | **R$ 100-120 bi** (turnover Pix 2024); **GGR R$ 37 bi 2025** (SPA/MF oficial) | iGaming Brazil 2026-02-05; iGaming Business H1/2025 SPA data |
| Receita líquida setor (NGR) | R$ 18-25 bilhões | **R$ 37 bi GGR 2025** | SPA/MF Relatório Semestral H1 2025 (R$ 17,4 bi) |
| % população adulta apostando | 22-28% (~38M) | **17,7M apostadores H1 2025 / 25,2M ano** (~11,8% pop) | SIGAP/SPA-MF Relatório Semestral ago/2025 |
| Concentração top 5 | 60% market share | **Top 3 = 47%** (Betano 23% + Bet365 20% + Superbet) | iGaming Business / H2 Gambling Capital set/2024 |

**Correção sugerida:** revisar Cap 1 (linhas 65-70), Cap 4 (Análise de Mercado), Cap 5 (TAM/SAM/SOM) com os números oficiais. O TAM/SAM/SOM precisa ser **reduzido proporcionalmente** — não invalida tese, mas trinca credibilidade se VC checar.

### 1.3 PCA gov.br — número de autoexclusões superestimado

| Plano diz | Realidade | Fonte |
|---|---|---|
| "340.000 autoexclusões ativas em 5 meses" (memória vault) | **153.000 solicitações nos primeiros 20 dias** após lançamento (10/dez/2025) | iGaming Business BR dez/2025 |

**Correção sugerida:** atualizar para "153k em 20 dias · crescendo" ou usar número mais recente se disponível. O dado oficial de operação está em SPA/MF e Serpro.

### 1.4 KYC — custo estimado já corrigido

Plano linha 1638: "Custo ano 1 R$ 327k" — **CORRETO**. O Executive Summary não cita o número, mas está implícito em "60% mais barato que stack tradicional". ✅ OK.

Memória anterior dizia R$ 54k/ano (6× subestimado). O plano atualizado já reflete a realidade.

### 1.5 P0s — narrativa interna consistente, mas ambígua

| Linha | Texto | Interpretação |
|---|---|---|
| L143, L1872, L1875, L1961, L2909 | "30 P0s mapeados · fix ETA 80-150h" | Total auditado ✅ |
| L298 | "13 P0s fechados (bug log.ts, marketplace fn, void/refund, match_results, admin role, copy bet, self-exclusion call, validação odds, wallet drift)" | Subset H1 Wave 1 — ambíguo |
| Executive Summary L38 | "fix ETA de 80-150 horas focadas" | Coerente |

**Correção sugerida:** L298 deveria ler "**13 P0s prioritários fechados na Wave 1 (subset dos 30 mapeados)**" pra evitar interpretação de que todos os 30 foram fechados.

---

## 2. Discrepâncias materiais — opcional corrigir

### 2.1 Tabelas/funções DB

| Plano diz | Realidade | Status |
|---|---|---|
| Executive Summary linha 33: "72 tabelas, 217 fns, 32 cron, 20 Edge Fns, 7 funcionais" | Confirmado pelo Explore agent | ✅ |
| Plano linha 61 (Cap 1): coerente | ✅ | ✅ |
| Plano linha 2904 (Cap 30 Narrativa): "72 tabelas, 217 funções SQL, 76 RLS policies, 32 cron jobs" | ✅ Bate | ✅ |
| Memória `project_nexa_audit_2026_05_08_completo`: "96 tabelas + 203 fns" | Aspiracional/desatualizado | ⚠️ Memória precisa update |

**Sem ação necessária no plano** — está alinhado.

### 2.2 Comparáveis globais — financials desatualizados

| Empresa | Plano diz | Realidade 2024 (SEC/IR) | Fonte |
|---|---|---|---|
| Kambi | "$500M mkt cap · 3-5× EV/Rev" | **€176,4M revenue 2024 (+2%) · €59,7M EBITDA** | iGaming Future; Yahoo Finance |
| Genius Sports | "$1B mkt cap · 3-4×" | **US$ 511M revenue 2024 (+24%) · Adj. EBITDA US$ 86M** | investors.geniussports.com Q4 2024 |
| Sportradar | Não cita | **€1.090M revenue 2024 (guidance +24%) · Adj. EBITDA €216M** · mkt cap US$ 3,73-4,07 bi | SEC 6-K FY2024 |
| Better Collective | "$1B mkt cap · 8-12×" | **€371,5M revenue 2024 (+13,7%)** | stockanalysis.com STO:BETCO |
| Bragg Gaming | "$50M mkt cap · 1-2×" | **€102M revenue 2024 (+9,1%)** | businesswire 2025-03-20 |
| GAN Limited | "$70M mkt cap · 1-2×" | **B2B Gross Op. Rev. US$ 610,4M 2024 (+44%)** | SEC filings |
| DraftKings | não cita | **US$ 4,77 bi revenue 2024 · 1º Adj. EBITDA positivo** · mkt cap US$ 11,32 bi | CasinoBeats 2025-02-15 |
| Flutter | não cita | **US$ 14,048 bi revenue 2024 (+9%)** | GlobeNewswire Q4 2024 |
| Stake.com | "$2,6B revenue 2022" (FT leak) | **GGR US$ 4,7 bilhões 2024** (+80%) | Global Gambling News 2024 |

**Correção sugerida:** atualizar Anexo B (Comparable Transactions) e Cap 6 (Análise Competitiva) com números 2024.

### 2.3 Recent BR M&A — adicionar (não estava no plano)

| Deal | Valor | Data | Fonte | Implicação NEXA |
|---|---|---|---|---|
| **Flutter compra 56% NSX/Betnacional** | **US$ 350M cash** + Betfair Brasil | set/2024 | NEXT.io / Flutter press release | Comparável direto pra exit ótica BR — 4º maior operador, 12% market share esportivo |
| **KTO paga outorga SIGAP** | R$ 30M | dez/2024 | Correio do Estado | Confirma R$ 30M (não R$ 47M) |
| **NSX revenue 2024 (expected)** | ~US$ 256M · Adj. EBITDA US$ 34M | 2024 | Flutter 8-K | Benchmark para BR operator at scale |

**Recomendação:** adicionar bloco no Anexo B referenciando o NSX deal como comparável.

### 2.4 Sportradar é dominante em BR

**Achado novo (não estava no plano):**
- **50 dos ~80 operadores BR licenciados são clientes Sportradar**; 35 terceirizam risk management e trading completo
- CBF estende parceria exclusiva (Integrity Services) 2025 — cobre >8.200 partidas/ano
- ACT (Acordo de Cooperação Técnica) com Ministério da Fazenda (SPA) e Ministério dos Esportes

**Implicação NEXA:** se Betsul ainda não usa Sportradar (verificar), pode ser stack que herda. Plus, integridade via Sportradar é narrativa positiva pra investidor.

### 2.5 Creator economy BR — números fortes que reforçam tese NEXA

- **20 milhões de criadores brasileiros** (de ~300M globais) — Meta 2023
- **389.448 empregos** diretos/indiretos em 2024 (+30% YoY) — FGV/Hotmart
- **Renda média criador**: R$ 10.007 (PJ) / R$ 4.987 (MEI/PF)
- **Hotmart GMV global cumulativo**: >R$ 30 bi desde 2011
- **Kwai BR**: 60M MAU, 89% diários
- **TikTok BR**: 82,2M usuários ativos 18+

**Recomendação:** Cap 11 (Creator Economy) ganha credibilidade citando estes números com fontes.

### 2.6 Esports betting BR — dado de audiência forte

- **CBLOL Split 1 2024**: 24,9M hours watched, pico **459,8k espectadores** (recorde da liga)
- **Free Fire World Series Brazil 2024 Split 2**: pico 164,7k espectadores

**Recomendação:** Cap 24 (Expansão) e Cap 28 (Apostas ao Vivo) podem citar esses números pra fundamentar entrada em esports.

---

## 3. Itens novos que valeria adicionar ao plano

### 3.1 Compliance Lei 14.790 — cronograma de aumento de tributo

| Ano | Alíquota GGR |
|---|---|
| 2025 | 12% |
| 2026 | 13% |
| 2027 | 14% |
| 2028 | 15% |

**Fonte:** Lei 14.790; Lance Biz

**Implicação NEXA:** unit economics no Cap 14 não modela este aumento. Em 2028 (NEXA mês 30), margem cai 3pp sobre NGR. Para uma split 30% NEXA, isso significa ~0,9pp menos receita.

### 3.2 Mercado cripto-casino global — first-mover validation

- **2024 global**: US$ 81,4 bilhões GGR (5× crescimento vs 2022) — AInvest/ChainPlay
- **Stake.com 2024**: US$ 4,7 bi GGR (+80%)
- **Rollbit jan/2024**: US$ 64,9M revenue em 30 dias

**Recomendação:** Cap 4 ou Cap 30 (Narrativa) deveria citar este dado pra justificar tese "cripto + aposta = next paradigm" antes de regular se consolidar no BR.

### 3.3 F12 não é o que vault dizia

- **Vault dizia:** "F12 pausou cripto (Falcon12 Token) em 2025"
- **Realidade externa:** F12.Bet **aceita cripto como meio de pagamento** (BTC/ETH/USDT) mas **não emitiu token próprio publicamente** segundo pesquisa externa
- Licenciada SPA/MF sob Lei 14.790

**Correção sugerida:** rever menção a "F12 pausou cripto" no plano (linha 548, linha 296 do Anexo etc) com fonte mais robusta. Talvez memória do vault tenha confundido. NEXA continua sendo first-mover em token próprio integrado, mas o framing precisa ajuste.

### 3.4 PSAVs BR — confirmar capital de cada

- **Mercado Bitcoin**: 18,3% market share BTC BR · autorização Bacen como IP em 2024
- **Binance BR**: 61,2% market share BTC (líder absoluto)
- **Foxbit**: 6,2% das transações ETH · plataforma stablecoins B2B já lançada
- **Bitso**: 1,3% market share · autorizada Bacen como IP em mar/2025

**Recomendação:** Cap 4.2.3 (NEXA Coin Fase 2) deveria especificar Mercado Bitcoin como primeira escolha (maior liquidez R$) + Bipa como segunda (CaaS dedicado mencionado no vault).

---

## 4. Resumo de ações recomendadas

### Críticas (recomendo aplicar antes de circular)

1. **Corrigir outorga R$ 47M → R$ 30M** (Executive Summary L14 + qualquer outra menção)
2. **Atualizar tamanho de mercado** (R$ 200 bi → R$ 100-120 bi turnover; GGR R$ 37 bi 2025; 17,7M apostadores)
3. **Atualizar concentração** (top 3 = 47%, não top 5 = 60%)
4. **Recalibrar PCA autoexclusões** (340k → 153k em 20 dias, crescendo)
5. **Clarear L298** (13 P0s fechados na Wave 1, dos 30 totais)

### Valiosas (aumentam credibilidade institucional)

6. Atualizar Anexo B com revenues 2024 reais (Kambi €176M, Genius US$ 511M, etc.)
7. Adicionar Flutter↔NSX deal (US$ 350M / 56%) como comparável BR
8. Incorporar cronograma de aumento de tributo (12→13→14→15%)
9. Citar dados creator economy BR (FGV/Hotmart 389k empregos)
10. Citar Sportradar dominance BR (50/80 operadores)

### Estratégicas (decisão founder)

11. Rever framing "F12 pausou cripto" — verificar se é Falcon12 (token próprio) ou só meio de pagamento. Plano pode estar errado.
12. Recalcular SOM ano 1-3 considerando market size revisado
13. Adicionar paragraph sobre cripto-casino global US$ 81 bi GGR pra justificar tese first-mover BR

---

## 5. Itens auditados que estão CORRETOS

✅ KYC R$ 327k/ano (linha 1638)
✅ 30 P0s mapeados · 80-150h ETA (múltiplas linhas)
✅ 72 tabelas, 217 fns, 76 RLS, 32 cron (linha 2904)
✅ Bacen Res. 519/520/521 vigência 02/02/2026 (linhas 24-31 do Cap 17)
✅ Lei 14.790 art. 29/35/36/174 corretamente citados
✅ Portaria 615/2024 e 1.231/2024 corretamente citadas
✅ Lei 14.478/2022 (Marco Cripto) corretamente citada
✅ PL 1018/2024 status "em tramitação" corretamente citado (autor Sen. Eduardo Girão NOVO-CE confirmado)
✅ Tokenomics NEXA Coin 10B supply consistente
✅ R$ 1,2M aporte holding citado consistentemente
✅ Estratégia faseada A→B→C cripto sem auto-contradições
✅ 14 anti-features listadas consistentemente
✅ Quarterly rocks Q3 26 / Q4 26 / Q1 27 consistentes
✅ 14 riscos do risk register com P×I scoring
✅ Decision gates M1-M18 internamente consistentes

---

## 6. Fontes consultadas (cross-check externo)

### Mercado BR
- iGaming Brazil 2026-02-05 (GGR R$ 37 bi 2025)
- iGaming Business H1/2025 SPA data (R$ 17,4 bi H1)
- SIGAP/SPA-MF Relatório Semestral ago/2025 (17,7M apostadores)
- Banco Central via TechTudo mar/2026 (Pix flows)
- Mercado&Consumo abr/2026 (R$ 2,2 bi jan/2026)
- Poder360 (R$ 9,95 bi arrecadação fiscal 2025)

### Operadores
- iGaming Business "Betano leading in Brazil with 23%"
- SBC Notícias (Betano + bet365 40%, top 3 47%)
- NEXT.io (Flutter↔NSX deal US$ 350M)
- Correio do Estado (KTO R$ 30M outorga)
- Portaria SPA/MF Nº 787/2025 (operadores licenciados)

### Comparáveis globais
- SEC filings: Flutter 8-K, Sportradar 6-K, DraftKings 10-K
- iGaming Future (Kambi 2024)
- investors.geniussports.com (Q4 2024)
- CasinoBeats (DraftKings 2024)

### Cripto BR
- Banco Central via Felsberg (Resoluções 519/520/521)
- Mattos Filho (regulamentação)
- CVM Parecer 40 (2022)
- Bitybank retrospectiva (PSAV market share)

### Regulação
- Lei 14.790/2023 (Planalto)
- Cordeiro, Lima e Advogados
- iGaming Brazil 2026-03-16 (PL 1018)
- BNLData (PL 1018)

### Creator/social
- FGV/Hotmart 2024 study
- Meta 2023 (20M criadores BR)
- Esports Charts (CBLOL audience)
- Streamscharts (Twitch BR top)

---

*Audit feito em 2026-05-19 cruzando o plano existente com 7 docs do vault + 50+ fontes externas. Próximo audit recomendado: trimestral, ou imediatamente antes de circular pra investidor.*
