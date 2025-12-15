import React, { useMemo } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, AlertTriangle, ClipboardCheck, TrendingUp, Save } from 'lucide-react';
import { computeCaseCompleteness, computeWorkspaceKpis } from '../lib/metrics';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { cases, auditLog, seedDemoData, clearAllLocalData, templates } = useStore();

  const activeCases = cases.filter((c) => !c.archivedAt);
  const pending = activeCases.filter(c => c.status === 'in_progress' || c.status === 'draft').length;
  const denied = activeCases.filter(c => c.status === 'denied' || c.status === 'appeal').length;
  const approved = activeCases.filter(c => c.status === 'approved').length;

  const kpis = useMemo(() => {
    return computeWorkspaceKpis(auditLog, activeCases.length, pending, denied);
  }, [auditLog, activeCases.length, pending, denied]);

  const attentionList = useMemo(() => {
    return activeCases
      .map((c) => {
        const comp = computeCaseCompleteness(c, templates);
        const needsAttention =
          c.status === 'denied' ||
          c.status === 'appeal' ||
          comp.percent < 80;
        return { c, comp, needsAttention };
      })
      .filter((x) => x.needsAttention)
      .sort((a, b) => (a.c.updatedAt < b.c.updatedAt ? 1 : -1))
      .slice(0, 6);
  }, [activeCases, templates]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 uppercase">Clinic Workspace</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">临床材料与文书工作台（Demo）</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              面向小诊所与专科门诊团队：用 <span className="font-semibold">去标识化 Case Card</span> 结构化录入关键信息，
              基于 <span className="font-semibold">模板库 + 规则引擎</span> 自动渲染 Prior Auth 材料包与申诉信，并生成缺件清单、风险提示与可追溯引用脚注。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/cases" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700">
                新建 / 查看 Case Cards <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50">
                进入授权工作流（PA / Appeal）<ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/evidence" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50">
                打开证据检索与 Pin 引用 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {activeCases.length === 0 ? (
            <div className="w-full max-w-sm bg-brand-50 border border-brand-100 rounded-xl p-4">
              <div className="text-sm font-semibold text-brand-800">快速开始（演示用）</div>
              <div className="text-xs text-brand-800/80 mt-2 leading-relaxed">
                你可以一键生成 3 个精神科用药 PA 场景 Case（含拒付理由与 pinned evidence），用来演示“找材料 → 拼叙事 → 补缺件 → 改稿 → 导出”的全流程。
              </div>
              <button
                onClick={seedDemoData}
                className="mt-3 w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
              >
                Seed Demo Data（生成 3 个示例 Case）
              </button>
              <div className="mt-2 text-[11px] text-brand-800/70">
                所有数据仅保存在浏览器 localStorage，不接任何后端。
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="活跃 Case" value={activeCases.length} icon={FileText} color="bg-blue-500" />
        <StatCard label="待处理（草稿/进行中）" value={pending} icon={Clock} color="bg-amber-500" />
        <StatCard label="拒付/申诉中" value={denied} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="已通过" value={approved} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="生成文档（累计）" value={kpis.docsGenerated} icon={ClipboardCheck} color="bg-slate-700" />
        <StatCard label="版本快照（累计）" value={kpis.versionsSaved} icon={Save} color="bg-slate-700" />
        <StatCard label="复制/导出（累计）" value={kpis.copies + kpis.exports} icon={ArrowRight} color="bg-slate-700" />
        <StatCard label="预估节省分钟（Demo）" value={kpis.estimatedMinutesSaved} icon={TrendingUp} color="bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">最近活动（审计日志）</h2>
            <Link to="/audit" className="text-sm text-brand-600 hover:underline">查看全部</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLog.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex gap-3 text-sm">
                <span className="text-slate-400 font-mono text-xs w-20 pt-1">
                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{log.summary}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{log.actorRole} • {log.actionType}</p>
                </div>
              </div>
            ))}
            {auditLog.length === 0 && <div className="p-8 text-center text-slate-500">暂无活动记录。</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">需要关注的 Case（缺件 / 拒付 / 申诉）</h2>
            <Link to="/cases" className="text-sm text-brand-600 hover:underline">打开 Case Cards</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {attentionList.map(({ c, comp }) => (
              <div key={c.id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{c.serviceOrDrug || '(未命名)'}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{c.diagnosis || '(未填写诊断)'} • 状态：{c.status}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${
                      comp.tone === 'green'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : comp.tone === 'amber'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      完整度 {comp.percent}%
                    </span>
                    {comp.missing.slice(0, 3).map((m) => (
                      <span key={m} className="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                        缺：{m}
                      </span>
                    ))}
                    {comp.missing.length > 3 ? (
                      <span className="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                        +{comp.missing.length - 3}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/auth?caseId=${encodeURIComponent(c.id)}`}
                    className="px-3 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 text-center"
                  >
                    去生成/改稿
                  </Link>
                  <Link
                    to={`/evidence?caseId=${encodeURIComponent(c.id)}`}
                    className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 text-center"
                  >
                    补证据（Pin）
                  </Link>
                </div>
              </div>
            ))}
            {attentionList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">当前没有需要特别关注的 Case。</div>
            ) : null}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              提示：完整度基于默认 PA Pack 模板 requiredFields + 规则引擎缺件检查（确定性）。
            </div>
            <button
              onClick={() => {
                if (confirm('确认清空本地数据？将删除 Case / 文档 / 模板 / 自定义证据（localStorage）。')) {
                  clearAllLocalData();
                }
              }}
              className="text-xs text-slate-500 hover:text-red-600"
            >
              清空工作区数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
