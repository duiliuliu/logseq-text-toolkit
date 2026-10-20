import { logseqAPI } from '../../logseq';
import type { HtmlAnnotation } from './types';

function safePageName(prefix: string, assetPath: string): string {
  const name = assetPath.split('/').pop() || assetPath;
  const raw = `${prefix}${name}`;
  return raw.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'HTML annotation';
}

export async function openAnnotationPage(pageName: string): Promise<void> {
  if (!pageName) return;
  try {
    await logseqAPI.App.pushState('page', { name: pageName });
  } catch {
    // navigation is best effort
  }
}

export async function writeAnnotationToGraph(
  annotation: HtmlAnnotation,
  pagePrefix: string
): Promise<{ blockUuid?: string; pageName: string } | null> {
  const editor = logseqAPI.Editor;
  if (!editor?.getPage || !editor?.createPage || !editor?.insertBlock) return null;

  const pageName = safePageName(pagePrefix, annotation.assetPath);
  try {
    let page = await editor.getPage(pageName);
    if (!page) {
      page = await editor.createPage(pageName, {}, { createFirstBlock: false });
    }
    const pageId = page?.uuid || page?.id;
    if (!pageId) return { pageName };

    const quote = annotation.quote
      .split(/\r?\n/)
      .map((line) => `> ${line}`)
      .join('\n');
    const body = [
      quote,
      annotation.comment ? `\n${annotation.comment}` : '',
      `\n来源: ${annotation.assetPath}`,
    ].join('');

    const block = await editor.insertBlock(String(pageId), body, {});
    return { blockUuid: block?.uuid, pageName };
  } catch {
    return { pageName };
  }
}

export async function removeAnnotationBlock(blockUuid?: string): Promise<void> {
  if (!blockUuid || typeof logseqAPI.Editor?.removeBlock !== 'function') return;
  try {
    await logseqAPI.Editor.removeBlock(blockUuid);
  } catch {
    // best effort
  }
}
