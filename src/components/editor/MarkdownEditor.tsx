import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export const MarkdownEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  heightClassName?: string;
  readOnly?: boolean;
}> = ({ value, onChange, placeholder, heightClassName, readOnly }) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const preview = useMemo(() => value || '', [value]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-between no-print">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
              mode === 'edit' ? 'bg-white border border-slate-200' : 'text-slate-600 hover:bg-white/60'
            }`}
            onClick={() => setMode('edit')}
            type="button"
          >
            Edit
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
              mode === 'preview' ? 'bg-white border border-slate-200' : 'text-slate-600 hover:bg-white/60'
            }`}
            onClick={() => setMode('preview')}
            type="button"
          >
            Preview
          </button>
        </div>
        <div className="text-[11px] text-slate-500">Markdown</div>
      </div>

      {mode === 'edit' ? (
        <textarea
          className={`w-full ${heightClassName ?? 'h-[34rem]'} p-4 font-mono text-sm leading-relaxed outline-none resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : (
        <div className={`${heightClassName ?? 'h-[34rem]'} p-4 overflow-auto bg-white`}>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{preview}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};


