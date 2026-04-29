// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja' | 'system';

// 语言配置类型
export interface LanguageConfig {
  code: string;       // 语言代码，如 zh-CN, en, ja
  name: string;       // 语言名称，如 "中文", "English", "日本語"
  path: string;       // 语言文件路径，相对于插件根目录
  isDefault?: boolean; // 是否为默认语言
}

export interface LanguageMeta {
  languages: LanguageConfig[];  // 语言列表
  fallbackLanguage: string;     // 降级语言代码
}

// Toolbar item type
export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  binding?: string;
  invoke: string;
  invokeParams: string;
  hidden?: boolean;
  // 兼容旧版本
  funcmode?: string;
  clickfunc?: string;
}

// Toolbar group type
export interface ToolbarGroup extends ToolbarItem {
  subItems: ToolbarItem[];
}

// 全局设置类型
export interface Settings {
  // 主题和语言设置
  theme: ThemeType;
  language: LanguageType;
  useSystemTheme: boolean;
  useSystemLanguage: boolean;
  
  // 工具栏设置
  toolbar: boolean;
  disabled: boolean;
  toolbarShortcut?: string;  // 可选字段，暂时未使用
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  developerMode: boolean;
  
  // 工具栏元素配置
  ToolbarItems: Array<ToolbarItem | ToolbarGroup>;
  
  // 元数据设置
  meta?: {
    language?: LanguageMeta;
  };
  
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
