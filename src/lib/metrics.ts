import type { AuditLogEntry, CaseCard, Template } from './schema';
import { getMissingInfo } from './generator';

export type CompletenessBadgeTone = 'green' | 'amber' | 'red';

export interface CaseCompleteness {
  percent: number; // 0-100
  missing: string[];
  totalChecks: number;
  tone: CompletenessBadgeTone;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function getDefaultPaPackTemplate(templates: Template[]): Template | undefined {
  return (
    templates.find((t) => t.id === 'tmpl-auth-pa-pack-standard') ??
    templates.find((t) => t.category === 'Authorization templates')
  );
}

export function computeCaseCompleteness(caseCard: CaseCard, templates: Template[]): CaseCompleteness {
  const tpl = getDefaultPaPackTemplate(templates);
  const required = unique([...(tpl?.requiredFields ?? [])]);
  // generator has extra deterministic rules; keep totalChecks consistent with them
  const deterministicExtras = ['severity'];
  if (caseCard.status === 'denied' || caseCard.status === 'appeal') {
    deterministicExtras.push('payer.denialText');
  }
  const totalSet = unique([...required, ...deterministicExtras]);

  const missing = tpl ? getMissingInfo(caseCard, tpl) : [];
  const missingCount = totalSet.filter((k) => missing.includes(k)).length;
  const totalChecks = Math.max(1, totalSet.length);
  const percent = Math.max(0, Math.min(100, Math.round((1 - missingCount / totalChecks) * 100)));

  const tone: CompletenessBadgeTone =
    percent >= 85 ? 'green' : percent >= 60 ? 'amber' : 'red';

  return { percent, missing, totalChecks, tone };
}

export interface WorkspaceKpis {
  casesTotal: number;
  casesInProgress: number;
  casesDenied: number;
  docsGenerated: number;
  versionsSaved: number;
  copies: number;
  exports: number;
  estimatedMinutesSaved: number;
}

export function computeWorkspaceKpis(auditLog: AuditLogEntry[], casesTotal: number, casesInProgress: number, casesDenied: number): WorkspaceKpis {
  const docsGenerated = auditLog.filter((l) => l.actionType === 'generate' && l.entityType === 'Document').length;
  const versionsSaved = auditLog.filter((l) => l.actionType === 'save_version' && l.entityType === 'Document').length;
  const copies = auditLog.filter((l) => l.actionType === 'copy' && l.entityType === 'Document').length;
  const exports = auditLog.filter((l) => l.actionType === 'export' && l.entityType === 'Document').length;

  // Deterministic ROI estimate for demo (tweakable): minutes saved per action
  const estimatedMinutesSaved =
    docsGenerated * 8 +
    copies * 2 +
    exports * 2 +
    versionsSaved * 1;

  return {
    casesTotal,
    casesInProgress,
    casesDenied,
    docsGenerated,
    versionsSaved,
    copies,
    exports,
    estimatedMinutesSaved,
  };
}


