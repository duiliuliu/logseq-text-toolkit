// src/utils/state.js

// 全局状态管理
const state = {
  selectedText: '',
  toolbarVisible: false,
  toolbarPosition: { x: 0, y: 0 },
  currentTheme: 'light',
  currentLanguage: 'zh-CN'
};

// 设置选中的文本
export const setSelectedText = (text) => {
  state.selectedText = text;
};

// 获取选中的文本
export const getSelectedText = () => state.selectedText;

// 设置工具栏可见性
export const setToolbarVisible = (visible) => {
  state.toolbarVisible = visible;
};

// 获取工具栏可见性
export const getToolbarVisible = () => state.toolbarVisible;

// 设置工具栏位置
export const setToolbarPosition = (position) => {
  state.toolbarPosition = position;
};

// 获取工具栏位置
export const getToolbarPosition = () => state.toolbarPosition;

// 设置当前主题
export const setCurrentTheme = (theme) => {
  state.currentTheme = theme;
};

// 获取当前主题
export const getCurrentTheme = () => state.currentTheme;

// 设置当前语言
export const setCurrentLanguage = (language) => {
  state.currentLanguage = language;
};

// 获取当前语言
export const getCurrentLanguage = () => state.currentLanguage;

// 监听选中文本变化
export const listenForSelectionChanges = () => {
  logseq.App.on('selectionChange', async (e) => {
    try {
      const selectedText = await logseq.Editor.getSelectedText();
      setSelectedText(selectedText || '');
      
      // 显示工具栏
      if (selectedText) {
        setToolbarVisible(true);
        // 这里可以添加计算工具栏位置的逻辑
      } else {
        setToolbarVisible(false);
      }
    } catch (error) {
      console.error('获取选中文本失败:', error);
    }
  });
};

export default state;