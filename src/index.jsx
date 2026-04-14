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
  setToolbarElements,
  setTextarea,
  applyTheme,
  toggleToolbarDisplay,
  positionToolbar,
  onToolbarTransitionEnd,
  onBlur,
  onScroll,
  onSelectionChange,
} from "./utils/toolbar.js"

const TOOLBAR_ID = "kef-wrap-toolbar"
const SPONSOR_BAR_ID = "kef-wrap-sponsor-bar"

const isTestMode = typeof window !== 'undefined' && window.location.pathname.includes('test.html')

let toolbar = null
let sponsorBar = null
let textarea = null
let model = {}

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN, "ja": ja, "en": en } })

  const definitions = await getDefinitions()
  provideStyles()

  const settings = getSettings()
  toolbar = null
  sponsorBar = null
  textarea = null
  model = {}

  const registerDefModel = (def) => {
    registerModel(model, def, textarea, isTestMode)
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

  if (settings.toolbar) {
    if (!isTestMode) {
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

      setTimeout(async () => {
        toolbar = parent.document.getElementById(TOOLBAR_ID)
        sponsorBar = parent.document.getElementById(SPONSOR_BAR_ID)
        setToolbarElements(toolbar, sponsorBar)
        render(<Toolbar items={definitions} model={model} />, toolbar)
        applyTheme(settings.toolbarTheme)

        toolbar.addEventListener("transitionend", onToolbarTransitionEnd)
        parent.document.addEventListener("focusout", onBlur)

        const mainContentContainer = parent.document.getElementById(
          "main-content-container",
        )
        mainContentContainer.addEventListener("scroll", onScroll, {
          passive: true,
        })
      }, 0)
    }
  }

  const selectionChangeHandler = onSelectionChange(textarea, toolbar, isTestMode)
  parent.document.addEventListener("selectionchange", selectionChangeHandler)

  logseq.beforeunload(async () => {
    if (textarea) {
      textarea.removeEventListener("keydown", deletionWorkaroundHandler)
    }
    if (!isTestMode) {
      const mainContentContainer = parent.document.getElementById(
        "main-content-container",
      )
      mainContentContainer.removeEventListener("scroll", onScroll, {
        passive: true,
      })
    }
    toolbar?.removeEventListener("transitionend", onToolbarTransitionEnd)
    parent.document.removeEventListener("focusout", onBlur)
    parent.document.removeEventListener("selectionchange", selectionChangeHandler)
  })

  for (const definition of definitions) {
    if (definition.key.startsWith("group-")) {
      for (const def of definition.items) {
        registerCommand(model, def)
      }
    } else {
      registerCommand(model, definition)
    }
  }

  console.log("#wrap loaded")
}

function deletionWorkaroundHandler(e) {
  if (
    (e.key === "Backspace" || e.key === "Delete") &&
    textarea &&
    textarea.selectionStart === 0 &&
    textarea.selectionEnd === textarea.value.length &&
    toolbar &&
    toolbar.style.opacity !== "0"
  ) {
    toolbar.style.opacity = "0"
  }
}

setupSettings(main)
