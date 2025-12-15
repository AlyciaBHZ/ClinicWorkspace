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
    if (caseId && cases.some((c) => c.id === caseId)) {
      setSelectedCaseId(caseId);
    }
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
