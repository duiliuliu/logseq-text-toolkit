export type ViewType = 'list' | 'table' | 'gallery' | 'board';
export type ThemeType = 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'tana' | 'custom';

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
    name: 'Kanban',
    icon: VIEW_ICONS.board,
    cssClass: 'ltt-board-root',
  },
};

export interface CustomTableTheme {
  borderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  cellTextColor?: string;
  headerBorderColor?: string;
  headerHeight?: string;
  rowBgColor?: string;
  rowHoverBgColor?: string;
  rowBorderColor?: string;
  cellPadding?: string;
  tableBorderRadius?: string;
}

export interface CustomGalleryTheme {
  borderColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  cardHoverBgColor?: string;
  headerBorderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  cardBorderRadius?: string;
  cardShadow?: string;
}

export interface CustomBoardTheme {
  borderColor?: string;
  columnBgColor?: string;
  columnHoverBgColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  cardBorderRadius?: string;
}

export interface TablePresetTheme {
  borderColor: string;
  headerBgColor: string;
  headerTextColor: string;
  cellTextColor?: string;
  headerBorderColor: string;
  headerHeight: string;
  rowBgColor: string;
  rowHoverBgColor: string;
  rowBorderColor: string;
  cellPadding: string;
  tableBorderRadius: string;
}

export interface GalleryPresetTheme {
  borderColor: string;
  cardBgColor: string;
  cardTextColor?: string;
  cardHoverBgColor: string;
  headerBorderColor: string;
  headerBgColor: string;
  headerTextColor: string;
  cardBorderRadius: string;
  cardShadow: string;
}

export interface BoardPresetTheme {
  borderColor: string;
  columnBgColor: string;
  columnHoverBgColor: string;
  headerBgColor: string;
  headerTextColor: string;
  cardBgColor: string;
  cardTextColor?: string;
  cardBorderColor: string;
  cardBorderRadius: string;
}

export const TABLE_PRESET_THEMES: Record<Exclude<ThemeType, 'custom'>, TablePresetTheme> = {
  default: {
    borderColor: '#e2e8f0',
    headerBgColor: '#f8fafc',
    headerTextColor: '#374151',
    cellTextColor: '#475569',
    headerBorderColor: '#cbd5e1',
    headerHeight: '48px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f1f5f9',
    rowBorderColor: '#e2e8f0',
    cellPadding: '12px 16px',
    tableBorderRadius: '8px'
  },
  notion: {
    borderColor: '#e5e7eb',
    headerBgColor: '#ffffff',
    headerTextColor: '#2d2d2d',
    cellTextColor: '#2d2d2d',
    headerBorderColor: '#d1d5db',
    headerHeight: '44px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f9fafb',
    rowBorderColor: '#e5e7eb',
    cellPadding: '10px 14px',
    tableBorderRadius: '6px'
  },
  linear: {
    borderColor: '#e5e7eb',
    headerBgColor: '#f9fafb',
    headerTextColor: '#5e6ad2',
    cellTextColor: '#475569',
    headerBorderColor: '#d1d5db',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f3f4f6',
    rowBorderColor: '#e5e7eb',
    cellPadding: '8px 14px',
    tableBorderRadius: '4px'
  },
  dark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    headerBgColor: '#1f2937',
    headerTextColor: '#f8fafc',
    cellTextColor: '#cbd5e1',
    headerBorderColor: 'rgba(255, 255, 255, 0.15)',
    headerHeight: '48px',
    rowBgColor: '#0f172a',
    rowHoverBgColor: '#1f2937',
    rowBorderColor: 'rgba(255, 255, 255, 0.1)',
    cellPadding: '12px 16px',
    tableBorderRadius: '8px'
  },
  gradient: {
    borderColor: '#dbeafe',
    headerBgColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #2563eb 100%)',
    headerTextColor: '#ffffff',
    cellTextColor: '#1e40af',
    headerBorderColor: '#2563eb',
    headerHeight: '52px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#eff6ff',
    rowBorderColor: '#dbeafe',
    cellPadding: '14px 18px',
    tableBorderRadius: '12px'
  },
  tana: {
    borderColor: '#a7f3d0',
    headerBgColor: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    headerTextColor: '#ffffff',
    cellTextColor: '#065f46',
    headerBorderColor: '#10b981',
    headerHeight: '52px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#d1fae5',
    rowBorderColor: '#a7f3d0',
    cellPadding: '14px 18px',
    tableBorderRadius: '14px'
  },
};

export const GALLERY_PRESET_THEMES: Record<Exclude<ThemeType, 'custom'>, GalleryPresetTheme> = {
  default: {
    borderColor: '#e2e8f0',
    cardBgColor: '#ffffff',
    cardTextColor: '#475569',
    cardHoverBgColor: '#f8fafc',
    headerBorderColor: '#e2e8f0',
    headerBgColor: 'transparent',
    headerTextColor: '#374151',
    cardBorderRadius: '12px',
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
  },
  notion: {
    borderColor: '#e5e7eb',
    cardBgColor: '#ffffff',
    cardTextColor: '#2d2d2d',
    cardHoverBgColor: '#f9fafb',
    headerBorderColor: '#e5e7eb',
    headerBgColor: 'transparent',
    headerTextColor: '#2d2d2d',
    cardBorderRadius: '0px',
    cardShadow: 'none'
  },
  linear: {
    borderColor: '#e5e7eb',
    cardBgColor: '#ffffff',
    cardTextColor: '#475569',
    cardHoverBgColor: '#f3f4f6',
    headerBorderColor: '#d1d5db',
    headerBgColor: '#fafafa',
    headerTextColor: '#5e6ad2',
    cardBorderRadius: '8px',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
  },
  dark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    cardBgColor: '#0f172a',
    cardTextColor: '#cbd5e1',
    cardHoverBgColor: '#1f2937',
    headerBorderColor: 'rgba(255, 255, 255, 0.1)',
    headerBgColor: 'transparent',
    headerTextColor: '#f8fafc',
    cardBorderRadius: '12px',
    cardShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
  },
  gradient: {
    borderColor: '#ddd6fe',
    cardBgColor: '#faf5ff',
    cardTextColor: '#6b21a8',
    cardHoverBgColor: '#ede9fe',
    headerBorderColor: '#c4b5fd',
    headerBgColor: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)',
    headerTextColor: '#6b21a8',
    cardBorderRadius: '16px',
    cardShadow: '0 12px 40px rgba(139, 92, 246, 0.25)'
  },
  tana: {
    borderColor: '#a7f3d0',
    cardBgColor: '#ecfdf5',
    cardTextColor: '#065f46',
    cardHoverBgColor: '#d1fae5',
    headerBorderColor: '#6ee7b7',
    headerBgColor: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
    headerTextColor: '#065f46',
    cardBorderRadius: '16px',
    cardShadow: '0 12px 40px rgba(16, 185, 129, 0.25)'
  },
};

export const BOARD_PRESET_THEMES: Record<Exclude<ThemeType, 'custom'>, BoardPresetTheme> = {
  default: {
    borderColor: '#e2e8f0',
    columnBgColor: '#ffffff',
    columnHoverBgColor: '#f8fafc',
    headerBgColor: 'transparent',
    headerTextColor: '#374151',
    cardBgColor: '#ffffff',
    cardTextColor: '#475569',
    cardBorderColor: '#e2e8f0',
    cardBorderRadius: '8px'
  },
  notion: {
    borderColor: '#e5e7eb',
    columnBgColor: '#ffffff',
    columnHoverBgColor: '#fafafa',
    headerBgColor: 'transparent',
    headerTextColor: '#2d2d2d',
    cardBgColor: '#ffffff',
    cardTextColor: '#2d2d2d',
    cardBorderColor: '#e5e7eb',
    cardBorderRadius: '0px'
  },
  linear: {
    borderColor: '#e5e7eb',
    columnBgColor: '#fafafa',
    columnHoverBgColor: '#f3f4f6',
    headerBgColor: '#fafafa',
    headerTextColor: '#5e6ad2',
    cardBgColor: '#ffffff',
    cardTextColor: '#475569',
    cardBorderColor: '#e5e7eb',
    cardBorderRadius: '8px'
  },
  dark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    columnBgColor: '#0f172a',
    columnHoverBgColor: '#1f2937',
    headerBgColor: 'transparent',
    headerTextColor: '#f8fafc',
    cardBgColor: '#1f2937',
    cardTextColor: '#cbd5e1',
    cardBorderColor: 'rgba(255, 255, 255, 0.08)',
    cardBorderRadius: '8px'
  },
  gradient: {
    borderColor: '#ddd6fe',
    columnBgColor: '#faf5ff',
    columnHoverBgColor: '#ede9fe',
    headerBgColor: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)',
    headerTextColor: '#6b21a8',
    cardBgColor: '#ffffff',
    cardTextColor: '#6b21a8',
    cardBorderColor: '#e9d5ff',
    cardBorderRadius: '12px'
  },
  tana: {
    borderColor: '#a7f3d0',
    columnBgColor: '#ecfdf5',
    columnHoverBgColor: '#d1fae5',
    headerBgColor: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
    headerTextColor: '#065f46',
    cardBgColor: '#ffffff',
    cardTextColor: '#065f46',
    cardBorderColor: '#a7f3d0',
    cardBorderRadius: '12px'
  },
};

export interface TableConfig {
  theme: ThemeType;
  showStriped?: boolean;
  showBorder?: boolean;
  colWidths?: Record<string, number>;
}

export interface GalleryConfig {
  showCardBorders?: boolean;
  cardsPerRow?: number;
}

export interface BoardConfig {
  showColumnBorders?: boolean;
  cardSpacing?: string;
}

export interface ViewCustomThemeConfig {
  table?: CustomTableTheme;
  gallery?: CustomGalleryTheme;
  board?: CustomBoardTheme;
}

export interface BlockViewArgs {
  view?: ViewType;
  theme?: ThemeType;
  colWidths?: string;
}
