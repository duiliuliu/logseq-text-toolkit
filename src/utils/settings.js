import { t } from "logseq-l10n"

// 定义设置面板
export function defineSettings() {
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
      }
    ])
}

// 处理设置变更
export function onSettingsChange() {
  // 重新初始化插件以应用新设置
  import('../index.jsx').then(({ main }) => {
    main().catch(console.error)
  })
}

// 获取设置，使用默认值确保兼容性
export function getSettings() {
  return {
    toolbar: logseq.settings?.toolbar ?? true,
    sponsorBar: logseq.settings?.sponsorBar ?? true,
    toolbarShortcut: logseq.settings?.toolbarShortcut ?? ""
  }
}
