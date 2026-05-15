import { logseqAPI } from '../logseq'
import { SummaryType, TemplateType } from '../lib/summary/types'

export type ThemeType = 'light' | 'dark' | 'system'

export type ViewType = 'mini-circle' | 'dot-matrix' | 'progress-bar' | 'fraction'

export type LabelFormat = 'fraction' | 'percentage' | 'progress'

export interface StatusColors {
  todo: string
  doing: string
  done: string
  waiting: string
  canceled: string
  'in-review': string
}

export interface DisplayOptions {
  'mini-circle': {
    size?: 'small' | 'medium' | 'large'
  }
  'dot-matrix': {
    maxDots?: number
    size?: 'small' | 'medium' | 'large'
  }
  'progress-bar': {
    showLabel?: boolean
    height?: string
  }
}

export interface TaskProgressSettings {
  enabled: boolean
  defaultDisplayType: ViewType
  showLabel: boolean
  labelFormat: LabelFormat
  displayOptions: DisplayOptions
  nestingLevel: number
  onlyLeaves: boolean
  showNestingIndicator: boolean
  statusColors: StatusColors
}

export type HeatmapViewType = 'year' | 'month' | 'week'
export type HeatmapDisplayMode = 'minimal' | 'basic' | 'full'
export type HeatmapColorFormula = 'simple' | 'weighted'

export interface ColorScheme {
  minColor: string
  maxColor: string
  gradientSteps: number
}

// 热力图设置
export interface HeatmapSettings {
  enabled: boolean
  defaultViewType: 'year' | 'month' | 'week'
  defaultDisplayMode: 'minimal' | 'basic' | 'full'
  defaultColorFormula: 'simple' | 'weighted'
  colorScheme: {
    minColor: string
    maxColor: string
    gradientSteps: number
  }
  // Month page creation settings
  monthPageCreation?: {
    enabled: boolean
    pageNameTemplate?: string
    logseqTemplate?: string
  }
  // Week page creation settings
  weekPageCreation?: {
    enabled: boolean
    pageNameTemplate?: string
    logseqTemplate?: string
  }
}

// Block View Settings
export type BlockThemeType = 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'tana' | 'custom';

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
  cardHoverBgColor?: string;
  headerBorderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  cardTextColor?: string;
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

export interface BlockViewTableSettings {
  showStriped: boolean;
  showBorder: boolean;
  customTheme?: CustomTableTheme;
}

export interface BlockViewGallerySettings {
  showCardBorders: boolean;
  cardsPerRow: number;
  customTheme?: CustomGalleryTheme;
}

export interface BlockViewBoardSettings {
  showColumnBorders: boolean;
  cardSpacing: string;
  customTheme?: CustomBoardTheme;
}

export interface ViewCustomThemeConfig {
  table?: CustomTableTheme;
  gallery?: CustomGalleryTheme;
  board?: CustomBoardTheme;
}

export interface BlockViewSettings {
  enabled: boolean;
  defaultView: 'list' | 'table' | 'gallery' | 'board';
  defaultTheme: BlockThemeType;
  hideViewBar: boolean;
  table: BlockViewTableSettings;
  gallery: BlockViewGallerySettings;
  board: BlockViewBoardSettings;
}

export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  apiUrl?: string;
  model?: string;
  promptTemplate?: string;
}

export interface SummarySettings {
  enabled: boolean;
  defaultTemplate: TemplateType;
  defaultType: SummaryType;
  dateFormat: string;
  ai: AIConfig;
  pageNameTemplate: string;
}

export interface Settings {
  disabled?: boolean
  theme?: ThemeType
  language?: string
  toolbar?: boolean
  dateFormat?: string
  useSystemTheme?: boolean
  useSystemLanguage?: boolean
  showBorder?: boolean
  width?: string
  height?: string
  hoverDelay?: number
  sponsorEnabled?: boolean
  developerMode?: boolean
  taskProgress?: TaskProgressSettings
  heatmap?: HeatmapSettings
  blockView?: BlockViewSettings
  summary?: SummarySettings
  ToolbarItems?: any[]
}
