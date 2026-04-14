// 状态管理模块，集中管理全局变量

// 工具栏相关元素
let toolbar = null
let sponsorBar = null
let textarea = null

/**
 * 设置工具栏元素
 * @param {HTMLElement} toolbarEl - 工具栏元素
 * @param {HTMLElement} sponsorBarEl - 赞助栏元素
 */
export function setToolbarElements(toolbarEl, sponsorBarEl) {
  toolbar = toolbarEl
  sponsorBar = sponsorBarEl
}

/**
 * 设置文本区域元素
 * @param {HTMLElement} textareaEl - 文本区域元素
 */
export function setTextarea(textareaEl) {
  textarea = textareaEl
}

/**
 * 获取当前状态
 * @returns {Object} 包含所有状态变量的对象
 */
export function getState() {
  return {
    toolbar,
    sponsorBar,
    textarea
  }
}

/**
 * 获取工具栏元素
 * @returns {HTMLElement|null} 工具栏元素
 */
export function getToolbar() {
  return toolbar
}

/**
 * 获取赞助栏元素
 * @returns {HTMLElement|null} 赞助栏元素
 */
export function getSponsorBar() {
  return sponsorBar
}

/**
 * 获取文本区域元素
 * @returns {HTMLElement|null} 文本区域元素
 */
export function getTextarea() {
  return textarea
}
