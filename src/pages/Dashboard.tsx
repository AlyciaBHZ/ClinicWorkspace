import React, { useMemo } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, AlertTriangle, ClipboardCheck, TrendingUp, Save } from 'lucide-react';
import { computeCaseCompleteness, computeWorkspaceKpis } from '../lib/metrics';
import { toPortalText } from '../lib/portalText';
import { loadTourState, resetTourState, startDashboardTour } from '../lib/demoTour';

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
  const {
    cases,
    auditLog,
    seedDemoData,
    seedUserCaseSpravatoTrdDenied,
    runFullScenario,
    resetScenario,
    clearAllLocalData,
    templates,
    setSettings,
    setCaseStatus,
    updateCase,
    generateForCase,
    activeCaseId,
    setActiveCaseId,
    getCaseById,
    getDocumentForCase,
    setPrintJob,
    showToast,
    guidedDemo,
  } = useStore();

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

  const scenarioCaseId = guidedDemo.exampleCaseId;
  const scenarioCase = getCaseById(scenarioCaseId);

  const effectiveCaseId = activeCaseId ?? scenarioCaseId;
  const activeDemoCase = getCaseById(effectiveCaseId);
  const paDoc = activeDemoCase ? getDocumentForCase(activeDemoCase.id, 'pa_pack') : undefined;
  const appealDoc = activeDemoCase ? getDocumentForCase(activeDemoCase.id, 'appeal_letter') : undefined;

  const tourState = loadTourState();

  const stepStatus = useMemo(() => {
    const c = scenarioCase;
    const s = guidedDemo.steps;
    const step1 = c ? 'done' : s.step1;
    const step2 = c && (c.pinnedEvidenceIds?.length ?? 0) >= 3 ? 'done' : s.step2;
    const step3 = c && !!getDocumentForCase(c.id, 'pa_pack') ? 'done' : s.step3;
    const step4 = c && !!getDocumentForCase(c.id, 'appeal_letter') ? 'done' : s.step4;
    const step5 = c && (!!getDocumentForCase(c.id, 'soap_note') || !!getDocumentForCase(c.id, 'hpi_pe_mdm_note')) ? 'done' : s.step5;
    return { step1, step2, step3, step4, step5 };
  }, [scenarioCase, guidedDemo.steps, getDocumentForCase]);

  const previewText = (md?: string) => {
    if (!md) return '';
    return md.split('\n').slice(0, 10).join('\n');
  };

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

          <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4" data-tour="demo-card">
            <div className="text-sm font-semibold text-slate-900">演示脚本（Spravato TRD 拒付申诉）</div>
            <div className="text-xs text-slate-600 mt-2 leading-relaxed">
              场景播放器：固定 <span className="font-mono">exampleCaseId</span>，一键跑通 Case → Evidence Pin → PA Pack/Appeal（v1）→ 状态。
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setSettings({ userRole: 'Admin' });
                  runFullScenario();
                  setActiveCaseId(scenarioCaseId);
                }}
                className="w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                data-tour="run-full-scenario"
              >
                Run full scenario
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => resetScenario()}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                >
                  Reset scenario
                </button>
                <button
                  onClick={() => {
                    if (tourState.completed) resetTourState();
                    startDashboardTour();
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                >
                  Start guided tour
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4" data-tour="stepper">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Stepper</div>
              <div className="space-y-2">
                {[
                  {
                    key: 'step1',
                    title: 'Step 1：Case Card（创建/补齐）',
                    status: stepStatus.step1,
                    go: () => {
                      setSettings({ userRole: 'Nurse' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/cases?caseId=${encodeURIComponent(id)}`;
                    },
                    summary: scenarioCase ? `已创建：${scenarioCase.serviceOrDrug}` : 'Not started',
                  },
                  {
                    key: 'step2',
                    title: 'Step 2：Evidence Pin（>=3）',
                    status: stepStatus.step2,
                    go: () => {
                      setSettings({ userRole: 'Doctor' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/evidence?caseId=${encodeURIComponent(id)}&q=${encodeURIComponent('esketamine TRD spravato')}`;
                    },
                    summary: scenarioCase ? `已 Pin：${scenarioCase.pinnedEvidenceIds.length} 条` : 'Not started',
                  },
                  {
                    key: 'step3',
                    title: 'Step 3：PA Pack（生成/版本）',
                    status: stepStatus.step3,
                    go: () => {
                      setSettings({ userRole: 'Admin' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/auth?caseId=${encodeURIComponent(id)}&tab=pa`;
                    },
                    summary: paDoc?.versions?.[0] ? `已保存：${paDoc.versions[0].label}` : (paDoc ? '已生成（未保存版本）' : 'Not started'),
                  },
                  {
                    key: 'step4',
                    title: 'Step 4：Appeal（生成/版本/diff）',
                    status: stepStatus.step4,
                    go: () => {
                      setSettings({ userRole: 'Doctor' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/auth?caseId=${encodeURIComponent(id)}&tab=appeal`;
                    },
                    summary: appealDoc?.versions?.[0] ? `已保存：${appealDoc.versions[0].label}` : (appealDoc ? '已生成（未保存版本）' : 'Not started'),
                  },
                  {
                    key: 'step5',
                    title: 'Step 5：Clinical QA（SOAP/MDM）',
                    status: stepStatus.step5,
                    go: () => {
                      setSettings({ userRole: 'Nurse' });
                      const id = seedUserCaseSpravatoTrdDenied();
                      setActiveCaseId(id);
                      location.hash = `#/clinical?caseId=${encodeURIComponent(id)}&preset=mdm`;
                    },
                    summary: '生成后点击 Mark addressed 写入 Audit Log',
                  },
                ].map((s) => (
                  <div key={s.key} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{s.summary}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${
                          s.status === 'done'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {s.status === 'done' ? 'Done' : 'Not started'}
                        </span>
                        <button
                          className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                          onClick={s.go}
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4" data-tour="outputs-preview">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Outputs preview（active case）</div>
              <div className="space-y-3">
                {[
                  { label: 'PA Pack', doc: paDoc, tab: 'pa' as const },
                  { label: 'Appeal Letter', doc: appealDoc, tab: 'appeal' as const },
                ].map(({ label, doc, tab }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {doc ? `updatedAt ${new Date(doc.updatedAt).toLocaleString()} • versions ${doc.versions?.length ?? 0}` : '尚未生成'}
                    </div>
                    <pre className="mt-2 text-[11px] bg-slate-50 border border-slate-200 rounded p-2 whitespace-pre-wrap max-h-28 overflow-auto">
                      {doc ? previewText(doc.contentMd) : '—'}
                    </pre>
                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={() => {
                          if (!activeDemoCase) return;
                          location.hash = `#/auth?caseId=${encodeURIComponent(activeDemoCase.id)}&tab=${tab}`;
                        }}
                        disabled={!doc || !activeDemoCase}
                      >
                        Open
                      </button>
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={async () => {
                          if (!doc) return;
                          await navigator.clipboard.writeText(toPortalText(doc.contentMd));
                          showToast(`已复制 ${label}（Portal text）`, { kind: 'success' });
                        }}
                        disabled={!doc}
                      >
                        Copy for Portal
                      </button>
                      <button
                        className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                        onClick={() => {
                          if (!doc) return;
                          setPrintJob({ docId: doc.id });
                        }}
                        disabled={!doc}
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              说明：该 Demo 仅前端本地运行（localStorage）；角色切换为模拟协作；引用编号按 pinned evidence 顺序确定性生成。
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
