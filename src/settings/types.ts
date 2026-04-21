// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja' | 'system';

// Toolbar item type
export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  binding?: string;
  funcmode: string;
  clickfunc: string;
  hidden?: boolean;
}

// Toolbar group type
export interface ToolbarGroup {
  [key: string]: ToolbarItem;
}

// 工具栏配置类型
export interface ToolbarConfig {
  enabled: boolean;
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  items: Record<string, ToolbarItem | ToolbarGroup>;
}

// 全局设置类型
export interface Settings {
  theme: ThemeType | string;
  language: LanguageType | string;
  toolbar: ToolbarConfig;
  disabled: boolean;
  toolbarShortcut: string;
  useSystemTheme?: boolean;
  useSystemLanguage?: boolean;
  [key: string]: any;
}

// Settings Context 类型
export interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  loadSettings: () => Promise<Settings | null>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
}
