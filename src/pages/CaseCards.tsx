import React, { useMemo, useState } from 'react';
import { Archive, Copy, Plus, Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../lib/store';
import { CASE_STATUS_LABELS, RISK_FACTOR_LABELS } from '../lib/constants';
import type { CaseCard, CaseStatus, RiskFactorKey } from '../lib/schema';
import { computeCaseCompleteness } from '../lib/metrics';
import { Link } from 'react-router-dom';

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
}> = ({ open, onClose, value, onSave, phiSafetyMode }) => {
  const [draft, setDraft] = useState<EditableCase>(value);

  React.useEffect(() => setDraft(value), [value, open]);
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service / Drug</label>
                  <input
                    className="w-full p-2 border rounded-md font-semibold"
                    value={draft.serviceOrDrug}
                    onChange={(e) => setDraft((d) => ({ ...d, serviceOrDrug: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Severity (optional)</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={draft.severity ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}
                    placeholder="e.g., PHQ-9: 22"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dosage</label>
                  <input className="w-full p-2 border rounded-md" value={draft.dosage} onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Frequency</label>
                  <input className="w-full p-2 border rounded-md" value={draft.frequency} onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration</label>
                  <input className="w-full p-2 border rounded-md" value={draft.duration} onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))} />
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
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Payer reference # (optional)</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payerReferenceNumber ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, payerReferenceNumber: e.target.value }))}
                      placeholder="Portal ref # (no PHI)"
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
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string>(cases[0]?.id ?? '');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState<EditableCase>(makeBlankDraft());

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
    setModalOpen(true);
  };

  const openEdit = (c: CaseCard) => {
    const { id, createdAt, updatedAt, ...rest } = c;
    setModalValue({ id, ...rest });
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
      />
    </div>
  );
};
