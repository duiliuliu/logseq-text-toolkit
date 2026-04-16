export const toolbarItems = {
  "text-replace": {
    "label": "文本替换",
    // "binding": "",
    "icon": "type",
    "funcmode": "replace",
    "clickfunc": "${selectedText}"
  },
  "group-style": {
    "wrap-bold": {
      "label": "加粗",
      // "binding": "",
      "icon": "bold",
      "funcmode": "replace",
      "clickfunc": "**${selectedText}**"
    },
    "wrap-italic": {
      "label": "斜体",
      // "binding": "mod+shift+i",
      "icon": "italic",
      "funcmode": "replace",
      "clickfunc": "*${selectedText}*"
    },
    "wrap-strike-through": {
      "label": "删除线",
      // "binding": "",
      "icon": "strikethrough",
      "funcmode": "replace",
      "clickfunc": "~~${selectedText}~~"
    }
  },
  "group-bg-hl": {
    "wrap-yellow-bg-hl": {
      "label": "背景高亮黄",
      // "binding": "",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "==${selectedText}=="
    },
    "wrap-red-bg-hl": {
      "label": "背景高亮红",
      // "binding": "",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "[[#red]]==${selectedText}=="
    },
    "wrap-green-bg-hl": {
      "label": "背景高亮绿",
      // "binding": "",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "[[#green]]==${selectedText}=="
    },
    "wrap-blue-bg-hl": {
      "label": "背景高亮蓝",
      // "binding": "",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "[[#blue]]==${selectedText}=="
    }
  },
  "group-text-hl": {
    "wrap-red-text-hl": {
      "label": "字体高亮红",
      // "binding": "",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "[[$red]]==${selectedText}=="
    },
    "wrap-yellow-text-hl": {
      "label": "字体高亮黄",
      // "binding": "",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "[[$yellow]]==${selectedText}=="
    },
    "wrap-green-text-hl": {
      "label": "字体高亮绿",
      // "binding": "",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "[[$green]]==${selectedText}=="
    },
    "wrap-blue-text-hl": {
      "label": "字体高亮蓝",
      // "binding": "",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "[[$blue]]==${selectedText}=="
    }
  },
  "group-underline-hl": {
    "wrap-red-underline-hl": {
      "label": "下划线高亮红",
      // "binding": "",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "__${selectedText}__"
    },
    "wrap-yellow-underline-hl": {
      "label": "下划线高亮黄",
      // "binding": "",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "__${selectedText}__"
    },
    "wrap-green-underline-hl": {
      "label": "下划线高亮绿",
      // "binding": "",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "__${selectedText}__"
    },
    "wrap-blue-underline-hl": {
      "label": "下划线高亮蓝",
      // "binding": "",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "__${selectedText}__"
    }
  },
  "repl-clear": {
    "label": "清除格式",
    // "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue|yellow)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x",
    "funcmode": "replace",
    "clickfunc": ""
  }
}
