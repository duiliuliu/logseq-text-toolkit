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
  labelFormat: string;
  labelFraction: string;
  labelPercentage: string;
  labelBoth: string;
  statusNames: TaskProgressStatusNames;
  tooltip: TaskProgressTooltip;
}

export interface TranslationKeys {
  toolbar: {
    bold: string;
    highlight: string;
    fileLink: string;
    comment: string;
  };
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
      advanced: string;
    };
    generalSettings: string;
    theme: string;
    themeFollowSystem: string;
    language: string;
    languageFollowSystem: string;
    toolbarSettings: string;
    enabled: string;
    showBorder: string;
    width: string;
    height: string;
    hoverDelay: string;
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
export type SupportedLanguage = 'en' | 'ja' | 'zh-CN';

// 翻译对象类型
export type Translations = Record<SupportedLanguage, TranslationKeys>;
