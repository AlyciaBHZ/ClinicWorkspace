import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import evidenceBaseJson from '@/data/evidence.json';
import type {
  AppSettings,
  AuditLogEntry,
  CaseCard,
  CaseStatus,
  DocumentArtifact,
  DocumentKind,
  EvidenceItem,
  LocalDataExport,
  Template,
} from './schema';
import { APP_DATA_VERSION, DEFAULT_TEMPLATES, EXAMPLE_CASE_ID } from './constants';
import {
  generateAppealLetter,
  generateAvs,
  generatePaPack,
  generatePaSupportLetter,
  generatePatientTreatmentSummary,
  generateDisabilityLetter,
  generateHpiPeMdmNote,
  generateReferralLetter,
  generateSickNote,
  generateSoapNote,
} from './generator';

type CaseCreateInput = Omit<CaseCard, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'pinnedEvidenceIds'> & {
  pinnedEvidenceIds?: string[];
  archivedAt?: number;
};

interface AppState {
  settings: AppSettings;

  cases: CaseCard[];
  templates: Template[];

  evidenceCustom: EvidenceItem[];
  documents: DocumentArtifact[];
  auditLog: AuditLogEntry[];

  // UI state (frontend-only)
  activeCaseId?: string;
  setActiveCaseId: (id?: string) => void;
  toast?: { message: string; kind?: 'success' | 'info' | 'warning' | 'error'; durationMs?: number };
  showToast: (message: string, opts?: { kind?: 'success' | 'info' | 'warning' | 'error'; durationMs?: number }) => void;
  clearToast: () => void;
  printJob?: { docId: string };
  setPrintJob: (job: { docId: string }) => void;
  clearPrintJob: () => void;

  guidedDemo: {
    exampleCaseId: string;
    steps: Record<'step1' | 'step2' | 'step3' | 'step4' | 'step5', 'not_started' | 'done'>;
    lastRunAt?: number;
  };

  // Derived-ish helpers
  getEvidenceAll: () => EvidenceItem[];
  getCaseById: (id: string) => CaseCard | undefined;
  getDocumentForCase: (caseId: string, kind: DocumentKind) => DocumentArtifact | undefined;
  getDocumentById: (docId: string) => DocumentArtifact | undefined;

  // Settings & audit
  setSettings: (s: Partial<AppSettings>) => void;
  log: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorRole'>) => void;

  // Cases
  createCase: (input: Partial<CaseCreateInput>) => string;
  updateCase: (caseId: string, patch: Partial<CaseCard>) => void;
  duplicateCase: (caseId: string) => string | undefined;
  archiveCase: (caseId: string) => void;
  restoreCase: (caseId: string) => void;
  setCaseStatus: (caseId: string, status: CaseStatus) => void;

  // Evidence
  toggleEvidencePin: (caseId: string, evidenceId: string) => void;
  addCustomEvidence: (e: Omit<EvidenceItem, 'id' | 'isCustom'>) => string;
  deleteCustomEvidence: (id: string) => void;

  // Templates
  createTemplate: (t: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  duplicateTemplate: (id: string) => string | undefined;
  deleteTemplate: (id: string) => void;
  importTemplates: (templates: Template[]) => void;

  // Documents
  upsertDocument: (doc: DocumentArtifact) => void;
  updateDocumentContent: (docId: string, contentMd: string) => void;
  saveDocumentVersion: (docId: string, label: string) => void;
  generateForCase: (caseId: string, kind: DocumentKind, opts?: { templateId?: string; payerStyle?: string; transcript?: string }) => string;

  // Data management
  seedDemoData: () => void;
  seedUserCaseSpravatoTrdDenied: () => string;
  runFullScenario: () => void;
  resetScenario: () => void;
  clearAllLocalData: () => void;
  exportAllData: () => LocalDataExport;
  importAllData: (data: LocalDataExport) => void;
}

const STORAGE_KEY = 'clinic-workspace-storage';

function now() {
  return Date.now();
}

function blankCase(): CaseCard {
  return {
    id: uuidv4(),
    specialty: 'Psychiatry',
    diagnosis: '',
    serviceOrDrug: '',
    dosage: '',
    frequency: '',
    duration: '',
    priorTreatments: [],
    severity: '',
    riskFactors: [],
    riskFactorNotes: {},
    visitDate: '',
    mseSummary: '',
    functionalImpairment: '',
    monitoringPlan: '',
    payerReferenceNumber: '',
    payer: undefined,
    attachments: [],
    status: 'draft',
    archivedAt: undefined,
    createdAt: now(),
    updatedAt: now(),
    pinnedEvidenceIds: [],
  };
}

function defaultSettings(): AppSettings {
  return {
    userRole: 'Doctor',
    phiSafetyMode: true,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings(),
      cases: [],
      templates: DEFAULT_TEMPLATES,
      evidenceCustom: [],
      documents: [],
      auditLog: [],
      activeCaseId: undefined,
      toast: undefined,
      printJob: undefined,
      guidedDemo: {
        exampleCaseId: EXAMPLE_CASE_ID,
        steps: {
          step1: 'not_started',
          step2: 'not_started',
          step3: 'not_started',
          step4: 'not_started',
          step5: 'not_started',
        },
        lastRunAt: undefined,
      },

      getEvidenceAll: () => {
        const base = (evidenceBaseJson as EvidenceItem[]).map((e) => ({ ...e, isCustom: false }));
        const custom = get().evidenceCustom.map((e) => ({ ...e, isCustom: true }));
        return [...custom, ...base];
      },

      getCaseById: (id) => get().cases.find((c) => c.id === id),

      getDocumentForCase: (caseId, kind) => get().documents.find((d) => d.caseId === caseId && d.kind === kind),
      getDocumentById: (docId) => get().documents.find((d) => d.id === docId),

      setSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
        })),

      setActiveCaseId: (id) => set(() => ({ activeCaseId: id })),

      showToast: (message, opts) =>
        set(() => ({
          toast: { message, kind: opts?.kind ?? 'info', durationMs: opts?.durationMs },
        })),
      clearToast: () => set(() => ({ toast: undefined })),

      setPrintJob: (job) => set(() => ({ printJob: job })),
      clearPrintJob: () => set(() => ({ printJob: undefined })),

      log: (entry) =>
        set((state) => ({
          auditLog: [
            {
              id: uuidv4(),
              timestamp: now(),
              actorRole: state.settings.userRole,
              ...entry,
            },
            ...state.auditLog,
          ],
        })),

      createCase: (input) => {
        const c = blankCase();
        const created: CaseCard = {
          ...c,
          ...input,
          id: uuidv4(),
          createdAt: now(),
          updatedAt: now(),
          pinnedEvidenceIds: input?.pinnedEvidenceIds ?? [],
          attachments: input?.attachments ?? [],
          priorTreatments: input?.priorTreatments ?? [],
          riskFactors: input?.riskFactors ?? [],
          dosage: input?.dosage ?? '',
          frequency: input?.frequency ?? '',
          duration: input?.duration ?? '',
          diagnosis: input?.diagnosis ?? '',
          serviceOrDrug: input?.serviceOrDrug ?? '',
          specialty: input?.specialty ?? 'Psychiatry',
        };
        set((state) => ({ cases: [created, ...state.cases] }));
        get().log({
          actionType: 'create',
          entityType: 'Case',
          entityId: created.id,
          summary: `Created case: ${created.serviceOrDrug || '(untitled)'}`,
        });
        return created.id;
      },

      updateCase: (caseId, patch) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId ? { ...c, ...patch, updatedAt: now() } : c,
          ),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Case',
          entityId: caseId,
          summary: `Updated case`,
        });
      },

      duplicateCase: (caseId) => {
        const original = get().cases.find((c) => c.id === caseId);
        if (!original) return undefined;
        const newId = get().createCase({
          ...original,
          status: 'draft',
          archivedAt: undefined,
          serviceOrDrug: `${original.serviceOrDrug} (Copy)`,
        });
        get().log({
          actionType: 'duplicate',
          entityType: 'Case',
          entityId: newId,
          summary: `Duplicated case from ${caseId}`,
        });
        return newId;
      },

      archiveCase: (caseId) => {
        get().updateCase(caseId, { archivedAt: now() });
        get().log({
          actionType: 'archive',
          entityType: 'Case',
          entityId: caseId,
          summary: `Archived case`,
        });
      },

      restoreCase: (caseId) => {
        get().updateCase(caseId, { archivedAt: undefined });
        get().log({
          actionType: 'edit',
          entityType: 'Case',
          entityId: caseId,
          summary: `Restored case`,
        });
      },

      setCaseStatus: (caseId, status) => {
        get().updateCase(caseId, { status });
        get().log({
          actionType: 'status_change',
          entityType: 'Case',
          entityId: caseId,
          summary: `Changed status to ${status}`,
        });
      },

      toggleEvidencePin: (caseId, evidenceId) => {
        const c = get().cases.find((x) => x.id === caseId);
        if (!c) return;
        const current = c.pinnedEvidenceIds ?? [];
        const exists = current.includes(evidenceId);
        const next = exists ? current.filter((id) => id !== evidenceId) : [...current, evidenceId];
        get().updateCase(caseId, { pinnedEvidenceIds: next });
        get().log({
          actionType: 'edit',
          entityType: 'Evidence',
          entityId: evidenceId,
          summary: `${exists ? 'Unpinned' : 'Pinned'} evidence to case`,
        });
      },

      addCustomEvidence: (e) => {
        const id = uuidv4();
        const item: EvidenceItem = {
          id,
          isCustom: true,
          ...e,
        };
        set((state) => ({ evidenceCustom: [item, ...state.evidenceCustom] }));
        get().log({
          actionType: 'create',
          entityType: 'Evidence',
          entityId: id,
          summary: `Added custom evidence: ${e.title}`,
        });
        return id;
      },

      deleteCustomEvidence: (id) => {
        set((state) => ({ evidenceCustom: state.evidenceCustom.filter((e) => e.id !== id) }));
        get().log({
          actionType: 'delete',
          entityType: 'Evidence',
          entityId: id,
          summary: `Deleted custom evidence`,
        });
      },

      createTemplate: (t) => {
        const id = uuidv4();
        const tpl: Template = {
          ...t,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ templates: [tpl, ...state.templates] }));
        get().log({
          actionType: 'create',
          entityType: 'Template',
          entityId: id,
          summary: `Created template: ${tpl.name}`,
        });
        return id;
      },

      updateTemplate: (id, patch) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Template',
          entityId: id,
          summary: `Updated template`,
        });
      },

      duplicateTemplate: (id) => {
        const t = get().templates.find((x) => x.id === id);
        if (!t) return undefined;
        const newId = get().createTemplate({
          ...t,
          name: `${t.name} (Copy)`,
          archivedAt: undefined,
        });
        get().log({
          actionType: 'duplicate',
          entityType: 'Template',
          entityId: newId,
          summary: `Duplicated template`,
        });
        return newId;
      },

      deleteTemplate: (id) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
        get().log({
          actionType: 'delete',
          entityType: 'Template',
          entityId: id,
          summary: `Deleted template`,
        });
      },

      importTemplates: (templates) => {
        set({ templates });
        get().log({
          actionType: 'import',
          entityType: 'Template',
          summary: `Imported templates: ${templates.length}`,
        });
      },

      upsertDocument: (doc) => {
        set((state) => {
          const exists = state.documents.some((d) => d.id === doc.id);
          return {
            documents: exists
              ? state.documents.map((d) => (d.id === doc.id ? doc : d))
              : [doc, ...state.documents],
          };
        });
      },

      updateDocumentContent: (docId, contentMd) => {
        set((state) => ({
          documents: state.documents.map((d) => (d.id === docId ? { ...d, contentMd, updatedAt: now() } : d)),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Document',
          entityId: docId,
          summary: `Edited document`,
        });
      },

      saveDocumentVersion: (docId, label) => {
        const doc = get().documents.find((d) => d.id === docId);
        if (!doc) return;
        const version = {
          id: uuidv4(),
          savedAt: now(),
          label: label || `v${doc.versions.length + 1}`,
          templateId: doc.templateId,
          contentMd: doc.contentMd,
        };
        get().upsertDocument({ ...doc, versions: [version, ...doc.versions] });
        get().log({
          actionType: 'save_version',
          entityType: 'Document',
          entityId: docId,
          summary: `Saved version: ${version.label}`,
        });
      },

      generateForCase: (caseId, kind, opts) => {
        const c = get().cases.find((x) => x.id === caseId);
        if (!c) throw new Error('Case not found');
        const templates = get().templates;
        const evidenceAll = get().getEvidenceAll();
        const pinIndex = new Map<string, number>((c.pinnedEvidenceIds ?? []).map((id, idx) => [id, idx]));
        const pins = evidenceAll
          .filter((e) => pinIndex.has(e.id))
          .sort((a, b) => (pinIndex.get(a.id)! - pinIndex.get(b.id)!));

        const generated =
          kind === 'pa_pack'
            ? generatePaPack(c, templates, pins, opts?.templateId)
            : kind === 'appeal_letter'
              ? generateAppealLetter(c, templates, pins, opts?.payerStyle, opts?.templateId)
              : kind === 'pa_support_letter'
                ? generatePaSupportLetter(c, templates, pins, opts?.templateId)
                : kind === 'patient_summary'
                  ? generatePatientTreatmentSummary(c, templates, opts?.templateId)
                : kind === 'referral_letter'
                  ? generateReferralLetter(c, templates, opts?.templateId)
                  : kind === 'sick_note'
                    ? generateSickNote(c, templates, opts?.templateId)
                    : kind === 'disability_letter'
                      ? generateDisabilityLetter(c, templates, opts?.templateId)
              : kind === 'soap_note'
                  ? generateSoapNote(c, templates, opts?.transcript, opts?.templateId)
                : kind === 'avs'
                    ? generateAvs(c, templates, opts?.transcript, opts?.templateId)
                    : kind === 'hpi_pe_mdm_note'
                      ? generateHpiPeMdmNote(c, opts?.transcript)
                  : generatePaPack(c, templates, pins);

        const existing = get().documents.find((d) => d.caseId === caseId && d.kind === kind);
        const doc: DocumentArtifact = {
          id: existing?.id ?? uuidv4(),
          kind,
          title: generated.title,
          caseId,
          templateId: opts?.templateId ?? existing?.templateId,
          payerStyle: opts?.payerStyle ?? existing?.payerStyle,
          contentMd: generated.contentMd,
          citations: generated.citations,
          missingInfoChecklist: generated.missingInfoChecklist,
          riskWarnings: generated.riskWarnings,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
          versions: existing?.versions ?? [],
        };

        get().upsertDocument(doc);
        get().log({
          actionType: 'generate',
          entityType: 'Document',
          entityId: doc.id,
          summary: `Generated ${kind} for case`,
        });
        return doc.id;
      },

      seedDemoData: () => {
        const baseNow = now();
        const case1Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'Major Depressive Disorder, recurrent, severe (TRD)',
          serviceOrDrug: 'Spravato (Esketamine) nasal spray',
          dosage: '84 mg',
          frequency: 'Twice weekly (induction)',
          duration: '4 weeks (induction), then weekly (maintenance)',
          severity: 'PHQ-9: 22 (severe)',
          riskFactors: ['hospitalizationHistory'],
          payer: {
            payerName: 'BlueCross (Demo)',
            planType: 'Commercial PPO',
            denialReasonCode: '',
            denialText: '',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Sertraline', outcome: 'ineffective', note: 'Adequate dose/duration; minimal response.' },
            { id: uuidv4(), name: 'Venlafaxine XR', outcome: 'ineffective', note: 'Partial response; persistent impairment.' },
            { id: uuidv4(), name: 'Bupropion XL', outcome: 'intolerant', note: 'Increased anxiety/insomnia.' },
          ],
          attachments: [
            { id: uuidv4(), label: 'Prior medication list (placeholder)', addedAt: baseNow },
            { id: uuidv4(), label: 'PHQ-9 screenshot (placeholder)', addedAt: baseNow },
          ],
          status: 'in_progress',
          pinnedEvidenceIds: ['ev-002', 'ev-018', 'ev-022'],
        });

        const case2Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'ADHD, combined presentation',
          serviceOrDrug: 'Lisdexamfetamine (Vyvanse)',
          dosage: '40 mg',
          frequency: 'Daily',
          duration: 'Ongoing (reassess at 8–12 weeks)',
          severity: 'ASRS: elevated; functional impairment documented',
          riskFactors: ['substanceUse'],
          payer: {
            payerName: 'UnitedHealth (Demo)',
            planType: 'HMO',
            denialReasonCode: 'ST-01',
            denialText: 'Step therapy required: trial methylphenidate ER first.',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Mixed amphetamine salts IR', outcome: 'intolerant', note: 'Rebound irritability and afternoon crash.' },
          ],
          attachments: [{ id: uuidv4(), label: 'Denial letter (placeholder)', addedAt: baseNow - 86_400_000 }],
          status: 'denied',
          pinnedEvidenceIds: ['ev-003', 'ev-011', 'ev-020'],
        });

        const case3Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'Bipolar I disorder (recent manic episode)',
          serviceOrDrug: 'Cariprazine (Vraylar)',
          dosage: '1.5 mg',
          frequency: 'Daily',
          duration: '8 weeks then maintenance',
          severity: 'Clinical severity: moderate; sleep disruption noted',
          riskFactors: ['hospitalizationHistory', 'comorbidities'],
          payer: {
            payerName: 'Aetna (Demo)',
            planType: 'Commercial',
            denialReasonCode: '',
            denialText: '',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Quetiapine', outcome: 'intolerant', note: 'Sedation and metabolic concerns.' },
            { id: uuidv4(), name: 'Lithium', outcome: 'contraindicated', note: 'Contraindicated due to renal monitoring constraints (demo).' },
          ],
          attachments: [{ id: uuidv4(), label: 'Hospital discharge summary (placeholder)', addedAt: baseNow - 172_800_000 }],
          status: 'submitted',
          pinnedEvidenceIds: ['ev-004', 'ev-021', 'ev-028'],
        });

        get().log({
          actionType: 'create',
          entityType: 'System',
          summary: `Seeded demo data (3 cases): ${case1Id}, ${case2Id}, ${case3Id}`,
        });
      },

      seedUserCaseSpravatoTrdDenied: () => {
        const baseNow = now();
        const caseId = EXAMPLE_CASE_ID;
        const existing = get().cases.find((c) => c.id === caseId);
        if (existing) return caseId;

        const created: CaseCard = {
          ...blankCase(),
          id: caseId,
          createdAt: baseNow,
          updatedAt: baseNow,
          specialty: 'Psychiatry',
          diagnosis: 'Major Depressive Disorder, recurrent. Treatment-resistant depression',
          serviceOrDrug: 'Spravato (esketamine) nasal spray',
          dosage: '56 mg induction; may increase to 84 mg per protocol',
          frequency: '2x weekly induction; then weekly/biweekly maintenance',
          duration: '12 weeks initial authorization requested',
          visitDate: '2025-12-10',
          severity: 'PHQ-9 = 21 (severe), documented on 2025-12-10',
          functionalImpairment:
            'Persistent severe depressive symptoms with functional impairment despite multiple adequate pharmacologic trials and structured psychotherapy.',
          monitoringPlan:
            'Clinic will administer under supervised setting with post-dose observation, vital sign monitoring, and safety plan reinforcement; follow-up scheduled per protocol.',
          mseSummary:
            'Affect constricted; mood depressed; thought process linear; passive SI without plan; insight/judgment fair (demo summary).',
          riskFactors: ['suicidality', 'hospitalizationHistory', 'comorbidities'],
          riskFactorNotes: {
            suicidality: 'Passive SI without plan. Safety plan in place.',
            hospitalizationHistory: '1 prior inpatient stay in 2024 for severe depression.',
            comorbidities: 'Generalized anxiety disorder.',
            substanceUse: 'Denies active substance use disorder.',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Sertraline 200mg (12 weeks)', outcome: 'ineffective', note: 'Adequate trial; ineffective.' },
            { id: uuidv4(), name: 'Escitalopram 20mg (10 weeks)', outcome: 'ineffective', note: 'Adequate trial; ineffective.' },
            { id: uuidv4(), name: 'Venlafaxine XR 225mg (8 weeks)', outcome: 'ineffective', note: 'Adequate trial; ineffective.' },
            { id: uuidv4(), name: 'Bupropion XL 300mg augmentation (6 weeks)', outcome: 'ineffective', note: 'Partial then plateau.' },
            { id: uuidv4(), name: 'Aripiprazole 5mg augmentation (4 weeks)', outcome: 'intolerant', note: 'Akathisia.' },
            { id: uuidv4(), name: 'Structured psychotherapy CBT (weekly x12)', outcome: 'ineffective', note: 'Insufficient response.' },
          ],
          payer: {
            payerName: 'Aetna',
            planType: 'PPO',
            denialReasonCode: 'PA-TRD-001',
            denialText:
              'Not medically necessary. Insufficient documentation of TRD criteria and failed trials. Missing severity scale and treatment history details.',
          },
          payerReferenceNumber: '',
          attachments: [
            { id: uuidv4(), label: 'PHQ-9 form 2025-12-10 (placeholder)', addedAt: baseNow },
            { id: uuidv4(), label: 'Medication history summary (placeholder)', addedAt: baseNow },
            { id: uuidv4(), label: 'Denial notice screenshot / reference # (placeholder)', addedAt: baseNow },
          ],
          status: 'denied',
          pinnedEvidenceIds: ['ev-spravato-001', 'ev-spravato-002', 'ev-spravato-003', 'ev-spravato-004'],
        };

        set((state) => ({ cases: [created, ...state.cases] }));
        get().log({
          actionType: 'create',
          entityType: 'Case',
          entityId: created.id,
          summary: `Created case: ${created.serviceOrDrug || '(untitled)'}`,
        });

        get().log({
          actionType: 'create',
          entityType: 'System',
          summary: `Seeded user case: Spravato TRD denied (Aetna) — ${caseId}`,
        });
        return caseId;
      },

      runFullScenario: () => {
        const { seedDemoData, seedUserCaseSpravatoTrdDenied, setActiveCaseId, setCaseStatus, generateForCase, saveDocumentVersion, showToast } = get();

        if (get().cases.length === 0) seedDemoData();

        const exampleId = seedUserCaseSpravatoTrdDenied();
        setActiveCaseId(exampleId);

        // Pin 3 evidence using tags: #TRD #esketamine/#spravato
        const all = get().getEvidenceAll();
        const hasTag = (e: EvidenceItem, tag: string) => (e.tags ?? []).some((t) => t.toLowerCase() === tag.toLowerCase());
        const matches = all.filter(
          (e) =>
            e.specialty.toLowerCase() === 'psychiatry' &&
            hasTag(e, 'trd') &&
            (hasTag(e, 'esketamine') || hasTag(e, 'spravato')),
        );
        const pick = matches.slice(0, 3).map((e) => e.id);
        if (pick.length > 0) get().updateCase(exampleId, { pinnedEvidenceIds: pick });

        const paId = generateForCase(exampleId, 'pa_pack', {
          templateId: 'tmpl-auth-pa-pack-psychiatry-spravato-commercial',
        });
        saveDocumentVersion(paId, 'v1');

        const appealId = generateForCase(exampleId, 'appeal_letter', {
          templateId: 'tmpl-auth-appeal-aetna-formal',
        });
        saveDocumentVersion(appealId, 'v1');

        setCaseStatus(exampleId, 'denied');

        set((state) => ({
          guidedDemo: {
            ...state.guidedDemo,
            exampleCaseId: EXAMPLE_CASE_ID,
            steps: { step1: 'done', step2: 'done', step3: 'done', step4: 'done', step5: 'not_started' },
            lastRunAt: now(),
          },
        }));

        showToast('Run full scenario 完成：PA Pack/Appeal 已生成并保存 v1，状态已设置为 denied。', { kind: 'success' });
      },

      resetScenario: () => {
        const exampleId = EXAMPLE_CASE_ID;
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== exampleId),
          documents: state.documents.filter((d) => d.caseId !== exampleId),
          activeCaseId: undefined,
          guidedDemo: {
            ...state.guidedDemo,
            exampleCaseId: EXAMPLE_CASE_ID,
            steps: { step1: 'not_started', step2: 'not_started', step3: 'not_started', step4: 'not_started', step5: 'not_started' },
            lastRunAt: undefined,
          },
        }));
        get().log({ actionType: 'clear', entityType: 'System', summary: `Reset scenario: ${exampleId}` });
        get().showToast('Reset scenario 完成：已移除示例 Case 与相关文档。', { kind: 'info' });
      },

      clearAllLocalData: () => {
        set({
          settings: defaultSettings(),
          cases: [],
          templates: DEFAULT_TEMPLATES,
          evidenceCustom: [],
          documents: [],
          auditLog: [],
        });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        get().log({
          actionType: 'clear',
          entityType: 'System',
          summary: 'Cleared all local data',
        });
      },

      exportAllData: () => ({
        exportedAt: now(),
        version: APP_DATA_VERSION,
        settings: get().settings,
        cases: get().cases,
        documents: get().documents,
        templates: get().templates,
        evidenceCustom: get().evidenceCustom,
        auditLog: get().auditLog,
      }),

      importAllData: (data) => {
        set({
          settings: data.settings ?? defaultSettings(),
          cases: data.cases ?? [],
          documents: data.documents ?? [],
          templates: data.templates ?? DEFAULT_TEMPLATES,
          evidenceCustom: data.evidenceCustom ?? [],
          auditLog: data.auditLog ?? [],
        });
        get().log({
          actionType: 'import',
          entityType: 'System',
          summary: `Imported workspace backup`,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: APP_DATA_VERSION,
      partialize: (state) => ({
        settings: state.settings,
        cases: state.cases,
        templates: state.templates,
        evidenceCustom: state.evidenceCustom,
        documents: state.documents,
        auditLog: state.auditLog,
        activeCaseId: state.activeCaseId,
        guidedDemo: state.guidedDemo,
      }),
    },
  ),
);
