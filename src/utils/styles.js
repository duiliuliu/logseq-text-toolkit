// src/utils/styles.js
import { getCurrentTheme } from './state';

// 主题样式映射
const themes = {
  light: {
    toolbar: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      color: '#333333'
    },
    modal: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      color: '#333333'
    }
  },
  dark: {
    toolbar: {
      background: '#333333',
      border: '1px solid #555555',
      color: '#ffffff'
    },
    modal: {
      background: '#333333',
      border: '1px solid #555555',
      color: '#ffffff'
    }
  }
};

// 获取当前主题样式
export const getThemeStyles = () => {
  const theme = getCurrentTheme();
  return themes[theme] || themes.light;
};

// 应用主题样式
export const applyTheme = (theme) => {
  // 这里可以实现动态应用主题样式的逻辑
};

export default {
  getThemeStyles,
  applyTheme
};