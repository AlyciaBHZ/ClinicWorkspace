import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'ClinicWorkspace_GuidedDemo_UpdateDump.md');

const files = [
  'package.json',
  'vite.config.ts',
  'README.md',
  '.github/workflows/pages.yml',

  'src/main.tsx',
  'src/index.css',
  'src/print.css',

  'src/lib/constants.ts',
  'src/lib/schema.ts',
  'src/lib/store.ts',
  'src/lib/portalText.ts',
  'src/lib/demoTour.ts',
  'src/lib/diff.ts',

  'src/components/ui/Layout.tsx',
  'src/components/ui/ToastHost.tsx',
  'src/components/print/PrintModal.tsx',

  'src/pages/Dashboard.tsx',
  'src/pages/CaseCards.tsx',
  'src/pages/AuthSuite.tsx',
  'src/pages/Evidence.tsx',
  'src/pages/ClinicalOutputStudio.tsx',
  'src/pages/Templates.tsx',
  'src/pages/LettersStudio.tsx',
].map((p) => path.join(root, p));

function rel(p) {
  return p.replace(root + path.sep, '').replaceAll('\\', '/');
}

let md = '';
md += '# Clinic Workspace — Guided Demo Update Dump\n\n';
md += `Generated at: ${new Date().toISOString()}\n\n`;
md += '## Included files\n';
for (const p of files) md += `- \`${rel(p)}\`\n`;
md += '\n---\n';

for (const p of files) {
  const r = rel(p);
  if (!fs.existsSync(p)) {
    md += `\n## ${r}\n\n`;
    md += '```\n';
    md += `// Missing file: ${r}\n`;
    md += '```\n';
    continue;
  }
  const content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  md += `\n## ${r}\n\n`;
  md += '```\n';
  md += content;
  if (!content.endsWith('\n')) md += '\n';
  md += '```\n';
}

fs.writeFileSync(out, md, 'utf8');
console.log('Wrote', out, 'files', files.length);


