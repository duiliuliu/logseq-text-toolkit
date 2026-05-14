// Block View Types
// 块视图类型定义
import { BlockEntity } from '../heatmap/types';

// View type - 视图类型
export type BlockViewType = 'table' | 'list' | 'card' | 'timeline';

// Table theme type - 表格主题类型
export type TableTheme = 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'custom';

// Column width configuration - 列宽配置
export interface ColumnWidths {
  [columnKey: string]: number; // key 是列的标识符（如 'content'、'page'、'createdAt'、'updatedAt'、'marker' 等
}

// Custom theme colors - 自定义主题颜色
export interface CustomTableTheme {
  borderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  headerBorderColor?: string;
  headerHeight?: string;
  rowBgColor?: string;
  rowHoverBgColor?: string;
  rowBorderColor?: string;
  cellPadding?: string;
  tableBorderRadius?: string;
}

// Table config - 表格配置
export interface TableConfig {
  theme: TableTheme;
  showRowStriped?: boolean;
  showBorder?: boolean;
  showColumns?: string[];
  customTheme?: CustomTableTheme;
  columnWidths?: ColumnWidths;
}

// List config - 列表配置
export interface ListConfig {
  theme: TableTheme;
  showBorder?: boolean;
  customTheme?: CustomTableTheme;
}

// Card config - 卡片配置
export interface CardConfig {
  theme: TableTheme;
  customTheme?: CustomTableTheme;
}

// Timeline config - 时间线配置
export interface TimelineConfig {
  theme: TableTheme;
  customTheme?: CustomTableTheme;
}

// Block View Config - 块视图配置
export interface BlockViewConfig {
  viewType: BlockViewType;
  table?: TableConfig;
  list?: ListConfig;
  card?: CardConfig;
  timeline?: TimelineConfig;
}

// Block View Settings - 块视图设置（Settings 中存储）
export interface BlockViewSettings {
  enabled: boolean;
  defaultViewType: BlockViewType;
  table: {
    defaultTheme: TableTheme;
    defaultShowStriped: boolean;
    defaultShowBorder: boolean;
    defaultColumns: string[];
    customTheme?: CustomTableTheme;
  };
}

// View type map - 视图类型映射
export const VIEW_TYPE_MAP: Record<string, BlockViewType> = {
  'table': 'table',
  '表格': 'table',
  'list': 'list',
  '列表': 'list',
  'card': 'card',
  '卡片': 'card',
  'timeline': 'timeline',
  '时间线': 'timeline'
};

// Table theme map - 表格主题映射
export const TABLE_THEME_MAP: Record<string, TableTheme> = {
  'default': 'default',
  '默认': 'default',
  'notion': 'notion',
  'linear': 'linear',
  'dark': 'dark',
  'gradient': 'gradient',
  'custom': 'custom',
  '自定义': 'custom'
};

// Preset themes - 预设主题
export const PRESET_THEMES: Record<Exclude<TableTheme, 'custom'>, CustomTableTheme> = {
  default: {
    borderColor: '#e5e7eb',
    headerBgColor: '#f3f4f6',
    headerTextColor: '#374151',
    headerBorderColor: '#d1d5db',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f9fafb',
    rowBorderColor: '#e5e7eb',
    cellPadding: '8px 12px',
    tableBorderRadius: '8px'
  },
  notion: {
    borderColor: '#e5e7eb',
    headerBgColor: '#ffffff',
    headerTextColor: '#374151',
    headerBorderColor: '#e5e7eb',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f9fafb',
    rowBorderColor: '#e5e7eb',
    cellPadding: '8px 12px',
    tableBorderRadius: '6px'
  },
  linear: {
    borderColor: '#e5e7eb',
    headerBgColor: '#f9fafb',
    headerTextColor: '#374151',
    headerBorderColor: '#e5e7eb',
    headerHeight: '36px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f3f4f6',
    rowBorderColor: '#e5e7eb',
    cellPadding: '6px 12px',
    tableBorderRadius: '4px'
  },
  dark: {
    borderColor: '#374151',
    headerBgColor: '#1f2937',
    headerTextColor: '#f9fafb',
    headerBorderColor: '#374151',
    headerHeight: '40px',
    rowBgColor: '#111827',
    rowHoverBgColor: '#1f2937',
    rowBorderColor: '#374151',
    cellPadding: '8px 12px',
    tableBorderRadius: '8px'
  },
  gradient: {
    borderColor: '#dbeafe',
    headerBgColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    headerTextColor: '#ffffff',
    headerBorderColor: '#2563eb',
    headerHeight: '44px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#eff6ff',
    rowBorderColor: '#dbeafe',
    cellPadding: '10px 12px',
    tableBorderRadius: '12px'
  }
};

// Column keys - 列键定义
export const DEFAULT_COLUMNS = ['marker', 'content', 'page', 'createdAt', 'updatedAt'];
