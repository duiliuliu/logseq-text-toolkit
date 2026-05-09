import { BlockEntity, HeatmapQueryParams, HeatmapViewType, HeatmapDataPoint, ColorFormula } from './types';
import { calculateColorValueSimple, calculateColorValueWeighted } from './colorCalculator';

const generateMockBlocks = (count: number, date: string): BlockEntity[] => {
  const blocks: BlockEntity[] = [];
  const baseDate = new Date(date);
  
  for (let i = 0; i < count; i++) {
    const createdAt = baseDate.getTime() + Math.random() * 86400000;
    blocks.push({
      'block/uuid': { '$uuid$': `mock-uuid-${date}-${i}` },
      'block/content': `Task ${i + 1} on ${date}`,
      'block/created-at': createdAt,
      'block/updated-at': createdAt + Math.random() * 3600000,
      children: Math.random() > 0.7 ? Array(Math.floor(Math.random() * 3)).fill(null).map((_, j) => ({
        'block/uuid': { '$uuid$': `mock-child-${date}-${i}-${j}` },
        'block/content': `Subtask ${j + 1}`,
      })) : undefined,
      'block/properties': Math.random() > 0.5 ? {
        category: 'work',
        priority: 'high',
      } : undefined,
    });
  }
  
  return blocks;
};

const generateYearData = (year: number, tagName: string, colorFormula: ColorFormula): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  
  for (const d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let count = 0;
    if (Math.random() > 0.3) {
      count = isWeekend 
        ? Math.floor(Math.random() * 8)
        : Math.floor(Math.random() * 15) + 2;
    }
    
    const blocks = generateMockBlocks(count, dateStr);
    data.push({
      date: dateStr,
      count: colorFormula === 'simple' ? blocks.length : calculateColorValueWeighted(blocks),
      blocks,
    });
  }
  
  return data;
};

const generateMonthData = (year: number, month: number, tagName: string, colorFormula: ColorFormula): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);
  
  for (const d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let count = 0;
    if (Math.random() > 0.25) {
      count = isWeekend 
        ? Math.floor(Math.random() * 10)
        : Math.floor(Math.random() * 20) + 3;
    }
    
    const blocks = generateMockBlocks(count, dateStr);
    data.push({
      date: dateStr,
      count: colorFormula === 'simple' ? blocks.length : calculateColorValueWeighted(blocks),
      blocks,
    });
  }
  
  return data;
};

const generateWeekData = (year: number, weekNumber: number, tagName: string, colorFormula: ColorFormula): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const startDate = getDateOfWeek(weekNumber, year);
  
  for (let day = 0; day < 7; day++) {
    for (let hourBlock = 0; hourBlock < 6; hourBlock++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      date.setHours(hourBlock * 4, 0, 0, 0);
      
      const dateStr = date.toISOString().split('.')[0];
      const hour = date.getHours();
      const isNight = hour < 6 || hour >= 22;
      const isWorkHour = hour >= 9 && hour < 18;
      
      let count = 0;
      if (isNight) {
        count = Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0;
      } else if (isWorkHour) {
        count = Math.random() > 0.15 ? Math.floor(Math.random() * 8) + 2 : 0;
      } else {
        count = Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0;
      }
      
      const blocks = generateMockBlocks(count, dateStr);
      data.push({
        date: dateStr,
        count: colorFormula === 'simple' ? blocks.length : calculateColorValueWeighted(blocks),
        blocks,
      });
    }
  }
  
  return data;
};

function getDateOfWeek(week: number, year: number): Date {
  const d = new Date(year, 0, 1);
  const dayOfWeek = d.getDay();
  const diff = d.getTimezoneOffset() * 60000;
  const oneWeek = 604800000;
  return new Date(d.getTime() - diff + (week - 1) * oneWeek);
}

export async function queryByTag(tagName: string, viewType: HeatmapViewType, colorFormula: ColorFormula, year?: number, month?: number, week?: number): Promise<HeatmapDataPoint[]> {
  const currentYear = year || new Date().getFullYear();
  
  switch (viewType) {
    case 'year':
      return generateYearData(currentYear, tagName, colorFormula);
    case 'month':
      const currentMonth = month !== undefined ? month - 1 : new Date().getMonth();
      return generateMonthData(currentYear, currentMonth, tagName, colorFormula);
    case 'week':
      const currentWeek = week || getCurrentWeekNumber();
      return generateWeekData(currentYear, currentWeek, tagName, colorFormula);
    default:
      return [];
  }
}

export async function queryByPage(pageName: string, viewType: HeatmapViewType, colorFormula: ColorFormula, year?: number, month?: number, week?: number): Promise<HeatmapDataPoint[]> {
  return queryByTag(pageName, viewType, colorFormula, year, month, week);
}

export async function queryByProperty(propertyKey: string, propertyValue: string, viewType: HeatmapViewType, colorFormula: ColorFormula, year?: number, month?: number, week?: number): Promise<HeatmapDataPoint[]> {
  return queryByTag(`${propertyKey}:${propertyValue}`, viewType, colorFormula, year, month, week);
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

export async function fetchHeatmapData(queryParams: HeatmapQueryParams, viewType: HeatmapViewType, colorFormula: ColorFormula): Promise<HeatmapDataPoint[]> {
  switch (queryParams.type) {
    case 'tag':
      return queryByTag(queryParams.value, viewType, colorFormula, queryParams.year, queryParams.month, queryParams.week);
    case 'page':
      return queryByPage(queryParams.value, viewType, colorFormula, queryParams.year, queryParams.month, queryParams.week);
    case 'property':
      return queryByProperty(queryParams.propertyKey || '', queryParams.value, viewType, colorFormula, queryParams.year, queryParams.month, queryParams.week);
    default:
      return [];
  }
}
