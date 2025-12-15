import React from 'react';
import { useStore } from '../lib/store';
import { Trash2, Download, Upload } from 'lucide-react';

export const Settings = () => {
  const {
    settings,
    setSettings,
    seedDemoData,
    clearAllLocalData,
    exportAllData,
    importAllData,
  } = useStore();

  const handleExport = () => {
    const data = exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic_workspace_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    importAllData(data);
  };

  return (
    <div className="max-w-2xl space-y-8">
      
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">角色与权限（模拟）</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">当前角色：</label>
          <select 
            className="p-2 border rounded-md"
            value={settings.userRole}
            onChange={(e) => setSettings({ userRole: e.target.value as any })}
          >
            <option value="Doctor">医生 Doctor（完整功能）</option>
            <option value="Nurse">护士 Nurse（限制模板管理）</option>
            <option value="Admin">管理员 Admin（可导入导出/管理模板）</option>
          </select>
        </div>
        <div className="text-xs text-slate-500 mt-3 leading-relaxed">
          说明：该 Demo 仅做前端角色模拟，用于演示“协作与权限控制”的产品形态。
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">隐私与安全</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">PHI 安全模式</div>
            <div className="text-sm text-slate-500">对疑似姓名/电话/邮箱等识别信息给出提示（不阻止保存）。</div>
          </div>
          <button 
            onClick={() => setSettings({ phiSafetyMode: !settings.phiSafetyMode })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.phiSafetyMode ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.phiSafetyMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">数据管理（localStorage）</h2>
        <div className="space-y-4">
           <div className="flex gap-4">
             <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
               <Download className="w-4 h-4" /> 导出全部数据（JSON）
             </button>
             <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
               <Upload className="w-4 h-4" /> 从 JSON 导入恢复
               <input
                 type="file"
                 accept="application/json"
                 className="hidden"
                 onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
               />
             </label>
           </div>

           <div>
             <button onClick={seedDemoData} className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
               Seed Demo Data（一键生成 3 个精神科 PA Case）
             </button>
             <div className="text-xs text-slate-500 mt-2">
               含：用药/服务、既往治疗史、风险因素、拒付理由、以及 pinned evidence（用于脚注引用）。
             </div>
           </div>
           
           <div className="pt-4 border-t border-slate-100">
             <button
               onClick={() => { if(confirm('确认清空本地数据？将删除 Case / 文档 / 模板 / 自定义证据（localStorage）。')) clearAllLocalData() }}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200"
             >
               <Trash2 className="w-4 h-4" /> Clear All Local Data（清空）
             </button>
           </div>
        </div>
      </section>

    </div>
  );
};
