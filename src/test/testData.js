export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**$^**",
    "icon": "bold",
    "funcmode": "replace",
    "clickfunc": "Wrap bold"
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": "italic",
      "funcmode": "console",
      "clickfunc": "Wrap italic"
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__$^__",
      "icon": "underline",
      "funcmode": "add",
      "clickfunc": "Wrap underline"
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": "strikethrough",
    "funcmode": "invoke",
    "clickfunc": "Wrap strike through"
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==$^==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "Wrap with yellow highlight"
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[[#red]]==$^==",
      "icon": "highlighter",
      "funcmode": "console",
      "clickfunc": "Wrap with red highlight"
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": "highlighter",
      "funcmode": "add",
      "clickfunc": "Wrap with blue highlight"
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[$red]]==$^==",
      "icon": "type",
      "funcmode": "invoke",
      "clickfunc": "Wrap with red text"
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "Wrap with blue text"
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "menu",
    "funcmode": "console",
    "clickfunc": "Wrap with cloze"
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x",
    "funcmode": "add",
    "clickfunc": "Remove formatting"
  }
}