export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**$^**",
    "icon": "bold"
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": "italic"
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__$^__",
      "icon": "underline"
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": "strikethrough"
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==$^==",
      "icon": "highlighter"
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[[#red]]==$^==",
      "icon": "highlighter"
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": "highlighter"
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[$red]]==$^==",
      "icon": "type"
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": "type"
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "menu"
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x"
  }
}