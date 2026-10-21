import { logseqAPI } from '../../logseq';

export type QuerySource =
  | { type: 'tag'; value: string }
  | { type: 'page'; value: string };

export interface QueryRow {
  uuid: string;
  title: string;
  page?: string;
  tags: string[];
  properties: Record<string, any>;
  updatedAt?: number;
}

const STATUS_KEY = 'logseq.property/status';

export const DEFAULT_STATUSES = ['Todo', 'Doing', 'Done', 'Waiting', 'In Review', 'Canceled'];

export function parseQuerySource(tokens: string[]): QuerySource | null {
  const map = new Map<string, string>();
  for (const token of tokens || []) {
    const index = token.indexOf('=');
    if (index <= 0) continue;
    map.set(token.slice(0, index).trim().toLowerCase(), token.slice(index + 1).trim());
  }
  const tag = map.get('tag');
  if (tag) return { type: 'tag', value: tag.replace(/^#/, '') };
  const page = map.get('page');
  if (page) return { type: 'page', value: page };
  return null;
}

export function valueToText(value: any): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return String(value.title ?? value.name ?? value.value ?? value['block/title'] ?? '');
  }
  return String(value);
}

export function propertyValue(row: QueryRow, key: string): string {
  const properties = row.properties || {};
  return valueToText(properties[key] ?? properties[`:${key}`]);
}

export function statusOf(row: QueryRow): string {
  return propertyValue(row, STATUS_KEY) || 'Unset';
}

function escapeQueryString(value: string): string {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export async function queryRows(source: QuerySource): Promise<QueryRow[]> {
  const db = (logseqAPI as any).DB;
  if (!db?.datascriptQuery) throw new Error('DB query API unavailable');

  const where = source.type === 'tag'
    ? `[?b :block/tags ?tag] [?tag :block/title "${escapeQueryString(source.value)}"]`
    : `[?b :block/page ?page] [?page :block/title "${escapeQueryString(source.value)}"]`;
  const query = `[:find (pull ?b [:block/uuid :block/title :block/page :block/tags :block/updated-at]) :where ${where}]`;
  const result = await db.datascriptQuery(query);
  const rawRows = (Array.isArray(result) ? result : []).map((entry: any) => entry?.[0] ?? entry);
  const rows: QueryRow[] = rawRows
    .filter((block: any) => block && (block.uuid || block['block/uuid']))
    .map((block: any) => ({
      uuid: String(block.uuid || block['block/uuid']),
      title: String(block.title || block['block/title'] || ''),
      page: valueToText(block.page || block['block/page']),
      tags: (block.tags || block['block/tags'] || []).map((tag: any) => valueToText(tag)).filter(Boolean),
      properties: {},
      updatedAt: Number(block['block/updated-at'] || block.updatedAt || 0),
    }));

  // Property reads are per row on DB graphs; chunk to keep the UI responsive.
  const chunkSize = 8;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    await Promise.all(chunk.map(async (row) => {
      try {
        const properties = await (logseqAPI.Editor as any)?.getBlockProperties?.(row.uuid);
        row.properties = properties || {};
      } catch {
        row.properties = {};
      }
    }));
  }
  return rows;
}

export async function updateRowStatus(uuid: string, status: string): Promise<void> {
  const editor = logseqAPI.Editor as any;
  if (!editor?.upsertBlockProperty) throw new Error('Property write API unavailable');
  await editor.upsertBlockProperty(uuid, STATUS_KEY, status);
}

export async function updateRowTitle(uuid: string, title: string): Promise<void> {
  const editor = logseqAPI.Editor as any;
  if (!editor?.updateBlock) throw new Error('Block update API unavailable');
  await editor.updateBlock(uuid, title);
}

export async function removeRow(uuid: string): Promise<void> {
  const editor = logseqAPI.Editor as any;
  if (!editor?.removeBlock) throw new Error('Block remove API unavailable');
  await editor.removeBlock(uuid);
}

export async function addRow(parentBlockId: string, source: QuerySource): Promise<void> {
  const editor = logseqAPI.Editor as any;
  if (!editor?.insertBlock) throw new Error('Block insert API unavailable');
  const suffix = source.type === 'tag' ? ` #${source.value}` : '';
  await editor.insertBlock(parentBlockId, `New item${suffix}`);
}
