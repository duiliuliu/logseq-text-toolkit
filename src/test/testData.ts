import { ToolbarConfig } from '../components/Toolbar/types.ts';

export const toolbarItems: ToolbarConfig['items'] = {
  "wrap-bold": {
    id: "wrap-bold",
    label: "加粗",
    binding: "",
    icon: "bold",
    funcmode: "replace",
    clickfunc: "**${selectedText}**"
  },
  "group-style": {
    id: "group-style",
    isGroup: true,
    label: "样式",
    items: {
      "wrap-italic": {
        id: "wrap-italic",
        label: "斜体",
        binding: "mod+shift+i",
        icon: "italic",
        funcmode: "replace",
        clickfunc: "*${selectedText}*"
      },
      "wrap-underline": {
        id: "wrap-underline",
        label: "下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "__${selectedText}__"
      },
      "wrap-strike-through": {
        id: "wrap-strike-through",
        label: "删除线",
        binding: "",
        icon: "strikethrough",
        funcmode: "replace",
        clickfunc: "~~${selectedText}~~"
      }
    }
  },
  "group-hl": {
    id: "group-hl",
    isGroup: true,
    label: "高亮",
    items: {
      "wrap-yellow-hl": {
        id: "wrap-yellow-hl",
        label: "黄色高亮",
        binding: "",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "==${selectedText}=="
      },
      "wrap-red-hl": {
        id: "wrap-red-hl",
        label: "红色高亮",
        binding: "",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[:mark.red ${selectedText}]"
      },
      "wrap-blue-hl": {
        id: "wrap-blue-hl",
        label: "蓝色高亮",
        binding: "",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[:mark.blue ${selectedText}]"
      },
      "wrap-green-hl": {
        id: "wrap-green-hl",
        label: "绿色高亮",
        binding: "",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[:mark.green ${selectedText}]"
      },
      "wrap-purple-hl": {
        id: "wrap-purple-hl",
        label: "紫色高亮",
        binding: "",
        icon: "highlighter",
        funcmode: "replace",
        clickfunc: "[:mark.purple ${selectedText}]"
      }
    }
  },
  "group-text": {
    id: "group-text",
    isGroup: true,
    label: "文本",
    items: {
      "wrap-red-text": {
        id: "wrap-red-text",
        label: "红色文本",
        binding: "",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[:color.red ${selectedText}]]"
      },
      "wrap-blue-text": {
        id: "wrap-blue-text",
        label: "蓝色文本",
        binding: "",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[:color.blue ${selectedText}]]"
      },
      "wrap-yellow-text": {
        id: "wrap-yellow-text",
        label: "黄色文本",
        binding: "",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[:color.yellow ${selectedText}]]"
      },
      "wrap-green-text": {
        id: "wrap-green-text",
        label: "绿色文本",
        binding: "",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[:color.green ${selectedText}]]"
      },
      "wrap-purple-text": {
        id: "wrap-purple-text",
        label: "紫色文本",
        binding: "",
        icon: "type",
        funcmode: "replace",
        clickfunc: "[[:color.purple ${selectedText}]]"
      }
    }
  },
  "group-underline": {
    id: "group-underline",
    isGroup: true,
    label: "下划线",
    items: {
      "wrap-red-underline": {
        id: "wrap-red-underline",
        label: "红色下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "[:mark.red-underline ${selectedText}]"
      },
      "wrap-yellow-underline": {
        id: "wrap-yellow-underline",
        label: "黄色下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "[:mark.yellow-underline ${selectedText}]"
      },
      "wrap-blue-underline": {
        id: "wrap-blue-underline",
        label: "蓝色下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "[:mark.blue-underline ${selectedText}]"
      },
      "wrap-green-underline": {
        id: "wrap-green-underline",
        label: "绿色下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "[:mark.green-underline ${selectedText}]"
      },
      "wrap-purple-underline": {
        id: "wrap-purple-underline",
        label: "紫色下划线",
        binding: "",
        icon: "underline",
        funcmode: "replace",
        clickfunc: "[:mark.purple-underline ${selectedText}]"
      }
    }
  },
  "wrap-file-link": {
    id: "wrap-file-link",
    label: "文件链接",
    binding: "",
    icon: "link",
    funcmode: "replace",
    clickfunc: "[[${selectedText}]]"
  },
  "wrap-cloze": {
    id: "wrap-cloze",
    label: "挖空",
    binding: "",
    icon: "menu",
    funcmode: "replace",
    clickfunc: " {{cloze ${selectedText}}}"
  },
  "repl-clear": {
    id: "repl-clear",
    label: "清除格式",
    binding: "mod+shift+x",
    icon: "x",
    funcmode: "replace",
    clickfunc: "",
    regex: "\[\[(?:#|\$)(?:red|green|blue)\]\]|==([^=]*)==|~~([^~]*)~~|\^\^([^\^]*)\^\^|\*\*([^\*]*)\*\*|\*([^\*]*)\*|_([^_]*)_|\$([^\$]*)\$|`([^`]*)`",
    replacement: "$1$2$3$4$5$6$7$8"
  }
};
