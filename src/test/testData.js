export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**${selectedText}**",
    "icon": "bold",
    "funcmode": "replace",
    "clickfunc": "Wrap bold"
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*${selectedText}*",
      "icon": "italic",
      "funcmode": "replace",
      "clickfunc": "Wrap italic"
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__${selectedText}__",
      "icon": "underline",
      "funcmode": "replace",
      "clickfunc": "Wrap underline"
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~${selectedText}~~",
    "icon": "strikethrough",
    "funcmode": "replace",
    "clickfunc": "Wrap strike through"
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==${selectedText}==",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "Wrap with yellow highlight"
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[:mark.red ${selectedText}]",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "Wrap with red highlight"
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[:mark.blue ${selectedText}]",
      "icon": "highlighter",
      "funcmode": "replace",
      "clickfunc": "Wrap with blue highlight"
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[:color.red ${selectedText}]]",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "Wrap with red text"
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[:color.blue ${selectedText}]]",
      "icon": "type",
      "funcmode": "replace",
      "clickfunc": "Wrap with blue text"
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze ${selectedText}}}",
    "icon": "menu",
    "funcmode": "replace",
    "clickfunc": "Wrap with cloze"
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "x",
    "funcmode": "replace",
    "clickfunc": "Remove formatting"
  }
}
