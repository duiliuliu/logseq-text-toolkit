import { BlockEntity, HeatmapQueryParams, HeatmapViewType, HeatmapDataPoint, ColorFormula } from './types';
import { calculateColorValueSimple, calculateColorValueWeighted } from './colorCalculator';
import { logseqAPI } from '../../logseq';
import logger from '../logger';

const escapeDatalogString = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

const getCreatedAt = (block: any): number | null => {
  const v = block?.['block/created-at'] ?? block?.['created-at'] ?? block?.createdAt ?? block?.created_at;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatLocalDateTimeNoTZ = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

const buildWhereClause = (queryParams: HeatmapQueryParams) => {
  const value = escapeDatalogString(queryParams.value || '');
  if (queryParams.type === 'tag') {
    return `
      [?b :block/tags ?t]
      (or-join [?t]
        [?t :block/name "${value}"]
        [?t :block/title "${value}"]
      )
    `;
  }

  if (queryParams.type === 'page') {
    return `
      (or-join [?p]
        [?p :block/name "${value}"]
        [?p :block/title "${value}"]
      )
      [?b :block/page ?p]
    `;
  }

  const key = (queryParams.propertyKey || '').trim();
  const escapedKey = key.replace(/[^a-zA-Z0-9_\\-]/g, '_');
  return `
    [?b :block/properties ?props]
    [(get ?props :${escapedKey}) ?pv]
    [(str ?pv) ?pvStr]
    [(= ?pvStr "${value}")]
  `;
};

const buildQuery = (queryParams: HeatmapQueryParams, startMs: number, endMs: number) => {
  const whereClause = buildWhereClause(queryParams);
  return `
    [:find (pull ?b [:block/uuid :block/content :block/title :block/created-at :block/updated-at :block/properties :block/tags :block/page])
     :where
     [?b :block/created-at ?created]
     [(>= ?created ${startMs})]
     [(< ?created ${endMs})]
     ${whereClause}
    ]
  `;
};

export async function queryByTag(
  tagName: string,
  viewType: HeatmapViewType,
  colorFormula: ColorFormula,
  year?: number,
  month?: number,
  week?: number
): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({
    type: 'tag',
    value: tagName,
    year,
    month,
    week,
  }, viewType, colorFormula);
}

export async function queryByPage(
  pageName: string,
  viewType: HeatmapViewType,
  colorFormula: ColorFormula,
  year?: number,
  month?: number,
  week?: number
): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({
    type: 'page',
    value: pageName,
    year,
    month,
    week,
  }, viewType, colorFormula);
}

export async function queryByProperty(
  propertyKey: string,
  propertyValue: string,
  viewType: HeatmapViewType,
  colorFormula: ColorFormula,
  year?: number,
  month?: number,
  week?: number
): Promise<HeatmapDataPoint[]> {
  return fetchHeatmapData({
    type: 'property',
    propertyKey,
    value: propertyValue,
    year,
    month,
    week,
  }, viewType, colorFormula);
}

function getDateOfWeek(week: number, year: number): Date {
  const d = new Date(year, 0, 1);
  const dayOfWeek = d.getDay();
  const diff = d.getTimezoneOffset() * 60000;
  const oneWeek = 604800000;
  return new Date(d.getTime() - diff + (week - 1) * oneWeek);
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

export async function fetchHeatmapData(
  queryParams: HeatmapQueryParams,
  viewType: HeatmapViewType,
  colorFormula: ColorFormula
): Promise<HeatmapDataPoint[]> {
  if (!queryParams.value?.trim()) {
    logger.debug('[Heatmap] Query value is empty, returning empty data');
    return [];
  }

  logger.debug('[Heatmap] fetchHeatmapData called', { queryParams, viewType, colorFormula });

  if (viewType === 'week') {
    const referenceDate = new Date();
    if (queryParams.year !== undefined && queryParams.month !== undefined && queryParams.week !== undefined) {
      referenceDate.setFullYear(queryParams.year, queryParams.month - 1, 1);
    }

    const dayOfWeek = referenceDate.getDay();
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const startMs = monday.getTime();
    const endMs = startMs + 7 * 86400000;

    const query = buildQuery(queryParams, startMs, endMs);
    logger.debug('[Heatmap] Week query', query);

    const result = await logseqAPI.DB.datascriptQuery(query);
    const blocks = (result || []).filter(Boolean);

    logger.debug('[Heatmap] Week query result count:', blocks.length);

    const buckets: Record<string, BlockEntity[]> = {};
    for (const b of blocks) {
      const createdAt = getCreatedAt(b);
      if (!createdAt) continue;
      const dt = new Date(createdAt);
      const dayIndex = Math.floor((dt.getTime() - startMs) / 86400000);
      if (dayIndex < 0 || dayIndex >= 7) continue;
      const hourIndex = Math.floor(dt.getHours() / 4);
      if (hourIndex < 0 || hourIndex >= 6) continue;
      const key = `${dayIndex}-${hourIndex}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(b as BlockEntity);
    }

    const data: HeatmapDataPoint[] = [];
    for (let hourIndex = 0; hourIndex < 6; hourIndex++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + dayIndex);
        d.setHours(hourIndex * 4, 0, 0, 0);
        const key = `${dayIndex}-${hourIndex}`;
        const cellBlocks = buckets[key] || [];
        const count = colorFormula === 'simple' ? calculateColorValueSimple(cellBlocks) : calculateColorValueWeighted(cellBlocks);
        data.push({
          date: formatLocalDateTimeNoTZ(d),
          count,
          blocks: cellBlocks,
        });
      }
    }
    logger.debug('[Heatmap] Week data generated, total cells:', data.length);
    return data;
  }

  const year = queryParams.year || new Date().getFullYear();
  const monthIndex = queryParams.month !== undefined ? queryParams.month - 1 : new Date().getMonth();

  let startDate: Date;
  let endDate: Date;

  if (viewType === 'month') {
    startDate = new Date(year, monthIndex, 1);
    endDate = new Date(year, monthIndex + 1, 1);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year + 1, 0, 1);
  }

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const query = buildQuery(queryParams, startMs, endMs);
  logger.debug(`[Heatmap] ${viewType} query`, query);

  const result = await logseqAPI.DB.datascriptQuery(query);
  const blocks = (result || []).filter(Boolean);

  logger.debug('[Heatmap] Query result count:', blocks.length);

  const buckets: Record<string, BlockEntity[]> = {};
  for (const b of blocks) {
    const createdAt = getCreatedAt(b);
    if (!createdAt) continue;
    const dateKey = new Date(createdAt).toISOString().split('T')[0];
    if (!buckets[dateKey]) buckets[dateKey] = [];
    buckets[dateKey].push(b as BlockEntity);
  }

  const data: HeatmapDataPoint[] = [];
  for (const d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const dayBlocks = buckets[dateKey] || [];
    const count = colorFormula === 'simple' ? calculateColorValueSimple(dayBlocks) : calculateColorValueWeighted(dayBlocks);
    data.push({
      date: dateKey,
      count,
      blocks: dayBlocks,
    });
  }

  logger.debug('[Heatmap] Data generated', { totalDays: data.length, viewType, year, month: monthIndex + 1 });
  return data;
}
