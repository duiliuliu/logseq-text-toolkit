import { ToolbarConfig } from '../components/Toolbar/types.ts';

export const toolbarItems: ToolbarConfig['items'] = {
  "text-replace": {
    id: "text-replace",
    label: "文本替换",
    icon: "type",
    funcmode: "replace",
    clickfunc: "test-${selectedText}-test"
  },
  "group-style": {
    id: "group-style",
    isGroup: true,
    label: "样式",
    items: {
      "wrap-bold": {
        id: "wrap-bold",
        label: "加粗",
        icon: "bold",
        funcmode: "replace",
        clickfunc: "**${selectedText}**"
      },
      "wrap-italic": {
        id: "wrap-italic",
        label: "斜体",
        icon: "italic",
        funcmode: "replace",
        clickfunc: "*${selectedText}*"
      },
      "wrap-strike-through": {
        id: "wrap-strike-through",
        label: "删除线",
        icon: "strikethrough",
        funcmode: "replace",
        clickfunc: "~~${selectedText}~~"
      }
    }
  },
  "group-bg-hl": {
    id: "group-bg-hl",
    isGroup: true,
    label: "背景高亮",
    items: {
      "wrap-yellow-bg-hl": {
        id: "wrap-yellow-bg-hl",
        label: "背景高亮黄",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "==${selectedText}=="
      },
      "wrap-red-bg-hl": {
        id: "wrap-red-bg-hl",
        label: "背景高亮红",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[[#red]]==${selectedText}=="
      },
      "wrap-green-bg-hl": {
        id: "wrap-green-bg-hl",
        label: "背景高亮绿",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[[#green]]==${selectedText}=="
      },
      "wrap-blue-bg-hl": {
        id: "wrap-blue-bg-hl",
        label: "背景高亮蓝",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[[#blue]]==${selectedText}=="
      }
    }
  },
  "group-text-hl": {
    id: "group-text-hl",
    isGroup: true,
    label: "字体高亮",
    items: {
      "wrap-red-text-hl": {
        id: "wrap-red-text-hl",
        label: "字体高亮红",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[$red]]==${selectedText}=="
      },
      "wrap-yellow-text-hl": {
        id: "wrap-yellow-text-hl",
        label: "字体高亮黄",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[$yellow]]==${selectedText}=="
      },
      "wrap-green-text-hl": {
        id: "wrap-green-text-hl",
        label: "字体高亮绿",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[$green]]==${selectedText}=="
      },
      "wrap-blue-text-hl": {
        id: "wrap-blue-text-hl",
        label: "字体高亮蓝",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[$blue]]==${selectedText}=="
      }
    }
  },
  "group-underline-hl": {
    id: "group-underline-hl",
    isGroup: true,
    label: "下划线",
    items: {
      "wrap-red-underline-hl": {
        id: "wrap-red-underline-hl",
        label: "下划线高亮红",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "__${selectedText}__"
      },
      "wrap-yellow-underline-hl": {
        id: "wrap-yellow-underline-hl",
        label: "下划线高亮黄",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "__${selectedText}__"
      },
      "wrap-green-underline-hl": {
        id: "wrap-green-underline-hl",
        label: "下划线高亮绿",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "__${selectedText}__"
      },
      "wrap-blue-underline-hl": {
        id: "wrap-blue-underline-hl",
        label: "下划线高亮蓝",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "__${selectedText}__"
      }
    }
  },
  "repl-clear": {
    id: "repl-clear",
    label: "清除格式",
    regex: "\\[\\[(?:#|\\$)(?:red|green|blue|yellow)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    replacement: "$1$2$3$4$5$6$7$8",
    icon: "x",
    funcmode: "replace",
    clickfunc: ""
  }
};
