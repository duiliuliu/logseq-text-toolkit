// src/utils/state.ts
import { ThemeType, LanguageType } from '../types/index.ts';

interface ToolbarPosition {
  x: number;
  y: number;
}

interface State {
  selectedText: string;
  toolbarVisible: boolean;
  toolbarPosition: ToolbarPosition;
  currentTheme: ThemeType;
  currentLanguage: LanguageType;
}

// 全局状态管理
const state: State = {
  selectedText: '',
  toolbarVisible: false,
  toolbarPosition: { x: 0, y: 0 },
  currentTheme: 'light',
  currentLanguage: 'zh-CN'
};

// 设置选中的文本
export const setSelectedText = (text: string): void => {
  state.selectedText = text;
};

// 获取选中的文本
export const getSelectedText = (): string => state.selectedText;

// 设置工具栏可见性
export const setToolbarVisible = (visible: boolean): void => {
  state.toolbarVisible = visible;
};

// 获取工具栏可见性
export const getToolbarVisible = (): boolean => state.toolbarVisible;

// 设置工具栏位置
export const setToolbarPosition = (position: ToolbarPosition): void => {
  state.toolbarPosition = position;
};

// 获取工具栏位置
export const getToolbarPosition = (): ToolbarPosition => state.toolbarPosition;

// 设置当前主题
export const setCurrentTheme = (theme: ThemeType): void => {
  state.currentTheme = theme;
};

// 获取当前主题
export const getCurrentTheme = (): ThemeType => state.currentTheme;

// 设置当前语言
export const setCurrentLanguage = (language: LanguageType): void => {
  state.currentLanguage = language;
};

// 获取当前语言
export const getCurrentLanguage = (): LanguageType => state.currentLanguage;

export default state;
