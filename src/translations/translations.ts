// 翻译类型定义

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
    tabs: {
      general: string;
      toolbar: string;
      taskProgress: string;
      heatmap: string;
      advanced: string;
    };
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
    taskProgressDescription: string;
    taskProgress: TaskProgressTranslation;
    saveTaskProgressSettings: string;
  };
}

// 支持的语言类型
export type SupportedLanguage = 'en' | 'ja' | 'zh-CN' | 'system';

// 翻译对象类型
export type Translations = Record<SupportedLanguage, TranslationKeys>;
