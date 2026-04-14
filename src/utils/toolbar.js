import { debounce, throttle } from "rambdax"

export function setToolbarElements(toolbarEl, sponsorBarEl) {
  toolbar = toolbarEl
  sponsorBar = sponsorBarEl
}

export function setTextarea(textareaEl) {
  textarea = textareaEl
}

export function applyTheme(theme) {
  const toolbarEl = toolbar
  const sponsorBarEl = sponsorBar
  if (!toolbarEl) return

  toolbarEl.classList.remove("light-theme", "dark-theme")
  if (sponsorBarEl) {
    sponsorBarEl.classList.remove("light-theme", "dark-theme")
  }

  let actualTheme = theme
  if (theme === "system") {
    actualTheme = parent.document.documentElement.getAttribute("data-theme") || "light"
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

export function toggleToolbarDisplay() {
  const appContainer = parent.document.getElementById("app-container")
  if (appContainer.classList.contains("kef-wrap-hidden")) {
    appContainer.classList.remove("kef-wrap-hidden")
  } else {
    appContainer.classList.add("kef-wrap-hidden")
  }
}

export async function positionToolbar() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
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

export function onToolbarTransitionEnd(e) {
  if (toolbar && toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
    if (sponsorBar) {
      sponsorBar.style.top = "0"
      sponsorBar.style.left = "-99999px"
    }
  }
}

export function onBlur(e) {
  if (document.activeElement !== textarea && toolbar?.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}

const hideToolbar = throttle(() => {
  if (toolbar && toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}, 1000)

const showToolbar = debounce(async () => {
  if (textarea != null && textarea.selectionStart !== textarea.selectionEnd) {
    await positionToolbar()
  }
}, 100)

export function onScroll(e) {
  hideToolbar()
  showToolbar()
}

export function onSelectionChange(textareaRef, toolbarRef, isTestMode) {
  return async function(e) {
    textarea = textareaRef
    toolbar = toolbarRef
    
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
        if (sponsorBar) {
          sponsorBar.style.opacity = "0"
        }
      } else if (textarea.selectionStart !== textarea.selectionEnd) {
        if (!isTestMode) {
          await positionToolbar()
        } else {
          toolbar.style.opacity = "1"
          toolbar.style.left = "100px"
          toolbar.style.top = "100px"
          if (sponsorBar) {
            sponsorBar.style.opacity = "1"
            sponsorBar.style.left = "100px"
            sponsorBar.style.top = "140px"
          }
        }
      }
    }
  }
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

let toolbar = null
let sponsorBar = null
let textarea = null
