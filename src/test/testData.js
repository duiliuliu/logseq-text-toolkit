import { Bold, Italic, Underline, Strikethrough, Highlighter, Type, X, Menu } from 'lucide-react'

export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**$^**",
    "icon": Bold
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": Italic
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__$^__",
      "icon": Underline
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": Strikethrough
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==$^==",
      "icon": Highlighter
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[[#red]]==$^==",
      "icon": Highlighter
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": Highlighter
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[$red]]==$^==",
      "icon": Type
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": Type
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": Menu
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": X
  }
}