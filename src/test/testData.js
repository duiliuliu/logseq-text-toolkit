export const toolbarItems = {
  "text-replace": {
    "label": "文本替换",
    // "binding": "",
    "template": "$^",
    "icon": "type",
    "funcmode": "replace",
    "clickfunc": "文本替换"
  },
  "group-style": {
    "wrap-bold": {
      "label": "加粗",
      // "binding": "",
      "template": "**$^**",
      "icon": "bold",
      "funcmode": "replace",
      "clickfunc": "加粗"
    },
    "wrap-italic": {
      "label": "斜体",
      // "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": "italic",
      "funcmode": "replace",
      "clickfunc": "斜体"
    },
    "wrap-strike-through": {
      "label": "删除线",
      // "binding": "",
      "template": "~~$^~~",
      "icon": "strikethrough",
      "funcmode": "replace",
      "clickfunc": "删除线"
    }
  },
  "group-bg-hl": {
    "wrap-yellow-bg-hl": {
      "label": "背景高亮黄",
      // "binding": "",
      "template": "==$^==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "背景高亮黄"
    },
    "wrap-red-bg-hl": {
      "label": "背景高亮红",
      // "binding": "",
      "template": "[[#red]]==$^==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "背景高亮红"
    },
    "wrap-green-bg-hl": {
      "label": "背景高亮绿",
      // "binding": "",
      "template": "[[#green]]==$^==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "背景高亮绿"
    },
    "wrap-blue-bg-hl": {
      "label": "背景高亮蓝",
      // "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "背景高亮蓝"
    }
  },
  "group-text-hl": {
    "wrap-red-text-hl": {
      "label": "字体高亮红",
      // "binding": "",
      "template": "[[$red]]==$^==",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "字体高亮红"
    },
    "wrap-yellow-text-hl": {
      "label": "字体高亮黄",
      // "binding": "",
      "template": "[[$yellow]]==$^==",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "字体高亮黄"
    },
    "wrap-green-text-hl": {
      "label": "字体高亮绿",
      // "binding": "",
      "template": "[[$green]]==$^==",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "字体高亮绿"
    },
    "wrap-blue-text-hl": {
      "label": "字体高亮蓝",
      // "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "字体高亮蓝"
    }
  },
  "group-underline-hl": {
    "wrap-red-underline-hl": {
      "label": "下划线高亮红",
      // "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "下划线高亮红"
    },
    "wrap-yellow-underline-hl": {
      "label": "下划线高亮黄",
      // "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "下划线高亮黄"
    },
    "wrap-green-underline-hl": {
      "label": "下划线高亮绿",
      // "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "下划线高亮绿"
    },
    "wrap-blue-underline-hl": {
      "label": "下划线高亮蓝",
      // "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "下划线高亮蓝"
    }
  },
  "repl-clear": {
    "label": "清除格式",
    // "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue|yellow)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x",
    "funcmode": "replace",
    "clickfunc": "清除格式"
  }
}
