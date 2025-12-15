import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShieldCheck, Mail, Stethoscope, 
  Search, Library, History, Settings, Activity 
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { ToastHost } from './ToastHost';
import { PrintModal } from '../print/PrintModal';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? 'bg-brand-50 text-brand-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};

const TITLE_MAP: Record<string, string> = {
  '/': '工作台总览',
  '/cases': 'Case Card（去标识化）',
  '/auth': '授权工作流（PA / Appeal）',
  '/letters': '信件工作台',
  '/clinical': '临床文书工作台',
  '/evidence': '证据检索与引用',
  '/templates': '模板库与规则',
  '/audit': '审计日志',
  '/settings': '设置',
};

export const Layout = () => {
  const { settings, seedDemoData, clearAllLocalData } = useStore();
  const location = useLocation();
  const title = TITLE_MAP[location.pathname] ?? 'Clinic Workspace';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col no-print">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-brand-600 hover:opacity-90" title="返回 Dashboard">
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">Clinic<span className="text-slate-900">Workspace</span></span>
          </Link>
          <div className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {settings.userRole} View
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="总览 Dashboard" />
          <NavItem to="/cases" icon={FileText} label="Case Cards" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">Workflows</div>
          <NavItem to="/auth" icon={ShieldCheck} label="Authorization Suite" />
          <NavItem to="/letters" icon={Mail} label="Letters Studio" />
          <NavItem to="/clinical" icon={Stethoscope} label="Clinical Output Studio" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">Resources</div>
          <NavItem to="/evidence" icon={Search} label="Evidence Retrieval" />
          <NavItem to="/templates" icon={Library} label="Template Library" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">System</div>
          <NavItem to="/audit" icon={History} label="Audit Log" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={seedDemoData}
            className="w-full px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            title="一键生成 3 个示例 Case（含精神科用药 PA 场景 + pinned evidence）"
          >
            Seed Demo Data（生成示例）
          </button>
          <button
            onClick={() => {
              if (confirm('确认清空本地数据？将删除 Case / 文档 / 模板 / 自定义证据（localStorage）。')) {
                clearAllLocalData();
              }
            }}
            className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            title="清空 localStorage"
          >
            Clear All Local Data
          </button>
          <div className="text-[11px] text-slate-500 leading-snug">
            Demo only：本项目不接后端，数据仅存浏览器 localStorage。
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print">
           <div className="min-w-0">
             <h1 className="text-xl font-semibold text-slate-800 truncate">{title}</h1>
             <div className="text-xs text-slate-500 truncate">
               临床材料与文书工作台 · Case Card → 模板/规则 → 可编辑文档（Copy / PDF / 版本 / 审计 / 引用）
             </div>
           </div>
           {settings.phiSafetyMode && (
             <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
               <ShieldCheck className="w-3 h-3" />
               PHI 安全模式已开启
             </div>
           )}
        </header>
        <div className="flex-1 overflow-auto p-8 relative" id="printable-area">
          <Outlet />
        </div>
      </main>

      <ToastHost />
      <PrintModal />
    </div>
  );
};
