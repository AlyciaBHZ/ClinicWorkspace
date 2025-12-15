import React from 'react';
import { useStore } from '../lib/store';

export const AuditLog = () => {
  const { auditLog } = useStore();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4">Actor</th>
            <th className="px-6 py-4">Action</th>
            <th className="px-6 py-4">Entity</th>
            <th className="px-6 py-4">Summary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {auditLog.map(log => (
            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-3 whitespace-nowrap font-mono text-xs">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.actorRole === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {log.actorRole}
                </span>
              </td>
              <td className="px-6 py-3 uppercase text-xs tracking-wide font-semibold text-slate-500">
                {log.actionType}
              </td>
              <td className="px-6 py-3">
                {log.entityType}
              </td>
              <td className="px-6 py-3 text-slate-900 font-medium">
                {log.summary}
              </td>
            </tr>
          ))}
          {auditLog.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No logs found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
