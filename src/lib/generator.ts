import type {
  CaseCard,
  DocumentCitation,
  EvidenceItem,
  Template,
} from './schema';
import { RISK_FACTOR_LABELS } from './constants';

export interface GeneratedDocument {
  title: string;
  contentMd: string;
  citations: DocumentCitation[];
  missingInfoChecklist: string[];
  riskWarnings: string[];
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce((acc: any, key) => (acc == null ? undefined : acc[key]), obj as any);
}

function renderTemplate(content: string, ctx: Record<string, string>): string {
  return content.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_m, key) => {
    const v = ctx[key];
    if (v == null || v === '') return `[${key.toUpperCase()}]`;
    return v;
  });
}

function formatPriorTreatments(c: CaseCard): string {
  if (!c.priorTreatments?.length) return '_No prior treatments recorded. Please add prior trials, outcomes, and notes._';
  return c.priorTreatments
    .map((t) => `- **${t.name}** — _${t.outcome}_: ${t.note || '[ADD NOTE]'} `)
    .join('\n');
}

function formatRiskFactors(c: CaseCard): string {
  if (!c.riskFactors?.length) return 'No specific high-risk factors recorded in this de-identified case card.';
  return c.riskFactors
    .map((k) => {
      const label = RISK_FACTOR_LABELS[k] ?? k;
      const note = c.riskFactorNotes?.[k];
      return note && note.trim() ? `- ${label}: ${note.trim()}` : `- ${label}`;
    })
    .join('\n');
}

function buildCitations(caseId: string | undefined, evidencePins: EvidenceItem[]): { citations: DocumentCitation[]; footnotesMd: string } {
  const citations: DocumentCitation[] = evidencePins.map((e, idx) => ({
    footnoteNumber: idx + 1,
    evidenceId: e.id,
  }));

  if (!evidencePins.length) {
    return {
      citations,
      footnotesMd: '_No pinned evidence. Add evidence in Evidence Retrieval to include citations._',
    };
  }

  const footnotesMd = evidencePins
    .map((e, idx) => {
      const n = idx + 1;
      const link = `#/evidence?caseId=${encodeURIComponent(caseId ?? '')}&evidenceId=${encodeURIComponent(e.id)}`;
      return `[^${n}]: [${e.title} — ${e.sourceName} (${e.year})](${link})\n\n> ${e.snippet}`;
    })
    .join('\n\n');

  return { citations, footnotesMd };
}

export function getMissingInfo(c: CaseCard, template: Template): string[] {
  const missing: string[] = [];

  for (const field of template.requiredFields ?? []) {
    const value = getByPath(
      {
        ...c,
        payerName: c.payer?.payerName ?? '',
        planType: c.payer?.planType ?? '',
        denialReasonCode: c.payer?.denialReasonCode ?? '',
        denialText: c.payer?.denialText ?? '',
      },
      field,
    );
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isEmptyString = typeof value === 'string' && value.trim() === '';
    if (value == null || isEmptyArray || isEmptyString) {
      missing.push(field);
    }
  }

  // Extra rules (deterministic)
  if (!c.severity) missing.push('severity');
  if ((c.status === 'denied' || c.status === 'appeal') && !c.payer?.denialText) missing.push('payer.denialText');

  return Array.from(new Set(missing));
}

export function missingChecklistMd(missing: string[]): string {
  if (!missing.length) return '- [x] No missing required fields detected (review clinically).';
  return missing.map((m) => `- [ ] Missing: **${m}**`).join('\n');
}

export function riskWarningsMd(): string[] {
  return [
    'Demo output — **clinician review required**. This content is generated from local templates and rules; it is not medical advice.',
    'Do **not** include PHI (names, MRN, phone, email). This workspace is designed for de-identified demo content.',
  ];
}

function medicalNecessityRationale(c: CaseCard): string {
  const severity = c.severity ? `Severity/scale: **${c.severity}**.` : 'Severity/scale: **[ADD SEVERITY]**.';
  const prior = c.priorTreatments?.length
    ? `Prior therapy history shows multiple trials with documented outcomes.`
    : `Prior therapy history is incomplete; please document prior trials and outcomes.`;
  return [
    `The requested therapy (**${c.serviceOrDrug || '[SERVICE/DRUG]'}**) is indicated for **${c.diagnosis || '[DIAGNOSIS]'}** in the context of the patient’s clinical course.`,
    c.visitDate ? `Encounter date (de-identified): **${c.visitDate}**.` : 'Encounter date: **[ADD VISIT DATE]**.',
    severity,
    c.functionalImpairment?.trim()
      ? `Functional impairment: ${c.functionalImpairment.trim()}`
      : 'Functional impairment: **[ADD FUNCTIONAL IMPAIRMENT]**.',
    prior,
    `The goal is to reduce symptom burden, improve function, and prevent clinical deterioration.`,
  ].join('\n\n');
}

export function generatePaPack(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-auth-pa-pack-standard') ??
    templates.find((t) => t.category === 'Authorization templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    diagnosis: c.diagnosis,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    severity: c.severity?.trim() ? c.severity.trim() : '[ADD SEVERITY]',
    visitDate: c.visitDate?.trim() ? c.visitDate.trim() : '[ADD VISIT DATE]',
    functionalImpairment: c.functionalImpairment?.trim()
      ? c.functionalImpairment.trim()
      : '[ADD FUNCTIONAL IMPAIRMENT]',
    mseSummary: c.mseSummary?.trim() ? c.mseSummary.trim() : '[ADD MSE SUMMARY]',
    monitoringPlan: c.monitoringPlan?.trim()
      ? c.monitoringPlan.trim()
      : '[ADD MONITORING PLAN]',
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    riskSafetySection: formatRiskFactors(c),
    missingInfoChecklist: missingChecklistMd(missing),
    footnotes: footnotesMd,
    payerName: c.payer?.payerName ?? '',
    planType: c.payer?.planType ?? '',
    denialReasonCode: c.payer?.denialReasonCode ?? '',
    denialText: c.payer?.denialText ?? '',
    executiveSummary: `Requesting PA for **${c.serviceOrDrug || '[SERVICE/DRUG]'}** for **${c.diagnosis || '[DIAGNOSIS]'}**.`,
  };

  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `PA Evidence Pack — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateAppealLetter(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  payerStyle?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-auth-appeal-formal-generic') ??
    templates.find((t) => t.category === 'Authorization templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    diagnosis: c.diagnosis,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    severity: c.severity?.trim() ? c.severity.trim() : '[ADD SEVERITY]',
    visitDate: c.visitDate?.trim() ? c.visitDate.trim() : '[ADD VISIT DATE]',
    functionalImpairment: c.functionalImpairment?.trim()
      ? c.functionalImpairment.trim()
      : '[ADD FUNCTIONAL IMPAIRMENT]',
    mseSummary: c.mseSummary?.trim() ? c.mseSummary.trim() : '[ADD MSE SUMMARY]',
    monitoringPlan: c.monitoringPlan?.trim()
      ? c.monitoringPlan.trim()
      : '[ADD MONITORING PLAN]',
    payerName: c.payer?.payerName ?? '[PAYER_NAME]',
    planType: c.payer?.planType ?? '',
    denialReasonCode: c.payer?.denialReasonCode ?? '',
    denialText: c.payer?.denialText ?? '[DENIAL_TEXT]',
    executiveSummary: `This appeal summarizes the clinical rationale for **${c.serviceOrDrug || '[SERVICE/DRUG]'}** in **${c.diagnosis || '[DIAGNOSIS]'}** and addresses denial criteria.`,
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    footnotes: footnotesMd,
    missingInfoChecklist: missingChecklistMd(missing),
  };

  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `Appeal Letter — ${payerStyle ? `${payerStyle} ` : ''}${c.serviceOrDrug || 'Case'}`.trim(),
    contentMd,
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateSoapNote(
  c: CaseCard,
  templates: Template[],
  transcript?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-clinical-soap') ??
    templates.find((t) => t.category === 'Clinical note templates')!;

  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    severity: c.severity?.trim() ? c.severity.trim() : '[ADD SEVERITY]',
    subjective: transcript?.trim()
      ? `Transcript summary (pasted):\n\n> ${transcript.trim()}`
      : '_No transcript provided._',
    objective: c.severity ? `Severity/scale: **${c.severity}**.` : 'Severity/scale: **[ADD SEVERITY]**.',
    followUpPlan: 'Follow-up plan to be confirmed by clinician.',
  };
  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `SOAP Note — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateAvs(
  c: CaseCard,
  templates: Template[],
  transcript?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-avs-standard') ??
    templates.find((t) => t.category === 'AVS templates')!;

  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    monitoringPlan: c.monitoringPlan?.trim()
      ? c.monitoringPlan.trim()
      : 'Monitoring plan to be confirmed by clinician.',
    patientSafetyNotes:
      'If you experience worsening symptoms or safety concerns, contact your clinician or seek urgent care according to your local policy.',
    nextSteps: transcript?.trim()
      ? `Next steps based on today’s discussion:\n\n- Review plan details\n- Schedule follow-up\n- Bring questions from transcript notes`
      : `- Schedule follow-up as advised\n- Take medication as directed\n- Bring any side effects/concerns to next visit`,
  };
  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `After Visit Summary — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateReferralLetter(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-referral') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    referralReason: 'Please evaluate and provide recommendations. (Demo placeholder)',
    priorTreatmentSection: formatPriorTreatments(c),
    duration: c.duration,
  };
  return {
    title: `Referral Letter — ${c.diagnosis || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateSickNote(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-sick-note') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    duration: c.duration,
  };
  return {
    title: `Sick Note — ${c.duration || 'Duration needed'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateDisabilityLetter(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-disability') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    duration: c.duration,
  };
  return {
    title: `Accommodation Letter — ${c.diagnosis || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generatePaSupportLetter(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-pa-support') ??
    templates.find((t) => t.category === 'Letters templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    footnotes: footnotesMd,
  };
  return {
    title: `PA Support Letter — ${c.serviceOrDrug || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generatePatientTreatmentSummary(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-patient-treatment-summary') ??
    templates.find((t) => t.category === 'Letters templates')!;

  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    duration: c.duration,
    monitoringPlan: c.monitoringPlan?.trim() ? c.monitoringPlan.trim() : '[ADD MONITORING PLAN]',
  };
  return {
    title: `Patient-facing Summary — ${c.serviceOrDrug || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateHpiPeMdmNote(
  c: CaseCard,
  transcript?: string,
): GeneratedDocument {
  const hpi = transcript?.trim()
    ? `Transcript excerpt:\n\n> ${transcript.trim()}`
    : '_No transcript provided._';
  const contentMd = [
    '# HPI / PE / MDM (Draft)',
    '',
    '## HPI',
    hpi,
    '',
    '## PE',
    '_[Not captured in this demo — add pertinent exam findings as needed]._',
    '',
    '## MDM',
    `Assessment: **${c.diagnosis || '[DIAGNOSIS]'}**`,
    `Plan: **${c.serviceOrDrug || '[SERVICE/DRUG]'}** (${c.dosage || '[DOSAGE]'}, ${c.frequency || '[FREQUENCY]'}, ${c.duration || '[DURATION]'})`,
    '',
    '### Safety / Risk',
    formatRiskFactors(c),
  ].join('\n');

  const missing = Array.from(new Set([...(c.severity ? [] : ['severity']), ...(c.priorTreatments.length ? [] : ['priorTreatments'])]));
  return {
    title: `HPI/PE/MDM — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}
