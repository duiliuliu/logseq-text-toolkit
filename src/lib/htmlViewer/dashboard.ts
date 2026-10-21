import { logseqAPI } from '../../logseq';

export interface DashboardBlockOption {
  uuid: string;
  title: string;
  path: string;
}

export async function listHtmlDashboardBlocks(): Promise<DashboardBlockOption[]> {
  const db = (logseqAPI as any).DB;
  if (!db?.datascriptQuery) return [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const rows = await db.datascriptQuery(
        '[:find (pull ?b [:block/uuid :block/title :logseq.property.asset/type]) :where [?b :logseq.property.asset/type "html"]]'
      );
      const blocks = (Array.isArray(rows) ? rows : [])
        .map((row: any) => row?.[0] ?? row)
        .filter((block: any) => block?.['block/uuid'] || block?.uuid)
        .map((block: any) => {
          const uuid = String(block['block/uuid'] || block.uuid);
          const title = String(block['block/title'] || block.title || uuid);
          return { uuid, title, path: `assets/${uuid}.html` };
        });
      if (blocks.length) return blocks;
    } catch {
      // DB may still be mounting during plugin boot.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return [];
}

export async function resolveDashboardAsset(value: string): Promise<string> {
  if (!value.startsWith('block:')) return value;
  const uuid = value.slice('block:'.length).trim();
  if (!uuid) return '';
  try {
    const block = await (logseqAPI as any).Editor?.getBlock?.(uuid, { includeChildren: false });
    const type = String(block?.['logseq.property.asset/type'] ?? block?.[':logseq.property.asset/type'] ?? '').toLowerCase();
    if (!block || !['html', 'htm', 'text/html'].includes(type)) return '';
    return `assets/${uuid}.${type === 'text/html' ? 'html' : type}`;
  } catch {
    return '';
  }
}
