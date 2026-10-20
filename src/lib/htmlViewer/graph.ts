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

async function findAssetBlock(assetPath: string): Promise<any | null> {
  const editor = logseqAPI.Editor;
  if (!editor?.getBlock) return null;
  const file = assetPath.split('/').pop() || '';
  const match = /^(.+)\.(html?|htm)$/i.exec(file);
  if (!match) return null;
  const uuid = match[1];
  try {
    const block = await editor.getBlock(uuid, { includeChildren: false });
    const type = block?.['logseq.property.asset/type']
      ?? block?.[':logseq.property.asset/type'];
    if (!block || !['html', 'htm', 'text/html'].includes(String(type || '').toLowerCase())) {
      return null;
    }
    return block;
  } catch {
    return null;
  }
}

export async function writeAnnotationToGraph(
  annotation: HtmlAnnotation,
  pagePrefix: string
): Promise<{ blockUuid?: string; pageName?: string; parentUuid?: string } | null> {
  const editor = logseqAPI.Editor;
  if (!editor?.insertBlock) return null;

  const assetBlock = await findAssetBlock(annotation.assetPath);
  if (assetBlock?.uuid) {
    const quote = annotation.quote
      .split(/\r?\n/)
      .map((line) => `> ${line}`)
      .join('\n');
    const body = [
      quote,
      annotation.comment ? `\n${annotation.comment}` : '',
      `\n来源: ${annotation.assetPath}`,
    ].join('');
    try {
      const block = await editor.insertBlock(String(assetBlock.uuid), body, {});
      // Mirror the PDF annotation association when the host supports writing
      // this property on a normal child block.
      if (block?.uuid && typeof editor.upsertBlockProperty === 'function') {
        try {
          await editor.upsertBlockProperty(block.uuid, 'logseq.property/asset', assetBlock.uuid);
        } catch {
          // Property may be scoped in some DB versions; parent linkage still works.
        }
      }
      return { blockUuid: block?.uuid, parentUuid: String(assetBlock.uuid) };
    } catch {
      return null;
    }
  }

  if (!editor.getPage || !editor.createPage) return null;

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
