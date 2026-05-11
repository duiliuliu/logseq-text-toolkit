import { BlockEntity, HeatmapQueryParams, HeatmapViewType, HeatmapDataPoint, ColorFormula } from './types';
import { calculateColorValueSimple, calculateColorValueWeighted } from './colorCalculator';
import { logseqAPI } from '../../logseq';
import logger from '../logger';

const getCreatedAt = (block: any): number | null => {
  const v = block?.['created-at'] ?? block?.['block/created-at'] ?? block?.createdAt ?? block?.created_at;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const buildWhereClause = (params: HeatmapQueryParams): string => {
  const value = params.value || '';
  const key = params.propertyKey || '';

  if (params.type === 'tag') {
    return `
[?b :block/tags ?t]
[?t :block/title "${value}"]`;
  }

  if (params.type === 'page') {
    return `
[?p :block/name "${value}"]
[?b :block/page ?p]`;
  }

  if (params.type === 'property') {
    if (!key) {
      return `
[?b :block/properties ?props]
[(some? ?props)]`;
    }
    if (value) {
      return `
[?b :logseq.property/${key} ?val]
[?val :block/title "${value}"]`;
    }
    return `
[?b :logseq.property/${key} ?val]
[(some? ?val)]`;
  }

  return '';
};

const buildQuery = (params: HeatmapQueryParams, startMs: number, endMs: number) => {
  const where = buildWhereClause(params);
  return `
[:find (pull ?b [*])
 :where
${where}
[?b :block/created-at ?date]
[(>= ?date ${startMs})]
[(<= ?date ${endMs})]]`;
};

const getWeekBounds = (ref: Date) => {
  const d = new Date(ref);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return { start: monday, end: new Date(monday.getTime() + 7 * 86400000) };
};

const bucketByDay = (blocks: any[], startMs: number, endMs: number): Record<string, any[]> => {
  const buckets: Record<string, any[]> = {};
  for (const b of blocks) {
    const ts = getCreatedAt(b);
    if (!ts || ts < startMs || ts >= endMs) continue;
    const key = formatDate(new Date(ts));
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(b);
  }
  return buckets;
};

const bucketByWeekCell = (blocks: any[], startMs: number): Record<string, any[]> => {
  const buckets: Record<string, any[]> = {};
  for (const b of blocks) {
    const ts = getCreatedAt(b);
    if (!ts) continue;
    const dayIdx = Math.floor((ts - startMs) / 86400000);
    if (dayIdx < 0 || dayIdx >= 7) continue;
    const hourIdx = Math.floor((ts % 86400000) / 14400000);
    const key = `${dayIdx}-${hourIdx}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(b);
  }
  return buckets;
};

const calcCount = (blocks: any[], formula: ColorFormula) =>
  formula === 'simple' ? calculateColorValueSimple(blocks) : calculateColorValueWeighted(blocks);

export async function fetchHeatmapData(
  params: HeatmapQueryParams,
  view: HeatmapViewType,
  formula: ColorFormula
): Promise<HeatmapDataPoint[]> {
  if (!params.value?.trim() && !params.propertyKey?.trim()) return [];

  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth() + 1;
  const ref = new Date(year, month - 1, 1);

  logger.debug('[Heatmap] fetchHeatmapData', { params, view, year, month });

  let start: Date, end: Date;

  if (view === 'week') {
    const bounds = getWeekBounds(ref);
    start = bounds.start;
    end = bounds.end;
  } else if (view === 'month') {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 1);
  } else {
    start = new Date(year, 0, 1);
    end = new Date(year + 1, 0, 1);
  }

  const startMs = start.getTime();
  const endMs = end.getTime();
  const query = buildQuery(params, startMs, endMs);

  logger.debug('[Heatmap] query', query);

  const raw = await logseqAPI.DB.datascriptQuery(query);
  const blocks = (raw || []).flat().filter(Boolean);

  logger.debug('[Heatmap] result count:', blocks.length, 'sample:', blocks[0]?.['created-at']);

  const data: HeatmapDataPoint[] = [];

  if (view === 'week') {
    const buckets = bucketByWeekCell(blocks, startMs);
    for (let h = 0; h < 6; h++) {
      for (let d = 0; d < 7; d++) {
        const key = `${d}-${h}`;
        const cellBlocks = buckets[key] || [];
        const day = new Date(start);
        day.setDate(start.getDate() + d);
        day.setHours(h * 4, 0, 0, 0);
        data.push({
          date: day.toISOString().replace('.000Z', 'Z'),
          count: calcCount(cellBlocks, formula),
          blocks: cellBlocks as BlockEntity[],
        });
      }
    }
  } else {
    const buckets = bucketByDay(blocks, startMs, endMs);
    for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const key = formatDate(new Date(d));
      const dayBlocks = buckets[key] || [];
      data.push({
        date: key,
        count: calcCount(dayBlocks, formula),
        blocks: dayBlocks as BlockEntity[],
      });
    }
  }

  return data;
}

export async function queryByTag(tag: string, view: HeatmapViewType, formula: ColorFormula, year?: number, month?: number): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({ type: 'tag', value: tag, year, month }, view, formula);
}

export async function queryByPage(page: string, view: HeatmapViewType, formula: ColorFormula, year?: number, month?: number): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({ type: 'page', value: page, year, month }, view, formula);
}

export async function queryByProperty(propertyKey: string, propertyValue: string, view: HeatmapViewType, formula: ColorFormula, year?: number, month?: number): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({ type: 'property', propertyKey, value: propertyValue, year, month }, view, formula);
}
