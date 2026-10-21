import type { HtmlAnnotation, HtmlTextAnchor } from './types';

interface TextNodeRange {
  node: Text;
  start: number;
  end: number;
}

function textNodes(doc: Document): TextNodeRange[] {
  const body = doc.body;
  if (!body) return [];
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const result: TextNodeRange[] = [];
  let offset = 0;
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent || '';
    result.push({ node: node as Text, start: offset, end: offset + text.length });
    offset += text.length;
    node = walker.nextNode();
  }
  return result;
}

export function bodyText(doc: Document): string {
  return textNodes(doc).map((item) => item.node.textContent || '').join('');
}

function offsetAt(doc: Document, container: Node, offset: number): number {
  const range = doc.createRange();
  range.selectNodeContents(doc.body);
  range.setEnd(container, offset);
  return range.toString().length;
}

function nodeAt(nodes: TextNodeRange[], offset: number): { node: Text; offset: number } | null {
  for (const item of nodes) {
    if (offset <= item.end) {
      return { node: item.node, offset: Math.max(0, offset - item.start) };
    }
  }
  const last = nodes[nodes.length - 1];
  return last ? { node: last.node, offset: (last.node.textContent || '').length } : null;
}

export function rangeToAnchor(doc: Document, range: Range): HtmlTextAnchor | null {
  if (!doc.body || range.collapsed) return null;
  const quote = range.toString();
  if (!quote.trim()) return null;

  const start = offsetAt(doc, range.startContainer, range.startOffset);
  const end = offsetAt(doc, range.endContainer, range.endOffset);
  if (end <= start) return null;

  const full = bodyText(doc);
  return {
    quote,
    start,
    end,
    prefix: full.slice(Math.max(0, start - 40), start),
    suffix: full.slice(end, Math.min(full.length, end + 40)),
  };
}

function matchScore(full: string, index: number, anchor: HtmlTextAnchor): number {
  let score = 0;
  if (anchor.prefix && full.slice(Math.max(0, index - anchor.prefix.length), index) === anchor.prefix) {
    score += 2;
  }
  const end = index + anchor.quote.length;
  if (anchor.suffix && full.slice(end, end + anchor.suffix.length) === anchor.suffix) {
    score += 2;
  }
  return score;
}

/**
 * Reconstruct a range from a text-quote anchor. Exact offsets are preferred;
 * quote+prefix/suffix is the fallback when a regenerated HTML file shifts text.
 */
export function anchorToRange(doc: Document, anchor: HtmlTextAnchor): Range | null {
  const nodes = textNodes(doc);
  const full = nodes.map((item) => item.node.textContent || '').join('');
  if (!anchor.quote) return null;

  let start = -1;
  if (
    typeof anchor.start === 'number' &&
    typeof anchor.end === 'number' &&
    full.slice(anchor.start, anchor.end) === anchor.quote
  ) {
    start = anchor.start;
  } else {
    let best = -1;
    let bestScore = -1;
    let index = full.indexOf(anchor.quote);
    while (index >= 0) {
      const score = matchScore(full, index, anchor);
      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
      index = full.indexOf(anchor.quote, index + Math.max(1, anchor.quote.length));
    }
    start = best;
  }

  if (start < 0) return null;
  const startPoint = nodeAt(nodes, start);
  const endPoint = nodeAt(nodes, start + anchor.quote.length);
  if (!startPoint || !endPoint) return null;

  const range = doc.createRange();
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);
  return range;
}

export function applyHighlights(
  doc: Document,
  annotations: HtmlAnnotation[],
  keyPrefix = 'ltt-html-'
): Map<string, Range> {
  const result = new Map<string, Range>();
  const win = doc.defaultView as any;
  if (!win?.CSS?.highlights || typeof win.Highlight !== 'function') return result;

  for (const key of Array.from(win.CSS.highlights.keys())) {
    if (String(key).startsWith(keyPrefix)) win.CSS.highlights.delete(key);
  }

  if (!doc.getElementById('ltt-html-highlight-style')) {
    const style = doc.createElement('style');
    style.id = 'ltt-html-highlight-style';
    style.textContent = '::highlight(ltt-html-highlight) { background-color: rgba(250, 204, 21, .42); color: inherit; }';
    (doc.head || doc.documentElement).appendChild(style);
  }

  const ranges: Range[] = [];
  for (const annotation of annotations) {
    const range = anchorToRange(doc, annotation.anchor);
    if (!range) continue;
    ranges.push(range);
    result.set(annotation.id, range);
  }
  if (ranges.length) {
    try {
      win.CSS.highlights.set(`${keyPrefix}highlight`, new win.Highlight(...ranges));
    } catch {
      // Ignore ranges that the browser cannot represent.
    }
  }
  return result;
}

export function scrollToRange(doc: Document, range: Range): void {
  const element = range.startContainer.parentElement || doc.body;
  element?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  const win = doc.defaultView;
  if (!win) return;
  const selection = win.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range.cloneRange());
  }
}
