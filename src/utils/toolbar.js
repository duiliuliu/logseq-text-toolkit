import { debounce, throttle } from "rambdax"
import { getToolbar, getSponsorBar, getTextarea, setTextarea } from "./state.js"

/**
 * 应用主题到工具栏和赞助栏
 * @param {string} theme - 主题类型：light, dark 或 system
 */
export async function applyTheme(theme) {
  const toolbarEl = getToolbar()
  const sponsorBarEl = getSponsorBar()
  if (!toolbarEl) return

  toolbarEl.classList.remove("light-theme", "dark-theme")
  if (sponsorBarEl) {
    sponsorBarEl.classList.remove("light-theme", "dark-theme")
  }

  let actualTheme = theme
  if (theme === "system") {
    const userConfigs = await logseq.App.getUserConfigs()
    actualTheme = userConfigs.preferredTheme || "light"
  }

  if (actualTheme === "light") {
    toolbarEl.classList.add("light-theme")
    if (sponsorBarEl) {
      sponsorBarEl.classList.add("light-theme")
    }
  } else {
    toolbarEl.classList.add("dark-theme")
    if (sponsorBarEl) {
      sponsorBarEl.classList.add("dark-theme")
    }
  }
}

/**
 * 切换工具栏显示/隐藏状态
 */
export function toggleToolbarDisplay() {
  const appContainer = parent.document.getElementById("app-container")
  if (appContainer.classList.contains("kef-wrap-hidden")) {
    appContainer.classList.remove("kef-wrap-hidden")
  } else {
    appContainer.classList.add("kef-wrap-hidden")
  }
}

/**
 * 定位工具栏到光标位置
 */
export async function positionToolbar() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
  const toolbar = getToolbar()
  const sponsorBar = getSponsorBar()
  if (curPos != null && toolbar) {
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
    
    toolbar.style.top = `${curPos.top + curPos.rect.y - 35}px`
    toolbar.style.left = leftPosition
    toolbar.style.width = `${width}px`
    toolbar.style.opacity = "1"
    
    if (sponsorBar) {
      sponsorBar.style.top = `${curPos.top + curPos.rect.y - 5}px`
      sponsorBar.style.left = leftPosition
      sponsorBar.style.width = `${width}px`
      sponsorBar.style.opacity = "1"
    }
  }
}

/**
 * 工具栏过渡结束事件处理函数
 * @param {Event} e - 过渡结束事件
 */
export function onToolbarTransitionEnd(e) {
  const toolbar = getToolbar()
  const sponsorBar = getSponsorBar()
  if (toolbar && toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
    if (sponsorBar) {
      sponsorBar.style.top = "0"
      sponsorBar.style.left = "-99999px"
    }
  }
}

/**
 * 失去焦点事件处理函数
 * @param {Event} e - 失去焦点事件
 */
export function onBlur(e) {
  const toolbar = getToolbar()
  const textarea = getTextarea()
  const sponsorBar = getSponsorBar()
  if (document.activeElement !== textarea && toolbar?.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}

/**
 * 隐藏工具栏的节流函数
 */
const hideToolbar = throttle(() => {
  const toolbar = getToolbar()
  const sponsorBar = getSponsorBar()
  if (toolbar && toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}, 1000)

/**
 * 显示工具栏的防抖函数
 */
const showToolbar = debounce(async () => {
  const textarea = getTextarea()
  if (textarea != null && textarea.selectionStart !== textarea.selectionEnd) {
    await positionToolbar()
  }
}, 100)

/**
 * 滚动事件处理函数
 * @param {Event} e - 滚动事件
 */
export function onScroll(e) {
  hideToolbar()
  showToolbar()
}

/**
 * 创建文本选择变化事件处理函数
 * @returns {Function} 事件处理函数
 */
export function onSelectionChange() {
  return async function(e) {
    const activeElement = parent.document.activeElement
    if (
      activeElement.nodeName.toLowerCase() === "textarea"
    ) {
      setTextarea(activeElement)
    }

    const toolbar = getToolbar()
    const textarea = getTextarea()
    const sponsorBar = getSponsorBar()
    if (toolbar != null && activeElement === textarea) {
      if (
        textarea.selectionStart === textarea.selectionEnd &&
        toolbar.style.opacity !== "0"
      ) {
        toolbar.style.opacity = "0"
        if (sponsorBar) {
          sponsorBar.style.opacity = "0"
        }
      } else if (textarea.selectionStart !== textarea.selectionEnd) {
        await positionToolbar()
      }
    }
  }
}
