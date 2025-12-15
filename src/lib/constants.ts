import type { RiskFactorKey, Template } from './schema';

export const APP_DATA_VERSION = 1;

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
