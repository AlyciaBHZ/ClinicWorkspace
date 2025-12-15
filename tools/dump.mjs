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


