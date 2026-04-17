import { Settings } from './types.ts';

// 默认配置数据
const defaultSettings: Settings = {
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
    sponsorEnabled: true, // 赞助栏开关
    
    // Toolbar 元素配置
    items: {
      "wrap-bold": {
        id: "wrap-bold",
        label: "Wrap bold",
        binding: "",
        icon: "bold",
        funcmode: "replace",
        clickfunc: "**${selectedText}**"
      },
      "group-style": {
        id: "group-style",
        isGroup: true,
        label: "Style",
        items: {
          "wrap-italic": {
            id: "wrap-italic",
            label: "Wrap italic",
            binding: "mod+shift+i",
            icon: "italic",
            funcmode: "replace",
            clickfunc: "*${selectedText}*"
          },
          "wrap-underline": {
            id: "wrap-underline",
            label: "Wrap underline",
            binding: "",
            icon: "underline",
            funcmode: "replace",
            clickfunc: "__${selectedText}__"
          }
        }
      },
      "wrap-strike-through": {
        id: "wrap-strike-through",
        label: "Wrap strike through",
        binding: "",
        icon: "strikethrough",
        funcmode: "replace",
        clickfunc: "~~${selectedText}~~"
      },
      "group-hl": {
        id: "group-hl",
        isGroup: true,
        label: "Highlight",
        items: {
          "wrap-yellow-hl": {
            id: "wrap-yellow-hl",
            label: "Wrap with yellow highlight",
            binding: "",
            icon: "highlighter",
            funcmode: "replace",
            clickfunc: "==${selectedText}=="
          },
          "wrap-red-hl": {
            id: "wrap-red-hl",
            label: "Wrap with red highlight",
            binding: "",
            icon: "highlighter",
            funcmode: "replace",
            clickfunc: "[:mark.red ${selectedText}]"
          },
          "wrap-blue-hl": {
            id: "wrap-blue-hl",
            label: "Wrap with blue highlight",
            binding: "",
            icon: "highlighter",
            funcmode: "replace",
            clickfunc: "[:mark.blue ${selectedText}]"
          }
        }
      },
      "group-text": {
        id: "group-text",
        isGroup: true,
        label: "Text",
        items: {
          "wrap-red-text": {
            id: "wrap-red-text",
            label: "Wrap with red text",
            binding: "",
            icon: "type",
            funcmode: "replace",
            clickfunc: "[[:color.red ${selectedText}]]"
          },
          "wrap-blue-text": {
            id: "wrap-blue-text",
            label: "Wrap with blue text",
            binding: "",
            icon: "type",
            funcmode: "replace",
            clickfunc: "[[:color.blue ${selectedText}]]"
          }
        }
      },
      "wrap-cloze": {
        id: "wrap-cloze",
        label: "Wrap with cloze",
        binding: "",
        icon: "menu",
        funcmode: "replace",
        clickfunc: " {{cloze ${selectedText}}}"
      },
      "repl-clear": {
        id: "repl-clear",
        label: "Remove formatting",
        binding: "mod+shift+x",
        icon: "x",
        funcmode: "replace",
        clickfunc: "",
        regex: "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
        replacement: "$1$2$3$4$5$6$7$8"
      }
    }
  }
};

export default defaultSettings;
