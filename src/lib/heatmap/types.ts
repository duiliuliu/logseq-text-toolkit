export type HeatmapViewType = 'year' | 'month' | 'week';

export type DisplayMode = 'minimal' | 'basic' | 'full';

export type ColorFormula = 'simple' | 'weighted';

export interface BlockEntity {
  'block/uuid': string | { '$uuid$': string };
  'block/title'?: string;
  'block/content'?: string;
  'block/page'?: Reference;
  'block/parent'?: Reference;
  'block/properties'?: Record<string, any>;
  'block/tags'?: Reference[];
  'block/refs'?: Reference[];
  'block/marker'?: string;
  'block/priority'?: string;
  'block/scheduled'?: number;
  'block/deadline'?: number;
  'block/created-at'?: number;
  'block/updated-at'?: number;
  children?: BlockEntity[];
}

export interface Reference {
  'block/uuid'?: string | { '$uuid$': string };
  'block/name'?: string;
  'block/title'?: string;
}

export interface HeatmapDataPoint {
  date: string;
  count: number;
  blocks: BlockEntity[];
}

export interface HeatmapQueryParams {
  type: 'tag' | 'page' | 'property' | 'all';
  value?: string;
  propertyKey?: string;
  year?: number;
  month?: number;
  week?: number;
}

export interface HeatmapConfig {
  viewType: HeatmapViewType;
  displayMode: DisplayMode;
  colorFormula: ColorFormula;
  colorScheme: IndigoColorScheme;
  minColor: string;
  maxColor: string;
  language: string;
  referenceDate?: Date;
  containerWidth?: string;
  enableMonthPageCreation?: boolean;
  monthPageTemplate?: string;
  monthPageLogseqTemplate?: string;
  enableWeekPageCreation?: boolean;
  weekPageTemplate?: string;
  weekPageLogseqTemplate?: string;
  dateFormat?: string;
}

export interface IndigoColorScheme {
  name: string;
  colors: string[];
}

export interface HeatmapCellData {
  date: string;
  value: number;
  maxValue: number;
  color: string;
  isEmpty: boolean;
  isHovered: boolean;
}

export interface HeatmapStatistics {
  totalBlocks: number;
  activeDays: number;
  maxCount: number;
  avgCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  blocksByDate: Record<string, BlockEntity[]>;
}

export interface HeatmapTooltipData {
  date: string;
  count: number;
  percentage: number;
  maxValue: number;
}

export const INDIGO_COLORS = [
  '#f5f5f5',
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#3730a3',
];

export const VIEW_TYPE_MAP: Record<string, HeatmapViewType> = {
  '年度视图': 'year',
  'year': 'year',
  'yearly': 'year',
  '年度': 'year',
  '月度视图': 'month',
  'month': 'month',
  'monthly': 'month',
  '月度': 'month',
  '周度视图': 'week',
  'week': 'week',
  'weekly': 'week',
  '周度': 'week',
};

export const DISPLAY_MODE_MAP: Record<string, DisplayMode> = {
  'minimal': 'minimal',
  '极简': 'minimal',
  'basic': 'basic',
  '基础': 'basic',
  'full': 'full',
  '完整': 'full',
};

export const COLOR_FORMULA_MAP: Record<string, ColorFormula> = {
  'simple': 'simple',
  '简化': 'simple',
  'weighted': 'weighted',
  '加权': 'weighted',
};
