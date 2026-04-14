import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import { render } from "preact"
import Toolbar from "./Toolbar.jsx"
import zhCN from "./translations/zh-CN.json"
import ja from "./translations/ja.json"
import en from "./translations/en.json"
import { getDefinitions } from "./utils/definitions.js"
import { provideStyles } from "./utils/styles.js"
import { registerCommand, registerModel } from "./utils/commands.js"
import { setupSettings, getSettings } from "./utils/settings.js"
import {
  applyTheme,
  toggleToolbarDisplay,
  positionToolbar,
  onToolbarTransitionEnd,
  onBlur,
  onScroll,
  onSelectionChange,
} from "./utils/toolbar.js"
import { setToolbarElements, setTextarea } from "./utils/state.js"

const TOOLBAR_ID = "kef-wrap-toolbar"
const SPONSOR_BAR_ID = "kef-wrap-sponsor-bar"

let toolbar = null
let sponsorBar = null
let textarea = null
let model = {}
let selectionChangeHandler = null

async function main() {
  try {
    console.log("Initializing Text Toolkit plugin")
    
    // 设置设置schema
    setupSettings()
    
    // 初始化国际化
    const userConfigs = await logseq.App.getUserConfigs()
    const preferredLanguage = userConfigs.preferredLanguage || "en"
    await setup({ 
      builtinTranslations: { "zh-CN": zhCN, "ja": ja, "en": en },
      defaultLanguage: preferredLanguage
    })

    // 获取工具栏定义
    const definitions = await getDefinitions()
    provideStyles()

    // 重置状态
    const settings = getSettings()
    toolbar = null
    sponsorBar = null
    textarea = null
    model = {}

    // 注册模型
    const registerDefModel = (def) => {
      registerModel(model, def, textarea)
    }

    for (const definition of definitions) {
      if (definition.key.startsWith("group-")) {
        for (const def of definition.items) {
          registerDefModel(def)
        }
      } else {
        registerDefModel(definition)
      }
    }
    logseq.provideModel(model)

    // 清除已存在的命令
    try {
      logseq.App.unregisterCommandPalette("toggle-toolbar")
    } catch (e) {
      // 命令不存在，忽略错误
    }

    // 注册命令
    for (const definition of definitions) {
      if (definition.key.startsWith("group-")) {
        for (const def of definition.items) {
          registerCommand(model, def)
        }
      } else {
        registerCommand(model, definition)
      }
    }

    // 注册工具栏切换命令
    if (settings.toolbar) {
      if (settings.toolbarShortcut) {
        logseq.App.registerCommandPalette(
          {
            key: "toggle-toolbar",
            label: t("Toggle toolbar display"),
            keybinding: { binding: settings.toolbarShortcut },
          },
          toggleToolbarDisplay,
        )
      } else {
        logseq.App.registerCommandPalette(
          { key: "toggle-toolbar", label: t("Toggle toolbar display") },
          toggleToolbarDisplay,
        )
      }

      // 创建工具栏UI
      logseq.provideUI({
        key: TOOLBAR_ID,
        path: "#app-container",
        template: `<div id="${TOOLBAR_ID}"></div>`,
      })

      if (settings.sponsorBar) {
        logseq.provideUI({
          key: SPONSOR_BAR_ID,
          path: "#app-container",
          template: `<div id="${SPONSOR_BAR_ID}"><iframe src="https://duiliuliu.github.io/sponsor-page/" scrolling="no" frameborder="0"></iframe></div>`,
        })
      }

      // 初始化工具栏元素
      setTimeout(async () => {
        try {
          console.log("Initializing toolbar elements")
          // 安全地获取parent.document
          const parentDocument = window.parent.document
          if (!parentDocument) {
            console.error("Cannot access parent document")
            return
          }
          
          toolbar = parentDocument.getElementById(TOOLBAR_ID)
          sponsorBar = parentDocument.getElementById(SPONSOR_BAR_ID)
          console.log("Toolbar element:", toolbar)
          console.log("Sponsor bar element:", sponsorBar)
          
          if (!toolbar) {
            console.error("Toolbar element not found")
            return
          }
          
          setToolbarElements(toolbar, sponsorBar)
          console.log("Toolbar elements set")
          render(<Toolbar items={definitions} model={model} />, toolbar)
          console.log("Toolbar rendered")
          await applyTheme(settings.toolbarTheme)
          console.log("Theme applied")

          toolbar.addEventListener("transitionend", onToolbarTransitionEnd)
          parentDocument.addEventListener("focusout", onBlur)

          const mainContentContainer = parentDocument.getElementById(
            "main-content-container",
          )
          if (mainContentContainer) {
            mainContentContainer.addEventListener("scroll", onScroll, {
              passive: true,
            })
          }
        } catch (error) {
          console.error("Error initializing toolbar:", error)
        }
      }, 0)
    }

    // 注册选择变化事件处理
    selectionChangeHandler = onSelectionChange()
    try {
      const parentDocument = window.parent.document
      if (parentDocument) {
        parentDocument.addEventListener("selectionchange", selectionChangeHandler)
      }
    } catch (error) {
      console.error("Error adding selection change listener:", error)
    }

    console.log("#wrap loaded successfully")
  } catch (error) {
    console.error("Error initializing plugin:", error)
  }
}

function cleanup() {
  try {
    console.log("Cleaning up Text Toolkit plugin")
    
    // 移除事件监听器
    if (toolbar) {
      toolbar.removeEventListener("transitionend", onToolbarTransitionEnd)
    }
    
    try {
      const parentDocument = window.parent.document
      if (parentDocument) {
        parentDocument.removeEventListener("focusout", onBlur)
        if (selectionChangeHandler) {
          parentDocument.removeEventListener("selectionchange", selectionChangeHandler)
        }
        
        const mainContentContainer = parentDocument.getElementById("main-content-container")
        if (mainContentContainer) {
          mainContentContainer.removeEventListener("scroll", onScroll, { passive: true })
        }
      }
    } catch (error) {
      console.error("Error removing event listeners:", error)
    }
    
    // 清除状态
    toolbar = null
    sponsorBar = null
    textarea = null
    model = {}
    selectionChangeHandler = null
  } catch (error) {
    console.error("Error during cleanup:", error)
  }
}

// 初始化插件
logseq.ready(main).catch(console.error)

// 清理插件
logseq.beforeunload(cleanup)

// 监听设置变化
logseq.onSettingsChanged(() => {
  console.log("Settings changed, reinitializing plugin")
  cleanup()
  main().catch(console.error)
})

