// 初始设置
const defaultSettings = {
  // 主题设置
  theme: 'light', // light, dark
  
  // 语言设置
  language: 'zh-CN', // zh-CN, en, ja
  
  // Toolbar 全局设置
  toolbar: {
    enabled: true, // Toolbar 功能开关
    showBorder: true, // 边框
    width: '110px', // 宽度
    height: '24px', // 高度
    hoverDelay: 500, // 悬停延时
    
    // Toolbar 元素配置
    items: {
      "wrap-bold": {
        "label": "Wrap bold",
        "binding": "",
        "icon": "bold",
        "funcmode": "replace",
        "clickfunc": "**${selectedText}**"
      },
      "group-style": {
        "wrap-italic": {
          "label": "Wrap italic",
          "binding": "mod+shift+i",
          "icon": "italic",
          "funcmode": "replace",
          "clickfunc": "*${selectedText}*"
        },
        "wrap-underline": {
          "label": "Wrap underline",
          "binding": "",
          "icon": "underline",
          "funcmode": "replace",
          "clickfunc": "__${selectedText}__"
        }
      },
      "wrap-strike-through": {
        "label": "Wrap strike through",
        "binding": "",
        "icon": "strikethrough",
        "funcmode": "replace",
        "clickfunc": "~~${selectedText}~~"
      },
      "group-hl": {
        "wrap-yellow-hl": {
          "label": "Wrap with yellow highlight",
          "binding": "",
          "icon": "highlighter",
          "funcmode": "replace",
          "clickfunc": "==${selectedText}=="
        },
        "wrap-red-hl": {
          "label": "Wrap with red highlight",
          "binding": "",
          "icon": "highlighter",
          "funcmode": "replace",
          "clickfunc": "[:mark.red ${selectedText}]"
        },
        "wrap-blue-hl": {
          "label": "Wrap with blue highlight",
          "binding": "",
          "icon": "highlighter",
          "funcmode": "replace",
          "clickfunc": "[:mark.blue ${selectedText}]"
        }
      },
      "group-text": {
        "wrap-red-text": {
          "label": "Wrap with red text",
          "binding": "",
          "icon": "type",
          "funcmode": "replace",
          "clickfunc": "[[:color.red ${selectedText}]]"
        },
        "wrap-blue-text": {
          "label": "Wrap with blue text",
          "binding": "",
          "icon": "type",
          "funcmode": "replace",
          "clickfunc": "[[:color.blue ${selectedText}]]"
        }
      },
      "wrap-cloze": {
        "label": "Wrap with cloze",
        "binding": "",
        "icon": "menu",
        "funcmode": "replace",
        "clickfunc": " {{cloze ${selectedText}}}"
      },
      "repl-clear": {
        "label": "Remove formatting",
        "binding": "mod+shift+x",
        "icon": "x",
        "funcmode": "replace",
        "clickfunc": "",
        "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
        "replacement": "$1$2$3$4$5$6$7$8"
      }
    }
  }
};

// 加载设置
export const loadSettings = async () => {
  try {
    // 在 Logseq 环境中，使用 Logseq 的设置存储
    if (typeof logseq !== 'undefined' && logseq.settings) {
      return { ...defaultSettings, ...logseq.settings };
    }
    
    // 在测试环境中，使用 localStorage
    const savedSettings = localStorage.getItem('text-toolkit-settings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// 保存设置
export const saveSettings = async (settings) => {
  try {
    // 在 Logseq 环境中，使用 Logseq 的设置存储
    if (typeof logseq !== 'undefined') {
      await logseq.updateSettings(settings);
      return true;
    }
    
    // 在测试环境中，使用 localStorage
    localStorage.setItem('text-toolkit-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

// 重置设置
export const resetSettings = async () => {
  return await saveSettings(defaultSettings);
};

export default defaultSettings;
