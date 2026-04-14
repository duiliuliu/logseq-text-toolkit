export const toolbarItems = [
  {
    id: "wrap-cloze",
    label: "Wrap with cloze",
    binding: "",
    template: " {{cloze $^}}",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" fill=\"currentColor\"/></svg>"
  },
  {
    id: "wrap-red-hl",
    label: "Wrap with red highlight",
    binding: "",
    template: "[[#red]]==$^==",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>"
  },
  {
    id: "wrap-green-hl",
    label: "Wrap with green highlight",
    binding: "",
    template: "[[#green]]==$^==",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>"
  },
  {
    id: "wrap-blue-hl",
    label: "Wrap with blue highlight",
    binding: "",
    template: "[[#blue]]==$^==",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>"
  },
  {
    id: "wrap-red-text",
    label: "Wrap with red text",
    binding: "",
    template: "[[\$red]]==$^==",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>"
  },
  {
    id: "wrap-green-text",
    label: "Wrap with green text",
    binding: "",
    template: "[[\$green]]==$^==",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>"
  },
  {
    id: "wrap-blue-text",
    label: "Wrap with blue text",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>"
  },
  {
    id: "repl-clear",
    label: "Remove formatting",
    icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/></svg>"
  }
]