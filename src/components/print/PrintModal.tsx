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


