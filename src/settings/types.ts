// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja' | 'system';

// Toolbar item type - 新版本，直接作为顶级键值对
export interface ToolbarItemSimple {
  id: string;
  label: string;
  icon: string;
  binding?: string;
  funcmode: string;
  clickfunc: string;
  hidden?: boolean;
}

// Toolbar group type - 新版本，直接作为顶级键值对
export interface ToolbarGroupSimple {
  [key: string]: ToolbarItemSimple;
}

// Toolbar item type - 旧版本，支持更多字段，用于 toolbar.items
export interface ToolbarItem {
  id: string;
  label: string;
  binding?: string;
  icon?: string | React.ReactNode;
  funcmode: string;
  clickfunc: string;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
}

// Toolbar group type - 旧版本，用于 toolbar.items
export interface ToolbarGroup {
  id: string;
  isGroup: true;
  items: Record<string, ToolbarItem>;
  label: string;
  hidden?: boolean;
}

// Toolbar 配置类型
export interface ToolbarConfig {
  enabled: boolean;
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  items: Record<string, ToolbarItem | ToolbarGroup | any>;
}

// 全局设置类型
export interface Settings {
  theme: ThemeType | string;
  language: LanguageType | string;
  useSystemTheme?: boolean;
  useSystemLanguage?: boolean;
  // 旧格式支持
  toolbar?: boolean | ToolbarConfig;
  disabled?: boolean;
  toolbarShortcut?: string;
  // 新格式支持 - 任何以 'group-' 开头的键都是工具栏组
  [key: `group-${string}`]: ToolbarGroupSimple | undefined;
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
