import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { AlertCircle, Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { CaseStatus, DocumentKind } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { useSearchParams } from 'react-router-dom';

const STATUSES: CaseStatus[] = ['draft', 'in_progress', 'submitted', 'denied', 'appeal', 'approved'];

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  } = useStore();

  const [params] = useSearchParams();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const activeCase = getCaseById(selectedCaseId);

  const paDoc = activeCase ? getDocumentForCase(activeCase.id, 'pa_pack') : undefined;
  const appealDoc = activeCase ? getDocumentForCase(activeCase.id, 'appeal_letter') : undefined;

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

  const [paTemplateId, setPaTemplateId] = useState<string>('tmpl-auth-pa-pack-standard');
  const [appealTemplateId, setAppealTemplateId] = useState<string>('tmpl-auth-appeal-formal-generic');
  const [activeDragCaseId, setActiveDragCaseId] = useState<string | null>(null);

  useEffect(() => {
    const caseId = params.get('caseId');
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedCaseId(caseId);
    }
  }, [params, cases]);

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
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({
      actionType: 'copy',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Copied ${kind} to clipboard`,
    });
  };

  const handlePrint = () => window.print();

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
          <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <div className="text-xs text-amber-800">
                  {paDoc.missingInfoChecklist.map((m) => (
                    <span key={m} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-amber-100 border border-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
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

            <div className="p-4">
              <MarkdownEditor
                value={paDoc?.contentMd ?? ''}
                onChange={(v) => (paDoc ? updateDocumentContent(paDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic PA pack output..."
                heightClassName="h-[32rem]"
              />
              {paDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paDoc.versions.map((v) => (
                      <button
                        key={v.id}
                        className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                        onClick={() => updateDocumentContent(paDoc.id, v.contentMd)}
                        title="Load this version into editor"
                      >
                        <div className="text-sm font-semibold text-slate-800">{v.label}</div>
                        <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                      </button>
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
                    log({
                      actionType: 'export',
                      entityType: 'Document',
                      entityId: paDoc.id,
                      summary: 'Exported PA pack via print',
                    });
                    handlePrint();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF (Print)
                </button>
              </div>
            </div>
          </div>

          {/* Appeal */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <div className="text-xs text-amber-800">
                  {appealDoc.missingInfoChecklist.map((m) => (
                    <span key={m} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-amber-100 border border-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="p-4">
              <MarkdownEditor
                value={appealDoc?.contentMd ?? ''}
                onChange={(v) => (appealDoc ? updateDocumentContent(appealDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic appeal letter..."
                heightClassName="h-[32rem]"
              />
              {appealDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {appealDoc.versions.map((v) => (
                      <button
                        key={v.id}
                        className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                        onClick={() => updateDocumentContent(appealDoc.id, v.contentMd)}
                        title="Load this version into editor"
                      >
                        <div className="text-sm font-semibold text-slate-800">{v.label}</div>
                        <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                      </button>
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
                    log({
                      actionType: 'export',
                      entityType: 'Document',
                      entityId: appealDoc.id,
                      summary: 'Exported appeal letter via print',
                    });
                    handlePrint();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF (Print)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
