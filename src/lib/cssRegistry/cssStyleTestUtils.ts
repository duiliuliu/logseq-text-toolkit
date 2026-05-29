/**
 * CSS 样式测试工具函数
 * 用于测试 CSS 样式、变量、加载和覆盖
 */

export interface CssVarTestConfig {
  varName: string
  expectedValue?: string
  minLength?: number
  description?: string
}

/**
 * 创建样式测试元素
 */
export function createStyleTestElement(
  tag: string = 'div',
  className: string = '',
  styles: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tag)
  if (className) {
    element.className = className
  }
  Object.entries(styles).forEach(([key, value]) => {
    (element.style as any)[key] = value
  })
  return element
}

/**
 * 获取 CSS 变量值
 */
export function getCssVariable(
  element: HTMLElement,
  varName: string
): string {
  const computedStyle = window.getComputedStyle(element)
  return computedStyle.getPropertyValue(varName).trim()
}

/**
 * 设置 CSS 变量值
 */
export function setCssVariable(
  element: HTMLElement,
  varName: string,
  value: string
): void {
  element.style.setProperty(varName, value)
}

/**
 * 验证多个 CSS 变量是否存在且有值
 */
export function verifyCssVariables(
  element: HTMLElement,
  varConfigs: CssVarTestConfig[]
): { valid: number; invalid: number; errors: string[] } {
  let valid = 0
  let invalid = 0
  const errors: string[] = []

  varConfigs.forEach(config => {
    const value = getCssVariable(element, config.varName)
    const varDescription = config.description || config.varName
    
    if (config.expectedValue) {
      if (value === config.expectedValue) {
        valid++
      } else {
        invalid++
        errors.push(`${varDescription}: expected "${config.expectedValue}", got "${value}"`)
      }
    } else if (config.minLength) {
      if (value.length >= config.minLength) {
        valid++
      } else {
        invalid++
        errors.push(`${varDescription}: value is too short (${value.length} < ${config.minLength})`)
      }
    } else {
      if (value.length > 0) {
        valid++
      } else {
        invalid++
        errors.push(`${varDescription}: value is empty`)
      }
    }
  })

  return { valid, invalid, errors }
}

/**
 * 验证样式类是否正确应用
 */
export function verifyClassApplied(
  element: HTMLElement,
  className: string
): boolean {
  return element.classList.contains(className)
}

/**
 * 验证样式优先级 - 检查特定属性值
 */
export function verifyStylePriority(
  element: HTMLElement,
  property: string,
  expectedValue: string
): boolean {
  const computedValue = window.getComputedStyle(element).getPropertyValue(property)
  return computedValue.trim() === expectedValue.trim()
}

/**
 * 检查元素是否具有特定样式属性
 */
export function hasStyleProperty(
  element: HTMLElement,
  property: string
): boolean {
  const inlineStyle = element.style.getPropertyValue(property)
  const computedStyle = window.getComputedStyle(element).getPropertyValue(property)
  return inlineStyle.length > 0 || computedStyle.length > 0
}

/**
 * 测试样式加载 - 在特定选择器下验证样式是否存在
 */
export function testStyleLoader(
  selector: string,
  expectedStyles: string[]
): { found: number; missing: number; missingStyles: string[] } {
  const elements = document.querySelectorAll(selector)
  if (elements.length === 0) {
    return { found: 0, missing: expectedStyles.length, missingStyles: expectedStyles }
  }

  let found = 0
  const missingStyles: string[] = []
  const firstElement = elements[0] as HTMLElement
  const computed = window.getComputedStyle(firstElement)

  expectedStyles.forEach(styleProp => {
    if (computed.getPropertyValue(styleProp)) {
      found++
    } else {
      missingStyles.push(styleProp)
    }
  })

  return { found, missing: missingStyles.length, missingStyles }
}

/**
 * 检测样式覆盖冲突
 */
export function detectStyleConflict(
  element: HTMLElement,
  properties: string[]
): string[] {
  const conflicts: string[] = []
  const computed = window.getComputedStyle(element)
  
  properties.forEach(prop => {
    const value = computed.getPropertyValue(prop)
    if (value.includes('!important')) {
      conflicts.push(`${prop} uses !important (potential conflict source)`)
    }
  })

  return conflicts
}

/**
 * 验证颜色值的基本有效性
 */
export function isValidColor(color: string): boolean {
  if (!color) return false
  
  const trimmed = color.trim()
  const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-z]+)$/i
  return colorRegex.test(trimmed)
}

/**
 * 验证透明度值
 */
export function isValidOpacity(opacity: string): boolean {
  const num = parseFloat(opacity)
  return !isNaN(num) && num >= 0 && num <= 1
}

/**
 * 测试主题切换 - 验证类名和变量变化
 */
export interface ThemeTestResult {
  classApplied: boolean
  variablesChanged: number
  cssVarsChanged: string[]
}

export function testThemeSwitch(
  element: HTMLElement,
  themeClass: string,
  testVariables: string[]
): ThemeTestResult {
  // 记录切换前的变量值
  const beforeValues = testVariables.map(varName => getCssVariable(element, varName))
  
  // 应用主题类
  element.classList.add(themeClass)
  
  // 记录切换后的变量值
  const afterValues = testVariables.map(varName => getCssVariable(element, varName))
  
  // 比较变化
  const changedVars: string[] = []
  testVariables.forEach((varName, index) => {
    if (beforeValues[index] !== afterValues[index]) {
      changedVars.push(varName)
    }
  })

  return {
    classApplied: element.classList.contains(themeClass),
    variablesChanged: changedVars.length,
    cssVarsChanged: changedVars
  }
}

/**
 * 验证响应式断点
 */
export function simulateViewportWidth(
  width: number
): void {
  // 使用 CSS 媒体查询或修改视口大小的测试工具
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  window.dispatchEvent(new Event('resize'))
}

/**
 * 清理测试创建的元素
 */
export function cleanupTestElement(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }
}

/**
 * 获取所有以特定前缀开头的CSS变量
 */
export function getCssVariablesByPrefix(
  element: HTMLElement,
  prefix: string
): Record<string, string> {
  const computed = window.getComputedStyle(element)
  const vars: Record<string, string> = {}
  
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i]
    if (prop.startsWith(prefix)) {
      vars[prop] = computed.getPropertyValue(prop).trim()
    }
  }
  
  return vars
}

/**
 * 验证样式文件是否正确加载
 */
export function verifyStylesheetLoaded(
  urlOrSelector: string
): boolean {
  // 检查 link 标签
  if (urlOrSelector.startsWith('http') || urlOrSelector.includes('.css')) {
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    for (const link of links) {
      if (link.getAttribute('href')?.includes(urlOrSelector)) {
        return true
      }
    }
    return false
  }
  
  // 检查特定选择器是否有样式
  return document.querySelectorAll(urlOrSelector).length > 0
}

/**
 * 动画和过渡测试辅助函数
 */
export function waitForTransition(
  element: HTMLElement,
  timeout: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const listener = () => {
      element.removeEventListener('transitionend', listener)
      resolve()
    }
    element.addEventListener('transitionend', listener)
    setTimeout(resolve, timeout)
  })
}

export function waitForAnimation(
  element: HTMLElement,
  animationName: string,
  timeout: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const listener = (event: AnimationEvent) => {
      if (event.animationName === animationName) {
        element.removeEventListener('animationend', listener as any)
        resolve()
      }
    }
    element.addEventListener('animationend', listener as any)
    setTimeout(resolve, timeout)
  })
}

/**
 * 样式快照测试辅助
 */
export function getElementStyles(element: HTMLElement): Record<string, string> {
  const computed = window.getComputedStyle(element)
  const styles: Record<string, string> = {}
  
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i]
    styles[prop] = computed.getPropertyValue(prop)
  }
  
  return styles
}
