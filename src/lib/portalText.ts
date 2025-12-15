export function toPortalText(md: string): string {
  const s = md.replace(/\r\n/g, '\n');

  // Strip code blocks but keep their content (best-effort)
  let out = s.replace(/```([\s\S]*?)```/g, (_m, inner) => String(inner ?? '').trim());

  // Convert links: [text](url) -> text (url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => `${text} (${url})`);

  // Remove images
  out = out.replace(/!\[[^\]]*]\([^)]*\)/g, '');

  // Keep headings, but remove the leading hashes
  out = out.replace(/^#{1,6}\s+/gm, '');

  // Remove emphasis/backticks while keeping text
  out = out.replace(/(\*\*|__)(.*?)\1/g, '$2');
  out = out.replace(/(\*|_)(.*?)\1/g, '$2');
  out = out.replace(/`([^`]+)`/g, '$1');

  // Normalize list markers (keep as "- ")
  out = out.replace(/^\s*[*+]\s+/gm, '- ');

  // Trim trailing spaces per-line
  out = out
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, ''))
    .join('\n');

  // Collapse excessive blank lines (keep max 1 blank line)
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  return out;
}


