# Clinic Workspace — Source Dump

Generated at: 2025-12-15T09:55:35.204Z

## Included
- All project source/config files

## Excluded
- node_modules/
- dist/
- package-lock.json (generated)

## File list
- `.gitignore`
- `index.html`
- `metadata.json`
- `package.json`
- `postcss.config.cjs`
- `README.md`
- `src/App.tsx`
- `src/components/editor/MarkdownEditor.tsx`
- `src/components/ui/Layout.tsx`
- `src/data/evidence.json`
- `src/index.css`
- `src/lib/constants.ts`
- `src/lib/generator.ts`
- `src/lib/schema.ts`
- `src/lib/store.ts`
- `src/main.tsx`
- `src/pages/AuditLog.tsx`
- `src/pages/AuthSuite.tsx`
- `src/pages/CaseCards.tsx`
- `src/pages/ClinicalOutputStudio.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Evidence.tsx`
- `src/pages/LettersStudio.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Templates.tsx`
- `tailwind.config.ts`
- `tools/dump.mjs`
- `tsconfig.json`
- `vite.config.ts`

---

## .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## index.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clinic Workspace</title>
  </head>
  <body class="bg-gray-50 text-slate-900 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## metadata.json

```
{
  "name": "Clinic Workspace",
  "description": "A standalone, offline-first clinical productivity suite for case management, prior authorization generation, and clinical documentation.",
  "requestFramePermissions": []
}
```

## package.json

```
{
  "name": "clinic-workspace",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/utilities": "^3.2.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "6.28.0",
    "lucide-react": "0.294.0",
    "uuid": "9.0.1",
    "zustand": "4.4.7"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^5.0.0",
    "@tailwindcss/typography": "^0.5.15",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

## postcss.config.cjs

```
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};


```

## README.md

```
# Clinic Workspace (Frontend-only Demo)

Interactive product prototype for clinic workflows. **No backend services**, **no external APIs**, all data is stored locally in the browser via **localStorage**.

## Run locally

- **Prerequisites**: Node.js (LTS recommended)

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

## Notes

- Use **Settings → Seed Demo Data** to generate 3 psychiatry prior-auth demo cases.
- Use **Settings → Clear All Local Data** to reset localStorage.
```

## src/App.tsx

```
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { CaseCards } from './pages/CaseCards';
import { AuthSuite } from './pages/AuthSuite';
import { LettersStudio } from './pages/LettersStudio';
import { ClinicalOutputStudio } from './pages/ClinicalOutputStudio';
import { Evidence } from './pages/Evidence';
import { Templates } from './pages/Templates';
import { AuditLog } from './pages/AuditLog';
import { Settings } from './pages/Settings';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<CaseCards />} />
          <Route path="auth" element={<AuthSuite />} />
          <Route path="letters" element={<LettersStudio />} />
          <Route path="clinical" element={<ClinicalOutputStudio />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="templates" element={<Templates />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
```

## src/components/editor/MarkdownEditor.tsx

```
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


```

## src/components/ui/Layout.tsx

```
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShieldCheck, Mail, Stethoscope, 
  Search, Library, History, Settings, Activity 
} from 'lucide-react';
import { useStore } from '../../lib/store';

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

export const Layout = () => {
  const { settings, seedDemoData, clearAllLocalData } = useStore();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col no-print">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600">
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">Clinic<span className="text-slate-900">Workspace</span></span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {settings.userRole} View
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/cases" icon={FileText} label="Case Cards" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase">Workflows</div>
          <NavItem to="/auth" icon={ShieldCheck} label="Authorization Suite" />
          <NavItem to="/letters" icon={Mail} label="Letters Studio" />
          <NavItem to="/clinical" icon={Stethoscope} label="Clinical Output" />
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
            title="Generate 3 demo cases"
          >
            Seed Demo Data
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all local data? This removes cases, documents, templates, and custom evidence.')) {
                clearAllLocalData();
              }
            }}
            className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            title="Clear localStorage"
          >
            Clear Local Data
          </button>
          <div className="text-[11px] text-slate-500 leading-snug">
            Demo only. Data is stored in your browser via localStorage.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print">
           <h1 className="text-xl font-semibold text-slate-800 capitalize">
             {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
           </h1>
           {settings.phiSafetyMode && (
             <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
               <ShieldCheck className="w-3 h-3" />
               PHI Safety Mode Active
             </div>
           )}
        </header>
        <div className="flex-1 overflow-auto p-8 relative" id="printable-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
```

## src/data/evidence.json

```
[
  {
    "id": "ev-001",
    "title": "Treatment-Resistant Depression: Evidence-Based Sequencing Strategies",
    "snippet": "Guideline summary supports stepwise optimization, augmentation, and consideration of advanced therapies after multiple adequate antidepressant trials.",
    "sourceName": "Consensus Review (Mock)",
    "year": 2023,
    "urlPlaceholder": "url:mock://evidence/ev-001",
    "tags": ["depression", "TRD", "guideline", "sequencing"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-002",
    "title": "Esketamine for TRD: Induction and Maintenance Outcomes",
    "snippet": "Randomized evidence demonstrates symptom improvement with supervised administration and ongoing monitoring in TRD populations.",
    "sourceName": "Journal of Clinical Psych (Mock)",
    "year": 2022,
    "urlPlaceholder": "url:mock://evidence/ev-002",
    "tags": ["depression", "TRD", "esketamine", "spravato"],
    "specialty": "Psychiatry",
    "strengthLevel": "High"
  },
  {
    "id": "ev-003",
    "title": "Adult ADHD Pharmacotherapy: Long-Term Safety Considerations",
    "snippet": "Longitudinal findings support continued efficacy with appropriate cardiovascular screening and dose monitoring.",
    "sourceName": "NEJM (Mock)",
    "year": 2021,
    "urlPlaceholder": "url:mock://evidence/ev-003",
    "tags": ["ADHD", "stimulant", "adult", "safety"],
    "specialty": "Psychiatry",
    "strengthLevel": "High"
  },
  {
    "id": "ev-004",
    "title": "Bipolar I: Acute Mania Management Algorithm",
    "snippet": "Algorithm recommends mood stabilizer + atypical antipsychotic for acute mania, with maintenance planning after stabilization.",
    "sourceName": "APA Guideline (Mock)",
    "year": 2022,
    "urlPlaceholder": "url:mock://evidence/ev-004",
    "tags": ["bipolar", "mania", "guideline"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-005",
    "title": "Generalized Anxiety Disorder: CBT vs Medication",
    "snippet": "Combined CBT + pharmacotherapy shows improved outcomes in severe presentations compared to monotherapy in multiple trials.",
    "sourceName": "Lancet Psychiatry (Mock)",
    "year": 2020,
    "urlPlaceholder": "url:mock://evidence/ev-005",
    "tags": ["anxiety", "GAD", "CBT", "SSRI"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-006",
    "title": "Major Depressive Disorder: PHQ-9 Use for Monitoring",
    "snippet": "Routine PHQ-9 tracking can support measurement-based care and earlier identification of non-response.",
    "sourceName": "Primary Care Update (Mock)",
    "year": 2019,
    "urlPlaceholder": "url:mock://evidence/ev-006",
    "tags": ["depression", "PHQ-9", "measurement-based care"],
    "specialty": "Family Medicine",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-007",
    "title": "PTSD: First-Line Therapies and When to Escalate",
    "snippet": "Evidence supports trauma-focused psychotherapy; medication considered when psychotherapy is insufficient or unavailable.",
    "sourceName": "Practice Bulletin (Mock)",
    "year": 2021,
    "urlPlaceholder": "url:mock://evidence/ev-007",
    "tags": ["PTSD", "therapy", "SSRI"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-008",
    "title": "Obsessive-Compulsive Disorder: SSRI Dose Optimization",
    "snippet": "Higher SSRI dosing ranges and adequate duration are associated with improved response in OCD.",
    "sourceName": "Clinical Review (Mock)",
    "year": 2018,
    "urlPlaceholder": "url:mock://evidence/ev-008",
    "tags": ["OCD", "SSRI", "dose"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-009",
    "title": "Schizophrenia: Maintenance Antipsychotic Adherence Strategies",
    "snippet": "Adherence interventions including shared decision-making and side-effect mitigation reduce relapse risk.",
    "sourceName": "Systematic Review (Mock)",
    "year": 2020,
    "urlPlaceholder": "url:mock://evidence/ev-009",
    "tags": ["schizophrenia", "adherence", "antipsychotic"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-010",
    "title": "Suicide Risk: Safety Planning as Standard of Care",
    "snippet": "Safety planning interventions reduce suicidal behavior when implemented with follow-up and means-restriction counseling.",
    "sourceName": "Clinical Guidance (Mock)",
    "year": 2021,
    "urlPlaceholder": "url:mock://evidence/ev-010",
    "tags": ["suicide", "safety", "risk"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-011",
    "title": "ADHD: Step Therapy and Clinical Exceptions",
    "snippet": "Clinical exceptions may be supported by documented intolerance, functional impairment, and prior trial outcomes.",
    "sourceName": "Payer Policy Summary (Mock)",
    "year": 2024,
    "urlPlaceholder": "url:mock://evidence/ev-011",
    "tags": ["ADHD", "step therapy", "payer"],
    "specialty": "Psychiatry",
    "strengthLevel": "Low"
  },
  {
    "id": "ev-012",
    "title": "Depression: Augmentation Strategies After SSRI Failure",
    "snippet": "Augmentation with atypical antipsychotics or bupropion is supported in subsets when monotherapy is insufficient.",
    "sourceName": "Meta-analysis (Mock)",
    "year": 2017,
    "urlPlaceholder": "url:mock://evidence/ev-012",
    "tags": ["depression", "augmentation", "SSRI"],
    "specialty": "Psychiatry",
    "strengthLevel": "High"
  },
  {
    "id": "ev-013",
    "title": "Bipolar Depression: Atypical Antipsychotics Evidence Summary",
    "snippet": "Certain atypical antipsychotics show efficacy in bipolar depression; monitoring for metabolic effects is recommended.",
    "sourceName": "Evidence Brief (Mock)",
    "year": 2019,
    "urlPlaceholder": "url:mock://evidence/ev-013",
    "tags": ["bipolar", "depression", "atypical antipsychotic"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-014",
    "title": "Insomnia: CBT-I as First-Line",
    "snippet": "CBT-I improves sleep outcomes and is recommended before long-term sedative-hypnotic use.",
    "sourceName": "Sleep Medicine Guideline (Mock)",
    "year": 2020,
    "urlPlaceholder": "url:mock://evidence/ev-014",
    "tags": ["insomnia", "CBT-I", "sleep"],
    "specialty": "Family Medicine",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-015",
    "title": "Medication Adherence: Shared Decision-Making Improves Outcomes",
    "snippet": "Shared decision-making can improve adherence and patient satisfaction across chronic conditions.",
    "sourceName": "Health Services Research (Mock)",
    "year": 2016,
    "urlPlaceholder": "url:mock://evidence/ev-015",
    "tags": ["adherence", "shared decision-making"],
    "specialty": "General",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-016",
    "title": "Anxiety Disorders: SSRI Onboarding and Side-Effect Counseling",
    "snippet": "Counseling about transient side effects and gradual titration may reduce early discontinuation.",
    "sourceName": "Clinical Toolkit (Mock)",
    "year": 2019,
    "urlPlaceholder": "url:mock://evidence/ev-016",
    "tags": ["anxiety", "SSRI", "titration"],
    "specialty": "Psychiatry",
    "strengthLevel": "Low"
  },
  {
    "id": "ev-017",
    "title": "OCD: ERP Therapy Effectiveness",
    "snippet": "Exposure and response prevention (ERP) demonstrates meaningful improvement and can be combined with SSRIs.",
    "sourceName": "Therapy Review (Mock)",
    "year": 2018,
    "urlPlaceholder": "url:mock://evidence/ev-017",
    "tags": ["OCD", "ERP", "therapy"],
    "specialty": "Psychiatry",
    "strengthLevel": "High"
  },
  {
    "id": "ev-018",
    "title": "Depression: Criteria for Adequate Antidepressant Trial",
    "snippet": "Adequate trial typically includes sufficient dose and duration with adherence; documentation supports payer review.",
    "sourceName": "Clinical Reference (Mock)",
    "year": 2015,
    "urlPlaceholder": "url:mock://evidence/ev-018",
    "tags": ["depression", "adequate trial", "documentation"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-019",
    "title": "Substance Use: Screening and Brief Intervention",
    "snippet": "Routine screening supports identification of comorbid substance use that can affect psychiatric treatment outcomes.",
    "sourceName": "USPSTF Summary (Mock)",
    "year": 2020,
    "urlPlaceholder": "url:mock://evidence/ev-019",
    "tags": ["substance use", "screening", "comorbidity"],
    "specialty": "General",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-020",
    "title": "ADHD: Comparative Efficacy of Extended-Release Stimulants",
    "snippet": "Extended-release stimulants can reduce rebound symptoms and support functional coverage across the day.",
    "sourceName": "Comparative Review (Mock)",
    "year": 2019,
    "urlPlaceholder": "url:mock://evidence/ev-020",
    "tags": ["ADHD", "stimulant", "extended-release"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-021",
    "title": "Bipolar I: Maintenance Therapy and Relapse Prevention",
    "snippet": "Maintenance treatment reduces relapse risk; monitoring for side effects and adherence is essential.",
    "sourceName": "Guideline Update (Mock)",
    "year": 2021,
    "urlPlaceholder": "url:mock://evidence/ev-021",
    "tags": ["bipolar", "maintenance", "relapse prevention"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-022",
    "title": "Depression: When to Consider Advanced Therapies",
    "snippet": "Advanced therapies may be considered after multiple adequate trials with persistent functional impairment.",
    "sourceName": "Practice Guide (Mock)",
    "year": 2022,
    "urlPlaceholder": "url:mock://evidence/ev-022",
    "tags": ["depression", "advanced therapy", "TRD"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-023",
    "title": "Psychiatric Hospitalization: Risk Stratification Notes",
    "snippet": "Past hospitalization can indicate elevated risk and supports careful safety planning and treatment intensity decisions.",
    "sourceName": "Clinical Notes (Mock)",
    "year": 2018,
    "urlPlaceholder": "url:mock://evidence/ev-023",
    "tags": ["hospitalization", "risk", "safety"],
    "specialty": "Psychiatry",
    "strengthLevel": "Low"
  },
  {
    "id": "ev-024",
    "title": "Comorbidities: Managing Metabolic Risk in Atypical Antipsychotic Use",
    "snippet": "Baseline metabolic screening and periodic monitoring are recommended to mitigate cardiometabolic risks.",
    "sourceName": "Safety Guidance (Mock)",
    "year": 2017,
    "urlPlaceholder": "url:mock://evidence/ev-024",
    "tags": ["comorbidity", "metabolic", "antipsychotic", "safety"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-025",
    "title": "Anxiety: Benzodiazepine Caution in Long-Term Use",
    "snippet": "Long-term use may be associated with dependence; alternatives and taper planning should be considered.",
    "sourceName": "Safety Bulletin (Mock)",
    "year": 2016,
    "urlPlaceholder": "url:mock://evidence/ev-025",
    "tags": ["anxiety", "benzodiazepine", "safety"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-026",
    "title": "Depression: Functional Impairment Documentation Tips",
    "snippet": "Documenting work/school impairment and ADLs can support medical necessity narratives in payer reviews.",
    "sourceName": "Documentation Guide (Mock)",
    "year": 2024,
    "urlPlaceholder": "url:mock://evidence/ev-026",
    "tags": ["depression", "documentation", "function"],
    "specialty": "General",
    "strengthLevel": "Low"
  },
  {
    "id": "ev-027",
    "title": "ADHD: Non-Stimulant Options Overview",
    "snippet": "Non-stimulants may be appropriate for certain comorbidities or intolerance; onset and efficacy differ from stimulants.",
    "sourceName": "Clinical Review (Mock)",
    "year": 2020,
    "urlPlaceholder": "url:mock://evidence/ev-027",
    "tags": ["ADHD", "non-stimulant", "atomoxetine"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-028",
    "title": "Bipolar I: Cariprazine Efficacy Snapshot",
    "snippet": "Evidence supports efficacy in bipolar disorder symptom domains; dosing and tolerability should be individualized.",
    "sourceName": "Trial Summary (Mock)",
    "year": 2019,
    "urlPlaceholder": "url:mock://evidence/ev-028",
    "tags": ["bipolar", "cariprazine", "vraylar"],
    "specialty": "Psychiatry",
    "strengthLevel": "Moderate"
  },
  {
    "id": "ev-029",
    "title": "Depression: Safety Monitoring in Advanced Therapies",
    "snippet": "Protocols emphasize monitoring, follow-up cadence, and safety checks for patients receiving advanced interventions.",
    "sourceName": "Protocol Checklist (Mock)",
    "year": 2023,
    "urlPlaceholder": "url:mock://evidence/ev-029",
    "tags": ["depression", "safety", "protocol"],
    "specialty": "Psychiatry",
    "strengthLevel": "Consensus"
  },
  {
    "id": "ev-030",
    "title": "Clinical Documentation QA: Common Missing Elements",
    "snippet": "Common gaps include missing severity scales, unclear duration, absent prior treatment outcomes, and limited safety assessment notes.",
    "sourceName": "QA Playbook (Mock)",
    "year": 2024,
    "urlPlaceholder": "url:mock://evidence/ev-030",
    "tags": ["documentation", "QA", "checklist"],
    "specialty": "General",
    "strengthLevel": "Consensus"
  }
]


```

## src/index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

/* App-wide defaults */
html,
body,
#root {
  height: 100%;
}

/* Print: hide chrome, keep content readable */
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white !important;
  }
}


```

## src/lib/constants.ts

```
import type { RiskFactorKey, Template } from './schema';

export const APP_DATA_VERSION = 1;

export const RISK_FACTOR_LABELS: Record<RiskFactorKey, string> = {
  suicidality: 'Suicidality / self-harm risk',
  hospitalizationHistory: 'Psychiatric hospitalization history',
  substanceUse: 'Substance use',
  comorbidities: 'Significant comorbidities',
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  submitted: 'Submitted',
  denied: 'Denied',
  appeal: 'Appeal',
  approved: 'Approved',
};

const now = () => Date.now();

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tmpl-auth-pa-pack-standard',
    name: 'PA Evidence Pack (Standard)',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: undefined,
    description: 'Multi-section PA pack with executive summary, medical necessity, prior treatment history, safety/risk, and next steps.',
    tone: 'formal',
    requiredFields: ['diagnosis', 'serviceOrDrug', 'dosage', 'frequency', 'duration', 'priorTreatments'],
    content: `# Executive Summary
Requesting prior authorization for **{{serviceOrDrug}}** for **{{diagnosis}}**.

# Medical Necessity Rationale
{{medicalNecessityRationale}}

# Prior Treatment Failures / Intolerance
{{priorTreatmentSection}}

# Safety / Risk Considerations
{{riskSafetySection}}

# Requested Service/Drug Details
- Requested: {{serviceOrDrug}}
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration: {{duration}}

# Next Steps + Missing Info Checklist
{{missingInfoChecklist}}

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-auth-appeal-formal-generic',
    name: 'Appeal Letter (Formal - Generic)',
    category: 'Authorization templates',
    specialty: 'Psychiatry',
    payer: undefined,
    description: 'Formal appeal letter with denial framing, evidence citations, and clinical justification.',
    tone: 'formal',
    requiredFields: ['payer.payerName', 'diagnosis', 'serviceOrDrug', 'priorTreatments', 'payer.denialText'],
    content: `# RE: Appeal of Coverage Denial — {{serviceOrDrug}}
**Payer**: {{payerName}} {{planType}}

To Whom It May Concern,

I am writing to appeal the denial of coverage for **{{serviceOrDrug}}** for the treatment of **{{diagnosis}}**. The denial references: **{{denialReasonCode}}** — "{{denialText}}".

## Clinical Summary
{{executiveSummary}}

## Medical Necessity
{{medicalNecessityRationale}}

## Prior Treatment History
{{priorTreatmentSection}}

## Requested Therapy Details
- Dose: {{dosage}}
- Frequency: {{frequency}}
- Duration: {{duration}}

## Conclusion
Given the patient’s clinical presentation and treatment history, **{{serviceOrDrug}}** is medically necessary. Please reconsider and approve this request.

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-referral',
    name: 'Referral Letter (Specialist Referral)',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'Referral letter with diagnosis, current plan, and specific referral question.',
    tone: 'neutral',
    requiredFields: ['diagnosis', 'serviceOrDrug'],
    content: `# Referral Letter

To Whom It May Concern,

I am referring a patient for evaluation/management of **{{diagnosis}}**. Current therapy under consideration: **{{serviceOrDrug}}**.

## Reason for Referral
{{referralReason}}

## Pertinent History
{{priorTreatmentSection}}

Sincerely,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-sick-note',
    name: 'Sick Note (Work/School)',
    category: 'Letters templates',
    specialty: 'General',
    description: 'Short sick note template.',
    tone: 'concise',
    requiredFields: ['duration'],
    content: `# Sick Note

This letter confirms the patient was evaluated and should be excused from work/school for: **{{duration}}**.

Signed,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-disability',
    name: 'Disability / Accommodation Letter',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'Accommodation letter with suggested supports and duration.',
    tone: 'formal',
    requiredFields: ['duration', 'diagnosis'],
    content: `# Disability / Accommodation Letter

To Whom It May Concern,

The patient is under care for **{{diagnosis}}**. I recommend the following accommodations:
- Flexible scheduling
- Time for clinical appointments
- Reduced workload during symptom exacerbation

Expected duration: **{{duration}}**.

Signed,  
Clinician (Demo)`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-letters-pa-support',
    name: 'Prior Auth Support Letter (Reusable)',
    category: 'Letters templates',
    specialty: 'Psychiatry',
    description: 'A shorter letter that can be used in portals; overlaps with PA pack content.',
    tone: 'formal',
    requiredFields: ['diagnosis', 'serviceOrDrug', 'priorTreatments'],
    content: `# Prior Authorization Support Letter

Requesting authorization for **{{serviceOrDrug}}** for **{{diagnosis}}**.

## Medical Necessity
{{medicalNecessityRationale}}

## Prior Treatment History
{{priorTreatmentSection}}

---
## References
{{footnotes}}`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-clinical-soap',
    name: 'SOAP Note Draft',
    category: 'Clinical note templates',
    specialty: 'General',
    description: 'SOAP draft populated from structured fields; for clinician review.',
    tone: 'neutral',
    requiredFields: ['diagnosis', 'serviceOrDrug'],
    content: `# SOAP Note (Draft)

## S: Subjective
{{subjective}}

## O: Objective
{{objective}}

## A: Assessment
Diagnosis: {{diagnosis}}

## P: Plan
- Treatment: {{serviceOrDrug}} ({{dosage}}, {{frequency}}, {{duration}})
- Follow-up: {{followUpPlan}}
`,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tmpl-avs-standard',
    name: 'After Visit Summary (Patient-Friendly)',
    category: 'AVS templates',
    specialty: 'General',
    description: 'Plain-language AVS with plan and safety guidance.',
    tone: 'concise',
    requiredFields: ['serviceOrDrug', 'dosage', 'frequency'],
    content: `# After Visit Summary (Draft)

## Today’s Focus
We discussed your condition and treatment plan.

## Your Plan
- Medication/service: **{{serviceOrDrug}}**
- How to take/use: **{{dosage}}**, **{{frequency}}**
- Expected duration: **{{duration}}**

## What to watch for
{{patientSafetyNotes}}

## Next steps
{{nextSteps}}
`,
    createdAt: now(),
    updatedAt: now(),
  },
];
```

## src/lib/generator.ts

```
import type {
  CaseCard,
  DocumentCitation,
  EvidenceItem,
  Template,
} from './schema';
import { RISK_FACTOR_LABELS } from './constants';

export interface GeneratedDocument {
  title: string;
  contentMd: string;
  citations: DocumentCitation[];
  missingInfoChecklist: string[];
  riskWarnings: string[];
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce((acc: any, key) => (acc == null ? undefined : acc[key]), obj as any);
}

function renderTemplate(content: string, ctx: Record<string, string>): string {
  return content.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_m, key) => {
    const v = ctx[key];
    if (v == null || v === '') return `[${key.toUpperCase()}]`;
    return v;
  });
}

function formatPriorTreatments(c: CaseCard): string {
  if (!c.priorTreatments?.length) return '_No prior treatments recorded. Please add prior trials, outcomes, and notes._';
  return c.priorTreatments
    .map((t) => `- **${t.name}** — _${t.outcome}_: ${t.note || '[ADD NOTE]'} `)
    .join('\n');
}

function formatRiskFactors(c: CaseCard): string {
  if (!c.riskFactors?.length) return 'No specific high-risk factors recorded in this de-identified case card.';
  return c.riskFactors.map((k) => `- ${RISK_FACTOR_LABELS[k] ?? k}`).join('\n');
}

function buildCitations(caseId: string | undefined, evidencePins: EvidenceItem[]): { citations: DocumentCitation[]; footnotesMd: string } {
  const citations: DocumentCitation[] = evidencePins.map((e, idx) => ({
    footnoteNumber: idx + 1,
    evidenceId: e.id,
  }));

  if (!evidencePins.length) {
    return {
      citations,
      footnotesMd: '_No pinned evidence. Add evidence in Evidence Retrieval to include citations._',
    };
  }

  const footnotesMd = evidencePins
    .map((e, idx) => {
      const n = idx + 1;
      const link = `#/evidence?caseId=${encodeURIComponent(caseId ?? '')}&evidenceId=${encodeURIComponent(e.id)}`;
      return `[^${n}]: [${e.title} — ${e.sourceName} (${e.year})](${link})\n\n> ${e.snippet}`;
    })
    .join('\n\n');

  return { citations, footnotesMd };
}

export function getMissingInfo(c: CaseCard, template: Template): string[] {
  const missing: string[] = [];

  for (const field of template.requiredFields ?? []) {
    const value = getByPath(
      {
        ...c,
        payerName: c.payer?.payerName ?? '',
        planType: c.payer?.planType ?? '',
        denialReasonCode: c.payer?.denialReasonCode ?? '',
        denialText: c.payer?.denialText ?? '',
      },
      field,
    );
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isEmptyString = typeof value === 'string' && value.trim() === '';
    if (value == null || isEmptyArray || isEmptyString) {
      missing.push(field);
    }
  }

  // Extra rules (deterministic)
  if (!c.severity) missing.push('severity');
  if ((c.status === 'denied' || c.status === 'appeal') && !c.payer?.denialText) missing.push('payer.denialText');

  return Array.from(new Set(missing));
}

export function missingChecklistMd(missing: string[]): string {
  if (!missing.length) return '- [x] No missing required fields detected (review clinically).';
  return missing.map((m) => `- [ ] Missing: **${m}**`).join('\n');
}

export function riskWarningsMd(): string[] {
  return [
    'Demo output — **clinician review required**. This content is generated from local templates and rules; it is not medical advice.',
    'Do **not** include PHI (names, MRN, phone, email). This workspace is designed for de-identified demo content.',
  ];
}

function medicalNecessityRationale(c: CaseCard): string {
  const severity = c.severity ? `Severity/scale: **${c.severity}**.` : 'Severity/scale: **[ADD SEVERITY]**.';
  const prior = c.priorTreatments?.length
    ? `Prior therapy history shows multiple trials with documented outcomes.`
    : `Prior therapy history is incomplete; please document prior trials and outcomes.`;
  return [
    `The requested therapy (**${c.serviceOrDrug || '[SERVICE/DRUG]'}**) is indicated for **${c.diagnosis || '[DIAGNOSIS]'}** in the context of the patient’s clinical course.`,
    severity,
    prior,
    `The goal is to reduce symptom burden, improve function, and prevent clinical deterioration.`,
  ].join('\n\n');
}

export function generatePaPack(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-auth-pa-pack-standard') ??
    templates.find((t) => t.category === 'Authorization templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    diagnosis: c.diagnosis,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    riskSafetySection: formatRiskFactors(c),
    missingInfoChecklist: missingChecklistMd(missing),
    footnotes: footnotesMd,
    payerName: c.payer?.payerName ?? '',
    planType: c.payer?.planType ?? '',
    denialReasonCode: c.payer?.denialReasonCode ?? '',
    denialText: c.payer?.denialText ?? '',
    executiveSummary: `Requesting PA for **${c.serviceOrDrug || '[SERVICE/DRUG]'}** for **${c.diagnosis || '[DIAGNOSIS]'}**.`,
  };

  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `PA Evidence Pack — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateAppealLetter(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  payerStyle?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-auth-appeal-formal-generic') ??
    templates.find((t) => t.category === 'Authorization templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    diagnosis: c.diagnosis,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    payerName: c.payer?.payerName ?? '[PAYER_NAME]',
    planType: c.payer?.planType ?? '',
    denialReasonCode: c.payer?.denialReasonCode ?? '',
    denialText: c.payer?.denialText ?? '[DENIAL_TEXT]',
    executiveSummary: `This appeal summarizes the clinical rationale for **${c.serviceOrDrug || '[SERVICE/DRUG]'}** in **${c.diagnosis || '[DIAGNOSIS]'}** and addresses denial criteria.`,
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    footnotes: footnotesMd,
    missingInfoChecklist: missingChecklistMd(missing),
  };

  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `Appeal Letter — ${payerStyle ? `${payerStyle} ` : ''}${c.serviceOrDrug || 'Case'}`.trim(),
    contentMd,
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateSoapNote(
  c: CaseCard,
  templates: Template[],
  transcript?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-clinical-soap') ??
    templates.find((t) => t.category === 'Clinical note templates')!;

  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    subjective: transcript?.trim()
      ? `Transcript summary (pasted):\n\n> ${transcript.trim()}`
      : '_No transcript provided._',
    objective: c.severity ? `Severity/scale: **${c.severity}**.` : 'Severity/scale: **[ADD SEVERITY]**.',
    followUpPlan: 'Follow-up plan to be confirmed by clinician.',
  };
  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `SOAP Note — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateAvs(
  c: CaseCard,
  templates: Template[],
  transcript?: string,
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-avs-standard') ??
    templates.find((t) => t.category === 'AVS templates')!;

  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    serviceOrDrug: c.serviceOrDrug,
    dosage: c.dosage,
    frequency: c.frequency,
    duration: c.duration,
    patientSafetyNotes:
      'If you experience worsening symptoms or safety concerns, contact your clinician or seek urgent care according to your local policy.',
    nextSteps: transcript?.trim()
      ? `Next steps based on today’s discussion:\n\n- Review plan details\n- Schedule follow-up\n- Bring questions from transcript notes`
      : `- Schedule follow-up as advised\n- Take medication as directed\n- Bring any side effects/concerns to next visit`,
  };
  const contentMd = renderTemplate(template.content, ctx);
  return {
    title: `After Visit Summary — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateReferralLetter(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-referral') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    referralReason: 'Please evaluate and provide recommendations. (Demo placeholder)',
    priorTreatmentSection: formatPriorTreatments(c),
    duration: c.duration,
  };
  return {
    title: `Referral Letter — ${c.diagnosis || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateSickNote(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-sick-note') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    duration: c.duration,
  };
  return {
    title: `Sick Note — ${c.duration || 'Duration needed'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateDisabilityLetter(
  c: CaseCard,
  templates: Template[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-disability') ??
    templates.find((t) => t.category === 'Letters templates')!;
  const missing = getMissingInfo(c, template);
  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    duration: c.duration,
  };
  return {
    title: `Accommodation Letter — ${c.diagnosis || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generatePaSupportLetter(
  c: CaseCard,
  templates: Template[],
  evidencePins: EvidenceItem[],
  templateId?: string,
): GeneratedDocument {
  const template =
    (templateId ? templates.find((t) => t.id === templateId) : undefined) ??
    templates.find((t) => t.id === 'tmpl-letters-pa-support') ??
    templates.find((t) => t.category === 'Letters templates')!;

  const missing = getMissingInfo(c, template);
  const { citations, footnotesMd } = buildCitations(c.id, evidencePins);

  const ctx: Record<string, string> = {
    diagnosis: c.diagnosis,
    serviceOrDrug: c.serviceOrDrug,
    medicalNecessityRationale: medicalNecessityRationale(c),
    priorTreatmentSection: formatPriorTreatments(c),
    footnotes: footnotesMd,
  };
  return {
    title: `PA Support Letter — ${c.serviceOrDrug || 'Case'}`,
    contentMd: renderTemplate(template.content, ctx),
    citations,
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}

export function generateHpiPeMdmNote(
  c: CaseCard,
  transcript?: string,
): GeneratedDocument {
  const hpi = transcript?.trim()
    ? `Transcript excerpt:\n\n> ${transcript.trim()}`
    : '_No transcript provided._';
  const contentMd = [
    '# HPI / PE / MDM (Draft)',
    '',
    '## HPI',
    hpi,
    '',
    '## PE',
    '_[Not captured in this demo — add pertinent exam findings as needed]._',
    '',
    '## MDM',
    `Assessment: **${c.diagnosis || '[DIAGNOSIS]'}**`,
    `Plan: **${c.serviceOrDrug || '[SERVICE/DRUG]'}** (${c.dosage || '[DOSAGE]'}, ${c.frequency || '[FREQUENCY]'}, ${c.duration || '[DURATION]'})`,
    '',
    '### Safety / Risk',
    formatRiskFactors(c),
  ].join('\n');

  const missing = Array.from(new Set([...(c.severity ? [] : ['severity']), ...(c.priorTreatments.length ? [] : ['priorTreatments'])]));
  return {
    title: `HPI/PE/MDM — ${c.serviceOrDrug || 'Case'}`,
    contentMd,
    citations: [],
    missingInfoChecklist: missing,
    riskWarnings: riskWarningsMd(),
  };
}
```

## src/lib/schema.ts

```
export type ActorRole = 'Doctor' | 'Nurse' | 'Admin';

export type CaseStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'denied'
  | 'appeal'
  | 'approved';

export type PriorTreatmentOutcome =
  | 'failed'
  | 'intolerant'
  | 'contraindicated'
  | 'ineffective';

export interface PriorTreatment {
  id: string;
  name: string;
  outcome: PriorTreatmentOutcome;
  note: string;
}

export type RiskFactorKey =
  | 'suicidality'
  | 'hospitalizationHistory'
  | 'substanceUse'
  | 'comorbidities';

export interface PayerInfo {
  payerName: string;
  planType?: string;
  denialReasonCode?: string;
  denialText?: string;
}

export interface AttachmentPlaceholder {
  id: string;
  label: string; // e.g., "Prior denial letter (placeholder)"
  note?: string;
  addedAt: number;
}

export interface CaseCard {
  id: string;

  // Minimal field set (de-identified; do not store PHI)
  specialty: string;
  diagnosis: string; // ICD-10 or free text
  serviceOrDrug: string;
  dosage: string;
  frequency: string;
  duration: string;
  priorTreatments: PriorTreatment[];
  severity?: string; // scale / severity measure
  riskFactors: RiskFactorKey[];

  payer?: PayerInfo;
  attachments: AttachmentPlaceholder[];

  status: CaseStatus;
  archivedAt?: number;
  createdAt: number;
  updatedAt: number;

  // Evidence pins
  pinnedEvidenceIds: string[];
}

export type EvidenceStrengthLevel = 'High' | 'Moderate' | 'Low' | 'Consensus';

export interface EvidenceItem {
  id: string;
  title: string;
  snippet: string;
  sourceName: string;
  year: number;
  urlPlaceholder: string;
  tags: string[];
  specialty: string;
  strengthLevel: EvidenceStrengthLevel;
  isCustom?: boolean;
}

export type TemplateCategory =
  | 'Authorization templates'
  | 'Letters templates'
  | 'Clinical note templates'
  | 'AVS templates';

export type TemplateTone = 'formal' | 'neutral' | 'concise';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  specialty: string;
  payer?: string;
  description: string;
  content: string; // {{placeholders}}
  requiredFields: string[]; // used for missing checklist
  tone: TemplateTone;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

export type DocumentKind =
  | 'pa_pack'
  | 'appeal_letter'
  | 'referral_letter'
  | 'sick_note'
  | 'disability_letter'
  | 'pa_support_letter'
  | 'soap_note'
  | 'hpi_pe_mdm_note'
  | 'avs';

export interface DocumentCitation {
  footnoteNumber: number;
  evidenceId: string;
}

export interface DocumentArtifact {
  id: string;
  kind: DocumentKind;
  title: string;
  caseId?: string; // some outputs can be freeform
  templateId?: string;
  payerStyle?: string;
  contentMd: string;

  citations: DocumentCitation[];
  missingInfoChecklist: string[];
  riskWarnings: string[];

  createdAt: number;
  updatedAt: number;
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  savedAt: number;
  label: string; // e.g. "v1", "Before appeal edits"
  templateId?: string;
  contentMd: string;
}

export type AuditActionType =
  | 'create'
  | 'edit'
  | 'delete'
  | 'duplicate'
  | 'archive'
  | 'generate'
  | 'save_version'
  | 'status_change'
  | 'export'
  | 'copy'
  | 'import'
  | 'clear';

export type AuditEntityType = 'Case' | 'Document' | 'Template' | 'Evidence' | 'System';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  actorRole: ActorRole;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId?: string;
  summary: string;
}

export interface AppSettings {
  userRole: ActorRole;
  phiSafetyMode: boolean;
}

export interface LocalDataExport {
  exportedAt: number;
  version: number;
  settings: AppSettings;
  cases: CaseCard[];
  documents: DocumentArtifact[];
  templates: Template[];
  evidenceCustom: EvidenceItem[];
  auditLog: AuditLogEntry[];
}
```

## src/lib/store.ts

```
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import evidenceBaseJson from '@/data/evidence.json';
import type {
  AppSettings,
  AuditLogEntry,
  CaseCard,
  CaseStatus,
  DocumentArtifact,
  DocumentKind,
  EvidenceItem,
  LocalDataExport,
  Template,
} from './schema';
import { APP_DATA_VERSION, DEFAULT_TEMPLATES } from './constants';
import {
  generateAppealLetter,
  generateAvs,
  generatePaPack,
  generatePaSupportLetter,
  generateDisabilityLetter,
  generateHpiPeMdmNote,
  generateReferralLetter,
  generateSickNote,
  generateSoapNote,
} from './generator';

type CaseCreateInput = Omit<CaseCard, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'pinnedEvidenceIds'> & {
  pinnedEvidenceIds?: string[];
  archivedAt?: number;
};

interface AppState {
  settings: AppSettings;

  cases: CaseCard[];
  templates: Template[];

  evidenceCustom: EvidenceItem[];
  documents: DocumentArtifact[];
  auditLog: AuditLogEntry[];

  // Derived-ish helpers
  getEvidenceAll: () => EvidenceItem[];
  getCaseById: (id: string) => CaseCard | undefined;
  getDocumentForCase: (caseId: string, kind: DocumentKind) => DocumentArtifact | undefined;
  getDocumentById: (docId: string) => DocumentArtifact | undefined;

  // Settings & audit
  setSettings: (s: Partial<AppSettings>) => void;
  log: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorRole'>) => void;

  // Cases
  createCase: (input: Partial<CaseCreateInput>) => string;
  updateCase: (caseId: string, patch: Partial<CaseCard>) => void;
  duplicateCase: (caseId: string) => string | undefined;
  archiveCase: (caseId: string) => void;
  restoreCase: (caseId: string) => void;
  setCaseStatus: (caseId: string, status: CaseStatus) => void;

  // Evidence
  toggleEvidencePin: (caseId: string, evidenceId: string) => void;
  addCustomEvidence: (e: Omit<EvidenceItem, 'id' | 'isCustom'>) => string;
  deleteCustomEvidence: (id: string) => void;

  // Templates
  createTemplate: (t: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  duplicateTemplate: (id: string) => string | undefined;
  deleteTemplate: (id: string) => void;
  importTemplates: (templates: Template[]) => void;

  // Documents
  upsertDocument: (doc: DocumentArtifact) => void;
  updateDocumentContent: (docId: string, contentMd: string) => void;
  saveDocumentVersion: (docId: string, label: string) => void;
  generateForCase: (caseId: string, kind: DocumentKind, opts?: { templateId?: string; payerStyle?: string; transcript?: string }) => string;

  // Data management
  seedDemoData: () => void;
  clearAllLocalData: () => void;
  exportAllData: () => LocalDataExport;
  importAllData: (data: LocalDataExport) => void;
}

const STORAGE_KEY = 'clinic-workspace-storage';

function now() {
  return Date.now();
}

function blankCase(): CaseCard {
  return {
    id: uuidv4(),
    specialty: 'Psychiatry',
    diagnosis: '',
    serviceOrDrug: '',
    dosage: '',
    frequency: '',
    duration: '',
    priorTreatments: [],
    severity: '',
    riskFactors: [],
    payer: undefined,
    attachments: [],
    status: 'draft',
    archivedAt: undefined,
    createdAt: now(),
    updatedAt: now(),
    pinnedEvidenceIds: [],
  };
}

function defaultSettings(): AppSettings {
  return {
    userRole: 'Doctor',
    phiSafetyMode: true,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings(),
      cases: [],
      templates: DEFAULT_TEMPLATES,
      evidenceCustom: [],
      documents: [],
      auditLog: [],

      getEvidenceAll: () => {
        const base = (evidenceBaseJson as EvidenceItem[]).map((e) => ({ ...e, isCustom: false }));
        const custom = get().evidenceCustom.map((e) => ({ ...e, isCustom: true }));
        return [...custom, ...base];
      },

      getCaseById: (id) => get().cases.find((c) => c.id === id),

      getDocumentForCase: (caseId, kind) => get().documents.find((d) => d.caseId === caseId && d.kind === kind),
      getDocumentById: (docId) => get().documents.find((d) => d.id === docId),

      setSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
        })),

      log: (entry) =>
        set((state) => ({
          auditLog: [
            {
              id: uuidv4(),
              timestamp: now(),
              actorRole: state.settings.userRole,
              ...entry,
            },
            ...state.auditLog,
          ],
        })),

      createCase: (input) => {
        const c = blankCase();
        const created: CaseCard = {
          ...c,
          ...input,
          id: uuidv4(),
          createdAt: now(),
          updatedAt: now(),
          pinnedEvidenceIds: input?.pinnedEvidenceIds ?? [],
          attachments: input?.attachments ?? [],
          priorTreatments: input?.priorTreatments ?? [],
          riskFactors: input?.riskFactors ?? [],
          dosage: input?.dosage ?? '',
          frequency: input?.frequency ?? '',
          duration: input?.duration ?? '',
          diagnosis: input?.diagnosis ?? '',
          serviceOrDrug: input?.serviceOrDrug ?? '',
          specialty: input?.specialty ?? 'Psychiatry',
        };
        set((state) => ({ cases: [created, ...state.cases] }));
        get().log({
          actionType: 'create',
          entityType: 'Case',
          entityId: created.id,
          summary: `Created case: ${created.serviceOrDrug || '(untitled)'}`,
        });
        return created.id;
      },

      updateCase: (caseId, patch) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId ? { ...c, ...patch, updatedAt: now() } : c,
          ),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Case',
          entityId: caseId,
          summary: `Updated case`,
        });
      },

      duplicateCase: (caseId) => {
        const original = get().cases.find((c) => c.id === caseId);
        if (!original) return undefined;
        const newId = get().createCase({
          ...original,
          status: 'draft',
          archivedAt: undefined,
          serviceOrDrug: `${original.serviceOrDrug} (Copy)`,
        });
        get().log({
          actionType: 'duplicate',
          entityType: 'Case',
          entityId: newId,
          summary: `Duplicated case from ${caseId}`,
        });
        return newId;
      },

      archiveCase: (caseId) => {
        get().updateCase(caseId, { archivedAt: now() });
        get().log({
          actionType: 'archive',
          entityType: 'Case',
          entityId: caseId,
          summary: `Archived case`,
        });
      },

      restoreCase: (caseId) => {
        get().updateCase(caseId, { archivedAt: undefined });
        get().log({
          actionType: 'edit',
          entityType: 'Case',
          entityId: caseId,
          summary: `Restored case`,
        });
      },

      setCaseStatus: (caseId, status) => {
        get().updateCase(caseId, { status });
        get().log({
          actionType: 'status_change',
          entityType: 'Case',
          entityId: caseId,
          summary: `Changed status to ${status}`,
        });
      },

      toggleEvidencePin: (caseId, evidenceId) => {
        const c = get().cases.find((x) => x.id === caseId);
        if (!c) return;
        const pinned = new Set(c.pinnedEvidenceIds ?? []);
        if (pinned.has(evidenceId)) pinned.delete(evidenceId);
        else pinned.add(evidenceId);
        get().updateCase(caseId, { pinnedEvidenceIds: Array.from(pinned) });
        get().log({
          actionType: 'edit',
          entityType: 'Evidence',
          entityId: evidenceId,
          summary: `${pinned.has(evidenceId) ? 'Pinned' : 'Unpinned'} evidence to case`,
        });
      },

      addCustomEvidence: (e) => {
        const id = uuidv4();
        const item: EvidenceItem = {
          id,
          isCustom: true,
          ...e,
        };
        set((state) => ({ evidenceCustom: [item, ...state.evidenceCustom] }));
        get().log({
          actionType: 'create',
          entityType: 'Evidence',
          entityId: id,
          summary: `Added custom evidence: ${e.title}`,
        });
        return id;
      },

      deleteCustomEvidence: (id) => {
        set((state) => ({ evidenceCustom: state.evidenceCustom.filter((e) => e.id !== id) }));
        get().log({
          actionType: 'delete',
          entityType: 'Evidence',
          entityId: id,
          summary: `Deleted custom evidence`,
        });
      },

      createTemplate: (t) => {
        const id = uuidv4();
        const tpl: Template = {
          ...t,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ templates: [tpl, ...state.templates] }));
        get().log({
          actionType: 'create',
          entityType: 'Template',
          entityId: id,
          summary: `Created template: ${tpl.name}`,
        });
        return id;
      },

      updateTemplate: (id, patch) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Template',
          entityId: id,
          summary: `Updated template`,
        });
      },

      duplicateTemplate: (id) => {
        const t = get().templates.find((x) => x.id === id);
        if (!t) return undefined;
        const newId = get().createTemplate({
          ...t,
          name: `${t.name} (Copy)`,
          archivedAt: undefined,
        });
        get().log({
          actionType: 'duplicate',
          entityType: 'Template',
          entityId: newId,
          summary: `Duplicated template`,
        });
        return newId;
      },

      deleteTemplate: (id) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
        get().log({
          actionType: 'delete',
          entityType: 'Template',
          entityId: id,
          summary: `Deleted template`,
        });
      },

      importTemplates: (templates) => {
        set({ templates });
        get().log({
          actionType: 'import',
          entityType: 'Template',
          summary: `Imported templates: ${templates.length}`,
        });
      },

      upsertDocument: (doc) => {
        set((state) => {
          const exists = state.documents.some((d) => d.id === doc.id);
          return {
            documents: exists
              ? state.documents.map((d) => (d.id === doc.id ? doc : d))
              : [doc, ...state.documents],
          };
        });
      },

      updateDocumentContent: (docId, contentMd) => {
        set((state) => ({
          documents: state.documents.map((d) => (d.id === docId ? { ...d, contentMd, updatedAt: now() } : d)),
        }));
        get().log({
          actionType: 'edit',
          entityType: 'Document',
          entityId: docId,
          summary: `Edited document`,
        });
      },

      saveDocumentVersion: (docId, label) => {
        const doc = get().documents.find((d) => d.id === docId);
        if (!doc) return;
        const version = {
          id: uuidv4(),
          savedAt: now(),
          label: label || `v${doc.versions.length + 1}`,
          templateId: doc.templateId,
          contentMd: doc.contentMd,
        };
        get().upsertDocument({ ...doc, versions: [version, ...doc.versions] });
        get().log({
          actionType: 'save_version',
          entityType: 'Document',
          entityId: docId,
          summary: `Saved version: ${version.label}`,
        });
      },

      generateForCase: (caseId, kind, opts) => {
        const c = get().cases.find((x) => x.id === caseId);
        if (!c) throw new Error('Case not found');
        const templates = get().templates;
        const evidenceAll = get().getEvidenceAll();
        const pins = evidenceAll.filter((e) => c.pinnedEvidenceIds.includes(e.id));

        const generated =
          kind === 'pa_pack'
            ? generatePaPack(c, templates, pins, opts?.templateId)
            : kind === 'appeal_letter'
              ? generateAppealLetter(c, templates, pins, opts?.payerStyle, opts?.templateId)
              : kind === 'pa_support_letter'
                ? generatePaSupportLetter(c, templates, pins, opts?.templateId)
                : kind === 'referral_letter'
                  ? generateReferralLetter(c, templates, opts?.templateId)
                  : kind === 'sick_note'
                    ? generateSickNote(c, templates, opts?.templateId)
                    : kind === 'disability_letter'
                      ? generateDisabilityLetter(c, templates, opts?.templateId)
              : kind === 'soap_note'
                  ? generateSoapNote(c, templates, opts?.transcript, opts?.templateId)
                : kind === 'avs'
                    ? generateAvs(c, templates, opts?.transcript, opts?.templateId)
                    : kind === 'hpi_pe_mdm_note'
                      ? generateHpiPeMdmNote(c, opts?.transcript)
                  : generatePaPack(c, templates, pins);

        const existing = get().documents.find((d) => d.caseId === caseId && d.kind === kind);
        const doc: DocumentArtifact = {
          id: existing?.id ?? uuidv4(),
          kind,
          title: generated.title,
          caseId,
          templateId: opts?.templateId ?? existing?.templateId,
          payerStyle: opts?.payerStyle ?? existing?.payerStyle,
          contentMd: generated.contentMd,
          citations: generated.citations,
          missingInfoChecklist: generated.missingInfoChecklist,
          riskWarnings: generated.riskWarnings,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
          versions: existing?.versions ?? [],
        };

        get().upsertDocument(doc);
        get().log({
          actionType: 'generate',
          entityType: 'Document',
          entityId: doc.id,
          summary: `Generated ${kind} for case`,
        });
        return doc.id;
      },

      seedDemoData: () => {
        const baseNow = now();
        const case1Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'Major Depressive Disorder, recurrent, severe (TRD)',
          serviceOrDrug: 'Spravato (Esketamine) nasal spray',
          dosage: '84 mg',
          frequency: 'Twice weekly (induction)',
          duration: '4 weeks (induction), then weekly (maintenance)',
          severity: 'PHQ-9: 22 (severe)',
          riskFactors: ['hospitalizationHistory'],
          payer: {
            payerName: 'BlueCross (Demo)',
            planType: 'Commercial PPO',
            denialReasonCode: '',
            denialText: '',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Sertraline', outcome: 'ineffective', note: 'Adequate dose/duration; minimal response.' },
            { id: uuidv4(), name: 'Venlafaxine XR', outcome: 'ineffective', note: 'Partial response; persistent impairment.' },
            { id: uuidv4(), name: 'Bupropion XL', outcome: 'intolerant', note: 'Increased anxiety/insomnia.' },
          ],
          attachments: [
            { id: uuidv4(), label: 'Prior medication list (placeholder)', addedAt: baseNow },
            { id: uuidv4(), label: 'PHQ-9 screenshot (placeholder)', addedAt: baseNow },
          ],
          status: 'in_progress',
          pinnedEvidenceIds: ['ev-002', 'ev-018', 'ev-022'],
        });

        const case2Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'ADHD, combined presentation',
          serviceOrDrug: 'Lisdexamfetamine (Vyvanse)',
          dosage: '40 mg',
          frequency: 'Daily',
          duration: 'Ongoing (reassess at 8–12 weeks)',
          severity: 'ASRS: elevated; functional impairment documented',
          riskFactors: ['substanceUse'],
          payer: {
            payerName: 'UnitedHealth (Demo)',
            planType: 'HMO',
            denialReasonCode: 'ST-01',
            denialText: 'Step therapy required: trial methylphenidate ER first.',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Mixed amphetamine salts IR', outcome: 'intolerant', note: 'Rebound irritability and afternoon crash.' },
          ],
          attachments: [{ id: uuidv4(), label: 'Denial letter (placeholder)', addedAt: baseNow - 86_400_000 }],
          status: 'denied',
          pinnedEvidenceIds: ['ev-003', 'ev-011', 'ev-020'],
        });

        const case3Id = get().createCase({
          specialty: 'Psychiatry',
          diagnosis: 'Bipolar I disorder (recent manic episode)',
          serviceOrDrug: 'Cariprazine (Vraylar)',
          dosage: '1.5 mg',
          frequency: 'Daily',
          duration: '8 weeks then maintenance',
          severity: 'Clinical severity: moderate; sleep disruption noted',
          riskFactors: ['hospitalizationHistory', 'comorbidities'],
          payer: {
            payerName: 'Aetna (Demo)',
            planType: 'Commercial',
            denialReasonCode: '',
            denialText: '',
          },
          priorTreatments: [
            { id: uuidv4(), name: 'Quetiapine', outcome: 'intolerant', note: 'Sedation and metabolic concerns.' },
            { id: uuidv4(), name: 'Lithium', outcome: 'contraindicated', note: 'Contraindicated due to renal monitoring constraints (demo).' },
          ],
          attachments: [{ id: uuidv4(), label: 'Hospital discharge summary (placeholder)', addedAt: baseNow - 172_800_000 }],
          status: 'submitted',
          pinnedEvidenceIds: ['ev-004', 'ev-021', 'ev-028'],
        });

        get().log({
          actionType: 'create',
          entityType: 'System',
          summary: `Seeded demo data (3 cases): ${case1Id}, ${case2Id}, ${case3Id}`,
        });
      },

      clearAllLocalData: () => {
        set({
          settings: defaultSettings(),
          cases: [],
          templates: DEFAULT_TEMPLATES,
          evidenceCustom: [],
          documents: [],
          auditLog: [],
        });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        get().log({
          actionType: 'clear',
          entityType: 'System',
          summary: 'Cleared all local data',
        });
      },

      exportAllData: () => ({
        exportedAt: now(),
        version: APP_DATA_VERSION,
        settings: get().settings,
        cases: get().cases,
        documents: get().documents,
        templates: get().templates,
        evidenceCustom: get().evidenceCustom,
        auditLog: get().auditLog,
      }),

      importAllData: (data) => {
        set({
          settings: data.settings ?? defaultSettings(),
          cases: data.cases ?? [],
          documents: data.documents ?? [],
          templates: data.templates ?? DEFAULT_TEMPLATES,
          evidenceCustom: data.evidenceCustom ?? [],
          auditLog: data.auditLog ?? [],
        });
        get().log({
          actionType: 'import',
          entityType: 'System',
          summary: `Imported workspace backup`,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: APP_DATA_VERSION,
      partialize: (state) => ({
        settings: state.settings,
        cases: state.cases,
        templates: state.templates,
        evidenceCustom: state.evidenceCustom,
        documents: state.documents,
        auditLog: state.auditLog,
      }),
    },
  ),
);
```

## src/main.tsx

```
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


```

## src/pages/AuditLog.tsx

```
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
```

## src/pages/AuthSuite.tsx

```
import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { AlertCircle, Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { CaseStatus, DocumentKind } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';

const STATUSES: CaseStatus[] = ['draft', 'in_progress', 'submitted', 'denied', 'appeal', 'approved'];

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const AuthSuite: React.FC = () => {
  const {
    cases,
    setCaseStatus,
    getCaseById,
    getDocumentForCase,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    templates,
    log,
  } = useStore();

  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const activeCase = getCaseById(selectedCaseId);

  const paDoc = activeCase ? getDocumentForCase(activeCase.id, 'pa_pack') : undefined;
  const appealDoc = activeCase ? getDocumentForCase(activeCase.id, 'appeal_letter') : undefined;

  const authTemplates = useMemo(
    () => templates.filter((t) => t.category === 'Authorization templates'),
    [templates],
  );

  const paTemplates = useMemo(
    () => authTemplates.filter((t) => t.id.includes('pa-pack') || /PA Evidence Pack/i.test(t.name)),
    [authTemplates],
  );
  const appealTemplates = useMemo(
    () => authTemplates.filter((t) => t.id.includes('appeal') || /Appeal/i.test(t.name)),
    [authTemplates],
  );

  const [paTemplateId, setPaTemplateId] = useState<string>('tmpl-auth-pa-pack-standard');
  const [appealTemplateId, setAppealTemplateId] = useState<string>('tmpl-auth-appeal-formal-generic');
  const [activeDragCaseId, setActiveDragCaseId] = useState<string | null>(null);

  const handleGenerate = (kind: DocumentKind) => {
    if (!activeCase) return;
    if (kind === 'pa_pack') generateForCase(activeCase.id, kind, { templateId: paTemplateId });
    else if (kind === 'appeal_letter') generateForCase(activeCase.id, kind, { templateId: appealTemplateId });
    else generateForCase(activeCase.id, kind);
  };

  const handleCopy = async (kind: DocumentKind) => {
    if (!activeCase) return;
    const doc = getDocumentForCase(activeCase.id, kind);
    if (!doc) return;
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({
      actionType: 'copy',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Copied ${kind} to clipboard`,
    });
  };

  const handlePrint = () => window.print();

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDragCaseId(null);
    const caseId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : '';
    if (!overId) return;
    if (!STATUSES.includes(overId as any)) return;
    setCaseStatus(caseId, overId as CaseStatus);
  };

  const KanbanColumn: React.FC<{ status: CaseStatus; onSelect: (caseId: string) => void }> = ({
    status,
    onSelect,
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const items = cases.filter((c) => !c.archivedAt && c.status === status);

    return (
      <div
        ref={setNodeRef}
        className={`w-72 rounded-xl border flex-shrink-0 ${
          isOver ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase">{status.replace('_', ' ')}</div>
          <div className="text-xs px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            {items.length}
          </div>
        </div>
        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          {items.map((c) => (
            <KanbanCard key={c.id} caseId={c.id} title={c.serviceOrDrug} subtitle={c.diagnosis} onSelect={onSelect} />
          ))}
          {items.length === 0 ? <div className="p-3 text-xs text-slate-400">Drop here</div> : null}
        </div>
      </div>
    );
  };

  const KanbanCard: React.FC<{
    caseId: string;
    title: string;
    subtitle: string;
    onSelect: (caseId: string) => void;
  }> = ({ caseId, title, subtitle, onSelect }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: caseId });
    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 rounded-lg border cursor-pointer select-none ${
          isDragging ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
        onClick={() => onSelect(caseId)}
        {...listeners}
        {...attributes}
      >
        <div className="text-sm font-bold text-slate-900 truncate">{title || '(untitled)'}</div>
        <div className="text-xs text-slate-500 truncate">{subtitle || '(no diagnosis)'}</div>
      </div>
    );
  };

  const DragCardOverlay: React.FC<{ caseId: string }> = ({ caseId }) => {
    const c = getCaseById(caseId);
    if (!c) return null;
    return (
      <div className="p-3 rounded-lg border border-brand-300 bg-white shadow-soft w-72">
        <div className="text-sm font-bold text-slate-900 truncate">{c.serviceOrDrug || '(untitled)'}</div>
        <div className="text-xs text-slate-500 truncate">{c.diagnosis || '(no diagnosis)'}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Active Case</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Status tracking board (drag & drop)
            </label>
            <DndContext
              onDragStart={(e) => setActiveDragCaseId(String(e.active.id))}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveDragCaseId(null)}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {STATUSES.map((s) => (
                  <KanbanColumn
                    key={s}
                    status={s}
                    onSelect={(id) => {
                      setSelectedCaseId(id);
                    }}
                  />
                ))}
              </div>
              <DragOverlay>{activeDragCaseId ? <DragCardOverlay caseId={activeDragCaseId} /> : null}</DragOverlay>
            </DndContext>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          This module demonstrates <span className="font-semibold">PA Evidence Pack</span> +{' '}
          <span className="font-semibold">Appeal Writer</span> workflow. Outputs are deterministic (templates + rules + pinned evidence).
        </div>
      </div>

      {!activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          No active case selected. Seed demo data in Settings, then come back here.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* PA Pack */}
          <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">PA Evidence Pack</div>
                <div className="font-bold text-slate-900">{activeCase.serviceOrDrug || '(untitled)'}</div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <select
                  className="p-2 border rounded-md text-sm"
                  value={paTemplateId}
                  onChange={(e) => setPaTemplateId(e.target.value)}
                  title="Select PA pack template"
                >
                  {(paTemplates.length ? paTemplates : authTemplates).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerate('pa_pack')}
                  className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                >
                  Generate
                </button>
                <button
                  onClick={() => (paDoc ? saveDocumentVersion(paDoc.id, '') : undefined)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                  title="Save a snapshot version"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Version
                </button>
              </div>
            </div>

            {paDoc?.missingInfoChecklist?.length ? (
              <div className="p-4 border-b border-slate-100 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Missing info checklist
                </div>
                <div className="text-xs text-amber-800">
                  {paDoc.missingInfoChecklist.map((m) => (
                    <span key={m} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-amber-100 border border-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="p-4 border-b border-slate-100 bg-white text-xs text-slate-600">
              <div className="font-semibold mb-1">Risk warnings / disclaimers</div>
              <ul className="list-disc list-inside">
                {(paDoc?.riskWarnings?.length ? paDoc.riskWarnings : ['Generate to see disclaimers.']).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={paDoc?.contentMd ?? ''}
                onChange={(v) => (paDoc ? updateDocumentContent(paDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic PA pack output..."
                heightClassName="h-[32rem]"
              />
              {paDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paDoc.versions.map((v) => (
                      <button
                        key={v.id}
                        className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                        onClick={() => updateDocumentContent(paDoc.id, v.contentMd)}
                        title="Load this version into editor"
                      >
                        <div className="text-sm font-semibold text-slate-800">{v.label}</div>
                        <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 flex gap-2 no-print">
                <button
                  onClick={() => handleCopy('pa_pack')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                >
                  <Copy className="w-4 h-4" />
                  Copy for Portal
                </button>
                <button
                  onClick={() => {
                    if (!paDoc) return;
                    log({
                      actionType: 'export',
                      entityType: 'Document',
                      entityId: paDoc.id,
                      summary: 'Exported PA pack via print',
                    });
                    handlePrint();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!paDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF (Print)
                </button>
              </div>
            </div>
          </div>

          {/* Appeal */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Appeal Letter</div>
                <div className="font-bold text-slate-900">{activeCase.payer?.payerName || 'Payer (not set)'}</div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <select
                  className="p-2 border rounded-md text-sm"
                  value={appealTemplateId}
                  onChange={(e) => setAppealTemplateId(e.target.value)}
                  title="Select appeal template"
                >
                  {(appealTemplates.length ? appealTemplates : authTemplates).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerate('appeal_letter')}
                  className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                >
                  Generate
                </button>
                <button
                  onClick={() => (appealDoc ? saveDocumentVersion(appealDoc.id, '') : undefined)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Version
                </button>
              </div>
            </div>

            {appealDoc?.missingInfoChecklist?.length ? (
              <div className="p-4 border-b border-slate-100 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Missing info checklist
                </div>
                <div className="text-xs text-amber-800">
                  {appealDoc.missingInfoChecklist.map((m) => (
                    <span key={m} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-amber-100 border border-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="p-4">
              <MarkdownEditor
                value={appealDoc?.contentMd ?? ''}
                onChange={(v) => (appealDoc ? updateDocumentContent(appealDoc.id, v) : undefined)}
                placeholder="Click Generate to produce deterministic appeal letter..."
                heightClassName="h-[32rem]"
              />
              {appealDoc?.versions?.length ? (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 no-print">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {appealDoc.versions.map((v) => (
                      <button
                        key={v.id}
                        className="w-full text-left p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                        onClick={() => updateDocumentContent(appealDoc.id, v.contentMd)}
                        title="Load this version into editor"
                      >
                        <div className="text-sm font-semibold text-slate-800">{v.label}</div>
                        <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 flex gap-2 no-print">
                <button
                  onClick={() => handleCopy('appeal_letter')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Copy className="w-4 h-4" />
                  Copy for Portal
                </button>
                <button
                  onClick={() => {
                    if (!appealDoc) return;
                    log({
                      actionType: 'export',
                      entityType: 'Document',
                      entityId: appealDoc.id,
                      summary: 'Exported appeal letter via print',
                    });
                    handlePrint();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!appealDoc}
                >
                  <Download className="w-4 h-4" />
                  Export PDF (Print)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## src/pages/CaseCards.tsx

```
import React, { useMemo, useState } from 'react';
import { Archive, Copy, Plus, Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../lib/store';
import { CASE_STATUS_LABELS, RISK_FACTOR_LABELS } from '../lib/constants';
import type { CaseCard, CaseStatus, RiskFactorKey } from '../lib/schema';

function looksLikePHI(s: string): boolean {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phone = /\b(\+?\d[\d\s().-]{7,}\d)\b/;
  return email.test(s) || phone.test(s);
}

const STATUS_OPTIONS: CaseStatus[] = ['draft', 'in_progress', 'submitted', 'denied', 'appeal', 'approved'];
const RISK_KEYS: RiskFactorKey[] = ['suicidality', 'hospitalizationHistory', 'substanceUse', 'comorbidities'];

type EditableCase = Omit<CaseCard, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

function makeBlankDraft(): EditableCase {
  return {
    specialty: 'Psychiatry',
    diagnosis: '',
    serviceOrDrug: '',
    dosage: '',
    frequency: '',
    duration: '',
    priorTreatments: [],
    severity: '',
    riskFactors: [],
    payer: undefined,
    attachments: [],
    status: 'draft',
    archivedAt: undefined,
    pinnedEvidenceIds: [],
  };
}

const CaseModal: React.FC<{
  open: boolean;
  onClose: () => void;
  value: EditableCase;
  onSave: (v: EditableCase) => void;
  phiSafetyMode: boolean;
}> = ({ open, onClose, value, onSave, phiSafetyMode }) => {
  const [draft, setDraft] = useState<EditableCase>(value);

  React.useEffect(() => setDraft(value), [value, open]);
  if (!open) return null;

  const warn = phiSafetyMode && looksLikePHI(JSON.stringify(draft));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Case Card (De-identified)</div>
            <div className="font-bold text-slate-900">{draft.id ? 'Edit Case' : 'New Case'}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <div className="font-semibold">PHI Warning</div>
            Please do <span className="font-semibold">not</span> enter patient name, MRN, phone, email, or other identifiers. Use de-identified demo content only.
            {warn ? <div className="mt-2 font-semibold">Potential PHI detected — please review.</div> : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specialty</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={draft.specialty}
                    onChange={(e) => setDraft((d) => ({ ...d, specialty: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={draft.status}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as CaseStatus }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {CASE_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</label>
                <input
                  className="w-full p-2 border rounded-md"
                  value={draft.diagnosis}
                  onChange={(e) => setDraft((d) => ({ ...d, diagnosis: e.target.value }))}
                  placeholder="ICD-10 or free text (no PHI)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service / Drug</label>
                  <input
                    className="w-full p-2 border rounded-md font-semibold"
                    value={draft.serviceOrDrug}
                    onChange={(e) => setDraft((d) => ({ ...d, serviceOrDrug: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Severity (optional)</label>
                  <input
                    className="w-full p-2 border rounded-md"
                    value={draft.severity ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}
                    placeholder="e.g., PHQ-9: 22"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dosage</label>
                  <input className="w-full p-2 border rounded-md" value={draft.dosage} onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Frequency</label>
                  <input className="w-full p-2 border rounded-md" value={draft.frequency} onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration</label>
                  <input className="w-full p-2 border rounded-md" value={draft.duration} onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Factors (checkboxes)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {RISK_KEYS.map((k) => {
                    const checked = draft.riskFactors.includes(k);
                    return (
                      <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              riskFactors: checked ? d.riskFactors.filter((x) => x !== k) : [...d.riskFactors, k],
                            }))
                          }
                        />
                        {RISK_FACTOR_LABELS[k]}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Prior Treatments</div>
                <div className="space-y-2">
                  {draft.priorTreatments.map((t, idx) => (
                    <div key={t.id} className="grid grid-cols-12 gap-2 items-start">
                      <input
                        className="col-span-4 p-2 border rounded-md text-sm"
                        placeholder="Name"
                        value={t.name}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)),
                          }))
                        }
                      />
                      <select
                        className="col-span-3 p-2 border rounded-md text-sm"
                        value={t.outcome}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, outcome: e.target.value as any } : x)),
                          }))
                        }
                      >
                        <option value="failed">failed</option>
                        <option value="intolerant">intolerant</option>
                        <option value="contraindicated">contraindicated</option>
                        <option value="ineffective">ineffective</option>
                      </select>
                      <input
                        className="col-span-4 p-2 border rounded-md text-sm"
                        placeholder="Note"
                        value={t.note}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            priorTreatments: d.priorTreatments.map((x) => (x.id === t.id ? { ...x, note: e.target.value } : x)),
                          }))
                        }
                      />
                      <button
                        className="col-span-1 p-2 rounded hover:bg-red-50 text-red-600"
                        onClick={() =>
                          setDraft((d) => ({ ...d, priorTreatments: d.priorTreatments.filter((x) => x.id !== t.id) }))
                        }
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        priorTreatments: [...d.priorTreatments, { id: uuidv4(), name: '', outcome: 'failed', note: '' }],
                      }))
                    }
                  >
                    + Add prior treatment
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Payer (optional)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Payer Name</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.payerName ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), payerName: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Plan Type</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.planType ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), planType: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Denial Reason Code</label>
                    <input
                      className="w-full p-2 border rounded-md text-sm"
                      value={draft.payer?.denialReasonCode ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), denialReasonCode: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Denial Text</label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={draft.payer?.denialText ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payer: { ...(d.payer ?? { payerName: '' }), denialText: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Attachments (placeholders)</div>
                <div className="space-y-2">
                  {draft.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <input
                        className="flex-1 p-2 border rounded-md text-sm"
                        value={a.label}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            attachments: d.attachments.map((x) => (x.id === a.id ? { ...x, label: e.target.value } : x)),
                          }))
                        }
                      />
                      <button
                        className="px-3 py-2 rounded hover:bg-red-50 text-red-600"
                        onClick={() => setDraft((d) => ({ ...d, attachments: d.attachments.filter((x) => x.id !== a.id) }))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        attachments: [...d.attachments, { id: uuidv4(), label: 'New attachment placeholder', addedAt: Date.now() }],
                      }))
                    }
                  >
                    + Add attachment placeholder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 bg-brand-600 text-white rounded-md font-semibold hover:bg-brand-700"
          >
            Save Case
          </button>
        </div>
      </div>
    </div>
  );
};

export const CaseCards: React.FC = () => {
  const { cases, settings, createCase, updateCase, duplicateCase, archiveCase, restoreCase } = useStore();
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string>(cases[0]?.id ?? '');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState<EditableCase>(makeBlankDraft());

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cases
      .filter((c) => (showArchived ? true : !c.archivedAt))
      .filter((c) => (!statusFilter ? true : c.status === statusFilter))
      .filter((c) => {
        if (!query) return true;
        return (
          c.serviceOrDrug.toLowerCase().includes(query) ||
          c.diagnosis.toLowerCase().includes(query) ||
          c.specialty.toLowerCase().includes(query) ||
          (c.payer?.payerName ?? '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cases, q, showArchived, statusFilter]);

  const selected = cases.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const openNew = () => {
    setModalValue(makeBlankDraft());
    setModalOpen(true);
  };

  const openEdit = (c: CaseCard) => {
    const { id, createdAt, updatedAt, ...rest } = c;
    setModalValue({ id, ...rest });
    setModalOpen(true);
  };

  const onSave = (v: EditableCase) => {
    if (v.id) {
      updateCase(v.id, v as any);
    } else {
      const id = createCase(v as any);
      setSelectedId(id);
    }
    setModalOpen(false);
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Case Cards</div>
              <div className="font-bold text-slate-900">De-identified workspace</div>
            </div>
            <button
              onClick={openNew}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder="Search specialty, diagnosis, drug, payer..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <select
              className="flex-1 p-2 border rounded-md text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {CASE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <label className="text-sm text-slate-600 flex items-center gap-2">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
              Archived
            </label>
          </div>
          {settings.phiSafetyMode ? (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              PHI Safety Mode is ON — do not enter names/MRN/phone/email.
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            Cases ({filtered.length})
          </div>
          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${
                  selected?.id === c.id ? 'bg-brand-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{c.serviceOrDrug || '(untitled)'}</div>
                    <div className="text-xs text-slate-500 truncate">{c.diagnosis || '(no diagnosis)'}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200">
                    {CASE_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {c.specialty} • {c.payer?.payerName ?? 'No payer'} • {c.pinnedEvidenceIds.length} pins
                </div>
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No cases. Seed demo data in Settings or create a new case.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!selected ? (
            <div className="p-10 text-center text-slate-400">Select a case to view details.</div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Case Details</div>
                  <div className="font-bold text-slate-900 truncate">{selected.serviceOrDrug || '(untitled)'}</div>
                  <div className="text-xs text-slate-500 truncate">{selected.diagnosis || '(no diagnosis)'}</div>
                </div>
                <div className="flex gap-2 no-print">
                  <button
                    onClick={() => duplicateCase(selected.id)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  {selected.archivedAt ? (
                    <button
                      onClick={() => restoreCase(selected.id)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveCase(selected.id)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(selected)}
                    className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Core</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div><span className="text-slate-500">Specialty:</span> {selected.specialty}</div>
                      <div><span className="text-slate-500">Dose:</span> {selected.dosage || '-'}</div>
                      <div><span className="text-slate-500">Frequency:</span> {selected.frequency || '-'}</div>
                      <div><span className="text-slate-500">Duration:</span> {selected.duration || '-'}</div>
                      <div><span className="text-slate-500">Severity:</span> {selected.severity || '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Prior treatments</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selected.priorTreatments.length ? (
                        <ul className="list-disc list-inside">
                          {selected.priorTreatments.map((t) => (
                            <li key={t.id}>
                              <span className="font-semibold">{t.name}</span> — <span className="text-slate-600">{t.outcome}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500">No prior treatments recorded.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Payer</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div><span className="text-slate-500">Payer:</span> {selected.payer?.payerName ?? '-'}</div>
                      <div><span className="text-slate-500">Plan:</span> {selected.payer?.planType ?? '-'}</div>
                      <div><span className="text-slate-500">Denial code:</span> {selected.payer?.denialReasonCode ?? '-'}</div>
                      <div className="mt-2"><span className="text-slate-500">Denial text:</span> {selected.payer?.denialText ?? '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Evidence pins</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-700">{selected.pinnedEvidenceIds.length} pinned evidence items</div>
                      <div className="text-xs text-slate-500 mt-1">Manage pins in Evidence Retrieval.</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Attachments</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selected.attachments.length ? (
                        <ul className="list-disc list-inside">
                          {selected.attachments.map((a) => (
                            <li key={a.id}>{a.label}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500">No attachment placeholders.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={modalValue}
        onSave={onSave}
        phiSafetyMode={settings.phiSafetyMode}
      />
    </div>
  );
};
```

## src/pages/ClinicalOutputStudio.tsx

```
import React, { useMemo, useState } from 'react';
import { Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { DocumentKind, CaseCard } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';

type ClinicalType = 'soap' | 'hpi' | 'avs';

const CLINICAL_KIND: Record<ClinicalType, DocumentKind> = {
  soap: 'soap_note',
  hpi: 'hpi_pe_mdm_note',
  avs: 'avs',
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildDocumentationQA(c: CaseCard, transcript?: string): { issue: string; suggestion: string }[] {
  const issues: { issue: string; suggestion: string }[] = [];
  if (!c.diagnosis) issues.push({ issue: 'Missing diagnosis', suggestion: 'Add diagnosis (ICD-10 or free text) in Case Card.' });
  if (!c.serviceOrDrug) issues.push({ issue: 'Missing requested therapy', suggestion: 'Add service/drug name and intended plan.' });
  if (!c.dosage) issues.push({ issue: 'Missing dosage', suggestion: 'Add dose and formulation details for the requested therapy.' });
  if (!c.frequency) issues.push({ issue: 'Missing frequency', suggestion: 'Add frequency / administration schedule.' });
  if (!c.duration) issues.push({ issue: 'Missing duration', suggestion: 'Add expected duration or trial window.' });
  if (!c.severity) issues.push({ issue: 'Missing severity scale', suggestion: 'Add a measurement (e.g., PHQ-9, ASRS) or severity statement.' });
  if (!c.priorTreatments.length) issues.push({ issue: 'No prior treatment history', suggestion: 'Add prior treatments with outcomes (failed/intolerant/etc.).' });
  if (!transcript?.trim()) issues.push({ issue: 'No transcript provided', suggestion: 'Paste a short transcript excerpt if available (optional).' });
  return issues;
}

export const ClinicalOutputStudio: React.FC = () => {
  const {
    cases,
    templates,
    getCaseById,
    getDocumentForCase,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    log,
  } = useStore();

  const [clinicalType, setClinicalType] = useState<ClinicalType>('soap');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const [transcript, setTranscript] = useState<string>('');
  const activeCase = getCaseById(selectedCaseId);

  const kind = CLINICAL_KIND[clinicalType];
  const doc = activeCase ? getDocumentForCase(activeCase.id, kind) : undefined;

  const availableTemplates = useMemo(() => {
    if (clinicalType === 'avs') return templates.filter((t) => t.category === 'AVS templates');
    return templates.filter((t) => t.category === 'Clinical note templates');
  }, [templates, clinicalType]);

  const defaultTemplateId = availableTemplates[0]?.id ?? '';
  const [templateId, setTemplateId] = useState<string>(defaultTemplateId);
  React.useEffect(() => setTemplateId(defaultTemplateId), [defaultTemplateId]);

  const qa = useMemo(() => (activeCase ? buildDocumentationQA(activeCase, transcript) : []), [activeCase, transcript]);

  const handleGenerate = () => {
    if (!activeCase) return;
    generateForCase(activeCase.id, kind, { transcript, templateId });
  };

  const handleCopy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({ actionType: 'copy', entityType: 'Document', entityId: doc.id, summary: `Copied ${kind}` });
  };

  const handlePrint = () => {
    if (!doc) return;
    log({ actionType: 'export', entityType: 'Document', entityId: doc.id, summary: `Exported ${kind} via print` });
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-72">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Output type</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={clinicalType}
              onChange={(e) => setClinicalType(e.target.value as ClinicalType)}
            >
              <option value="soap">SOAP Note Draft</option>
              <option value="hpi">HPI/PE/MDM Draft</option>
              <option value="avs">After Visit Summary (AVS)</option>
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Case source</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Template</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={handleGenerate}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
            >
              Generate
            </button>
            <button
              onClick={() => (doc ? saveDocumentVersion(doc.id, '') : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
              disabled={!doc}
              title="Save a snapshot"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Version
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Transcript (optional)</label>
          <textarea
            className="w-full p-3 border rounded-md text-sm"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste a transcript excerpt (plain text)."
          />
        </div>
      </div>

      {!activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Select a case to generate clinical outputs. (You can seed demo data in Settings.)
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Editable output</div>
                <div className="font-bold text-slate-900">{doc?.title ?? 'Generate to create output'}</div>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={doc?.contentMd ?? ''}
                onChange={(v) => (doc ? updateDocumentContent(doc.id, v) : undefined)}
                placeholder="Click Generate to create the clinical note..."
                heightClassName="h-[34rem]"
              />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Documentation QA</div>
              {qa.length ? (
                <div className="space-y-2">
                  {qa.map((x, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-800 text-sm">{x.issue}</div>
                      <div className="text-xs text-slate-600 mt-1">{x.suggestion}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No common gaps detected from Case Card fields.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
              {doc?.versions?.length ? (
                <div className="space-y-2">
                  {doc.versions.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                      onClick={() => updateDocumentContent(doc.id, v.contentMd)}
                      title="Load this version into editor"
                    >
                      <div className="font-semibold text-slate-800">{v.label}</div>
                      <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No saved versions yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


```

## src/pages/Dashboard.tsx

```
import React from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const { cases, auditLog, seedDemoData, clearAllLocalData } = useStore();

  const pending = cases.filter(c => c.status === 'in_progress' || c.status === 'draft').length;
  const denied = cases.filter(c => c.status === 'denied').length;
  const approved = cases.filter(c => c.status === 'approved').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Cases" value={cases.length} icon={FileText} color="bg-blue-500" />
        <StatCard label="Pending Action" value={pending} icon={Clock} color="bg-amber-500" />
        <StatCard label="Denials" value={denied} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Approved" value={approved} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Recent Activity</h2>
            <Link to="/audit" className="text-sm text-brand-600 hover:underline">View all</Link>
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
            {auditLog.length === 0 && <div className="p-8 text-center text-slate-500">No activity logged.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/cases" className="block w-full p-4 text-center rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-colors">
              + Create New Case
            </Link>
            
            {cases.length === 0 && (
              <div className="p-4 bg-brand-50 rounded-lg border border-brand-100 text-center">
                <p className="text-brand-800 mb-3">Welcome! Your workspace is empty.</p>
                <button 
                  onClick={seedDemoData}
                  className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700"
                >
                  Load Demo Data (3 Cases)
                </button>
              </div>
            )}
            
            <button onClick={clearAllLocalData} className="w-full text-xs text-slate-400 hover:text-red-500 mt-8">
              Reset Workspace (Clear LocalStorage)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## src/pages/Evidence.tsx

```
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
```

## src/pages/LettersStudio.tsx

```
import React, { useMemo, useState } from 'react';
import { Copy, Download, Save } from 'lucide-react';
import { useStore } from '../lib/store';
import type { DocumentKind, Template } from '../lib/schema';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { v4 as uuidv4 } from 'uuid';

type LetterType = 'referral' | 'sick_note' | 'disability' | 'pa_support';

const LETTER_KIND: Record<LetterType, DocumentKind> = {
  referral: 'referral_letter',
  sick_note: 'sick_note',
  disability: 'disability_letter',
  pa_support: 'pa_support_letter',
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const LettersStudio: React.FC = () => {
  const {
    cases,
    templates,
    getCaseById,
    getDocumentForCase,
    getDocumentById,
    generateForCase,
    updateDocumentContent,
    saveDocumentVersion,
    createTemplate,
    upsertDocument,
    log,
  } = useStore();

  const [mode, setMode] = useState<'case' | 'free'>('case');
  const [letterType, setLetterType] = useState<LetterType>('referral');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id ?? '');
  const activeCase = getCaseById(selectedCaseId);

  const letterTemplates = useMemo(
    () => templates.filter((t) => t.category === 'Letters templates'),
    [templates],
  );

  const defaultTemplateId = useMemo(() => {
    // Heuristic: pick matching built-in templates if present
    const byType: Record<LetterType, string> = {
      referral: 'tmpl-letters-referral',
      sick_note: 'tmpl-letters-sick-note',
      disability: 'tmpl-letters-disability',
      pa_support: 'tmpl-letters-pa-support',
    };
    const id = byType[letterType];
    return letterTemplates.some((t) => t.id === id) ? id : (letterTemplates[0]?.id ?? '');
  }, [letterType, letterTemplates]);

  const [templateId, setTemplateId] = useState<string>(defaultTemplateId);
  React.useEffect(() => setTemplateId(defaultTemplateId), [defaultTemplateId]);

  const kind = LETTER_KIND[letterType];
  const [freeDocId, setFreeDocId] = useState<string>('');
  const doc =
    mode === 'case'
      ? (activeCase ? getDocumentForCase(activeCase.id, kind) : undefined)
      : (freeDocId ? getDocumentById(freeDocId) : undefined);

  const [freeFields, setFreeFields] = useState({
    specialty: 'General',
    diagnosis: '',
    serviceOrDrug: '',
    dosage: '',
    frequency: '',
    duration: '',
    payerName: '',
    planType: '',
  });

  const freeMissing = (tpl: Template) => {
    const missing: string[] = [];
    for (const f of tpl.requiredFields ?? []) {
      const v =
        f === 'diagnosis'
          ? freeFields.diagnosis
          : f === 'serviceOrDrug'
            ? freeFields.serviceOrDrug
            : f === 'dosage'
              ? freeFields.dosage
              : f === 'frequency'
                ? freeFields.frequency
                : f === 'duration'
                  ? freeFields.duration
                  : f === 'payer.payerName'
                    ? freeFields.payerName
                    : '';
      if (!String(v ?? '').trim()) missing.push(f);
    }
    return Array.from(new Set(missing));
  };

  const renderFree = (tpl: Template) => {
    const ctx: Record<string, string> = {
      diagnosis: freeFields.diagnosis,
      serviceOrDrug: freeFields.serviceOrDrug,
      dosage: freeFields.dosage,
      frequency: freeFields.frequency,
      duration: freeFields.duration,
      payerName: freeFields.payerName,
      planType: freeFields.planType,
      priorTreatmentSection: '_Prior treatment history not provided in free input mode._',
      medicalNecessityRationale:
        'This is a demo placeholder. Please ensure clinical justification is reviewed and completed by a clinician.',
      referralReason: 'Please evaluate and provide recommendations. (Demo placeholder)',
      footnotes: '_No evidence pins in free input mode._',
    };
    return tpl.content.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_m, key) => {
      const v = ctx[key];
      return v == null || v === '' ? `[${String(key).toUpperCase()}]` : v;
    });
  };

  const handleGenerate = () => {
    if (mode === 'case') {
      if (!activeCase) return;
      generateForCase(activeCase.id, kind, { templateId });
      return;
    }

    const tpl = templates.find((t) => t.id === templateId) ?? letterTemplates[0];
    if (!tpl) return;

    const id = freeDocId || uuidv4();
    const missingInfoChecklist = freeMissing(tpl);
    const contentMd = renderFree(tpl);

    upsertDocument({
      id,
      kind,
      title: `${tpl.name} — Free input`,
      caseId: undefined,
      templateId: tpl.id,
      payerStyle: undefined,
      contentMd,
      citations: [],
      missingInfoChecklist,
      riskWarnings: [
        'Demo output — clinician review required. This content is generated from local templates and rules; it is not medical advice.',
        'Do not include PHI (names, MRN, phone, email). This workspace is for de-identified demo content.',
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    });
    setFreeDocId(id);
    log({ actionType: 'generate', entityType: 'Document', entityId: id, summary: `Generated ${kind} (free input)` });
  };

  const handleCopy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(stripMarkdown(doc.contentMd));
    log({
      actionType: 'copy',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Copied ${kind} to clipboard`,
    });
  };

  const handlePrint = () => {
    if (!doc) return;
    log({
      actionType: 'export',
      entityType: 'Document',
      entityId: doc.id,
      summary: `Exported ${kind} via print`,
    });
    window.print();
  };

  const handleSaveAsTemplate = () => {
    if (!doc) return;
    const name = `${doc.title} (Saved)`;
    createTemplate({
      name,
      category: 'Letters templates',
      specialty: (mode === 'case' ? activeCase?.specialty : freeFields.specialty) || 'General',
      payer: mode === 'case' ? activeCase?.payer?.payerName : freeFields.payerName || undefined,
      description: 'Saved from Letters Studio output (may contain resolved values; edit placeholders as needed).',
      content: doc.contentMd,
      requiredFields: [],
      tone: 'neutral',
      archivedAt: undefined,
    });
    log({
      actionType: 'create',
      entityType: 'Template',
      summary: `Saved letter output as template: ${name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-56">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mode</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="case">From Case Card</option>
              <option value="free">Free input</option>
            </select>
          </div>
          <div className="w-72">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Letter type</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={letterType}
              onChange={(e) => setLetterType(e.target.value as LetterType)}
            >
              <option value="referral">Referral Letter</option>
              <option value="sick_note">Sick Note</option>
              <option value="disability">Disability / Accommodation Letter</option>
              <option value="pa_support">Prior Auth Support Letter</option>
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Case source</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              disabled={mode !== 'case'}
            >
              <option value="" disabled>
                Select a case...
              </option>
              {cases
                .filter((c) => !c.archivedAt)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.serviceOrDrug || '(untitled)'} — {c.diagnosis || '(no diagnosis)'}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-80">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Template</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {letterTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={handleGenerate}
              className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700"
            >
              Generate
            </button>
            <button
              onClick={() => (doc ? saveDocumentVersion(doc.id, '') : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
              disabled={!doc}
              title="Save a snapshot"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Version
            </button>
          </div>
        </div>

        {mode === 'free' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.diagnosis}
                onChange={(e) => setFreeFields((s) => ({ ...s, diagnosis: e.target.value }))}
                placeholder="No PHI"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service/Drug</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.serviceOrDrug}
                onChange={(e) => setFreeFields((s) => ({ ...s, serviceOrDrug: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration</label>
              <input
                className="w-full p-2 border rounded-md text-sm"
                value={freeFields.duration}
                onChange={(e) => setFreeFields((s) => ({ ...s, duration: e.target.value }))}
              />
            </div>
          </div>
        ) : null}

        <div className="text-xs text-slate-500">
          Outputs are editable Markdown, generated deterministically using local templates and rules. No backend calls.
        </div>
      </div>

      {mode === 'case' && !activeCase ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Select a case to generate letters. (You can seed demo data in Settings.)
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Editable output</div>
                <div className="font-bold text-slate-900">{doc?.title ?? 'Generate to create output'}</div>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                  disabled={!doc}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50"
                  disabled={!doc}
                  title="Save current output as a template"
                >
                  Save as Template
                </button>
              </div>
            </div>

            <div className="p-4">
              <MarkdownEditor
                value={doc?.contentMd ?? ''}
                onChange={(v) => (doc ? updateDocumentContent(doc.id, v) : undefined)}
                placeholder="Click Generate to create the letter..."
                heightClassName="h-[34rem]"
              />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Missing fields</div>
              {doc?.missingInfoChecklist?.length ? (
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {doc.missingInfoChecklist.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">Generate to see required-field checks.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Versions</div>
              {doc?.versions?.length ? (
                <div className="space-y-2">
                  {doc.versions.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                      onClick={() => updateDocumentContent(doc.id, v.contentMd)}
                      title="Load this version into editor"
                    >
                      <div className="font-semibold text-slate-800">{v.label}</div>
                      <div className="text-xs text-slate-500">{new Date(v.savedAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No saved versions yet.</div>
              )}
              <div className="text-xs text-slate-400 mt-2">Click a version to load it into the editor.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


```

## src/pages/Settings.tsx

```
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
        <h2 className="text-lg font-bold text-slate-800 mb-4">User Simulation</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Active Role:</label>
          <select 
            className="p-2 border rounded-md"
            value={settings.userRole}
            onChange={(e) => setSettings({ userRole: e.target.value as any })}
          >
            <option value="Doctor">Doctor (Full Access)</option>
            <option value="Nurse">Nurse (Limited Edit)</option>
            <option value="Admin">Admin (Template Mgmt)</option>
          </select>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Privacy & Safety</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">PHI Safety Mode</div>
            <div className="text-sm text-slate-500">Warns when potential patient identifiers are typed.</div>
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
        <h2 className="text-lg font-bold text-slate-800 mb-4">Data Management</h2>
        <div className="space-y-4">
           <div className="flex gap-4">
             <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
               <Download className="w-4 h-4" /> Export Backup JSON
             </button>
             <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
               <Upload className="w-4 h-4" /> Import Backup JSON
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
               Seed Demo Data (3 Psychiatry PA cases)
             </button>
             <div className="text-xs text-slate-500 mt-2">
               Demo cases include psychiatry medication prior-auth scenarios and pinned evidence for citations.
             </div>
           </div>
           
           <div className="pt-4 border-t border-slate-100">
             <button
               onClick={() => { if(confirm('Are you sure? This deletes everything in localStorage.')) clearAllLocalData() }}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200"
             >
               <Trash2 className="w-4 h-4" /> Clear All Local Data
             </button>
           </div>
        </div>
      </section>

    </div>
  );
};
```

## src/pages/Templates.tsx

```
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
            <div className="font-bold text-slate-900">Template Library</div>
            <div className="flex gap-2">
              <button
                onClick={handleNew}
                className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"
                disabled={!canEdit}
                title={!canEdit ? 'Nurse role cannot create templates' : 'Create template'}
              >
                <Plus className="w-4 h-4" /> New
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
                disabled={!canImportExport}
                title={!canImportExport ? 'Admin only' : 'Export templates JSON'}
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <label
                className={`px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 cursor-pointer ${
                  !canImportExport ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={!canImportExport ? 'Admin only' : 'Import templates JSON'}
              >
                <Upload className="w-4 h-4" /> Import
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
```

## tailwind.config.ts

```
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [typography],
} satisfies Config;


```

## tools/dump.mjs

```
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'ClinicWorkspace_FullDump.md');
const excludeDirs = new Set(['node_modules', 'dist']);
const excludeFiles = new Set(['package-lock.json', 'ClinicWorkspace_FullDump.md', '.env.local', '.env']);

function rel(p) {
  return p.replace(root + path.sep, '').replaceAll('\\', '/');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  /** @type {string[]} */
  let files = [];
  for (const e of entries) {
    if (excludeDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(p));
    else files.push(p);
  }
  return files;
}

const files = walk(root).filter((p) => !excludeFiles.has(rel(p)));

let md = '';
md += '# Clinic Workspace — Source Dump\n\n';
md += `Generated at: ${new Date().toISOString()}\n\n`;
md += '## Included\n- All project source/config files\n\n';
md += '## Excluded\n- node_modules/\n- dist/\n- package-lock.json (generated)\n\n';
md += '## File list\n';
for (const p of files) md += `- \`${rel(p)}\`\n`;
md += '\n---\n';

for (const p of files) {
  const r = rel(p);
  const content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  md += `\n## ${r}\n\n`;
  md += '```\n';
  md += content;
  if (!content.endsWith('\n')) md += '\n';
  md += '```\n';
}

fs.writeFileSync(out, md, 'utf8');
console.log('Wrote', out, 'files', files.length);


```

## tsconfig.json

```
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

## vite.config.ts

```
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));
```
