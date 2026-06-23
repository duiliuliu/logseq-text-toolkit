// 翻译类型定义

// 递归获取嵌套对象的所有点分路径键
type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? Prefix extends ''
          ? K
          : `${Prefix}.${K}`
        : T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : never;
    }[keyof T & string]
  : never;

// 翻译键类型 - 所有合法的点分路径
export type TranslationKey = NestedKeyOf<TranslationKeys>;

export interface TaskProgressStatusNames {
  todo: string;
  doing: string;
  'in-review': string;
  done: string;
  waiting: string;
  canceled: string;
}

export interface TaskProgressTooltip {
  progress: string;
  total: string;
}

export interface TaskProgressTranslation {
  enabled: string;
  nestingSettings: string;
  nestingLevel: string;
  nestingLevel1: string;
  nestingLevel2: string;
  nestingLevel3: string;
  nestingLevelAll: string;
  onlyLeaves: string;
  onlyLeavesDescription: string;
  showNestingIndicator: string;
  showNestingIndicatorDescription: string;
  defaultDisplayType: string;
  miniCircle: string;
  dotMatrix: string;
  statusCursor: string;
  progressCapsule: string;
  stepProgress: string;
  size: string;
  sizeSmall: string;
  sizeMedium: string;
  sizeLarge: string;
  showLabel: string;
  fireworksOnComplete: string;
  labelFormat: string;
  labelFraction: string;
  labelPercentage: string;
  labelBoth: string;
  statusColors: string;
  statusNames: TaskProgressStatusNames;
  tooltip: TaskProgressTooltip;
  defaultSlashCommandTemplate: string;
}

export interface ToolbarTranslation {
  bold: string;
  highlight: string;
  fileLink: string;
  comment: string;
  noSelection: string;
  replaceFailed: string;
  noBlockContent: string;
  buttonTooltip: string;
}

export interface InlineCommentTranslation {
  text: string;
  placeholder: string;
  save: string;
  title: string;
  addComment: string;
  selectedText: string;
  annotate: string;
  comment: string;
}

export interface TableThemeTranslation {
  title: string;
  showStriped: string;
  showBorder: string;
  customTheme: {
    title: string;
    borderColor: string;
    headerBgColor: string;
    headerTextColor: string;
    cellTextColor: string;
    headerBorderColor: string;
    headerHeight: string;
    rowBgColor: string;
    rowHoverBgColor: string;
    rowBorderColor: string;
    cellPadding: string;
    tableBorderRadius: string;
  };
}

export interface GalleryThemeTranslation {
  title: string;
  showCardBorders: string;
  cardsPerRow: string;
  customTheme: {
    title: string;
    borderColor: string;
    cardBgColor: string;
    cardHoverBgColor: string;
    headerBorderColor: string;
    headerBgColor: string;
    headerTextColor: string;
    cardTextColor: string;
    cardBorderRadius: string;
    cardShadow: string;
  };
}

export interface BoardThemeTranslation {
  title: string;
  showColumnBorders: string;
  cardSpacing: string;
  customTheme: {
    title: string;
    borderColor: string;
    columnBgColor: string;
    columnHoverBgColor: string;
    headerBgColor: string;
    headerTextColor: string;
    cardBgColor: string;
    cardTextColor: string;
    cardBorderColor: string;
    cardBorderRadius: string;
  };
}

export interface BlockViewTranslation {
  description: string;
  enabled: string;
  defaultView: string;
  viewList: string;
  viewTable: string;
  viewGallery: string;
  viewBoard: string;
  hideViewBar: string;
  hideViewBarDescription: string;
  defaultTheme: string;
  themeDefault: string;
  themeNotion: string;
  themeLinear: string;
  themeDark: string;
  themeGradient: string;
  themeTana: string;
  themeCustom: string;
  table: TableThemeTranslation;
  gallery: GalleryThemeTranslation;
  board: BoardThemeTranslation;
  defaultSlashCommandTemplate: string;
}

export interface HeatmapTranslation {
  description: string;
  enabled: string;
  defaultViewType: string;
  viewTypeYear: string;
  viewTypeMonth: string;
  viewTypeWeek: string;
  defaultDisplayMode: string;
  displayModeFull: string;
  displayModeBasic: string;
  displayModeMinimal: string;
  defaultColorFormula: string;
  colorFormulaSimple: string;
  colorFormulaWeighted: string;
  colorScheme: string;
  minColor: string;
  maxColor: string;
  preview: string;
  monthPageCreation: string;
  enableMonthPageCreation: string;
  monthTemplateType: string;
  templateNone: string;
  monthPageNameTemplate: string;
  weekPageCreation: string;
  enableWeekPageCreation: string;
  weekTemplateType: string;
  weekPageNameTemplate: string;
  defaultSlashCommandTemplate: string;
  formulaNote: string;
  templateNote: string;
}

export interface MilestoneTranslation {
  description: string;
  enabled: string;
  defaultSlashCommandTemplate: string;
  defaultStyle: string;
  styleCapsule: string;
  styleBadge: string;
  styleTrack: string;
  styleCard: string;
  styleCompact: string;
  styleArrowCapsule: string;
  styleTimelineTrack: string;
  tooltipStyle: string;
  tooltipStyleMinimal: string;
  tooltipStyleCompact: string;
  tooltipStyleDetailed: string;
  tooltipStyleElegant: string;
  inline: string;
  showLabel: string;
  showLabels: string;
  showProgress: string;
  templates: string;
  addTemplate: string;
  noTemplates: string;
  newTemplate: string;
  templateName: string;
  templateDescription: string;
  templateFilterTag: string;
  templateFilterPropKey: string;
  templateFilterPropValue: string;
  templateMilestonePropKey: string;
  templateMilestoneList: string;
  defaultColors: string;
  edit: string;
  collapse: string;
  delete: string;
  nameRequired: string;
  nameDuplicate: string;
  // Color labels
  colorCompleted: string;
  colorInProgress: string;
  colorPending: string;
  colorFailed: string;
  colorSkipped: string;
  colorBackground: string;
  colorText: string;
  // Form hints
  templatePropKeyHint: string;
  templateMilestoneListPlaceholder: string;
  customColorsTitle: string;
  customColorsHint: string;
}

export interface SummaryTranslation {
  description: string;
  enabled: string;
  defaultTemplate: string;
  defaultType: string;
  dateFormat: string;
  weeklyPageNameTemplate: string;
  weeklyPageNamePlaceholder: string;
  monthlyPageNameTemplate: string;
  monthlyPageNamePlaceholder: string;
  customPageNameTemplate: string;
  customPageNamePlaceholder: string;
  pageNameTemplateHelp: string;
  templateGtdWorkReview: string;
  templateMinimalDashboard: string;
  templateBulletJournal: string;
  templateOkrReview: string;
  templateStudySummary: string;
  typeWeekly: string;
  typeMonthly: string;
  typeYearly: string;
  typeCustom: string;
  startDate: string;
  endDate: string;
  aiSettings: string;
  aiEnabled: string;
  aiProvider: string;
  aiProviderOpenAI: string;
  aiProviderClaude: string;
  aiProviderCustom: string;
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
  aiPromptTemplate: string;
}

export interface FeaturesTranslation {
  enabled: string;
  disabled: string;
  toolbarDescription: string;
  taskProgressDescription: string;
  heatmapDescription: string;
  blockViewDescription: string;
  milestoneDescription: string;
  summaryDescription: string;
}

export interface SettingsTabsTranslation {
  general: string;
  toolbar: string;
  taskProgress: string;
  heatmap: string;
  blockView: string;
  summary: string;
  advanced: string;
}

export interface TranslationKeys {
  taskProgress?: {
    nestingLevel: string;
  };
  toolbar: ToolbarTranslation;
  inlineComment: InlineCommentTranslation;
  comment: {
    title: string;
  };
  modal: {
    placeholder: string;
  };
  settings: {
    title: string;
    tabs: SettingsTabsTranslation;
    saveSuccessRestart?: string;
    generalSettings: string;
    theme: string;
    themeFollowSystem: string;
    language: string;
    languageFollowSystem: string;
    toolbarSettings: string;
    enabled: string;
    disabled: string;
    showBorder: string;
    width: string;
    height: string;
    hoverDelay: string;
    toolbarShortcut?: string;
    toolbarShortcutPlaceholder?: string;
    sponsorEnabled: string;
    developerMode: string;
    toolbarElements: string;
    addNewItem: string;
    addItem: string;
    label: string;
    icon: string;
    funcmode: string;
    confirmDeleteItem: string;
    jsonSettings: string;
    applyJson: string;
    resetToDefault: string;
    cancel: string;
    save: string;
    saving: string;
    loading: string;
    error: string;
    confirmReset: string;
    confirmResetItems: string;
    subtitle: string;
    generalSettingsDescription: string;
    toolbarSettingsDescription: string;
    advancedSettings: string;
    advancedSettingsDescription: string;
    lightTheme: string;
    darkTheme: string;
    chinese: string;
    english: string;
    japanese: string;
    saveGeneralSettings: string;
    saveToolbarSettings: string;
    saveSuccess: string;
    settingsNotConfigured: string;
    comingSoon: string;
    featuresTitle: string;
    featuresHint: string;
    features?: FeaturesTranslation;
    default: string;
    taskProgressDescription: string;
    taskProgress: TaskProgressTranslation;
    saveTaskProgressSettings: string;
    saveHeatmapSettings: string;
    saveBlockViewSettings: string;
    saveSummarySettings: string;
    blockView: BlockViewTranslation;
    heatmap: HeatmapTranslation;
    summary: SummaryTranslation;
    milestone?: MilestoneTranslation;
  };
}

// 支持的语言类型
export type SupportedLanguage = 'en' | 'ja' | 'zh-CN' | 'system';

// 翻译对象类型
export type Translations = Record<SupportedLanguage, TranslationKeys>;
