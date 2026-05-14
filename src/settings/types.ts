import { logseqAPI } from '../logseq'

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
export interface BlockViewSettings {
  defaultView: 'list' | 'table' | 'gallery' | 'board';
  hideViewBar: boolean;
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
  ToolbarItems?: any[]
}
