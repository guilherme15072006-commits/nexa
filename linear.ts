// =====================================================
// NEXA Linear Integration — Gestao de Tarefas e Bugs
// Integra com Linear para tracking automatico de:
// - Bug reports do app
// - Feature requests dos usuarios
// - Metricas de qualidade
// =====================================================

const LINEAR_CONFIG = {
  apiUrl: 'https://api.linear.app/graphql',
  apiKey: process.env.LINEAR_API_KEY ?? '',
  teamId: process.env.LINEAR_TEAM_ID ?? '',
  projectId: process.env.LINEAR_PROJECT_ID ?? '',
};

// --- Types ---

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  state: { name: string };
  priority: number;
  url: string;
}

interface CreateIssueInput {
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  labels?: string[];
  assigneeId?: string;
}

interface BugReportInput {
  screen: string;
  action: string;
  expected: string;
  actual: string;
  userId: string;
  deviceInfo: string;
  appVersion: string;
  stackTrace?: string;
}

// --- Priority map ---

const PRIORITY_MAP: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
  none: 0,
};

// --- Label IDs (configurar no Linear) ---

const LABELS = {
  bug: process.env.LINEAR_LABEL_BUG ?? '',
  feature: process.env.LINEAR_LABEL_FEATURE ?? '',
  ux: process.env.LINEAR_LABEL_UX ?? '',
  performance: process.env.LINEAR_LABEL_PERFORMANCE ?? '',
  analytics: process.env.LINEAR_LABEL_ANALYTICS ?? '',
  betting: process.env.LINEAR_LABEL_BETTING ?? '',
  gamification: process.env.LINEAR_LABEL_GAMIFICATION ?? '',
  responsible_gaming: process.env.LINEAR_LABEL_RESPONSIBLE ?? '',
};

// --- GraphQL Client ---

async function linearQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!LINEAR_CONFIG.apiKey) {
    if (__DEV__) {
      console.log('[Linear] Query (sem API key):', query.slice(0, 100));
    }
    return {} as T;
  }

  const response = await fetch(LINEAR_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': LINEAR_CONFIG.apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(`Linear API error: ${json.errors[0].message}`);
  }

  return json.data;
}

// --- Issue Management ---

class NexaLinear {
  async createIssue(input: CreateIssueInput): Promise<LinearIssue | null> {
    try {
      const result = await linearQuery<{ issueCreate: { issue: LinearIssue } }>(`
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              title
              description
              state { name }
              priority
              url
            }
          }
        }
      `, {
        input: {
          teamId: LINEAR_CONFIG.teamId,
          projectId: LINEAR_CONFIG.projectId,
          title: input.title,
          description: input.description,
          priority: PRIORITY_MAP[input.priority] ?? 3,
          labelIds: input.labels?.filter(Boolean) ?? [],
        },
      });

      return result.issueCreate?.issue ?? null;
    } catch (error) {
      if (__DEV__) console.warn('[Linear] Erro ao criar issue:', error);
      return null;
    }
  }

  // --- Bug Report (auto-generated from app errors) ---

  async reportBug(input: BugReportInput): Promise<LinearIssue | null> {
    const description = [
      `## Contexto`,
      `- **Tela:** ${input.screen}`,
      `- **Acao:** ${input.action}`,
      `- **Usuario:** ${input.userId}`,
      `- **Dispositivo:** ${input.deviceInfo}`,
      `- **Versao:** ${input.appVersion}`,
      ``,
      `## Comportamento esperado`,
      input.expected,
      ``,
      `## Comportamento atual`,
      input.actual,
      input.stackTrace ? `\n## Stack Trace\n\`\`\`\n${input.stackTrace}\n\`\`\`` : '',
    ].join('\n');

    return this.createIssue({
      title: `[Bug] ${input.screen}: ${input.action}`,
      description,
      priority: input.stackTrace ? 'high' : 'medium',
      labels: [LABELS.bug],
    });
  }

  // --- Feature request from user feedback ---

  async requestFeature(title: string, description: string, userId: string): Promise<LinearIssue | null> {
    return this.createIssue({
      title: `[Feature Request] ${title}`,
      description: `Solicitado por usuario ${userId}\n\n${description}`,
      priority: 'medium',
      labels: [LABELS.feature],
    });
  }

  // --- Performance issue (auto-detected) ---

  async reportPerformance(metric: string, value: number, threshold: number, context: string): Promise<LinearIssue | null> {
    return this.createIssue({
      title: `[Performance] ${metric} acima do limite: ${value}ms (limite: ${threshold}ms)`,
      description: [
        `## Metrica`,
        `- **Nome:** ${metric}`,
        `- **Valor:** ${value}ms`,
        `- **Limite:** ${threshold}ms`,
        `- **Excesso:** ${Math.round(((value - threshold) / threshold) * 100)}%`,
        ``,
        `## Contexto`,
        context,
      ].join('\n'),
      priority: value > threshold * 2 ? 'high' : 'medium',
      labels: [LABELS.performance],
    });
  }

  // --- Responsible gaming alert ---

  async reportResponsibleGaming(userId: string, trigger: string, userState: string): Promise<LinearIssue | null> {
    return this.createIssue({
      title: `[Jogo Responsavel] Alerta para usuario ${userId}`,
      description: [
        `## Detalhes`,
        `- **Usuario:** ${userId}`,
        `- **Estado detectado:** ${userState}`,
        `- **Gatilho:** ${trigger}`,
        `- **Timestamp:** ${new Date().toISOString()}`,
        ``,
        `## Acao necessaria`,
        `Revisar comportamento do usuario e validar se intervencao e necessaria.`,
      ].join('\n'),
      priority: 'high',
      labels: [LABELS.responsible_gaming],
    });
  }

  // --- Sprint metrics (called by CI/CD) ---

  async getSprintIssues(): Promise<LinearIssue[]> {
    try {
      const result = await linearQuery<{ issues: { nodes: LinearIssue[] } }>(`
        query SprintIssues($teamId: String!) {
          issues(
            filter: {
              team: { id: { eq: $teamId } }
              cycle: { isActive: { eq: true } }
            }
            first: 50
          ) {
            nodes {
              id
              identifier
              title
              state { name }
              priority
              url
            }
          }
        }
      `, { teamId: LINEAR_CONFIG.teamId });

      return result.issues?.nodes ?? [];
    } catch {
      return [];
    }
  }
}

// Singleton
export const linear = new NexaLinear();

// --- Error boundary integration ---

export function setupErrorReporting(): void {
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    linear.reportBug({
      screen: 'Global',
      action: isFatal ? 'Fatal error' : 'Unhandled error',
      expected: 'App funcionar normalmente',
      actual: error.message,
      userId: 'unknown',
      deviceInfo: `${require('react-native').Platform.OS} ${require('react-native').Platform.Version}`,
      appVersion: '0.1.0',
      stackTrace: error.stack,
    });

    originalHandler(error, isFatal);
  });
}
