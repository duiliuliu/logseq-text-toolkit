export type LogseqHref =
  | { type: 'page'; name: string }
  | { type: 'block'; uuid: string };

export function parseLogseqHref(href: string): LogseqHref | null {
  const match = /^logseq:\/\/(page|block)\/(.+)$/i.exec(String(href || '').trim());
  if (!match) return null;
  let value = match[2];
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the raw value for malformed escapes.
  }
  if (!value) return null;
  return match[1].toLowerCase() === 'page'
    ? { type: 'page', name: value }
    : { type: 'block', uuid: value };
}

export function isSafeDashboardCall(method: string): boolean {
  return new Set([
    'App.pushState',
    'App.openExternalLink',
    'Editor.openInRightSidebar',
  ]).has(method);
}
