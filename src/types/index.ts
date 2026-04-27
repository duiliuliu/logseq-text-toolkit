// 主题类型
export type ThemeType = 'light' | 'dark';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja';

// Toolbar 项目类型
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

// Toolbar 组类型
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
  items: Record<string, ToolbarItem | ToolbarGroup>;
}

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

// 全局设置类型
export interface Settings {
  theme: ThemeType;
  language: LanguageType;
  toolbar: ToolbarConfig;
  meta?: {
    language?: LanguageMeta;
  };
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

// SettingsModal Props 类型
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
}

// 标签页组件 Props 类型
export interface TabComponentProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings | null>>;
  onSave: () => void;
  isSaving: boolean;
  language: LanguageType;
}
