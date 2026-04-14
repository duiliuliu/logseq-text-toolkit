import { t } from "logseq-l10n"

const TOOLBAR_ID = "kef-wrap-toolbar"
const SPONSOR_BAR_ID = "kef-wrap-sponsor-bar"
let toolbar
let sponsorBar
let textarea

// 检测是否在测试模式
export const isTestMode = typeof window !== 'undefined' && window.location.pathname.includes('test.html')

// 获取工具栏元素
export function getToolbar() {
  return toolbar
}

// 获取赞赏栏元素
export function getSponsorBar() {
  return sponsorBar
}

// 获取当前textarea元素
export function getTextarea() {
  return textarea
}

// 设置textarea元素
export function setTextarea(element) {
  textarea = element
}

// 提供工具栏和赞赏栏UI
export function provideToolbarUI(settings) {
  if (settings.toolbar) {
    if (!isTestMode) {
      logseq.provideUI({
        key: TOOLBAR_ID,
        path: "#app-container",
        template: `<div id="${TOOLBAR_ID}"></div>`,
      })

      // 提供赞赏栏UI
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
        logseq.App.registerCommandPalette({ key: "toggle-toolbar", label: t("Toggle toolbar display") }, toggleToolbarDisplay)
      }

      // Let div root element get generated first.
      setTimeout(async () => {
        toolbar = parent.document.getElementById(TOOLBAR_ID)

        // 获取赞赏栏元素
        if (settings.sponsorBar) {
          sponsorBar = parent.document.getElementById(SPONSOR_BAR_ID)
        }

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

  parent.document.addEventListener("selectionchange", onSelectionChange)
}

// 清理事件监听器
export function cleanupEventListeners() {
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
  parent.document.removeEventListener("selectionchange", onSelectionChange)
}

// 监听选择变化
async function onSelectionChange(e) {
  const activeElement = parent.document.activeElement
  if (
    activeElement !== textarea &&
    activeElement.nodeName.toLowerCase() === "textarea"
  ) {
    if (toolbar != null && textarea != null) {
      textarea.removeEventListener("keydown", deletionWorkaroundHandler)
    }
    textarea = activeElement
    if (toolbar != null) {
      textarea.addEventListener("keydown", deletionWorkaroundHandler)
    }
  }

  if (toolbar != null && activeElement === textarea) {
    if (
      textarea.selectionStart === textarea.selectionEnd &&
      toolbar.style.opacity !== "0"
    ) {
      toolbar.style.opacity = "0"
      // 同时隐藏赞赏栏
      if (sponsorBar) {
        sponsorBar.style.opacity = "0"
      }
    } else if (textarea.selectionStart !== textarea.selectionEnd) {
      if (!isTestMode) {
        await positionToolbar()
      } else {
        // 在测试模式下直接显示工具栏
        toolbar.style.opacity = "1"
        toolbar.style.left = "100px"
        toolbar.style.top = "100px"
        // 同时显示赞赏栏
        if (sponsorBar) {
          sponsorBar.style.opacity = "1"
          sponsorBar.style.left = "100px"
          sponsorBar.style.top = "140px"
        }
      }
    }
  }
}

// 处理删除键的工作区
export function deletionWorkaroundHandler(e) {
  if (
    (e.key === "Backspace" || e.key === "Delete") &&
    textarea.selectionStart === 0 &&
    textarea.selectionEnd === textarea.value.length &&
    toolbar.style.opacity !== "0"
  ) {
    toolbar.style.opacity = "0"
  }
}

// 定位工具栏
async function positionToolbar() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
  if (curPos != null) {
    // 计算位置和宽度
    let leftPosition
    let width = toolbar.clientWidth
    
    if (
      curPos.left + curPos.rect.x + width <=
      parent.window.innerWidth
    ) {
      leftPosition = `${curPos.left + curPos.rect.x}px`
    } else {
      width = parent.window.innerWidth - (curPos.left + curPos.rect.x)
      leftPosition = `${curPos.left + curPos.rect.x}px`
    }
    
    // 设置工具栏位置和宽度
    toolbar.style.top = `${curPos.top + curPos.rect.y - 35}px`
    toolbar.style.left = leftPosition
    toolbar.style.width = `${width}px`
    toolbar.style.opacity = "1"
    
    // 设置赞赏栏位置和宽度
    if (sponsorBar) {
      sponsorBar.style.top = `${curPos.top + curPos.rect.y - 5}px`
      sponsorBar.style.left = leftPosition
      sponsorBar.style.width = `${width}px`
      sponsorBar.style.opacity = "1"
    }
  }
}

// 工具栏过渡结束事件
function onToolbarTransitionEnd(e) {
  if (toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.top = "0"
      sponsorBar.style.left = "-99999px"
    }
  }
}

// 失去焦点事件
function onBlur(e) {
  // Update toolbar visibility upon activeElement change.
  if (document.activeElement !== textarea && toolbar?.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}

// 隐藏工具栏
const hideToolbar = throttle(() => {
  if (toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}, 1000)

// 显示工具栏
const showToolbar = debounce(async () => {
  if (textarea != null && textarea.selectionStart !== textarea.selectionEnd) {
    await positionToolbar()
  }
}, 100)

// 滚动事件
function onScroll(e) {
  hideToolbar()
  showToolbar()
}

// 切换工具栏显示
function toggleToolbarDisplay() {
  const appContainer = parent.document.getElementById("app-container")
  if (appContainer.classList.contains("kef-wrap-hidden")) {
    appContainer.classList.remove("kef-wrap-hidden")
  } else {
    appContainer.classList.add("kef-wrap-hidden")
  }
}

// 从rambdax导入throttle和debounce
import { debounce, throttle } from "rambdax"
