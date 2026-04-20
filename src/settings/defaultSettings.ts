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
      "group-format": {
        id: "group-format",
        isGroup: true,
        label: "Format",
        items: {
          "wrap-bold": {
            id: "wrap-bold",
            label: "Bold",
            binding: "",
            icon: "bold",
            funcmode: "replace",
            clickfunc: "**${selectedText}**"
          },
          "wrap-italic": {
            id: "wrap-italic",
            label: "Italic",
            binding: "mod+shift+i",
            icon: "italic",
            funcmode: "replace",
            clickfunc: "*${selectedText}*"
          },
          "wrap-strike-through": {
            id: "wrap-strike-through",
            label: "Strikethrough",
            binding: "",
            icon: "strikethrough",
            funcmode: "replace",
            clickfunc: "~~${selectedText}~~"
          },
          "wrap-underline": {
            id: "wrap-underline",
            label: "Underline",
            binding: "",
            icon: "underline",
            funcmode: "replace",
            clickfunc: "__${selectedText}__"
          }
        }
      },
      "group-hl": {
        id: "group-hl",
        isGroup: true,
        label: "Highlight",
        items: {
          "wrap-yellow-hl": {
            id: "wrap-yellow-hl",
            label: "Yellow",
            binding: "",
            icon: "highlighter",
            funcmode: "replace",
            clickfunc: "==${selectedText}=="
          },
          "wrap-red-hl": {
            id: "wrap-red-hl",
            label: "Red",
            binding: "",
            icon: "highlighter",
            funcmode: "replace",
            clickfunc: "[:mark.red ${selectedText}]"
          },
          "wrap-blue-hl": {
            id: "wrap-blue-hl",
            label: "Blue",
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
            label: "Red Text",
            binding: "",
            icon: "type",
            funcmode: "replace",
            clickfunc: "[[:color.red ${selectedText}]]"
          },
          "wrap-blue-text": {
            id: "wrap-blue-text",
            label: "Blue Text",
            binding: "",
            icon: "type",
            funcmode: "replace",
            clickfunc: "[[:color.blue ${selectedText}]]"
          }
        }
      },
      "wrap-cloze": {
        id: "wrap-cloze",
        label: "Cloze",
        binding: "",
        icon: "menu",
        funcmode: "replace",
        clickfunc: " {{cloze ${selectedText}}}"
      }
    }
  }
};

export default defaultSettings;
