import React, { useMemo, useState } from 'react';
import { Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { DocumentKind, CaseCard } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';

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

  const [clinicalType, setClinicalType] = useState<ClinicalType>('soap');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const [transcript, setTranscript] = useState<string>('');
  const activeCase = getCaseById(selectedCaseId);

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
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Documentation QA</div>
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


