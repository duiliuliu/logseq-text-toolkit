export const toolbarItems = {
  "wrap-bold": {
    "label": "Wrap bold",
    "binding": "",
    "template": "**$^**",
    "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M6 4h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V4zm0 7h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V11z\" fill=\"currentColor\"/></svg>"
  },
  "group-style": {
    "wrap-italic": {
      "label": "Wrap italic",
      "binding": "mod+shift+i",
      "template": "*$^*",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M10 4h4l-3 16H7l3-16z\" fill=\"currentColor\"/></svg>"
    },
    "wrap-underline": {
      "label": "Wrap underline",
      "binding": "",
      "template": "__$^__",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></svg>"
    }
  },
  "wrap-strike-through": {
    "label": "Wrap strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M3 12h18M6 4h4l2 8h-4zM14 12h4l2 8h-4z\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></svg>"
  },
  "group-hl": {
    "wrap-yellow-hl": {
      "label": "Wrap with yellow highlight",
      "binding": "",
      "template": "==$^==",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"#ffe79a\"/></svg>"
    },
    "wrap-red-hl": {
      "label": "Wrap with red highlight",
      "binding": "",
      "template": "[[#red]]==$^==",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"#ffc7c7\"/></svg>"
    },
    "wrap-blue-hl": {
      "label": "Wrap with blue highlight",
      "binding": "",
      "template": "[[#blue]]==$^==",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" fill=\"#abdfff\"/></svg>"
    }
  },
  "group-text": {
    "wrap-red-text": {
      "label": "Wrap with red text",
      "binding": "",
      "template": "[[$red]]==$^==",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"14\" fill=\"#f00\">T</text></svg>"
    },
    "wrap-blue-text": {
      "label": "Wrap with blue text",
      "binding": "",
      "template": "[[$blue]]==$^==",
      "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"14\" fill=\"#00beff\">T</text></svg>"
    }
  },
  "wrap-cloze": {
    "label": "Wrap with cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"8\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/><path d=\"M12 8v8M8 12h8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>"
  },
  "repl-clear": {
    "label": "Remove formatting",
    "binding": "mod+shift+x",
    "regex": "\\[\\[(?:#|\\$)(?:red|green|blue)\\]\\]|==([^=]*)==|~~([^~]*)~~|\\^\\^([^\\^]*)\\^\\^|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|_([^_]*)_|\\$([^\\$]*)\\$|`([^`]*)`",
    "replacement": "$1$2$3$4$5$6$7$8",
    "icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M3 6h18M6 6l2 12h8l2-12M10 11h4\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></svg>"
  }
}