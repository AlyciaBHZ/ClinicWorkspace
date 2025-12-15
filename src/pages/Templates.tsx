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
              <button
                onClick={handleExport}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                disabled={!canImportExport}
                title={!canImportExport ? 'Admin only' : 'Export templates JSON'}
              >
                <Download className="w-4 h-4" /> 导出
              </button>
              <label
                className={`px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 cursor-pointer ${
                  !canImportExport ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={!canImportExport ? 'Admin only' : 'Import templates JSON'}
              >
                <Upload className="w-4 h-4" /> 导入
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  disabled={!canImportExport}
                  onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
                />
              </label>
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
                  <button
                    className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-semibold hover:bg-red-100 flex items-center gap-2"
                    onClick={() => deleteTemplate(selected.id)}
                    disabled={!canDelete}
                    title={!canDelete ? 'Admin only' : 'Delete template'}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
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
