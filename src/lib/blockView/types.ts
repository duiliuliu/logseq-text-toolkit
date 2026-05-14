export type ViewType = 'list' | 'table' | 'gallery' | 'board';
export type TableTheme = 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'custom';

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: string;
  cssClass: string;
}

const VIEW_ICONS: Record<ViewType, string> = {
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M3 3.5h8"/><path d="M3 7h8"/><path d="M3 10.5h8"/>
    <circle cx="1.5" cy="3.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="7" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/>
  </svg>`,

  table: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="11" height="10" rx="2"/>
    <path d="M5 2v10"/><path d="M1.5 5.5h11"/>
  </svg>`,

  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="4" height="4" rx="1"/>
    <rect x="8.5" y="2" width="4" height="4" rx="1"/>
    <rect x="1.5" y="8" width="4" height="4" rx="1"/>
    <rect x="8.5" y="8" width="4" height="4" rx="1"/>
  </svg>`,

  board: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="3" height="10" rx="1"/>
    <rect x="5.5" y="2" width="3" height="7" rx="1"/>
    <rect x="9.5" y="2" width="3" height="8" rx="1"/>
  </svg>`
};

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': {
    id: 'list',
    name: 'List',
    icon: VIEW_ICONS.list,
    cssClass: 'ltt-list-root',
  },
  'table': {
    id: 'table',
    name: 'Table',
    icon: VIEW_ICONS.table,
    cssClass: 'ltt-table-root',
  },
  'gallery': {
    id: 'gallery',
    name: 'Gallery',
    icon: VIEW_ICONS.gallery,
    cssClass: 'ltt-gallery-root',
  },
  'board': {
    id: 'board',
    name: 'Board',
    icon: VIEW_ICONS.board,
    cssClass: 'ltt-board-root',
  },
};

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

export const PRESET_THEMES: Record<Exclude<TableTheme, 'custom'>, CustomTableTheme> = {
  default: {
    borderColor: '#e2e8f0',
    headerBgColor: '#f8fafc',
    headerTextColor: '#374151',
    headerBorderColor: '#cbd5e1',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f1f5f9',
    rowBorderColor: '#e2e8f0',
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
    rowBgColor: '#0f172a',
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
  },
};

export interface TableConfig {
  theme: TableTheme;
  showStriped?: boolean;
  showBorder?: boolean;
  colWidths?: Record<string, number>;
}

export interface BlockViewArgs {
  view?: ViewType;
  theme?: TableTheme;
  colWidths?: string;
}
