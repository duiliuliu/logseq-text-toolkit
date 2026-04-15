export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**$^**",
    "icon": "bold",
    "iconColor": "#333333"
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": "italic",
      "iconColor": "#666666"
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "iconColor": "#999999"
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": "strikethrough",
    "iconColor": "#999999"
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==$^==",
      "icon": "highlighter",
      "iconColor": "#FFD700"
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[[#red]]==$^==",
      "icon": "highlighter",
      "iconColor": "#FF6B6B"
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": "highlighter",
      "iconColor": "#4ECDC4"
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[$red]]==$^==",
      "icon": "type",
      "iconColor": "#FF6B6B"
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": "type",
      "iconColor": "#4ECDC4"
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "menu",
    "iconColor": "#666666"
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x",
    "iconColor": "#FF6B6B"
  }
}