# Clinic Workspace — Guided Demo Update Dump

Generated at: 2025-12-15T12:14:12.275Z

## Included files
- `package.json`
- `vite.config.ts`
- `README.md`
- `.github/workflows/pages.yml`
- `src/main.tsx`
- `src/index.css`
- `src/print.css`
- `src/lib/constants.ts`
- `src/lib/schema.ts`
- `src/lib/store.ts`
- `src/lib/portalText.ts`
- `src/lib/demoTour.ts`
- `src/lib/diff.ts`
- `src/components/ui/Layout.tsx`
- `src/components/ui/ToastHost.tsx`
- `src/components/print/PrintModal.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/CaseCards.tsx`
- `src/pages/AuthSuite.tsx`
- `src/pages/Evidence.tsx`
- `src/pages/ClinicalOutputStudio.tsx`
- `src/pages/Templates.tsx`
- `src/pages/LettersStudio.tsx`

---

## package.json

```
{
  "name": "clinic-workspace",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/utilities": "^3.2.2",
    "driver.js": "^1.3.6",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "6.28.0",
    "lucide-react": "0.294.0",
    "uuid": "9.0.1",
    "zustand": "4.4.7"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^5.0.0",
    "@tailwindcss/typography": "^0.5.15",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

## vite.config.ts

```
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  // For GitHub Pages (repo subpath) + local dev: keep assets relative.
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));
```

## README.md

```
# Clinic Workspace (Frontend-only Demo)

Interactive product prototype for clinic workflows. **No backend services**, **no external APIs**, all data is stored locally in the browser via **localStorage**.

## Run locally

- **Prerequisites**: Node.js (LTS recommended)

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

## Notes

- Use **Settings → Seed Demo Data** to generate 3 psychiatry prior-auth demo cases.
- Use **Settings → Clear All Local Data** to reset localStorage.

## GitHub Pages

This repo is configured to deploy to GitHub Pages via Actions.

- Repository: `https://github.com/AlyciaBHZ/ClinicWorkspace.git`
- Pages deployment workflow: `.github/workflows/pages.yml`

## Guided Demo: Spravato TRD (one click)

1. Open **Dashboard**
2. In the right-side card **“演示脚本（Spravato TRD 拒付申诉）”**, click **Run full scenario**
3. The app will (frontend-only, deterministic):
   - Ensure demo data exists
   - Create/ensure the fixed demo case id: `exampleCaseId`
   - Auto-pin evidence by tags (TRD + esketamine/spravato)
   - Generate **PA Pack** and **Appeal Letter**, and save **v1**
   - Set status to **denied** for appeal workflow demo
4. Use the Stepper “Go” buttons to jump into each module with `caseId` context.
```

## .github/workflows/pages.yml

```
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: SPA fallback + nojekyll
        run: |
          touch dist/.nojekyll
          cp dist/index.html dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4


```

## src/main.tsx

```
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './print.css';
import 'driver.js/dist/driver.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


```

## src/index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

/* App-wide defaults */
html,
body,
#root {
  height: 100%;
}

/* Print: hide chrome, keep content readable */
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white !important;
  }
}


```

## src/print.css

```
@media print {
  /* Hide the app chrome and keep only the print root */
  body * {
    visibility: hidden !important;
  }

  .print-root,
  .print-root * {
    visibility: visible !important;
  }

  .print-root {
    position: absolute;
    inset: 0;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print-header {
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .print-header__title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }

  .print-header__meta {
    font-size: 11px;
    color: #475569;
    margin-top: 2px;
  }

  .print-prose h1,
  .print-prose h2,
  .print-prose h3 {
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  .print-prose ul,
  .print-prose ol,
  .print-prose p {
    orphans: 3;
    widows: 3;
  }

  /* Avoid giant margins from browser default print */
  @page {
    margin: 14mm 14mm;
  }
}


```

## src/lib/constants.ts

```
import type { RiskFactorKey, Template } from './schema';

export const APP_DATA_VERSION = 1;

// Fixed demo case id for Guided Demo scenario player
export const EXAMPLE_CASE_ID = 'exampleCaseId';

export const RISK_FACTOR_LABELS: Record<RiskFactorKey, string> = {
  suicidality: 'Suicidality / self-harm risk',
  hospitalizationHistory: 'Psychiatric hospitalization history',
  substanceUse: 'Substance use',
  comorbidities: 'Significant comorbidities',
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  submitted: 'Submitted',
  denied: 'Denied',
  appeal: 'Appeal',
  approved: 'Approved',
};

const now = () => Date.now();

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tmpl-auth-pa-pack-standard',
    name: 'PA Evidence Pack (Standard)',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: undefined,
    description: 'Multi-section PA pack with executive summary, medical necessity, prior treatment history, safety/risk, and next steps.',
    tone: 'formal',
    requiredFields: ['diagnosis', 'serviceOrDrug', 'dosage', 'frequency', 'duration', 'priorTreatments'],
    content: `# Executive Summary
Requesting prior authorization for **{{serviceOrDrug}}** for **{{diagnosis}}**.

# Medical Necessity Rationale
{{medicalNecessityRationale}}

# Prior Treatment Failures / Intolerance
{{priorTreatmentSection}}

# Severity & Functional Impairment
{{severity}}

{{functionalImpairment}}

# Safety / Risk Considerations
{{riskSafetySection}}

# Monitoring / Clinic Capability
{{monitoringPlan}}

# Requested Service/Drug Details
- Requested: {{serviceOrDrug}}
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration: {{duration}}

# Next Steps + Missing Info Checklist
{{missingInfoChecklist}}

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-auth-pa-pack-psychiatry-spravato-commercial',
    name: 'PA Evidence Pack — Psychiatry · Spravato · Commercial Payer',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: 'Aetna',
    description: 'Tailored Spravato/TRD pack emphasizing TRD criteria, failed trials, PHQ-9 severity, and monitoring/REMS-style workflow.',
    tone: 'formal',
    requiredFields: [
      'diagnosis',
      'serviceOrDrug',
      'dosage',
      'frequency',
      'duration',
      'priorTreatments',
      'severity',
      'visitDate',
      'functionalImpairment',
      'monitoringPlan',
    ],
    content: `# Executive Summary
This request is for **{{serviceOrDrug}}** for **{{diagnosis}}**. The clinical record supports **treatment-resistant depression (TRD)** with multiple adequate trials and persistent severe symptoms.

## TRD Criteria & Treatment History (Structured Summary)
{{priorTreatmentSection}}

## Severity & Functional Impairment
- PHQ-9 / scale: {{severity}}
- Functional impairment: {{functionalImpairment}}
- Encounter date: {{visitDate}}

## Medical Necessity Rationale
{{medicalNecessityRationale}}

## Safety / Risk Considerations
{{riskSafetySection}}

## Monitoring / REMS-style Plan
{{monitoringPlan}}

## Requested Therapy Details
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration requested: {{duration}}

## Next Steps + Missing Info Checklist
{{missingInfoChecklist}}

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-auth-appeal-formal-generic',
    name: 'Appeal Letter (Formal - Generic)',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: undefined,
    description: 'Formal appeal letter with denial framing, evidence citations, and clinical justification.',
    tone: 'formal',
    requiredFields: ['payer.payerName', 'diagnosis', 'serviceOrDrug', 'priorTreatments', 'payer.denialText'],
    content: `# RE: Appeal of Coverage Denial — {{serviceOrDrug}}
**Payer**: {{payerName}} {{planType}}

To Whom It May Concern,

I am writing to appeal the denial of coverage for **{{serviceOrDrug}}** for the treatment of **{{diagnosis}}**. The denial references: **{{denialReasonCode}}** — "{{denialText}}".

## Clinical Summary
{{executiveSummary}}

## Medical Necessity
{{medicalNecessityRationale}}

## Prior Treatment History
{{priorTreatmentSection}}

## Requested Therapy Details
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration: {{duration}}

## Conclusion
Given the patient’s clinical presentation and treatment history, **{{serviceOrDrug}}** is medically necessary. Please reconsider and approve this request.

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-auth-appeal-aetna-formal',
    name: 'Appeal Letter — Aetna style · Formal',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: 'Aetna',
    description: 'Formal Aetna-style appeal emphasizing TRD criteria, failed trials, PHQ-9, and monitoring plan; references denial code/text.',
    tone: 'formal',
    requiredFields: [
      'payer.payerName',
      'payer.planType',
      'payer.denialReasonCode',
      'payer.denialText',
      'diagnosis',
      'serviceOrDrug',
      'priorTreatments',
      'severity',
      'monitoringPlan',
    ],
    content: `# RE: Appeal of Denial — {{serviceOrDrug}}
**Payer**: {{payerName}} {{planType}}
**Denial code**: {{denialReasonCode}}

To Whom It May Concern,

I am appealing the denial of coverage for **{{serviceOrDrug}}** for **{{diagnosis}}**. The denial states: "{{denialText}}".

## Summary
The patient meets TRD criteria with multiple adequate trials and persistent severe symptoms (**{{severity}}**). This appeal provides structured treatment history, severity documentation, and a monitoring plan.

## Prior Treatment History (Failed / Intolerant)
{{priorTreatmentSection}}

## Medical Necessity
{{medicalNecessityRationale}}

## Safety & Monitoring
- Risk factors: {{riskSafetySection}}
- Monitoring plan: {{monitoringPlan}}

## Requested Therapy Details
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration: {{duration}}

Thank you for your prompt reconsideration.

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-referral',
    name: 'Referral Letter (Specialist Referral)',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'Referral letter with diagnosis, current plan, and specific referral question.',
    tone: 'neutral',
    requiredFields: ['diagnosis', 'serviceOrDrug'],
    content: `# Referral Letter

To Whom It May Concern,

I am referring a patient for evaluation/management of **{{diagnosis}}**. Current therapy under consideration: **{{serviceOrDrug}}**.

## Reason for Referral
{{referralReason}}

## Pertinent History
{{priorTreatmentSection}}

Sincerely,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-sick-note',
    name: 'Sick Note (Work/School)',
    category: 'Letters templates',
    specialty: 'General',
    description: 'Short sick note template.',
    tone: 'concise',
    requiredFields: ['duration'],
    content: `# Sick Note

This letter confirms the patient was evaluated and should be excused from work/school for: **{{duration}}**.

Signed,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-disability',
    name: 'Disability / Accommodation Letter',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'Accommodation letter with suggested supports and duration.',
    tone: 'formal',
    requiredFields: ['duration', 'diagnosis'],
    content: `# Disability / Accommodation Letter

To Whom It May Concern,

The patient is under care for **{{diagnosis}}**. I recommend the following accommodations:
- Flexible scheduling
- Time for clinical appointments
- Reduced workload during symptom exacerbation

Expected duration: **{{duration}}**.

Signed,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-pa-support',
    name: 'Prior Auth Support Letter (Reusable)',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'A shorter letter that can be used in portals; overlaps with PA pack content.',
    tone: 'formal',
    requiredFields: ['diagnosis', 'serviceOrDrug', 'priorTreatments'],
    content: `# Prior Authorization Support Letter

Requesting authorization for **{{serviceOrDrug}}** for **{{diagnosis}}**.

## Medical Necessity
{{medicalNecessityRationale}}

## Prior Treatment History
{{priorTreatmentSection}}

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-patient-treatment-summary',
    name: 'Patient-facing Treatment Summary (Spravato / Prior Auth)',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'Plain-language patient-facing summary for what Spravato is, why PA is needed, timeline, and day-of-visit monitoring notes.',
    tone: 'neutral',
    requiredFields: ['serviceOrDrug', 'duration', 'monitoringPlan'],
    content: `# Patient-facing Treatment Summary (Draft)

## What this treatment is
We discussed **{{serviceOrDrug}}** and why it may help with your condition.

## Why prior authorization is needed
Some insurance plans require approval before covering this treatment. Our clinic will submit a complete packet and follow up with the payer.

## Expected timeline & next steps
- We submitted/are preparing documents for insurance review.
- Typical timelines vary; we will update you when we hear back.
- If insurance requests more information, we may need additional forms or a brief follow-up.

## Monitoring and day-of-visit instructions
{{monitoringPlan}}

## Questions or safety concerns
If your symptoms worsen or you have safety concerns, contact your clinic or seek urgent care per local guidance.
`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-clinical-soap',
    name: 'SOAP Note Draft',
    category: 'Clinical note templates',
    specialty: 'General',
    description: 'SOAP draft populated from structured fields; for clinician review.',
    tone: 'neutral',
    requiredFields: ['diagnosis', 'serviceOrDrug'],
    content: `# SOAP Note (Draft)

## S: Subjective
{{subjective}}

## O: Objective
{{objective}}

## A: Assessment
Diagnosis: {{diagnosis}}

## P: Plan
- Treatment: {{serviceOrDrug}} ({{dosage}}, {{frequency}}, {{duration}})
- Follow-up: {{followUpPlan}}
`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-avs-standard',
    name: 'After Visit Summary (Patient-Friendly)',
    category: 'AVS templates',
    specialty: 'General',
    description: 'Plain-language AVS with plan and safety guidance.',
    tone: 'concise',
    requiredFields: ['serviceOrDrug', 'dosage', 'frequency'],
    content: `# After Visit Summary (Draft)

## Today’s Focus
We discussed your condition and treatment plan.

## Your Plan
- Medication/service: **{{serviceOrDrug}}**
- How to take/use: **{{dosage}}**, **{{frequency}}**
- Expected duration: **{{duration}}**

## What to watch for
{{patientSafetyNotes}}

## Next steps
{{nextSteps}}
`,
    createdAt: now(),
    updatedAt: now(),
  },
];
```

## src/lib/schema.ts

```
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
```

## src/lib/store.ts

```
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
```

## src/lib/portalText.ts

```
export function toPortalText(md: string): string {
  const s = md.replace(/\r\n/g, '\n');

  // Strip code blocks but keep their content (best-effort)
  let out = s.replace(/```([\s\S]*?)```/g, (_m, inner) => String(inner ?? '').trim());

  // Convert links: [text](url) -> text (url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => `${text} (${url})`);

  // Remove images
  out = out.replace(/!\[[^\]]*]\([^)]*\)/g, '');

  // Keep headings, but remove the leading hashes
  out = out.replace(/^#{1,6}\s+/gm, '');

  // Remove emphasis/backticks while keeping text
  out = out.replace(/(\*\*|__)(.*?)\1/g, '$2');
  out = out.replace(/(\*|_)(.*?)\1/g, '$2');
  out = out.replace(/`([^`]+)`/g, '$1');

  // Normalize list markers (keep as "- ")
  out = out.replace(/^\s*[*+]\s+/gm, '- ');

  // Trim trailing spaces per-line
  out = out
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, ''))
    .join('\n');

  // Collapse excessive blank lines (keep max 1 blank line)
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  return out;
}


```

## src/lib/demoTour.ts

```
import { driver, type Driver } from 'driver.js';

const TOUR_KEY = 'cw_guided_tour_state_v1';

export type TourState = {
  completed: boolean;
};

export function loadTourState(): TourState {
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    if (!raw) return { completed: false };
    const parsed = JSON.parse(raw) as TourState;
    return { completed: !!parsed.completed };
  } catch {
    return { completed: false };
  }
}

export function saveTourState(state: TourState) {
  localStorage.setItem(TOUR_KEY, JSON.stringify(state));
}

export function resetTourState() {
  localStorage.removeItem(TOUR_KEY);
}

export function startDashboardTour(): Driver {
  const d = driver({
    showProgress: true,
    allowClose: true,
    steps: [
      {
        element: '[data-tour="demo-card"]',
        popover: {
          title: 'Guided Demo（场景播放器）',
          description: '这是 Spravato TRD 拒付申诉的“一键跑通”演示入口，会把 Case→证据→文档→版本→状态流转串起来。',
        },
      },
      {
        element: '[data-tour="run-full-scenario"]',
        popover: {
          title: 'Run full scenario',
          description: '一键执行：创建固定案例 exampleCaseId、自动 Pin 证据、生成 PA Pack & Appeal、保存 v1、设置状态。',
        },
      },
      {
        element: '[data-tour="stepper"]',
        popover: {
          title: 'Stepper（每步产出可追踪）',
          description: '每步会显示 Done/Not started，并可跳转到对应模块继续演示与编辑。',
        },
      },
      {
        element: '[data-tour="outputs-preview"]',
        popover: {
          title: 'Outputs preview（产出物预览）',
          description: '直接预览当前 active case 的 PA Pack / Appeal 最新版本，并支持 Open / Copy / Export PDF。',
        },
      },
    ],
    onDestroyed: () => {
      // Keep state in localStorage
      saveTourState({ completed: true });
    },
  });

  d.drive();
  return d;
}


```

## src/lib/diff.ts

```
export type DiffOp = { type: 'add' | 'del' | 'same'; text: string };

function lcs(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

export function diffByLines(oldText: string, newText: string): DiffOp[] {
  const a = oldText.replace(/\r\n/g, '\n').split('\n');
  const b = newText.replace(/\r\n/g, '\n').split('\n');
  const dp = lcs(a, b);

  const ops: DiffOp[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', text: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'del', text: a[i - 1] });
      i--;
    } else {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: 'del', text: a[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.push({ type: 'add', text: b[j - 1] });
    j--;
  }

  ops.reverse();
  return ops;
}


```

## src/components/ui/Layout.tsx

```
import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShieldCheck, Mail, Stethoscope, 
  Search, Library, History, Settings, Activity 
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { ToastHost } from './ToastHost';
import { PrintModal } from '../print/PrintModal';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? 'bg-brand-50 text-brand-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};

const TITLE_MAP: Record<string, string> = {
  '/': '工作台总览',
  '/cases': 'Case Card（去标识化）',
  '/auth': '授权工作流（PA / Appeal）',
  '/letters': '信件工作台',
  '/clinical': '临床文书工作台',
  '/evidence': '证据检索与引用',
  '/templates': '模板库与规则',
  '/audit': '审计日志',
  '/settings': '设置',
};

export const Layout = () => {
  const { settings, seedDemoData, clearAllLocalData } = useStore();
  const location = useLocation();
  const title = TITLE_MAP[location.pathname] ?? 'Clinic Workspace';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col no-print">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-brand-600 hover:opacity-90" title="返回 Dashboard">
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">Clinic<span className="text-slate-900">Workspace</span></span>
          </Link>
          <div className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {settings.userRole} View
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="总览 Dashboard" />
          <NavItem to="/cases" icon={FileText} label="Case Cards" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">Workflows</div>
          <NavItem to="/auth" icon={ShieldCheck} label="Authorization Suite" />
          <NavItem to="/letters" icon={Mail} label="Letters Studio" />
          <NavItem to="/clinical" icon={Stethoscope} label="Clinical Output Studio" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">Resources</div>
          <NavItem to="/evidence" icon={Search} label="Evidence Retrieval" />
          <NavItem to="/templates" icon={Library} label="Template Library" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">System</div>
          <NavItem to="/audit" icon={History} label="Audit Log" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={seedDemoData}
            className="w-full px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            title="一键生成 3 个示例 Case（含精神科用药 PA 场景 + pinned evidence）"
          >
            Seed Demo Data（生成示例）
          </button>
          <button
            onClick={() => {
              if (confirm('确认清空本地数据？将删除 Case / 文档 / 模板 / 自定义证据（localStorage）。')) {
                clearAllLocalData();
              }
            }}
            className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            title="清空 localStorage"
          >
            Clear All Local Data
          </button>
          <div className="text-[11px] text-slate-500 leading-snug">
            Demo only：本项目不接后端，数据仅存浏览器 localStorage。
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print">
           <div className="min-w-0">
             <h1 className="text-xl font-semibold text-slate-800 truncate">{title}</h1>
             <div className="text-xs text-slate-500 truncate">
               临床材料与文书工作台 · Case Card → 模板/规则 → 可编辑文档（Copy / PDF / 版本 / 审计 / 引用）
             </div>
           </div>
           {settings.phiSafetyMode && (
             <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
               <ShieldCheck className="w-3 h-3" />
               PHI 安全模式已开启
             </div>
           )}
        </header>
        <div className="flex-1 overflow-auto p-8 relative" id="printable-area">
          <Outlet />
        </div>
      </main>

      <ToastHost />
      <PrintModal />
    </div>
  );
};
```

## src/components/ui/ToastHost.tsx

```
import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';

export const ToastHost: React.FC = () => {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => clearToast(), toast.durationMs ?? 2800);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const tone =
    toast.kind === 'success'
      ? 'bg-green-600'
      : toast.kind === 'warning'
        ? 'bg-amber-600'
        : toast.kind === 'error'
          ? 'bg-red-600'
          : 'bg-slate-900';

  return (
    <div className="fixed bottom-4 right-4 z-[60] no-print">
      <div className={`${tone} text-white shadow-lg rounded-lg px-4 py-3 text-sm font-semibold max-w-sm`}>
        {toast.message}
      </div>
    </div>
  );
};


```

## src/components/print/PrintModal.tsx

```
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Printer } from 'lucide-react';
import { useStore } from '@/lib/store';

export const PrintModal: React.FC = () => {
  const job = useStore((s) => s.printJob);
  const clear = useStore((s) => s.clearPrintJob);
  const getCaseById = useStore((s) => s.getCaseById);
  const getDocumentById = useStore((s) => s.getDocumentById);
  const templates = useStore((s) => s.templates);

  if (!job) return null;
  const doc = getDocumentById(job.docId);
  if (!doc) return null;

  const c = doc.caseId ? getCaseById(doc.caseId) : undefined;
  const template = doc.templateId ? templates.find((t) => t.id === doc.templateId) : undefined;
  const latestVersion = doc.versions?.[0];

  const headerCaseName = c?.serviceOrDrug || '(untitled case)';
  const headerTemplateName = template?.name || doc.templateId || '(no template)';
  const headerVersion = latestVersion?.label || 'current';
  const headerGeneratedAt = new Date(doc.updatedAt).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">Export PDF / Print Preview</div>
            <div className="text-xs text-slate-600 truncate">
              {headerCaseName} • {headerTemplateName} • {headerVersion} • {headerGeneratedAt}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
              onClick={() => window.print()}
              title="Use browser print to save as PDF"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button className="p-2 rounded hover:bg-slate-100" onClick={clear} title="Close">
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Printable */}
        <div className="p-6 overflow-auto max-h-[84vh] print-root">
          <div className="print-header">
            <div className="print-header__title">{headerCaseName}</div>
            <div className="print-header__meta">
              {headerTemplateName} • {headerVersion} • {headerGeneratedAt}
            </div>
          </div>

          <article className="prose prose-slate max-w-none print-prose">
            <ReactMarkdown>{doc.contentMd}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
};


```

## src/pages/Dashboard.tsx

```
import React, { useMemo } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, AlertTriangle, ClipboardCheck, TrendingUp, Save } from 'lucide-react';
import { computeCaseCompleteness, computeWorkspaceKpis } from '../lib/metrics';
import { toPortalText } from '../lib/portalText';
import { loadTourState, resetTourState, startDashboardTour } from '../lib/demoTour';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const {
    cases,
    auditLog,
    seedDemoData,
    seedUserCaseSpravatoTrdDenied,
    runFullScenario,
    resetScenario,
    clearAllLocalData,
    templates,
    setSettings,
    setCaseStatus,
    updateCase,
    generateForCase,
    activeCaseId,
    setActiveCaseId,
    getCaseById,
    getDocumentForCase,
    setPrintJob,
    showToast,
    guidedDemo,
  } = useStore();

  const activeCases = cases.filter((c) => !c.archivedAt);
  const pending = activeCases.filter(c => c.status === 'in_progress' || c.status === 'draft').length;
  const denied = activeCases.filter(c => c.status === 'denied' || c.status === 'appeal').length;
  const approved = activeCases.filter(c => c.status === 'approved').length;

  const kpis = useMemo(() => {
    return computeWorkspaceKpis(auditLog, activeCases.length, pending, denied);
  }, [auditLog, activeCases.length, pending, denied]);

  const attentionList = useMemo(() => {
    return activeCases
      .map((c) => {
        const comp = computeCaseCompleteness(c, templates);
        const needsAttention =
          c.status === 'denied' ||
          c.status === 'appeal' ||
          comp.percent < 80;
        return { c, comp, needsAttention };
      })
      .filter((x) => x.needsAttention)
      .sort((a, b) => (a.c.updatedAt < b.c.updatedAt ? 1 : -1))
      .slice(0, 6);
  }, [activeCases, templates]);

  const scenarioCaseId = guidedDemo.exampleCaseId;
  const scenarioCase = getCaseById(scenarioCaseId);

  const effectiveCaseId = activeCaseId ?? scenarioCaseId;
  const activeDemoCase = getCaseById(effectiveCaseId);
  const paDoc = activeDemoCase ? getDocumentForCase(activeDemoCase.id, 'pa_pack') : undefined;
  const appealDoc = activeDemoCase ? getDocumentForCase(activeDemoCase.id, 'appeal_letter') : undefined;

  const tourState = loadTourState();

  const stepStatus = useMemo(() => {
    const c = scenarioCase;
    const s = guidedDemo.steps;
    const step1 = c ? 'done' : s.step1;
    const step2 = c && (c.pinnedEvidenceIds?.length ?? 0) >= 3 ? 'done' : s.step2;
    const step3 = c && !!getDocumentForCase(c.id, 'pa_pack') ? 'done' : s.step3;
    const step4 = c && !!getDocumentForCase(c.id, 'appeal_letter') ? 'done' : s.step4;
    const step5 = c && (!!getDocumentForCase(c.id, 'soap_note') || !!getDocumentForCase(c.id, 'hpi_pe_mdm_note')) ? 'done' : s.step5;
    return { step1, step2, step3, step4, step5 };
  }, [scenarioCase, guidedDemo.steps, getDocumentForCase]);

  const previewText = (md?: string) => {
    if (!md) return '';
    return md.split('\n').slice(0, 10).join('\n');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 uppercase">Clinic Workspace</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">临床材料与文书工作台（Demo）</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              面向小诊所与专科门诊团队：用 <span className="font-semibold">去标识化 Case Card</span> 结构化录入关键信息，
              基于 <span className="font-semibold">模板库 + 规则引擎</span> 自动渲染 Prior Auth 材料包与申诉信，并生成缺件清单、风险提示与可追溯引用脚注。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/cases" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700">
                新建 / 查看 Case Cards <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50">
                进入授权工作流（PA / Appeal）<ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/evidence" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50">
                打开证据检索与 Pin 引用 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4" data-tour="demo-card">
            <div className="text-sm font-semibold text-slate-900">演示脚本（Spravato TRD 拒付申诉）</div>
            <div className="text-xs text-slate-600 mt-2 leading-relaxed">
              场景播放器：固定 <span className="font-mono">exampleCaseId</span>，一键跑通 Case → Evidence Pin → PA Pack/Appeal（v1）→ 状态。
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setSettings({ userRole: 'Admin' });
                  runFullScenario();
                  setActiveCaseId(scenarioCaseId);
                }}
                className="w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                data-tour="run-full-scenario"
              >
                Run full scenario
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => resetScenario()}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                >
                  Reset scenario
                </button>
                <button
                  onClick={() => {
                    if (tourState.completed) resetTourState();
                    startDashboardTour();
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                >
                  Start guided tour
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4" data-tour="stepper">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Stepper</div>
              <div className="space-y-2">
                {[
                  {
                    key: 'step1',
                    title: 'Step 1：Case Card（创建/补齐）',
                    status: stepStatus.step1,
                    go: () => {
                      setSettings({ userRole: 'Nurse' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/cases?caseId=${encodeURIComponent(id)}`;
                    },
                    summary: scenarioCase ? `已创建：${scenarioCase.serviceOrDrug}` : 'Not started',
                  },
                  {
                    key: 'step2',
                    title: 'Step 2：Evidence Pin（>=3）',
                    status: stepStatus.step2,
                    go: () => {
                      setSettings({ userRole: 'Doctor' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/evidence?caseId=${encodeURIComponent(id)}&q=${encodeURIComponent('esketamine TRD spravato')}`;
                    },
                    summary: scenarioCase ? `已 Pin：${scenarioCase.pinnedEvidenceIds.length} 条` : 'Not started',
                  },
                  {
                    key: 'step3',
                    title: 'Step 3：PA Pack（生成/版本）',
                    status: stepStatus.step3,
                    go: () => {
                      setSettings({ userRole: 'Admin' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/auth?caseId=${encodeURIComponent(id)}&tab=pa`;
                    },
                    summary: paDoc?.versions?.[0] ? `已保存：${paDoc.versions[0].label}` : (paDoc ? '已生成（未保存版本）' : 'Not started'),
                  },
                  {
                    key: 'step4',
                    title: 'Step 4：Appeal（生成/版本/diff）',
                    status: stepStatus.step4,
                    go: () => {
                      setSettings({ userRole: 'Doctor' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/auth?caseId=${encodeURIComponent(id)}&tab=appeal`;
                    },
                    summary: appealDoc?.versions?.[0] ? `已保存：${appealDoc.versions[0].label}` : (appealDoc ? '已生成（未保存版本）' : 'Not started'),
                  },
                  {
                    key: 'step5',
                    title: 'Step 5：Clinical QA（SOAP/MDM）',
                    status: stepStatus.step5,
                    go: () => {
                      setSettings({ userRole: 'Nurse' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/clinical?caseId=${encodeURIComponent(id)}&preset=mdm`;
                    },
                    summary: '生成后点击 Mark addressed 写入 Audit Log',
                  },
                ].map((s) => (
                  <div key={s.key} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{s.summary}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${
                          s.status === 'done'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {s.status === 'done' ? 'Done' : 'Not started'}
                        </span>
                        <button
                          className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                          onClick={s.go}
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4" data-tour="outputs-preview">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Outputs preview（active case）</div>
              <div className="space-y-3">
                {[
                  { label: 'PA Pack', doc: paDoc, tab: 'pa' as const },
                  { label: 'Appeal Letter', doc: appealDoc, tab: 'appeal' as const },
                ].map(({ label, doc, tab }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {doc ? `updatedAt ${new Date(doc.updatedAt).toLocaleString()} • versions ${doc.versions?.length ?? 0}` : '尚未生成'}
                    </div>
                    <pre className="mt-2 text-[11px] bg-slate-50 border border-slate-200 rounded p-2 whitespace-pre-wrap max-h-28 overflow-auto">
                      {doc ? previewText(doc.contentMd) : '—'}
                    </pre>
                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={() => {
                          if (!activeDemoCase) return;
                          location.hash = `#/auth?caseId=${encodeURIComponent(activeDemoCase.id)}&tab=${tab}`;
                        }}
                        disabled={!doc || !activeDemoCase}
                      >
                        Open
                      </button>
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={async () => {
                          if (!doc) return;
                          await navigator.clipboard.writeText(toPortalText(doc.contentMd));
                          showToast(`已复制 ${label}（Portal text）`, { kind: 'success' });
                        }}
                        disabled={!doc}
                      >
                        Copy for Portal
                      </button>
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={() => {
                          if (!doc) return;
                          setPrintJob({ docId: doc.id });
                        }}
                        disabled={!doc}
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              说明：该 Demo 仅前端本地运行（localStorage）；角色切换为模拟协作；引用编号按 pinned evidence 顺序确定性生成。
            </div>
          </div>

          {activeCases.length === 0 ? (
            <div className="w-full max-w-sm bg-brand-50 border border-brand-100 rounded-xl p-4">
              <div className="text-sm font-semibold text-brand-800">快速开始（演示用）</div>
              <div className="text-xs text-brand-800/80 mt-2 leading-relaxed">
                你可以一键生成 3 个精神科用药 PA 场景 Case（含拒付理由与 pinned evidence），用来演示“找材料 → 拼叙事 → 补缺件 → 改稿 → 导出”的全流程。
              </div>
              <button
                onClick={seedDemoData}
                className="mt-3 w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
              >
                Seed Demo Data（生成 3 个示例 Case）
              </button>
              <div className="mt-2 text-[11px] text-brand-800/70">
                所有数据仅保存在浏览器 localStorage，不接任何后端。
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="活跃 Case" value={activeCases.length} icon={FileText} color="bg-blue-500" />
        <StatCard label="待处理（草稿/进行中）" value={pending} icon={Clock} color="bg-amber-500" />
        <StatCard label="拒付/申诉中" value={denied} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="已通过" value={approved} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="生成文档（累计）" value={kpis.docsGenerated} icon={ClipboardCheck} color="bg-slate-700" />
        <StatCard label="版本快照（累计）" value={kpis.versionsSaved} icon={Save} color="bg-slate-700" />
        <StatCard label="复制/导出（累计）" value={kpis.copies + kpis.exports} icon={ArrowRight} color="bg-slate-700" />
        <StatCard label="预估节省分钟（Demo）" value={kpis.estimatedMinutesSaved} icon={TrendingUp} color="bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">最近活动（审计日志）</h2>
            <Link to="/audit" className="text-sm text-brand-600 hover:underline">查看全部</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLog.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex gap-3 text-sm">
                <span className="text-slate-400 font-mono text-xs w-20 pt-1">
                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{log.summary}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{log.actorRole} • {log.actionType}</p>
                </div>
              </div>
            ))}
            {auditLog.length === 0 && <div className="p-8 text-center text-slate-500">暂无活动记录。</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">需要关注的 Case（缺件 / 拒付 / 申诉）</h2>
            <Link to="/cases" className="text-sm text-brand-600 hover:underline">打开 Case Cards</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {attentionList.map(({ c, comp }) => (
              <div key={c.id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{c.serviceOrDrug || '(未命名)'}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{c.diagnosis || '(未填写诊断)'} • 状态：{c.status}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${
                      comp.tone === 'green'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : comp.tone === 'amber'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      完整度 {comp.percent}%
                    </span>
                    {comp.missing.slice(0, 3).map((m) => (
                      <span key={m} className="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                        缺：{m}
                      </span>
                    ))}
                    {comp.missing.length > 3 ? (
                      <span className="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                        +{comp.missing.length - 3}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/auth?caseId=${encodeURIComponent(c.id)}`}
                    className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 text-center"
                  >
                    去生成/改稿
                  </Link>
                  <Link
                    to={`/evidence?caseId=${encodeURIComponent(c.id)}`}
                    className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 text-center"
                  >
                    补证据（Pin）
                  </Link>
                </div>
              </div>
            ))}
            {attentionList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">当前没有需要特别关注的 Case。</div>
            ) : null}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              提示：完整度基于默认 PA Pack 模板 requiredFields + 规则引擎缺件检查（确定性）。
            </div>
            <button
              onClick={() => {
                if (confirm('确认清空本地数据？将删除 Case / 文档 / 模板 / 自定义证据（localStorage）。')) {
                  clearAllLocalData();
                }
              }}
              className="text-xs text-slate-500 hover:text-red-600"
            >
              清空工作区数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## src/pages/CaseCards.tsx

```
import React, { useMemo, useState } from 'react';
import { Archive, Copy, Plus, Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../lib/store';
import { CASE_STATUS_LABELS, RISK_FACTOR_LABELS } from '../lib/constants';
import type { CaseCard, CaseStatus, RiskFactorKey } from '../lib/schema';
import { computeCaseCompleteness } from '../lib/metrics';
import { Link, useSearchParams } from 'react-router-dom';

function looksLikePHI(s: string): boolean {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phone = /\b(\+?\d[\d\s().-]{7,}\d)\b/;
  return email.test(s) || phone.test(s);
}

const STATUS_OPTIONS: CaseStatus[] = ['draft', 'in_progress', 'submitted', 'denied', 'appeal', 'approved'];
const RISK_KEYS: RiskFactorKey[] = ['suicidality', 'hospitalizationHistory', 'substanceUse', 'comorbidities'];

type EditableCase = Omit<CaseCard, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

function makeBlankDraft(): EditableCase {
  return {
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
    pinnedEvidenceIds: [],
  };
}

const CaseModal: React.FC<{
  open: boolean;
  onClose: () => void;
  value: EditableCase;
  onSave: (v: EditableCase) => void;
  phiSafetyMode: boolean;
  focusField?: string | null;
}> = ({ open, onClose, value, onSave, phiSafetyMode, focusField }) => {
  const [draft, setDraft] = useState<EditableCase>(value);

  React.useEffect(() => setDraft(value), [value, open]);
  React.useEffect(() => {
    if (!open) return;
    if (!focusField) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-field="${focusField}"]`) as HTMLElement | null;
      el?.focus?.();
      el?.scrollIntoView?.({ block: 'center' });
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, focusField]);
  if (!open) return null;

  const warn = phiSafetyMode && looksLikePHI(JSON.stringify(draft));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Case Card (De-identified)</div>
            <div className="font-bold text-slate-900">{draft.id ? 'Edit Case' : 'New Case'}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <div className="font-semibold">PHI Warning</div>
            Please do <span className="font-semibold">not</span> enter patient name, MRN, phone, email, or other identifiers. Use de-identified demo content only.
            {warn ? <div className="mt-2 font-semibold">Potential PHI detected — please review.</div> : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specialty</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={draft.specialty}
                    onChange={(e) => setDraft((d) => ({ ...d, specialty: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={draft.status}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as CaseStatus }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {CASE_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</label>
                <input
                  className="w-full p-2 border rounded-md"
                  value={draft.diagnosis}
                  onChange={(e) => setDraft((d) => ({ ...d, diagnosis: e.target.value }))}
                  placeholder="ICD-10 or free text (no PHI)"
                  data-field="diagnosis"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service / Drug</label>
                  <input
                    className="w-full p-2 border rounded-md font-semibold"
                    value={draft.serviceOrDrug}
                    onChange={(e) => setDraft((d) => ({ ...d, serviceOrDrug: e.target.value }))}
                    data-field="serviceOrDrug"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Severity (optional)</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={draft.severity ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}
                    placeholder="e.g., PHQ-9: 22"
                    data-field="severity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dosage</label>
                  <input className="w-full p-2 border rounded-md" value={draft.dosage} onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))} data-field="dosage" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Frequency</label>
                  <input className="w-full p-2 border rounded-md" value={draft.frequency} onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))} data-field="frequency" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration</label>
                  <input className="w-full p-2 border rounded-md" value={draft.duration} onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))} data-field="duration" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Factors (checkboxes)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {RISK_KEYS.map((k) => {
                    const checked = draft.riskFactors.includes(k);
                    return (
                      <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              riskFactors: checked ? d.riskFactors.filter((x) => x !== k) : [...d.riskFactors, k],
                            }))
                          }
                        />
                        {RISK_FACTOR_LABELS[k]}
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-2">
                  {draft.riskFactors.map((k) => (
                    <div key={k}>
                      <div className="text-xs text-slate-600 mb-1">Note: {RISK_FACTOR_LABELS[k]}</div>
                      <input
                        className="w-full p-2 border rounded-md text-sm"
                        value={draft.riskFactorNotes?.[k] ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            riskFactorNotes: { ...(d.riskFactorNotes ?? {}), [k]: e.target.value },
                          }))
                        }
                        placeholder="Optional context (no PHI)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Clinical narrative (recommended)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Visit date (YYYY-MM-DD)</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.visitDate ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, visitDate: e.target.value }))}
                      placeholder="2025-12-10"
                      data-field="visitDate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Payer reference # (optional)</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payerReferenceNumber ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, payerReferenceNumber: e.target.value }))}
                      placeholder="Portal ref # (no PHI)"
                      data-field="payerReferenceNumber"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Functional impairment</label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={draft.functionalImpairment ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, functionalImpairment: e.target.value }))}
                      placeholder="Describe functional impact (work/school/ADLs) without identifiers"
                      data-field="functionalImpairment"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">MSE summary</label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={draft.mseSummary ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, mseSummary: e.target.value }))}
                      placeholder="Key MSE points (de-identified)"
                      data-field="mseSummary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Monitoring / REMS-style plan</label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={3}
                      value={draft.monitoringPlan ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, monitoringPlan: e.target.value }))}
                      placeholder="Observation, vitals, safety plan, follow-up timing (no PHI)"
                      data-field="monitoringPlan"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Prior Treatments</div>
                <div className="space-y-2">
                  {draft.priorTreatments.map((t, idx) => (
                    <div key={t.id} className="grid grid-cols-12 gap-2 items-start">
                      <input
                        className="col-span-4 p-2 border rounded-md text-sm"
                        placeholder="Name"
                        value={t.name}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)),
                          }))
                        }
                      />
                      <select
                        className="col-span-3 p-2 border rounded-md text-sm"
                        value={t.outcome}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, outcome: e.target.value as any } : x)),
                          }))
                        }
                      >
                        <option value="failed">failed</option>
                        <option value="intolerant">intolerant</option>
                        <option value="contraindicated">contraindicated</option>
                        <option value="ineffective">ineffective</option>
                      </select>
                      <input
                        className="col-span-4 p-2 border rounded-md text-sm"
                        placeholder="Note"
                        value={t.note}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, note: e.target.value } : x)),
                          }))
                        }
                      />
                      <button
                        className="col-span-1 p-2 rounded hover:bg-red-50 text-red-600"
                        onClick={() =>
                          setDraft((d) => ({ ...d, priorTreatments: d.priorTreatments.filter((x) => x.id !== t.id) }))
                        }
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        priorTreatments: [...d.priorTreatments, { id: uuidv4(), name: '', outcome: 'failed', note: '' }],
                      }))
                    }
                  >
                    + Add prior treatment
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Payer (optional)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Payer Name</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.payerName ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), payerName: e.target.value },
                        }))
                      }
                      data-field="payer.payerName"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Plan Type</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.planType ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), planType: e.target.value },
                        }))
                      }
                      data-field="payer.planType"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Denial Reason Code</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.denialReasonCode ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), denialReasonCode: e.target.value },
                        }))
                      }
                      data-field="payer.denialReasonCode"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Denial Text</label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={draft.payer?.denialText ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), denialText: e.target.value },
                        }))
                      }
                      data-field="payer.denialText"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Attachments (placeholders)</div>
                <div className="space-y-2">
                  {draft.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <input
                        className="flex-1 p-2 border rounded-md text-sm"
                        value={a.label}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            attachments: d.attachments.map((x) => (x.id === a.id ? { ...x, label: e.target.value } : x)),
                          }))
                        }
                      />
                      <button
                        className="px-3 py-2 rounded hover:bg-red-50 text-red-600"
                        onClick={() => setDraft((d) => ({ ...d, attachments: d.attachments.filter((x) => x.id !== a.id) }))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        attachments: [...d.attachments, { id: uuidv4(), label: 'New attachment placeholder', addedAt: Date.now() }],
                      }))
                    }
                  >
                    + Add attachment placeholder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 bg-brand-600 text-white rounded-md font-semibold hover:bg-brand-700"
          >
            Save Case
          </button>
        </div>
      </div>
    </div>
  );
};

export const CaseCards: React.FC = () => {
  const { cases, settings, createCase, updateCase, duplicateCase, archiveCase, restoreCase, templates } = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string>(cases[0]?.id ?? '');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState<EditableCase>(makeBlankDraft());
  const [modalFocusField, setModalFocusField] = useState<string | null>(null);

  React.useEffect(() => {
    const caseId = params.get('caseId');
    const edit = params.get('edit');
    const focus = params.get('focus');
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedId(caseId);
      if (edit === '1') {
        const c = cases.find((x) => x.id === caseId)!;
        const { id, createdAt, updatedAt, ...rest } = c;
        setModalValue({ id, ...rest });
        setModalFocusField(focus);
        setModalOpen(true);
      }
    }
  }, [params, cases]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cases
      .filter((c) => (showArchived ? true : !c.archivedAt))
      .filter((c) => (!statusFilter ? true : c.status === statusFilter))
      .filter((c) => {
        if (!query) return true;
        return (
          c.serviceOrDrug.toLowerCase().includes(query) ||
          c.diagnosis.toLowerCase().includes(query) ||
          c.specialty.toLowerCase().includes(query) ||
          (c.payer?.payerName ?? '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cases, q, showArchived, statusFilter]);

  const selected = cases.find((c) => c.id === selectedId) ?? filtered[0] ?? null;
  const selectedCompleteness = selected ? computeCaseCompleteness(selected, templates) : null;

  const openNew = () => {
    setModalValue(makeBlankDraft());
    setModalFocusField(null);
    setModalOpen(true);
  };

  const openEdit = (c: CaseCard) => {
    const { id, createdAt, updatedAt, ...rest } = c;
    setModalValue({ id, ...rest });
    setModalFocusField(null);
    setModalOpen(true);
  };

  const onSave = (v: EditableCase) => {
    if (v.id) {
      updateCase(v.id, v as any);
    } else {
      const id = createCase(v as any);
      setSelectedId(id);
    }
    setModalOpen(false);
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Case Cards</div>
              <div className="font-bold text-slate-900">De-identified workspace</div>
            </div>
            <button
              onClick={openNew}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder="Search specialty, diagnosis, drug, payer..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <select
              className="flex-1 p-2 border rounded-md text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {CASE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <label className="text-sm text-slate-600 flex items-center gap-2">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
              Archived
            </label>
          </div>
          {settings.phiSafetyMode ? (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              PHI Safety Mode is ON — do not enter names/MRN/phone/email.
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            Cases ({filtered.length})
          </div>
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${
                  selected?.id === c.id ? 'bg-brand-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{c.serviceOrDrug || '(untitled)'}</div>
                    <div className="text-xs text-slate-500 truncate">{c.diagnosis || '(no diagnosis)'}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200">
                      {CASE_STATUS_LABELS[c.status]}
                    </span>
                    {(() => {
                      const comp = computeCaseCompleteness(c, templates);
                      const cls =
                        comp.tone === 'green'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : comp.tone === 'amber'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-red-50 border-red-200 text-red-700';
                      return (
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${cls}`} title={`Missing: ${comp.missing.join(', ')}`}>
                          完整度 {comp.percent}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {c.specialty} • {c.payer?.payerName ?? 'No payer'} • {c.pinnedEvidenceIds.length} pins
                </div>
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No cases. Seed demo data in Settings or create a new case.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!selected ? (
            <div className="p-10 text-center text-slate-400">Select a case to view details.</div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Case Details</div>
                  <div className="font-bold text-slate-900 truncate">{selected.serviceOrDrug || '(untitled)'}</div>
                  <div className="text-xs text-slate-500 truncate">{selected.diagnosis || '(no diagnosis)'}</div>
                  {selectedCompleteness ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200">
                        完整度 {selectedCompleteness.percent}%
                      </span>
                      {selectedCompleteness.missing.slice(0, 4).map((m) => (
                        <span key={m} className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800">
                          缺：{m}
                        </span>
                      ))}
                      {selectedCompleteness.missing.length > 4 ? (
                        <span className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800">
                          +{selectedCompleteness.missing.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2 no-print">
                  <Link
                    to={`/auth?caseId=${encodeURIComponent(selected.id)}`}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                    title="跳转到 PA / Appeal 生成与改稿"
                  >
                    去授权工作流
                  </Link>
                  <button
                    onClick={() => duplicateCase(selected.id)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  {selected.archivedAt ? (
                    <button
                      onClick={() => restoreCase(selected.id)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveCase(selected.id)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(selected)}
                    className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Core</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div><span className="text-slate-500">Specialty:</span> {selected.specialty}</div>
                      <div><span className="text-slate-500">Dose:</span> {selected.dosage || '-'}</div>
                      <div><span className="text-slate-500">Frequency:</span> {selected.frequency || '-'}</div>
                      <div><span className="text-slate-500">Duration:</span> {selected.duration || '-'}</div>
                      <div><span className="text-slate-500">Severity:</span> {selected.severity || '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Prior treatments</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selected.priorTreatments.length ? (
                        <ul className="list-disc list-inside">
                          {selected.priorTreatments.map((t) => (
                            <li key={t.id}>
                              <span className="font-semibold">{t.name}</span> — <span className="text-slate-600">{t.outcome}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500">No prior treatments recorded.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Payer</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div><span className="text-slate-500">Payer:</span> {selected.payer?.payerName ?? '-'}</div>
                      <div><span className="text-slate-500">Plan:</span> {selected.payer?.planType ?? '-'}</div>
                      <div><span className="text-slate-500">Denial code:</span> {selected.payer?.denialReasonCode ?? '-'}</div>
                      <div className="mt-2"><span className="text-slate-500">Denial text:</span> {selected.payer?.denialText ?? '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Evidence pins</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-700">{selected.pinnedEvidenceIds.length} pinned evidence items</div>
                      <div className="text-xs text-slate-500 mt-1">Manage pins in Evidence Retrieval.</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Attachments</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selected.attachments.length ? (
                        <ul className="list-disc list-inside">
                          {selected.attachments.map((a) => (
                            <li key={a.id}>{a.label}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500">No attachment placeholders.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={modalValue}
        onSave={onSave}
        phiSafetyMode={settings.phiSafetyMode}
        focusField={modalFocusField}
      />
    </div>
  );
};
```

## src/pages/AuthSuite.tsx

```
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { AlertCircle, Copy, Download, Save, X } from 'lucide-react';
import { useStore } from '../lib/store';
import type { CaseStatus, DocumentKind } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { useSearchParams } from 'react-router-dom';
import { diffByLines } from '../lib/diff';
import { toPortalText } from '../lib/portalText';

const STATUSES: CaseStatus[] = ['draft', 'in_progress', 'submitted', 'denied', 'appeal', 'approved'];

export const AuthSuite: React.FC = () => {
  const {
    cases,
    setCaseStatus,
    getCaseById,
    getDocumentForCase,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    templates,
    log,
    updateCase,
    setPrintJob,
    showToast,
    getEvidenceAll,
  } = useStore();

  const [params] = useSearchParams();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const activeCase = getCaseById(selectedCaseId);
  const paSectionRef = useRef<HTMLDivElement | null>(null);
  const appealSectionRef = useRef<HTMLDivElement | null>(null);

  const paDoc = activeCase ? getDocumentForCase(activeCase.id, 'pa_pack') : undefined;
  const appealDoc = activeCase ? getDocumentForCase(activeCase.id, 'appeal_letter') : undefined;

  const evidenceAll = getEvidenceAll();
  const evidenceById = useMemo(() => new Map(evidenceAll.map((e) => [e.id, e])), [evidenceAll]);
  const [drawerEvidenceId, setDrawerEvidenceId] = useState<string | null>(null);
  const drawerEvidence = drawerEvidenceId ? evidenceById.get(drawerEvidenceId) : undefined;

  const authTemplates = useMemo(
    () => templates.filter((t) => t.category === 'Authorization templates'),
    [templates],
  );

  const paTemplates = useMemo(
    () => authTemplates.filter((t) => t.id.includes('pa-pack') || /PA Evidence Pack/i.test(t.name)),
    [authTemplates],
  );
  const appealTemplates = useMemo(
    () => authTemplates.filter((t) => t.id.includes('appeal') || /Appeal/i.test(t.name)),
    [authTemplates],
  );

  const [paTemplateId, setPaTemplateId] = useState<string>('tmpl-auth-pa-pack-psychiatry-spravato-commercial');
  const [appealTemplateId, setAppealTemplateId] = useState<string>('tmpl-auth-appeal-aetna-formal');
  const [activeDragCaseId, setActiveDragCaseId] = useState<string | null>(null);

  useEffect(() => {
    const caseId = params.get('caseId');
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedCaseId(caseId);
    }
  }, [params, cases]);

  useEffect(() => {
    const tab = params.get('tab');
    if (tab === 'appeal') {
      setTimeout(() => appealSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    if (tab === 'pa') {
      setTimeout(() => paSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [params]);

  const handleGenerate = (kind: DocumentKind) => {
    if (!activeCase) return;
    if (kind === 'pa_pack') generateForCase(activeCase.id, kind, { templateId: paTemplateId });
    else if (kind === 'appeal_letter') generateForCase(activeCase.id, kind, { templateId: appealTemplateId });
    else generateForCase(activeCase.id, kind);
  };

  const handleCopy = async (kind: DocumentKind) => {
    if (!activeCase) return;
    const doc = getDocumentForCase(activeCase.id, kind);
    if (!doc) return;
    await navigator.clipboard.writeText(toPortalText(doc.contentMd));
    log({
      actionType: 'copy',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Copied ${kind} to clipboard`,
    });
    showToast('已复制为 Portal 纯文本（保留标题与列表）', { kind: 'success' });
  };

  const handleExport = (docId: string, label: string) => {
    log({ actionType: 'export', entityType: 'Document', entityId: docId, summary: `Exported ${label} via print` });
    setPrintJob({ docId });
  };

  const buildChecklist = (docKind: DocumentKind, docMissing: string[]) => {
    if (!activeCase) return { required: [], recommended: [] };
    const required = Array.from(new Set(docMissing));

    // Recommended (demo heuristics)
    const rec: string[] = [];
    if (!activeCase.visitDate) rec.push('visitDate');
    if (!activeCase.mseSummary) rec.push('mseSummary');
    if (!activeCase.functionalImpairment) rec.push('functionalImpairment');
    if (!activeCase.monitoringPlan) rec.push('monitoringPlan');
    if (!activeCase.payerReferenceNumber) rec.push('payerReferenceNumber');

    // Evidence pins are required for demo citations
    if ((activeCase.pinnedEvidenceIds?.length ?? 0) < 3) {
      if (!required.includes('evidencePins')) required.push('evidencePins');
    }
    if (docKind === 'appeal_letter' && !activeCase.payer?.denialText) {
      if (!required.includes('payer.denialText')) required.push('payer.denialText');
    }

    const recommended = rec.filter((x) => !required.includes(x));
    return { required, recommended };
  };

  const fixItem = (item: string) => {
    if (!activeCase) return;
    const caseId = activeCase.id;

    if (item === 'evidencePins') {
      location.hash = `#/evidence?caseId=${encodeURIComponent(caseId)}&q=${encodeURIComponent('esketamine TRD spravato')}`;
      return;
    }
    if (item.toLowerCase().includes('mse') || item === 'mseSummary') {
      location.hash = `#/clinical?caseId=${encodeURIComponent(caseId)}&preset=mdm`;
      return;
    }
    if (item === 'monitoringPlan') {
      location.hash = `#/clinical?caseId=${encodeURIComponent(caseId)}&preset=soap`;
      return;
    }
    // Default: jump to Case Cards and focus field (edit modal focuses)
    location.hash = `#/cases?caseId=${encodeURIComponent(caseId)}&edit=1&focus=${encodeURIComponent(item)}`;
  };

  const [diffOpen, setDiffOpen] = useState(false);
  const [diffTitle, setDiffTitle] = useState('');
  const [diffOps, setDiffOps] = useState<ReturnType<typeof diffByLines>>([]);

  const openDiff = (docId: string, versionContent: string, label: string) => {
    const doc =
      paDoc?.id === docId ? paDoc : appealDoc?.id === docId ? appealDoc : undefined;
    const current = doc?.contentMd ?? '';
    setDiffOps(diffByLines(versionContent, current));
    setDiffTitle(`Diff: ${label} → Current`);
    setDiffOpen(true);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDragCaseId(null);
    const caseId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : '';
    if (!overId) return;
    if (!STATUSES.includes(overId as any)) return;
    setCaseStatus(caseId, overId as CaseStatus);
  };

  const KanbanColumn: React.FC<{ status: CaseStatus; onSelect: (caseId: string) => void }> = ({
    status,
    onSelect,
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const items = cases.filter((c) => !c.archivedAt && c.status === status);

    return (
      <div
        ref={setNodeRef}
        className={`w-72 rounded-xl border flex-shrink-0 ${
          isOver ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase">{status.replace('_', ' ')}</div>
          <div className="text-xs px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            {items.length}
          </div>
        </div>
        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          {items.map((c) => (
            <KanbanCard key={c.id} caseId={c.id} title={c.serviceOrDrug} subtitle={c.diagnosis} onSelect={onSelect} />
          ))}
          {items.length === 0 ? <div className="p-3 text-xs text-slate-400">Drop here</div> : null}
        </div>
      </div>
    );
  };

  const KanbanCard: React.FC<{
    caseId: string;
    title: string;
    subtitle: string;
    onSelect: (caseId: string) => void;
  }> = ({ caseId, title, subtitle, onSelect }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: caseId });
    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 rounded-lg border cursor-pointer select-none ${
          isDragging ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
        onClick={() => onSelect(caseId)}
        {...listeners}
        {...attributes}
      >
        <div className="text-sm font-bold text-slate-900 truncate">{title || '(untitled)'}</div>
        <div className="text-xs text-slate-500 truncate">{subtitle || '(no diagnosis)'}</div>
      </div>
    );
  };

  const DragCardOverlay: React.FC<{ caseId: string }> = ({ caseId }) => {
    const c = getCaseById(caseId);
    if (!c) return null;
    return (
      <div className="p-3 rounded-lg border border-brand-300 bg-white shadow-soft w-72">
        <div className="text-sm font-bold text-slate-900 truncate">{c.serviceOrDrug || '(untitled)'}</div>
        <div className="text-xs text-slate-500 truncate">{c.diagnosis || '(no diagnosis)'}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Active Case</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Status tracking board (drag & drop)
            </label>
            <DndContext
              onDragStart={(e) => setActiveDragCaseId(String(e.active.id))}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveDragCaseId(null)}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {STATUSES.map((s) => (
                  <KanbanColumn
                    key={s}
                    status={s}
                    onSelect={(id) => {
                      setSelectedCaseId(id);
                    }}
                  />
                ))}
              </div>
              <DragOverlay>{activeDragCaseId ? <DragCardOverlay caseId={activeDragCaseId} /> : null}</DragOverlay>
            </DndContext>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          This module demonstrates <span className="font-semibold">PA Evidence Pack</span> +{' '}
          <span className="font-semibold">Appeal Writer</span> workflow. Outputs are deterministic (templates + rules + pinned evidence).
        </div>
      </div>

      {!activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          No active case selected. Seed demo data in Settings, then come back here.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* PA Pack */}
          <div ref={paSectionRef} className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">PA Evidence Pack</div>
                <div className="font-bold text-slate-900">{activeCase.serviceOrDrug || '(untitled)'}</div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <select
                  className="p-2 border rounded-md text-sm"
                  value={paTemplateId}
                  onChange={(e) => setPaTemplateId(e.target.value)}
                  title="Select PA pack template"
                >
                  {(paTemplates.length ? paTemplates : authTemplates).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerate('pa_pack')}
                  className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                >
                  Generate
                </button>
                <button
                  onClick={() => (paDoc ? saveDocumentVersion(paDoc.id, '') : undefined)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                  title="Save a snapshot version"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Version
                </button>
              </div>
            </div>

            {paDoc?.missingInfoChecklist?.length ? (
              <div className="p-4 border-b border-slate-100 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Missing info checklist
                </div>
                {(() => {
                  const ck = buildChecklist('pa_pack', paDoc.missingInfoChecklist);
                  const renderItems = (items: string[]) => (
                    <div className="space-y-1">
                      {items.map((m) => (
                        <div key={m} className="flex items-center justify-between gap-2 bg-amber-100 border border-amber-200 rounded px-2 py-1">
                          <div className="text-xs text-amber-900">{m}</div>
                          <button
                            className="px-2 py-1 text-[11px] rounded border border-amber-300 hover:bg-amber-50"
                            onClick={() => fixItem(m)}
                          >
                            Fix
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <div className="text-[11px] font-semibold text-amber-900 uppercase mb-1">Required missing</div>
                        {ck.required.length ? renderItems(ck.required) : <div className="text-xs text-amber-800">None</div>}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-amber-900 uppercase mb-1">Recommended missing</div>
                        {ck.recommended.length ? renderItems(ck.recommended) : <div className="text-xs text-amber-800">None</div>}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <div className="p-4 border-b border-slate-100 bg-white text-xs text-slate-600">
              <div className="font-semibold mb-1">Risk warnings / disclaimers</div>
              <ul className="list-disc list-inside">
                {(paDoc?.riskWarnings?.length ? paDoc.riskWarnings : ['Generate to see disclaimers.']).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white no-print">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Submission / Payer reference (Admin workflow)</div>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-64">
                  <label className="block text-xs text-slate-600 mb-1">Payer reference #</label>
                  <input
                    className="w-full p-2 border rounded-md text-sm"
                    value={activeCase.payerReferenceNumber ?? ''}
                    onChange={(e) => updateCase(activeCase.id, { payerReferenceNumber: e.target.value })}
                    placeholder="Portal reference # (no PHI)"
                  />
                </div>
                <div className="flex-1 min-w-64">
                  <label className="block text-xs text-slate-600 mb-1">Status</label>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-md border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                      onClick={() => setCaseStatus(activeCase.id, 'submitted')}
                    >
                      Mark Submitted
                    </button>
                    <button
                      className="px-3 py-2 rounded-md border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                      onClick={() => setCaseStatus(activeCase.id, 'approved')}
                    >
                      Mark Approved
                    </button>
                    <button
                      className="px-3 py-2 rounded-md border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                      onClick={() => setCaseStatus(activeCase.id, 'denied')}
                    >
                      Mark Denied
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                提示：拖拽看板用于团队跟踪；这里提供演示用的快速按钮，并记录到 Audit Log。
              </div>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={paDoc?.contentMd ?? ''}
                onChange={(v) => (paDoc ? updateDocumentContent(paDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic PA pack output..."
                heightClassName="h-[32rem]"
              />
              {paDoc?.citations?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">References</div>
                  <div className="space-y-2">
                    {paDoc.citations.map((c) => {
                      const ev = evidenceById.get(c.evidenceId);
                      return (
                        <button
                          key={`${c.footnoteNumber}-${c.evidenceId}`}
                          className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                          onClick={() => setDrawerEvidenceId(c.evidenceId)}
                          title="Open evidence details"
                        >
                          <div className="text-sm font-semibold text-slate-800">
                            [{c.footnoteNumber}] {ev?.title ?? c.evidenceId}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ev ? `${ev.sourceName} • ${ev.year} • ${ev.strengthLevel}` : 'Evidence not found'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {paDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paDoc.versions.map((v) => (
                      <div key={v.id} className="w-full p-2 rounded-md border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            className="text-left min-w-0"
                            onClick={() => updateDocumentContent(paDoc.id, v.contentMd)}
                            title="Load this version into editor"
                          >
                            <div className="text-sm font-semibold text-slate-800 truncate">{v.label}</div>
                            <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                          </button>
                          <button
                            className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                            onClick={() => openDiff(paDoc.id, v.contentMd, v.label)}
                            title="Compare version vs current"
                          >
                            Diff
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 flex gap-2 no-print">
                <button
                  onClick={() => handleCopy('pa_pack')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                >
                  <Copy className="w-4 h-4" />
                  Copy for Portal
                </button>
                <button
                  onClick={() => {
                    if (!paDoc) return;
                    handleExport(paDoc.id, 'PA pack');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Appeal */}
          <div ref={appealSectionRef} className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Appeal Letter</div>
                <div className="font-bold text-slate-900">{activeCase.payer?.payerName || 'Payer (not set)'}</div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <select
                  className="p-2 border rounded-md text-sm"
                  value={appealTemplateId}
                  onChange={(e) => setAppealTemplateId(e.target.value)}
                  title="Select appeal template"
                >
                  {(appealTemplates.length ? appealTemplates : authTemplates).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerate('appeal_letter')}
                  className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                >
                  Generate
                </button>
                <button
                  onClick={() => (appealDoc ? saveDocumentVersion(appealDoc.id, '') : undefined)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Version
                </button>
              </div>
            </div>

            {appealDoc?.missingInfoChecklist?.length ? (
              <div className="p-4 border-b border-slate-100 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Missing info checklist
                </div>
                {(() => {
                  const ck = buildChecklist('appeal_letter', appealDoc.missingInfoChecklist);
                  const renderItems = (items: string[]) => (
                    <div className="space-y-1">
                      {items.map((m) => (
                        <div key={m} className="flex items-center justify-between gap-2 bg-amber-100 border border-amber-200 rounded px-2 py-1">
                          <div className="text-xs text-amber-900">{m}</div>
                          <button
                            className="px-2 py-1 text-[11px] rounded border border-amber-300 hover:bg-amber-50"
                            onClick={() => fixItem(m)}
                          >
                            Fix
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <div className="text-[11px] font-semibold text-amber-900 uppercase mb-1">Required missing</div>
                        {ck.required.length ? renderItems(ck.required) : <div className="text-xs text-amber-800">None</div>}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-amber-900 uppercase mb-1">Recommended missing</div>
                        {ck.recommended.length ? renderItems(ck.recommended) : <div className="text-xs text-amber-800">None</div>}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <div className="p-4">
              <MarkdownEditor
                value={appealDoc?.contentMd ?? ''}
                onChange={(v) => (appealDoc ? updateDocumentContent(appealDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic appeal letter..."
                heightClassName="h-[32rem]"
              />
              {appealDoc?.citations?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">References</div>
                  <div className="space-y-2">
                    {appealDoc.citations.map((c) => {
                      const ev = evidenceById.get(c.evidenceId);
                      return (
                        <button
                          key={`${c.footnoteNumber}-${c.evidenceId}`}
                          className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                          onClick={() => setDrawerEvidenceId(c.evidenceId)}
                          title="Open evidence details"
                        >
                          <div className="text-sm font-semibold text-slate-800">
                            [{c.footnoteNumber}] {ev?.title ?? c.evidenceId}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ev ? `${ev.sourceName} • ${ev.year} • ${ev.strengthLevel}` : 'Evidence not found'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {appealDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {appealDoc.versions.map((v) => (
                      <div key={v.id} className="w-full p-2 rounded-md border border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            className="text-left min-w-0"
                            onClick={() => updateDocumentContent(appealDoc.id, v.contentMd)}
                            title="Load this version into editor"
                          >
                            <div className="text-sm font-semibold text-slate-800 truncate">{v.label}</div>
                            <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                          </button>
                          <button
                            className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                            onClick={() => openDiff(appealDoc.id, v.contentMd, v.label)}
                            title="Compare version vs current"
                          >
                            Diff
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 flex gap-2 no-print">
                <button
                  onClick={() => handleCopy('appeal_letter')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Copy className="w-4 h-4" />
                  Copy for Portal
                </button>
                <button
                  onClick={() => {
                    if (!appealDoc) return;
                    handleExport(appealDoc.id, 'Appeal letter');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {diffOpen ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="font-bold text-slate-900">{diffTitle}</div>
              <button onClick={() => setDiffOpen(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] font-mono text-xs leading-relaxed">
              {diffOps.map((op, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-wrap px-2 py-0.5 rounded ${
                    op.type === 'add'
                      ? 'bg-green-50 text-green-800'
                      : op.type === 'del'
                        ? 'bg-red-50 text-red-800'
                        : 'text-slate-700'
                  }`}
                >
                  <span className="inline-block w-5">
                    {op.type === 'add' ? '+' : op.type === 'del' ? '-' : ' '}
                  </span>
                  {op.text}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-500">
              Diff is line-based and deterministic (sufficient for demo review & governance).
            </div>
          </div>
        </div>
      ) : null}

      {drawerEvidence ? (
        <div className="fixed inset-0 bg-black/40 z-[55] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 truncate">{drawerEvidence.title}</div>
                <div className="text-xs text-slate-600 truncate">
                  {drawerEvidence.sourceName} • {drawerEvidence.year} • {drawerEvidence.strengthLevel}
                </div>
              </div>
              <button
                onClick={() => setDrawerEvidenceId(null)}
                className="p-2 rounded hover:bg-slate-100"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm text-slate-700 leading-relaxed">{drawerEvidence.snippet}</div>
              <div className="flex flex-wrap gap-2">
                {drawerEvidence.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">Evidence ID: {drawerEvidence.id}</div>
                <button
                  className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                  onClick={() => {
                    if (!activeCase) return;
                    location.hash = `#/evidence?caseId=${encodeURIComponent(activeCase.id)}&evidenceId=${encodeURIComponent(drawerEvidence.id)}`;
                    setDrawerEvidenceId(null);
                  }}
                >
                  Go to Evidence Retrieval
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
```

## src/pages/Evidence.tsx

```
import React, { useEffect, useMemo, useState } from 'react';
import { Pin, Plus, Search, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useSearchParams } from 'react-router-dom';

export const Evidence: React.FC = () => {
  const { cases, getEvidenceAll, toggleEvidencePin, addCustomEvidence } = useStore();
  const [params] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const [showAdd, setShowAdd] = useState(false);

  const [customDraft, setCustomDraft] = useState({
    title: '',
    snippet: '',
    sourceName: '',
    year: new Date().getFullYear(),
    urlPlaceholder: 'url:mock://custom',
    tags: 'custom',
    specialty: 'Psychiatry',
    strengthLevel: 'Low' as const,
  });

  const evidenceAll = getEvidenceAll();
  const activeCase = cases.find((c) => c.id === selectedCaseId);

  useEffect(() => {
    const caseId = params.get('caseId');
    const evidenceId = params.get('evidenceId');
    const q = params.get('q');
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedCaseId(caseId);
    }
    if (q) setSearchTerm(q);
    if (evidenceId) {
      // allow render cycle to complete
      setTimeout(() => {
        const el = document.getElementById(evidenceId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [params, cases]);

  const tagsAll = useMemo(() => {
    const set = new Set<string>();
    for (const e of evidenceAll) for (const t of e.tags ?? []) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [evidenceAll]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    for (const e of evidenceAll) set.add(e.specialty);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [evidenceAll]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return evidenceAll.filter((e) => {
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q) ||
        e.sourceName.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q));
      const matchTag = !selectedTag || e.tags.includes(selectedTag);
      const matchSpec = !selectedSpecialty || e.specialty === selectedSpecialty;
      return matchQ && matchTag && matchSpec;
    });
  }, [evidenceAll, searchTerm, selectedTag, selectedSpecialty]);

  const togglePin = (evidenceId: string) => {
    if (!activeCase) return;
    toggleEvidencePin(activeCase.id, evidenceId);
  };

  const handleAddCustom = () => {
    addCustomEvidence({
      title: customDraft.title.trim() || '(Untitled custom evidence)',
      snippet: customDraft.snippet.trim() || '(No snippet)',
      sourceName: customDraft.sourceName.trim() || 'Custom entry',
      year: Number(customDraft.year) || new Date().getFullYear(),
      urlPlaceholder: customDraft.urlPlaceholder || 'url:mock://custom',
      tags: customDraft.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      specialty: customDraft.specialty || 'General',
      strengthLevel: customDraft.strengthLevel,
    });
    setShowAdd(false);
    setCustomDraft({
      title: '',
      snippet: '',
      sourceName: '',
      year: new Date().getFullYear(),
      urlPlaceholder: 'url:mock://custom',
      tags: 'custom',
      specialty: 'Psychiatry',
      strengthLevel: 'Low',
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 no-print">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder="Search title, snippet, tags, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-56">
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All tags</option>
              {tagsAll.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>
          <div className="w-56">
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="w-80">
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="">(Optional) Select case to pin evidence...</option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Custom Evidence
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Pin evidence to a case to auto-generate footnotes in Authorization / Letters / Clinical outputs.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filtered.map((item) => {
          const isPinned = activeCase?.pinnedEvidenceIds.includes(item.id) ?? false;
          return (
            <div
              key={item.id}
              id={item.id}
              className={`bg-white p-4 rounded-xl border transition-all ${
                isPinned ? 'border-brand-500 ring-1 ring-brand-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold">{item.sourceName}</span>
                    <span>•</span>
                    <span>{item.year}</span>
                    <span>•</span>
                    <span>{item.specialty}</span>
                    <span>•</span>
                    <span className="px-1.5 rounded bg-slate-100 border border-slate-200">
                      {item.strengthLevel} strength
                    </span>
                    {item.isCustom ? (
                      <span className="px-1.5 rounded bg-purple-50 border border-purple-200 text-purple-700">Custom</span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => togglePin(item.id)}
                  disabled={!activeCase}
                  className={`p-2 rounded-full transition-colors ${
                    isPinned ? 'bg-brand-100 text-brand-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                  title={activeCase ? 'Pin/unpin to active case' : 'Select a case first'}
                >
                  <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="mt-3 text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {item.snippet}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-slate-200"
                    title="Filter by tag"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center p-12 text-slate-400">No evidence found.</div>}
      </div>

      {showAdd ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="font-bold text-slate-900">Add Custom Evidence</div>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Title</label>
                  <input
                    className="mt-1 w-full p-2 border rounded-md"
                    value={customDraft.title}
                    onChange={(e) => setCustomDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Source</label>
                  <input
                    className="mt-1 w-full p-2 border rounded-md"
                    value={customDraft.sourceName}
                    onChange={(e) => setCustomDraft((d) => ({ ...d, sourceName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Year</label>
                  <input
                    type="number"
                    className="mt-1 w-full p-2 border rounded-md"
                    value={customDraft.year}
                    onChange={(e) => setCustomDraft((d) => ({ ...d, year: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Specialty</label>
                  <input
                    className="mt-1 w-full p-2 border rounded-md"
                    value={customDraft.specialty}
                    onChange={(e) => setCustomDraft((d) => ({ ...d, specialty: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Tags (comma separated)</label>
                  <input
                    className="mt-1 w-full p-2 border rounded-md"
                    value={customDraft.tags}
                    onChange={(e) => setCustomDraft((d) => ({ ...d, tags: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Snippet</label>
                <textarea
                  className="mt-1 w-full p-2 border rounded-md"
                  rows={4}
                  value={customDraft.snippet}
                  onChange={(e) => setCustomDraft((d) => ({ ...d, snippet: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-md hover:bg-slate-100">
                  Cancel
                </button>
                <button
                  onClick={handleAddCustom}
                  className="px-4 py-2 bg-brand-600 text-white rounded-md font-semibold hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
```

## src/pages/ClinicalOutputStudio.tsx

```
import React, { useMemo, useState } from 'react';
import { Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { DocumentKind, CaseCard } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { useSearchParams } from 'react-router-dom';

type ClinicalType = 'soap' | 'hpi' | 'avs';

const CLINICAL_KIND: Record<ClinicalType, DocumentKind> = {
  soap: 'soap_note',
  hpi: 'hpi_pe_mdm_note',
  avs: 'avs',
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildDocumentationQA(c: CaseCard, transcript?: string): { issue: string; suggestion: string }[] {
  const issues: { issue: string; suggestion: string }[] = [];
  if (!c.diagnosis) issues.push({ issue: 'Missing diagnosis', suggestion: 'Add diagnosis (ICD-10 or free text) in Case Card.' });
  if (!c.serviceOrDrug) issues.push({ issue: 'Missing requested therapy', suggestion: 'Add service/drug name and intended plan.' });
  if (!c.dosage) issues.push({ issue: 'Missing dosage', suggestion: 'Add dose and formulation details for the requested therapy.' });
  if (!c.frequency) issues.push({ issue: 'Missing frequency', suggestion: 'Add frequency / administration schedule.' });
  if (!c.duration) issues.push({ issue: 'Missing duration', suggestion: 'Add expected duration or trial window.' });
  if (!c.severity) issues.push({ issue: 'Missing severity scale', suggestion: 'Add a measurement (e.g., PHQ-9, ASRS) or severity statement.' });
  if (!c.priorTreatments.length) issues.push({ issue: 'No prior treatment history', suggestion: 'Add prior treatments with outcomes (failed/intolerant/etc.).' });
  if (!transcript?.trim()) issues.push({ issue: 'No transcript provided', suggestion: 'Paste a short transcript excerpt if available (optional).' });
  return issues;
}

export const ClinicalOutputStudio: React.FC = () => {
  const {
    cases,
    templates,
    getCaseById,
    getDocumentForCase,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    log,
  } = useStore();

  const [params] = useSearchParams();
  const deepCaseId = params.get('caseId') ?? '';
  const preset = params.get('preset') ?? '';

  const [clinicalType, setClinicalType] = useState<ClinicalType>('soap');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const [transcript, setTranscript] = useState<string>('');
  const activeCase = getCaseById(selectedCaseId);

  React.useEffect(() => {
    if (deepCaseId && cases.some((c) => c.id === deepCaseId)) {
      setSelectedCaseId(deepCaseId);
    }
  }, [deepCaseId, cases]);

  React.useEffect(() => {
    if (preset === 'mdm') setClinicalType('hpi');
    if (preset === 'soap') setClinicalType('soap');
    if (preset === 'avs') setClinicalType('avs');
  }, [preset]);

  const kind = CLINICAL_KIND[clinicalType];
  const doc = activeCase ? getDocumentForCase(activeCase.id, kind) : undefined;

  const availableTemplates = useMemo(() => {
    if (clinicalType === 'avs') return templates.filter((t) => t.category === 'AVS templates');
    return templates.filter((t) => t.category === 'Clinical note templates');
  }, [templates, clinicalType]);

  const defaultTemplateId = availableTemplates[0]?.id ?? '';
  const [templateId, setTemplateId] = useState<string>(defaultTemplateId);
  React.useEffect(() => setTemplateId(defaultTemplateId), [defaultTemplateId]);

  const qa = useMemo(() => (activeCase ? buildDocumentationQA(activeCase, transcript) : []), [activeCase, transcript]);

  const handleGenerate = () => {
    if (!activeCase) return;
    generateForCase(activeCase.id, kind, { transcript, templateId });
  };

  const handleCopy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({ actionType: 'copy', entityType: 'Document', entityId: doc.id, summary: `Copied ${kind}` });
  };

  const handlePrint = () => {
    if (!doc) return;
    log({ actionType: 'export', entityType: 'Document', entityId: doc.id, summary: `Exported ${kind} via print` });
    window.print();
  };

  const handleQaAcknowledge = () => {
    if (!doc) return;
    log({
      actionType: 'qa_ack',
      entityType: 'Document',
      entityId: doc.id,
      summary: `QA acknowledged (${qa.length} items) for ${kind}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-72">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Output type</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={clinicalType}
              onChange={(e) => setClinicalType(e.target.value as ClinicalType)}
            >
              <option value="soap">SOAP Note Draft</option>
              <option value="hpi">HPI/PE/MDM Draft</option>
              <option value="avs">After Visit Summary (AVS)</option>
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Case source</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Template</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={handleGenerate}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
            >
              Generate
            </button>
            <button
              onClick={() => (doc ? saveDocumentVersion(doc.id, '') : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
              disabled={!doc}
              title="Save a snapshot"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Version
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Transcript (optional)</label>
          <textarea
            className="w-full p-3 border rounded-md text-sm"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste a transcript excerpt (plain text)."
          />
        </div>
      </div>

      {!activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Select a case to generate clinical outputs. (You can seed demo data in Settings.)
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Editable output</div>
                <div className="font-bold text-slate-900">{doc?.title ?? 'Generate to create output'}</div>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={doc?.contentMd ?? ''}
                onChange={(v) => (doc ? updateDocumentContent(doc.id, v) : undefined)}
                placeholder="Click Generate to create the clinical note..."
                heightClassName="h-[34rem]"
              />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-500 uppercase">Documentation QA</div>
                <button
                  onClick={handleQaAcknowledge}
                  disabled={!doc}
                  className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                  title="Record QA acknowledgment into Audit Log (demo governance)"
                >
                  Mark addressed
                </button>
              </div>
              {qa.length ? (
                <div className="space-y-2">
                  {qa.map((x, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-800 text-sm">{x.issue}</div>
                      <div className="text-xs text-slate-600 mt-1">{x.suggestion}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No common gaps detected from Case Card fields.</div>
              )}
              <div className="text-[11px] text-slate-500 mt-3">
                Tip: 这里的 QA 只做 demo 规则提示，点击 “Mark addressed” 会写入审计日志，方便演示治理与协作闭环。
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
              {doc?.versions?.length ? (
                <div className="space-y-2">
                  {doc.versions.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                      onClick={() => updateDocumentContent(doc.id, v.contentMd)}
                      title="Load this version into editor"
                    >
                      <div className="font-semibold text-slate-800">{v.label}</div>
                      <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No saved versions yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


```

## src/pages/Templates.tsx

```
import React, { useMemo, useState } from 'react';
import { Download, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useStore } from '../lib/store';
import type { Template, TemplateCategory, TemplateTone } from '../lib/schema';

const CATEGORIES: TemplateCategory[] = [
  'Authorization templates',
  'Letters templates',
  'Clinical note templates',
  'AVS templates',
];

export const Templates: React.FC = () => {
  const {
    templates,
    settings,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    importTemplates,
    cases,
  } = useStore();

  const canDelete = settings.userRole === 'Admin';
  const canEdit = settings.userRole !== 'Nurse';
  const canImportExport = settings.userRole === 'Admin';

  const [category, setCategory] = useState<TemplateCategory>('Authorization templates');
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? '');
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const filtered = useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category],
  );

  const sampleCase = cases.find((c) => !c.archivedAt) ?? null;

  const handleNew = () => {
    const id = createTemplate({
      name: 'New Template',
      category,
      specialty: 'General',
      payer: undefined,
      description: 'Describe when to use this template.',
      content: '# Title\n\n{{diagnosis}}\n\n{{serviceOrDrug}}\n',
      requiredFields: ['diagnosis', 'serviceOrDrug'],
      tone: 'neutral',
      archivedAt: undefined,
    });
    setSelectedId(id);
  };

  const handleExport = () => {
    const json = JSON.stringify(templates, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as Template[];
    importTemplates(parsed);
  };

  const renderPreview = (tpl: Template) => {
    if (!sampleCase) return 'Seed demo data to preview with a sample case.';
    // Lightweight preview: replace a few common placeholders
    return tpl.content
      .replace(/{{\s*diagnosis\s*}}/g, sampleCase.diagnosis || '[DIAGNOSIS]')
      .replace(/{{\s*serviceOrDrug\s*}}/g, sampleCase.serviceOrDrug || '[SERVICE/DRUG]')
      .replace(/{{\s*dosage\s*}}/g, sampleCase.dosage || '[DOSAGE]')
      .replace(/{{\s*frequency\s*}}/g, sampleCase.frequency || '[FREQUENCY]')
      .replace(/{{\s*duration\s*}}/g, sampleCase.duration || '[DURATION]')
      .replace(/{{\s*payerName\s*}}/g, sampleCase.payer?.payerName || '[PAYER]');
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">模板库与规则（Template Library）</div>
              <div className="text-xs text-slate-500 mt-1">
                把“机构话术/指南要点/信件格式”沉淀成可复用资产，用 requiredFields 驱动缺件检查。
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNew}
                className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
                disabled={!canEdit}
                title={!canEdit ? 'Nurse role cannot create templates' : 'Create template'}
              >
                <Plus className="w-4 h-4" /> 新建
              </button>
              {canImportExport ? (
                <>
                  <button
                    onClick={handleExport}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                    title="Export templates JSON"
                  >
                    <Download className="w-4 h-4" /> 导出
                  </button>
                  <label
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    title="Import templates JSON"
                  >
                    <Upload className="w-4 h-4" /> 导入
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 text-xs text-slate-500 leading-relaxed">
            常用占位符：<code className="font-mono">{'{{diagnosis}}'}</code>、<code className="font-mono">{'{{serviceOrDrug}}'}</code>、<code className="font-mono">{'{{dosage}}'}</code>、<code className="font-mono">{'{{frequency}}'}</code>、<code className="font-mono">{'{{duration}}'}</code>、<code className="font-mono">{'{{priorTreatmentSection}}'}</code>、<code className="font-mono">{'{{footnotes}}'}</code>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            Templates ({filtered.length})
          </div>
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${
                  selectedId === t.id ? 'bg-brand-50' : 'bg-white'
                }`}
              >
                <div className="font-bold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {t.specialty} • {t.tone} • {t.payer ? `Payer: ${t.payer}` : 'Any payer'}
                </div>
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No templates in this category.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!selected ? (
            <div className="p-10 text-center text-slate-400">Select a template to view/edit.</div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Editing</div>
                  <div className="font-bold text-slate-900 truncate">{selected.name}</div>
                </div>
                <div className="flex gap-2 no-print">
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                    onClick={() => duplicateTemplate(selected.id)}
                    disabled={!canEdit}
                  >
                    Duplicate
                  </button>
                  {canDelete ? (
                    <button
                      className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-semibold hover:bg-red-100 flex items-center gap-2"
                      onClick={() => deleteTemplate(selected.id)}
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                    <input
                      className="w-full p-2 border rounded-md"
                      value={selected.name}
                      disabled={!canEdit}
                      onChange={(e) => updateTemplate(selected.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specialty</label>
                      <input
                        className="w-full p-2 border rounded-md"
                        value={selected.specialty}
                        disabled={!canEdit}
                        onChange={(e) => updateTemplate(selected.id, { specialty: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tone</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selected.tone}
                        disabled={!canEdit}
                        onChange={(e) => updateTemplate(selected.id, { tone: e.target.value as TemplateTone })}
                      >
                        <option value="formal">formal</option>
                        <option value="neutral">neutral</option>
                        <option value="concise">concise</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Payer (optional)</label>
                    <input
                      className="w-full p-2 border rounded-md"
                      value={selected.payer ?? ''}
                      disabled={!canEdit}
                      onChange={(e) => updateTemplate(selected.id, { payer: e.target.value || undefined })}
                      placeholder="e.g., BlueCross"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={selected.description}
                      disabled={!canEdit}
                      onChange={(e) => updateTemplate(selected.id, { description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Required Fields (comma separated)
                    </label>
                    <input
                      className="w-full p-2 border rounded-md"
                      value={(selected.requiredFields ?? []).join(', ')}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateTemplate(selected.id, {
                          requiredFields: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Content (Markdown)</label>
                    <span className="text-xs text-slate-400">Editable • Local-only</span>
                  </div>
                  <textarea
                    className="w-full h-[24rem] p-3 border rounded-lg font-mono text-sm"
                    value={selected.content}
                    disabled={!canEdit}
                    onChange={(e) => updateTemplate(selected.id, { content: e.target.value })}
                  />
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Preview with Sample Case</div>
                    <pre className="whitespace-pre-wrap text-xs text-slate-700">{renderPreview(selected)}</pre>
                  </div>
                  <div className="text-xs text-slate-500">
                    Tip: Use placeholders like <code className="font-mono">{"{{diagnosis}}"}</code>,{' '}
                    <code className="font-mono">{"{{serviceOrDrug}}"}</code>, <code className="font-mono">{"{{dosage}}"}</code>.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
```

## src/pages/LettersStudio.tsx

```
import React, { useMemo, useState } from 'react';
import { Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { DocumentKind, Template } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';

type LetterType = 'referral' | 'sick_note' | 'disability' | 'pa_support' | 'patient_summary' | 'avs_patient';

const LETTER_KIND: Record<LetterType, DocumentKind> = {
  referral: 'referral_letter',
  sick_note: 'sick_note',
  disability: 'disability_letter',
  pa_support: 'pa_support_letter',
  patient_summary: 'patient_summary',
  avs_patient: 'avs',
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const LettersStudio: React.FC = () => {
  const {
    cases,
    templates,
    getCaseById,
    getDocumentForCase,
    getDocumentById,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    createTemplate,
    upsertDocument,
    log,
  } = useStore();

  const [params] = useSearchParams();

  const [mode, setMode] = useState<'case' | 'free'>('case');
  const [letterType, setLetterType] = useState<LetterType>('referral');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const activeCase = getCaseById(selectedCaseId);

  const letterTemplates = useMemo(
    () => templates.filter((t) => t.category === 'Letters templates'),
    [templates],
  );

  const avsTemplates = useMemo(
    () => templates.filter((t) => t.category === 'AVS templates'),
    [templates],
  );

  const defaultTemplateId = useMemo(() => {
    // Heuristic: pick matching built-in templates if present
    const byType: Record<LetterType, string> = {
      referral: 'tmpl-letters-referral',
      sick_note: 'tmpl-letters-sick-note',
      disability: 'tmpl-letters-disability',
      pa_support: 'tmpl-letters-pa-support',
      patient_summary: 'tmpl-letters-patient-treatment-summary',
      avs_patient: 'tmpl-avs-standard',
    };
    const id = byType[letterType];
    const list = letterType === 'avs_patient' ? avsTemplates : letterTemplates;
    return list.some((t) => t.id === id) ? id : (list[0]?.id ?? '');
  }, [letterType, letterTemplates, avsTemplates]);

  const [templateId, setTemplateId] = useState<string>(defaultTemplateId);
  React.useEffect(() => setTemplateId(defaultTemplateId), [defaultTemplateId]);

  React.useEffect(() => {
    const caseId = params.get('caseId');
    const letter = params.get('letter');
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedCaseId(caseId);
      setMode('case');
    }
    if (letter) {
      const asType = letter as LetterType;
      if (LETTER_KIND[asType]) setLetterType(asType);
    }
  }, [params, cases]);

  const kind = LETTER_KIND[letterType];
  const [freeDocId, setFreeDocId] = useState<string>('');
  const doc =
    mode === 'case'
      ? (activeCase ? getDocumentForCase(activeCase.id, kind) : undefined)
      : (freeDocId ? getDocumentById(freeDocId) : undefined);

  const [freeFields, setFreeFields] = useState({
    specialty: 'General',
    diagnosis: '',
    serviceOrDrug: '',
    dosage: '',
    frequency: '',
    duration: '',
    payerName: '',
    planType: '',
  });

  const freeMissing = (tpl: Template) => {
    const missing: string[] = [];
    for (const f of tpl.requiredFields ?? []) {
      const v =
        f === 'diagnosis'
          ? freeFields.diagnosis
          : f === 'serviceOrDrug'
            ? freeFields.serviceOrDrug
            : f === 'dosage'
              ? freeFields.dosage
              : f === 'frequency'
                ? freeFields.frequency
                : f === 'duration'
                  ? freeFields.duration
                  : f === 'payer.payerName'
                    ? freeFields.payerName
                    : '';
      if (!String(v ?? '').trim()) missing.push(f);
    }
    return Array.from(new Set(missing));
  };

  const renderFree = (tpl: Template) => {
    const ctx: Record<string, string> = {
      diagnosis: freeFields.diagnosis,
      serviceOrDrug: freeFields.serviceOrDrug,
      dosage: freeFields.dosage,
      frequency: freeFields.frequency,
      duration: freeFields.duration,
      payerName: freeFields.payerName,
      planType: freeFields.planType,
      priorTreatmentSection: '_Prior treatment history not provided in free input mode._',
      medicalNecessityRationale:
        'This is a demo placeholder. Please ensure clinical justification is reviewed and completed by a clinician.',
      referralReason: 'Please evaluate and provide recommendations. (Demo placeholder)',
      footnotes: '_No evidence pins in free input mode._',
    };
    return tpl.content.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_m, key) => {
      const v = ctx[key];
      return v == null || v === '' ? `[${String(key).toUpperCase()}]` : v;
    });
  };

  const handleGenerate = () => {
    if (mode === 'case') {
      if (!activeCase) return;
      generateForCase(activeCase.id, kind, { templateId });
      return;
    }

    const tpl =
      templates.find((t) => t.id === templateId) ??
      (letterType === 'avs_patient' ? avsTemplates[0] : letterTemplates[0]);
    if (!tpl) return;

    const id = freeDocId || uuidv4();
    const missingInfoChecklist = freeMissing(tpl);
    const contentMd = renderFree(tpl);

    upsertDocument({
      id,
      kind,
      title: `${tpl.name} — Free input`,
      caseId: undefined,
      templateId: tpl.id,
      payerStyle: undefined,
      contentMd,
      citations: [],
      missingInfoChecklist,
      riskWarnings: [
        'Demo output — clinician review required. This content is generated from local templates and rules; it is not medical advice.',
        'Do not include PHI (names, MRN, phone, email). This workspace is for de-identified demo content.',
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    });
    setFreeDocId(id);
    log({ actionType: 'generate', entityType: 'Document', entityId: id, summary: `Generated ${kind} (free input)` });
  };

  const handleCopy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({
      actionType: 'copy',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Copied ${kind} to clipboard`,
    });
  };

  const handlePrint = () => {
    if (!doc) return;
    log({
      actionType: 'export',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Exported ${kind} via print`,
    });
    window.print();
  };

  const handleSaveAsTemplate = () => {
    if (!doc) return;
    const name = `${doc.title} (Saved)`;
    createTemplate({
      name,
      category: 'Letters templates',
      specialty: (mode === 'case' ? activeCase?.specialty : freeFields.specialty) || 'General',
      payer: mode === 'case' ? activeCase?.payer?.payerName : freeFields.payerName || undefined,
      description: 'Saved from Letters Studio output (may contain resolved values; edit placeholders as needed).',
      content: doc.contentMd,
      requiredFields: [],
      tone: 'neutral',
      archivedAt: undefined,
    });
    log({
      actionType: 'create',
      entityType: 'Template',
      summary: `Saved letter output as template: ${name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-56">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mode</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="case">From Case Card</option>
              <option value="free">Free input</option>
            </select>
          </div>
          <div className="w-72">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Letter type</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={letterType}
              onChange={(e) => setLetterType(e.target.value as LetterType)}
            >
              <option value="referral">Referral Letter</option>
              <option value="sick_note">Sick Note</option>
              <option value="disability">Disability / Accommodation Letter</option>
              <option value="pa_support">Prior Auth Support Letter</option>
              <option value="patient_summary">Patient-facing Treatment Summary</option>
              <option value="avs_patient">Patient-facing AVS（患者版说明）</option>
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Case source</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              disabled={mode !== 'case'}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Template</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {(letterType === 'avs_patient' ? avsTemplates : letterTemplates).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={handleGenerate}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
            >
              Generate
            </button>
            <button
              onClick={() => (doc ? saveDocumentVersion(doc.id, '') : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
              disabled={!doc}
              title="Save a snapshot"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Version
            </button>
          </div>
        </div>

        {mode === 'free' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.diagnosis}
                onChange={(e) => setFreeFields((s) => ({ ...s, diagnosis: e.target.value }))}
                placeholder="No PHI"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service/Drug</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.serviceOrDrug}
                onChange={(e) => setFreeFields((s) => ({ ...s, serviceOrDrug: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.duration}
                onChange={(e) => setFreeFields((s) => ({ ...s, duration: e.target.value }))}
              />
            </div>
          </div>
        ) : null}

        <div className="text-xs text-slate-500">
          Outputs are editable Markdown, generated deterministically using local templates and rules. No backend calls.
        </div>
      </div>

      {mode === 'case' && !activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Select a case to generate letters. (You can seed demo data in Settings.)
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Editable output</div>
                <div className="font-bold text-slate-900">{doc?.title ?? 'Generate to create output'}</div>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!doc}
                  title="Save current output as a template"
                >
                  Save as Template
                </button>
              </div>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={doc?.contentMd ?? ''}
                onChange={(v) => (doc ? updateDocumentContent(doc.id, v) : undefined)}
                placeholder="Click Generate to create the letter..."
                heightClassName="h-[34rem]"
              />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Missing fields</div>
              {doc?.missingInfoChecklist?.length ? (
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {doc.missingInfoChecklist.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">Generate to see required-field checks.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
              {doc?.versions?.length ? (
                <div className="space-y-2">
                  {doc.versions.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                      onClick={() => updateDocumentContent(doc.id, v.contentMd)}
                      title="Load this version into editor"
                    >
                      <div className="font-semibold text-slate-800">{v.label}</div>
                      <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No saved versions yet.</div>
              )}
              <div className="text-xs text-slate-400 mt-2">Click a version to load it into the editor.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


```
