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


