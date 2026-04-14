export function setupSettings(mainFn) {
  logseq
    .useSettingsSchema([
      {
        key: "toolbar",
        type: "boolean",
        default: true,
        title: "Show toolbar",
        description: "Whether to show the toolbar when selecting text"
      },
      {
        key: "sponsorBar",
        type: "boolean",
        default: true,
        title: "Show sponsor bar",
        description: "Whether to show the sponsor bar below the toolbar"
      },
      {
        key: "toolbarShortcut",
        type: "string",
        default: "",
        title: "Toolbar toggle shortcut",
        description: "Keyboard shortcut to toggle toolbar display"
      },
      {
        key: "toolbarTheme",
        type: "enum",
        default: "system",
        title: "Toolbar theme",
        description: "Choose toolbar theme (light, dark, or system)",
        enumChoices: ["light", "dark", "system"]
      }
    ])
    .ready(() => {
      onSettingsChange(mainFn)
      logseq.onSettingsChanged(() => onSettingsChange(mainFn))
    })
    .catch(console.error)
}

function onSettingsChange(mainFn) {
  mainFn().catch(console.error)
}

export function getSettings() {
  return {
    toolbar: logseq.settings?.toolbar ?? true,
    sponsorBar: logseq.settings?.sponsorBar ?? true,
    toolbarShortcut: logseq.settings?.toolbarShortcut ?? "",
    toolbarTheme: logseq.settings?.toolbarTheme ?? "system"
  }
}
