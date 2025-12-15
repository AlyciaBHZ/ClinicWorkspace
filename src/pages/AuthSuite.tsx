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
