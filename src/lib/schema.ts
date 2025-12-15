export type ActorRole = 'Doctor' | 'Nurse' | 'Admin';

export type CaseStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'denied'
  | 'appeal'
  | 'approved';

export type PriorTreatmentOutcome =
  | 'failed'
  | 'intolerant'
  | 'contraindicated'
  | 'ineffective';

export interface PriorTreatment {
  id: string;
  name: string;
  outcome: PriorTreatmentOutcome;
  note: string;
}

export type RiskFactorKey =
  | 'suicidality'
  | 'hospitalizationHistory'
  | 'substanceUse'
  | 'comorbidities';

export interface PayerInfo {
  payerName: string;
  planType?: string;
  denialReasonCode?: string;
  denialText?: string;
}

export interface AttachmentPlaceholder {
  id: string;
  label: string; // e.g., "Prior denial letter (placeholder)"
  note?: string;
  addedAt: number;
}

export interface CaseCard {
  id: string;

  // Minimal field set (de-identified; do not store PHI)
  specialty: string;
  diagnosis: string; // ICD-10 or free text
  serviceOrDrug: string;
  dosage: string;
  frequency: string;
  duration: string;
  priorTreatments: PriorTreatment[];
  severity?: string; // scale / severity measure
  riskFactors: RiskFactorKey[];
  riskFactorNotes?: Partial<Record<RiskFactorKey, string>>;

  // Optional clinical/admin narrative fields (still de-identified)
  visitDate?: string; // YYYY-MM-DD
  mseSummary?: string; // Mental Status Exam key points
  functionalImpairment?: string;
  monitoringPlan?: string; // e.g., REMS / observation plan
  payerReferenceNumber?: string;

  payer?: PayerInfo;
  attachments: AttachmentPlaceholder[];

  status: CaseStatus;
  archivedAt?: number;
  createdAt: number;
  updatedAt: number;

  // Evidence pins
  pinnedEvidenceIds: string[];
}

export type EvidenceStrengthLevel = 'High' | 'Moderate' | 'Low' | 'Consensus';

export interface EvidenceItem {
  id: string;
  title: string;
  snippet: string;
  sourceName: string;
  year: number;
  urlPlaceholder: string;
  tags: string[];
  specialty: string;
  strengthLevel: EvidenceStrengthLevel;
  isCustom?: boolean;
}

export type TemplateCategory =
  | 'Authorization templates'
  | 'Letters templates'
  | 'Clinical note templates'
  | 'AVS templates';

export type TemplateTone = 'formal' | 'neutral' | 'concise';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  specialty: string;
  payer?: string;
  description: string;
  content: string; // {{placeholders}}
  requiredFields: string[]; // used for missing checklist
  tone: TemplateTone;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

export type DocumentKind =
  | 'pa_pack'
  | 'appeal_letter'
  | 'referral_letter'
  | 'sick_note'
  | 'disability_letter'
  | 'pa_support_letter'
  | 'patient_summary'
  | 'soap_note'
  | 'hpi_pe_mdm_note'
  | 'avs';

export interface DocumentCitation {
  footnoteNumber: number;
  evidenceId: string;
}

export interface DocumentArtifact {
  id: string;
  kind: DocumentKind;
  title: string;
  caseId?: string; // some outputs can be freeform
  templateId?: string;
  payerStyle?: string;
  contentMd: string;

  citations: DocumentCitation[];
  missingInfoChecklist: string[];
  riskWarnings: string[];

  createdAt: number;
  updatedAt: number;
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  savedAt: number;
  label: string; // e.g. "v1", "Before appeal edits"
  templateId?: string;
  contentMd: string;
}

export type AuditActionType =
  | 'create'
  | 'edit'
  | 'delete'
  | 'duplicate'
  | 'archive'
  | 'generate'
  | 'qa_ack'
  | 'save_version'
  | 'status_change'
  | 'export'
  | 'copy'
  | 'import'
  | 'clear';

export type AuditEntityType = 'Case' | 'Document' | 'Template' | 'Evidence' | 'System';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  actorRole: ActorRole;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId?: string;
  summary: string;
}

export interface AppSettings {
  userRole: ActorRole;
  phiSafetyMode: boolean;
}

export interface LocalDataExport {
  exportedAt: number;
  version: number;
  settings: AppSettings;
  cases: CaseCard[];
  documents: DocumentArtifact[];
  templates: Template[];
  evidenceCustom: EvidenceItem[];
  auditLog: AuditLogEntry[];
}
