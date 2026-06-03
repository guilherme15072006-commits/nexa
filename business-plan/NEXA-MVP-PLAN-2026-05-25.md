# NEXA — Plano MVP Mínimo Funcional Pra Lançar

**Data:** 2026-05-25
**Versão:** 1.0
**Horizonte:** 8 semanas pra GA público controlado
**Objetivo único:** validar o **Loop NEXA** com usuários reais e provar a **conversão cross-sell fantasy→FTD operadora** — única métrica que destranca a Linha 1 (R$ 70k MRR m12).
**Base estratégica:** plano v5 fantasy-first 2026-05-19 + Documento canônico 2026-05-21 (13 capítulos).
**Stack de execução:** 10 marketing skills coreyhaines instaladas em `~/.claude/skills/` + contexto compartilhado em `Desktop/.agents/product-marketing.md`.

---

## 1 · Princípio organizador do MVP

**Cortar 50% do produto pra provar 100% da tese.**

O plano v5 prevê 6 camadas × 6 linhas de receita. O MVP entrega **3 camadas** (Fantasy + Social + Afiliação) e **2 linhas de receita** (Entry fees DFS + CPA afiliação). As outras 3 camadas e 4 linhas ficam para GA Wave 2 (m6+) — não porque não importam, mas porque **não precisam funcionar pra responder a pergunta única do MVP**: o Loop NEXA retém e cross-vende?

### Escopo IN (3 camadas, 2 linhas)

| Camada | Status técnico | O que entrega no MVP |
|---|---|---|
| **I · Fantasy DFS** | Backend pronto, UI parcial | 1 contest semanal (não daily) — salary cap básico — entry R$ 5/15/50 — prêmio garantido pool |
| **II · Social** | 90% pronto (feed + clans + ranking + copy-bet) | Família = clan-zero, ranking público, feed wired ao DB real |
| **IV · Aposta (cross-sell)** | 0% — precisa integrar | Deep-link Betsul único, attribution via UTM + cookie 90d, dashboard FTD básico |
| **VI · Identidade** | Já pronto | Perfil público + XP + badge + ranking (acessível pelo deep-link Camada II) |

### Escopo OUT (cortar pra Wave 2)

- ❌ DFS daily (só weekly no MVP — operacionalmente mais simples + premiação concentrada gera buzz)
- ❌ Creator Marketplace (Camada III) — mock OK no beta · monetiza só pós-PMF
- ❌ NEXA Coin (Camada V) — adia pra Fase 2 TGE (Q4 2026)
- ❌ Premium subscription (Linha 3) — adia pra GA Wave 2
- ❌ Live streaming Mux (parte da Camada II) — custa $$ + complexidade · adia
- ❌ Patrocínios (Linha 6) — só faz sentido com 5k+ MAU
- ❌ App store optimization — mobile RN soft-deprecated, web-first

---

## 2 · Calendário 8 semanas

| Semana | Sprint | Skill ativada | Output | Gate |
|---|---|---|---|---|
| **S0 (hoje, 2 dias)** | Destravar | `/launch` (planning) | Vercel SSO off · 24 arquivos commit · 17 migrations persist · Supabase Redirect URLs | URL pública 200 OK |
| **S1** | Beta privado família | `/onboarding` | 20 family seed entram · primeiro contest semanal aberto · clan-zero ativo | ≥ 15 logins D7 |
| **S2** | Voice of Customer | `/customer-research` | 8 entrevistas roteirizadas + transcritas + sintetizadas em VOC doc | ≥ 8 entrevistas |
| **S3** | Refino UX + copy | `/copywriting` + `/marketing-psychology` | Landing pública v1 · 3 hero variants · push notification re-engage não-predatório | TypeCheck + build verde |
| **S4** | Cross-sell técnico | `/pricing` + dev | Deep-link Betsul integrado · attribution UTM+cookie 90d · primeira tabela `affiliate_clicks` + `affiliate_ftds` | 1 FTD teste fechado |
| **S5** | Beta semi-público (50-80) | `/referrals` + `/community-marketing` | Family convida amigos · referral program 1ª versão (R$ X em entry credit por amigo ativo) | ≥ 50 usuários · ≥ 5 FTDs |
| **S6** | GA preparation | `/launch` + `/marketing-ideas` | ORB plan (Owned/Rented/Borrowed) · Product Hunt-style adaptado BR · 2-3 streamers nicho esports contratados | 3 deals streamer assinados |
| **S7** | GA público controlado | `/launch` + `/copywriting` | Lançamento público · cap 500 vagas wave 1 · landing pública · paid 0 (só orgânico + streamers) | ≥ 200 signups · ≥ 30 FTDs |
| **S8** | Mensuração + gate H1→H2 | `/customer-research` + `/marketing-ideas` | NPS · MAU · retention D7/D30 · cross-sell % · decisão H1→H2 | NPS ≥ 40 · cross-sell ≥ 8% |

---

## 3 · Sprint-a-Sprint detalhado

### Sprint 0 — DESTRAVAR (hoje, 2 dias) · sem skill, só execução

Bloqueia tudo. Lista do meu briefing anterior:

1. Vercel `settings/deployment-protection` → "Disabled" → Save
2. Supabase Auth Redirect URLs → adicionar URL Vercel
3. Testar fluxo family_01 em janela anônima
4. Commit + push 24 arquivos + 50 untracked (separar em 3-4 commits temáticos)
5. Persistir 17 migrations P0+P1 em `supabase/migrations/`
6. Comprar domínio `.app` ou `.bet` (URL longa é constrangedor)

**Custo:** 90 min · 0 R$ (exceto domínio R$ 80-200/ano)
**Sem isso, todo o resto do MVP fica parado.**

---

### Sprint 1 — Beta privado família (semana 1) · skill: `/onboarding`

**Pergunta a responder:** consegue o usuário entrar no produto e chegar ao primeiro contest sem ajuda externa?

**Execução:**
- Distribuir convites WhatsApp (template em `Desktop/BETA-CONVITES-FAMILIA.md` — só trocar `[URL]` pela final)
- Invocar `/onboarding` pra mapear o fluxo signup → primeiro contest e identificar fricção
- Configurar tracking analytics nos 6 passos do Loop NEXA (Ver/Interagir/Apostar/Evoluir/Competir/Voltar)
- Criar **clan-zero "Família NEXA"** com os 20 family seed pré-membros
- Abrir **1 contest semanal pré-Brasileirão** — entry simbólico R$ 5, prêmio R$ 500 garantido (custeio interno, é beta)

**Sucesso:** ≥ 15/20 family logaram, criaram time, e completaram o 1º contest até segunda-feira. Se < 12, P0 UX existe e bloqueia tudo.

---

### Sprint 2 — Voice of Customer (semana 2) · skill: `/customer-research`

**Pergunta a responder:** o que a família REALMENTE pensa do produto vs o que o plano v5 alega?

**Execução:**
- Invocar `/customer-research` pra gerar roteiro de entrevista de 30 min focado em: (a) jobs-to-be-done atual com Cartola/Bet365/grupo WhatsApp, (b) momento de fricção/abandono no NEXA, (c) o que substituiria, (d) intenção de cross-sell pra Betsul
- Marcar 10 entrevistas (meta: 8 completadas — taxa show-up 80%) com mix de perfis (3 que apostam, 3 que só fantasy, 2 que nunca apostou, 2 que abandonaram em D1)
- Skill sintetiza VOC doc com pains/triggers/desired outcomes/language usado
- **Bater contra o plano v5:** quais premissas se confirmam, quais morrem

**Sucesso:** 8 entrevistas + VOC doc + ≥ 3 ajustes UX priorizados (vão pro Sprint 3)

---

### Sprint 3 — Landing pública + copy não-predatório (semana 3) · skills: `/copywriting` + `/marketing-psychology`

**Pergunta a responder:** consegue um visitante zero entender em 5 segundos por que NEXA não é "mais uma bet"?

**Execução:**
- `/marketing-psychology` mapeia o contraste **loop pertencimento × loop extração** (Cap 07 do Documento) em princípios persuasivos não-predatórios: framing de identidade, social proof horizontal (não whale), perda enquadrada como ajuste de jogo (não vergonha)
- `/copywriting` produz landing page v1 com:
  - Hero: "NEXA é o canal próprio da economia esportiva brasileira" + sub explicando "não somos onde se aposta — somos onde se conecta"
  - 6 seções pelas 6 camadas (1 paragraph cada · max 60 palavras)
  - CTA único: "Entrar na lista" (não "Apostar agora")
  - 3 hero variants pra A/B test pós-GA
- Aplicar 3 ajustes UX do VOC (Sprint 2)
- Push notification de re-engage: "Seu clã está em 3º na rodada" (nunca: "Última chance pra apostar!")

**Sucesso:** landing pública live em domínio próprio, 3 variants prontas pra teste no Sprint 7

---

### Sprint 4 — Cross-sell técnico Betsul (semana 4) · skill: `/pricing` (negociação)

**Pergunta a responder:** o pipe técnico do cross-sell funciona ponta-a-ponta?

**Execução técnica (delegar pro `nexa-backend-architect` agent):**
- Criar tabelas `affiliate_clicks` (user_id, casa, utm, timestamp) e `affiliate_ftds` (user_id, casa, valor, timestamp, attribution_window_days)
- Implementar deep-link contextual: botão "Apostar essa partida na Betsul" abre nova aba com `https://betsul.bet.br/?utm_source=nexa&utm_campaign=match_<id>&affiliate_id=NEXA001`
- Setup webhook Betsul → NEXA pra receber FTD confirmados (precisa contrato/spec — paralelo Sprint 4)
- Dashboard admin: clicks → FTDs → CPA estimado · daily refresh

**Execução comercial:**
- `/pricing` ajuda a estruturar pitch CPA + RevShare premium pra Betsul (família é dona) + 2-3 casas adicionais
- Banda alvo: CPA R$ 350-450 + RevShare 30% NGR + cookie 90d + lifetime 24m + 5 anos exclusividade família
- Outras casas a abordar Sprint 4: Bet365 BR, Betano (programa reaberto 2025), KTO

**Sucesso:** 1 FTD teste registrado end-to-end na pipeline (família apostando R$ 10 na Betsul via NEXA → webhook → dashboard)

---

### Sprint 5 — Beta semi-público + referral (semana 5) · skills: `/referrals` + `/community-marketing`

**Pergunta a responder:** o produto sobrevive a usuários que não te conhecem pessoalmente?

**Execução:**
- `/referrals` desenha programa: **família convida amigos · ganha R$ 10 em entry credit por amigo que completa 1º contest** (não cash — atende Art. 29 Lei 14.790 que proíbe vantagem prévia em $$, mas crédito interno pra contest fantasy é permitido sob Art. 49)
- `/community-marketing` configura **clan-zero como ambassador program**: family seed vira "Founders Club" com badge permanente exclusivo, prioridade em features novas, voz no Discord/WhatsApp privado
- Abrir Discord NEXA (gratuito) — canais: #anúncios · #escalações-rodada · #picks-coletivos · #suporte · #feedback-direto-leonardo
- Cap de 80 usuários nesta wave (controla blast radius de bugs)

**Sucesso:** 50-80 usuários totais · ≥ 5 FTDs Betsul · ≥ 3 clans organicamente criados pelos family seeds · ≥ 30 mensagens/dia no Discord

---

### Sprint 6 — Preparação GA + streamer outreach (semana 6) · skills: `/launch` + `/marketing-ideas`

**Pergunta a responder:** qual é a sequência mínima de drops que constrói momentum sem queimar capital?

**Execução:**
- `/launch` aplica framework **ORB (Owned · Rented · Borrowed)**:
  - **Owned:** lista email captada na landing (S3) · Discord NEXA · perfis Twitter/Instagram NEXA
  - **Rented:** Product Hunt-style adaptado BR (TabNews, Notícias Reddit Brasil, ResetEra-BR — sem mass-market) · DEV.to · Hacker News se houver ângulo técnico
  - **Borrowed:** 3 micro-streamers nicho esports (R$ 3-8k cada — plano marketing streamers 2026-05-19) — NÃO Casimiro/Virgínia/Deolane (CPI Bets)
- `/marketing-ideas` brainstorm 15 táticas → escolher 6 testáveis em 4 semanas (S7 + S8)
- Filiar à **ABFS** (Associação Brasileira de Bets e Fantasy Sport) — voz institucional contra PLP 68/2024
- Parecer Art. 49 com Mattos Filho / Tozzini / Demarest (paralelo, R$ 15-30k, demora 3-4 semanas)

**Sucesso:** 3 streamer deals assinados · ABFS filiada · parecer encomendado · ORB plan documentado

---

### Sprint 7 — GA público controlado (semana 7) · skill: `/launch` execução

**Pergunta a responder:** consegue captar 200 signups via canais orgânicos + 3 streamers sem 1 real de paid ads?

**Execução:**
- **Cap 500 vagas (waitlist)** — escassez genuína controla bugs · cria sinal social
- Drop sequência (7 dias):
  - D-7: streamer #1 menciona em live (entry test, vê reação chat)
  - D-3: blog post Leonardo "Por que NEXA não é mais uma bet" (Substack/Medium · viral candidate)
  - D-1: streamer #2 + Twitter X com vídeo curto landing
  - D0: lançamento aberto · email blast lista S3 · Discord aviso · post LinkedIn Leonardo
  - D+1: streamer #3 reage ao lançamento · resposta a feedback público
  - D+3: post Reddit r/brasil + r/futebol (sem spam · contribuição genuína)
  - D+7: AMA Discord · debrief público dos primeiros 7 dias
- Zero Meta/Google Ads. Razão: (a) Lei 14.790 art. 29 + risco PL 2985 sobre celebridades, (b) Sentry/observability ainda precisa endurecer pra suportar tráfego inorgânico

**Sucesso:** ≥ 200 signups · ≥ 30 FTDs Betsul (15% conversion fantasy→bet · 2× a meta DK ano-1) · 0 vulnerabilidade crítica reportada

---

### Sprint 8 — Mensuração + decisão gate H1→H2 (semana 8) · skills: `/customer-research` + `/marketing-ideas`

**Pergunta a responder:** os números do beta sustentam o plano v5 ou exigem pivot?

**Execução:**
- Painel consolidado com 6 métricas-gate (do contexto product-marketing.md):
  1. Family ativos D7 ≥ 75% (medido S1 + agora MoM)
  2. Engajamento clã ≥ 50% (S5 onwards)
  3. ≥ 8 entrevistas customer-research (S2 done · adicionar 5 da wave nova)
  4. ≥ 1 contest DFS completado com 20+ entries (S1 done · agora medir N contests + entries/contest)
  5. ≥ 5 FTDs Betsul via NEXA (S4 done · agora ≥ 30 FTDs S7)
  6. NPS ≥ 40 (medir survey Discord + email lista beta)
- `/customer-research` round 2: 5 entrevistas com **usuários públicos que vieram via streamer** (não família) — sinal limpo de PMF
- Decisão go/no-go GA Wave 2:
  - **4-6/6 atingidos:** seguir pra GA público sem cap · captar R$ 1,2M conselho · contratar 2 sr eng + 1 mid
  - **3/6:** pivot UX antes de marketing pago · 2 semanas extra Sprint 9
  - **< 3/6:** pivot estratégico · re-avaliar premissa fantasy-first

**Sucesso:** decisão documentada · próximos 90 dias planejados · família vê números honestos

---

## 4 · Stack de skills × momento de uso

| Skill | Quando invocar | Output crítico |
|---|---|---|
| `/product-marketing` | Já invocado · arquivo `.agents/product-marketing.md` criado | Contexto compartilhado pelas outras 9 |
| `/onboarding` | Sprint 1 | Mapear fluxo signup→1º contest · identificar 3 fricções |
| `/customer-research` | Sprint 2 e 8 | Roteiro entrevista + síntese VOC |
| `/marketing-psychology` | Sprint 3 | Princípios persuasivos não-predatórios (loop pertencimento) |
| `/copywriting` | Sprint 3 e 7 | Landing v1 · 3 hero variants · push copy · blog post drops |
| `/pricing` | Sprint 4 | Banda CPA+RevShare · tier entry fees R$ 5/15/50/100/500 · pitch deals |
| `/referrals` | Sprint 5 | Programa "convida amigo ganha R$ 10 entry credit" · mecânica viral |
| `/community-marketing` | Sprint 5 | Ambassador "Founders Club" · estrutura Discord · clan-zero |
| `/launch` | Sprint 6 e 7 | ORB plan · 7-day drop sequence · checklist GA |
| `/marketing-ideas` | Sprint 6 e 8 | Brainstorm 15 → escolher 6 táticas testáveis · backlog growth pós-MVP |

---

## 5 · Bloqueadores externos e contingências

| Bloqueador | Probabilidade | Mitigação |
|---|---|---|
| Asaas key (Pix real) atrasa | Alta | Aceitar Pix mock + R$ promocional simbólico até key chegar — funciona pra MVP |
| Betsul não fecha CPA premium | Média | Família é dona — questão política interna, não comercial. Plano B: começar com Bet365 BR programa público |
| IDWall key (KYC real) atrasa | Média | Mock vale pra MVP. Real só importa pra usuário público GA Wave 2 |
| Parecer Art. 49 vem com ressalva | Média-alta | Manter mecânica DFS clássica (≥2 atletas + prêmio garantido) · NUNCA pick'em prop |
| PLP 68/2024 inclui fantasy no Imposto Seletivo | Média | Filiação ABFS · diversificação receita (fantasy é Linha 2 das 6 · impacto contido) |
| Streamer cancela last-minute | Alta | Contratar 5 candidatos · usar 3 · fallback 2 prontos |
| Vercel custa $$ com tráfego | Baixa pré-200 users | Tier free aguenta · só virar pro Cloudflare Pages se >10k req/dia |

---

## 6 · Orçamento MVP estimado (8 semanas)

| Item | R$ | Observação |
|---|---|---|
| Domínio próprio `.app` ou `.bet` | 80-200/ano | Sprint 0 |
| Prêmio garantido contest beta (8 contests × R$ 500) | 4.000 | Sprint 1-8 · custeio família |
| Crédito entry referral (50 ativações × R$ 10) | 500 | Sprint 5 |
| 3 streamers nicho esports (R$ 3-8k cada) | 15.000 | Sprint 6-7 |
| Parecer jurídico Art. 49 (Mattos Filho / Tozzini) | 15-30.000 | Sprint 6 · paralelo |
| Filiação ABFS (anuidade) | 5.000-10.000 | Sprint 6 |
| Sentry plan team | 0-260/mês | Free tier inicial OK |
| Supabase Pro upgrade (se MAU >50k row writes/mo) | 0-25 USD/mês | Provavelmente free tier vale |
| **Total MVP 8 semanas** | **35-55k R$** | Sem Meta/Google Ads (intencional) |

**Comparação:** plano v5 prevê R$ 1,2M nos primeiros 12 meses. Esse MVP gasta < 5% disso pra **validar a tese antes de queimar o resto**. Se gates falham, economiza-se R$ 1,15M evitando o erro.

---

## 7 · Pergunta única que o MVP responde

> Em 8 semanas, com 50-500 usuários reais, **NEXA consegue manter retenção D7 ≥ 75% E cross-sell fantasy→FTD operadora ≥ 8% E NPS ≥ 40 — usando ZERO paid ads?**

- **Se SIM:** plano v5 está vivo · captar R$ 1,2M · contratar time · GA Wave 2
- **Se NÃO:** pivot UX ou pivot estratégico ANTES de gastar R$ 1,2M perseguindo premissa morta

Tudo nos 8 sprints existe pra responder essa pergunta com dados, não opinião.

---

## 8 · O que NÃO está neste plano (intencional)

- ❌ Lançamento mobile iOS/Android (RN soft-deprecated · web-first)
- ❌ NEXA Coin TGE (Fase 2 · Q4 2026 · precisa PSAV parceiro firmado)
- ❌ Marketplace creator monetizado (mock no MVP · GA Wave 2)
- ❌ Premium subscription (sem dado pra precificar pré-MVP)
- ❌ Patrocínios brand (sem MAU pra justificar)
- ❌ Expansão LATAM (Horizon 3 · 2027-28)
- ❌ Paid ads Meta/Google (atende Lei 14.790 art. 29 + PL 2985 + observability ainda imatura)
- ❌ Influenciador celebridade mass-market (CPI Bets investigou Casimiro/Virgínia/Deolane · risco reputacional alto)
- ❌ Live streaming Mux (custo + complexidade · não muda métrica gate)

Cada um desses tem motivo claro pra ficar fora. **Adicionar qualquer um deles antes de bater 4/6 gates é distração.**

---

**Próximo passo:** executar Sprint 0 hoje (90 min). Quer que eu dispare via agents agora?

*Documento vivo. Atualizar ao fim de cada sprint com aprendizados reais vs premissas.*
