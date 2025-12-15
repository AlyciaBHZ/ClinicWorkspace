import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';

export const ToastHost: React.FC = () => {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => clearToast(), toast.durationMs ?? 2800);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const tone =
    toast.kind === 'success'
      ? 'bg-green-600'
      : toast.kind === 'warning'
        ? 'bg-amber-600'
        : toast.kind === 'error'
          ? 'bg-red-600'
          : 'bg-slate-900';

  return (
    <div className="fixed bottom-4 right-4 z-[60] no-print">
      <div className={`${tone} text-white shadow-lg rounded-lg px-4 py-3 text-sm font-semibold max-w-sm`}>
        {toast.message}
      </div>
    </div>
  );
};


