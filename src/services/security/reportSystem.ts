/**
 * NEXA Security — Report System
 *
 * Modulo independente. Denuncias da comunidade com validacao cruzada.
 * Escala automaticamente quando multiplos reports convergem.
 *
 * Consumido por: orchestrator.ts, screens (perfil, chat, feed)
 * Consome: auditLog.ts, penaltyEngine.ts
 */

import { auditLog } from './auditLog';
import { penaltyEngine } from './penaltyEngine';

// ─── Types ──────────────────────────────────────────────────

export type ReportCategory = 'spam' | 'fraud' | 'harassment' | 'bot' | 'cheating' | 'inappropriate' | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reporterReputation: number;
  targetUserId: string;
  category: ReportCategory;
  description: string;
  context: string;           // where: 'chat', 'feed', 'profile', 'marketplace'
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: number;
}

// ─── Config ─────────────────────────────────────────────────

const AUTO_ESCALATE_THRESHOLD = 3;   // 3 unique reporters → auto-escalate
const AUTO_ESCALATE_WINDOW = 24 * 60 * 60 * 1000; // within 24h

const CATEGORY_SEVERITY: Record<ReportCategory, number> = {
  cheating: 5,
  fraud: 5,
  harassment: 4,
  bot: 3,
  spam: 2,
  inappropriate: 2,
  other: 1,
};

// ─── Service ────────────────────────────────────────────────

class ReportSystemService {
  private reports: Report[] = [];
  private listeners: Array<(report: Report, autoEscalated: boolean) => void> = [];

  /** Subscribe to new reports */
  onReport(listener: (report: Report, autoEscalated: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Submit a report */
  submit(params: {
    reporterId: string;
    reporterReputation: number;
    targetUserId: string;
    category: ReportCategory;
    description: string;
    context: string;
  }): Report {
    // Prevent self-report
    if (params.reporterId === params.targetUserId) {
      throw new Error('Nao e possivel reportar a si mesmo');
    }

    // Prevent duplicate (same reporter → same target in 24h)
    const existing = this.reports.find(r =>
      r.reporterId === params.reporterId &&
      r.targetUserId === params.targetUserId &&
      Date.now() - r.createdAt < AUTO_ESCALATE_WINDOW,
    );
    if (existing) {
      throw new Error('Voce ja reportou este usuario recentemente');
    }

    const report: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...params,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.reports.push(report);

    auditLog.log({
      userId: params.reporterId,
      action: 'report_submitted',
      resource: 'report_system',
      detail: { reportId: report.id, targetUserId: params.targetUserId, category: params.category, context: params.context },
      result: 'success',
    });

    // Check auto-escalation
    const autoEscalated = this.checkAutoEscalation(params.targetUserId);
    this.listeners.forEach(l => l(report, autoEscalated));

    return report;
  }

  /** Check if target has enough reports for auto-escalation */
  private checkAutoEscalation(targetUserId: string): boolean {
    const recentReports = this.reports.filter(r =>
      r.targetUserId === targetUserId &&
      Date.now() - r.createdAt < AUTO_ESCALATE_WINDOW &&
      r.status === 'pending',
    );

    // Count unique reporters
    const uniqueReporters = new Set(recentReports.map(r => r.reporterId));

    if (uniqueReporters.size >= AUTO_ESCALATE_THRESHOLD) {
      // Calculate weighted severity
      const totalSeverity = recentReports.reduce((sum, r) => sum + CATEGORY_SEVERITY[r.category] * (r.reporterReputation / 500), 0);

      if (totalSeverity >= 8) {
        // Auto-apply shadow ban while investigating
        penaltyEngine.shadowBan(targetUserId, `Auto-escalated: ${uniqueReporters.size} reports in 24h (severity: ${totalSeverity.toFixed(1)})`);
        auditLog.log({ userId: targetUserId, action: 'anomaly_detected', resource: 'report_system', detail: { uniqueReporters: uniqueReporters.size, totalSeverity, action: 'shadow_ban' }, result: 'blocked' });
        return true;
      }
    }

    return false;
  }

  /** Resolve a report */
  resolve(reportId: string, resolution: 'confirmed' | 'dismissed'): void {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    report.status = resolution === 'confirmed' ? 'resolved' : 'dismissed';

    auditLog.log({
      action: 'report_resolved',
      resource: 'report_system',
      detail: { reportId, targetUserId: report.targetUserId, category: report.category, resolution },
      result: 'success',
    });
  }

  /** Get reports against a user */
  getReportsAgainst(userId: string): Report[] {
    return this.reports.filter(r => r.targetUserId === userId);
  }

  /** Get reports submitted by a user */
  getReportsBy(userId: string): Report[] {
    return this.reports.filter(r => r.reporterId === userId);
  }

  /** Get pending reports (for admin) */
  getPending(): Report[] {
    return this.reports.filter(r => r.status === 'pending');
  }
}

export const reportSystem = new ReportSystemService();
