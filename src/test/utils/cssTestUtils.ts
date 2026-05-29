/**
 * CSS 测试工具函数
 * 用于验证 CSS 变量、样式和组件渲染
 */

export interface CSSVariable {
  name: string;
  expectedLightValue?: string;
  expectedDarkValue?: string;
}

export interface ComponentClassInfo {
  className: string;
  properties: string[];
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  variables: Record<string, string>;
}

/**
 * 获取 CSS 变量值
 */
export function getCSSVariable(varName: string): string | null {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(varName).trim() || null;
}

/**
 * 获取所有定义的 CSS 变量
 */
export function getAllCSSVariables(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  const variables: Record<string, string> = {};
  
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    if (prop.startsWith('--')) {
      variables[prop] = style.getPropertyValue(prop).trim();
    }
  }
  
  return variables;
}

/**
 * 验证 CSS 变量是否存在
 */
export function hasCSSVariable(varName: string): boolean {
  return getCSSVariable(varName) !== null;
}

/**
 * 验证 CSS 变量值
 */
export function expectCSSVariable(
  varName: string,
  expectedValue: string
): void {
  const value = getCSSVariable(varName);
  expect(value).toBe(expectedValue);
}

/**
 * 验证元素具有正确的类名
 */
export function expectElementHasClass(
  element: Element | null,
  className: string
): void {
  expect(element).not.toBeNull();
  expect(element?.classList.contains(className)).toBe(true);
}

/**
 * 验证元素具有所有指定的类名
 */
export function expectElementHasClasses(
  element: Element | null,
  classNames: string[]
): void {
  expect(element).not.toBeNull();
  classNames.forEach(className => {
    expect(element?.classList.contains(className)).toBe(true);
  });
}

/**
 * 验证元素的计算样式
 */
export function expectComputedStyle(
  element: Element | null,
  property: string,
  expectedValue: string
): void {
  expect(element).not.toBeNull();
  const style = getComputedStyle(element!);
  expect(style.getPropertyValue(property)).toBe(expectedValue);
}

/**
 * 验证元素的计算样式包含某值
 */
export function expectComputedStyleContains(
  element: Element | null,
  property: string,
  expectedPartial: string
): void {
  expect(element).not.toBeNull();
  const style = getComputedStyle(element!);
  expect(style.getPropertyValue(property)).toContain(expectedPartial);
}

/**
 * 创建 DOM 元素用于测试
 */
export function createTestElement(
  className: string,
  innerHTML?: string
): HTMLElement {
  const element = document.createElement('div');
  element.className = className;
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  document.body.appendChild(element);
  return element;
}

/**
 * 清理测试 DOM
 */
export function cleanupTestDOM(): void {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

/**
 * 设置主题模式
 */
export function setThemeMode(mode: 'light' | 'dark'): void {
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(`${mode}-mode`);
}

/**
 * 获取主题模式
 */
export function getThemeMode(): 'light' | 'dark' | null {
  if (document.body.classList.contains('dark-mode')) {
    return 'dark';
  }
  if (document.body.classList.contains('light-mode')) {
    return 'light';
  }
  return null;
}

/**
 * 验证组件在指定主题下的样式
 */
export function validateComponentThemeStyles(
  component: HTMLElement,
  theme: 'light' | 'dark',
  styles: Record<string, Record<string, string>>
): void {
  setThemeMode(theme);
  
  const themeStyles = styles[theme];
  expect(themeStyles).toBeDefined();
  
  Object.entries(themeStyles).forEach(([property, expectedValue]) => {
    expectComputedStyle(component, property, expectedValue);
  });
}

/**
 * 提取 CSS 文件中的类名
 */
export function extractClassNames(cssContent: string): string[] {
  const classPattern = /\.([a-zA-Z0-9_-]+)/g;
  const matches = cssContent.matchAll(classPattern);
  const classes = new Set<string>();
  
  for (const match of matches) {
    const className = match[1];
    // 排除伪类和伪元素
    if (!className.includes(':')) {
      classes.add(className);
    }
  }
  
  return Array.from(classes);
}

/**
 * 验证 CSS 变量定义完整性
 */
export function validateCSSVariables(
  defined: string[],
  used: string[]
): { valid: boolean; missing: string[]; unused: string[] } {
  const definedSet = new Set(defined);
  const usedSet = new Set(used);
  
  const missing = used.filter(v => !definedSet.has(v));
  const unused = defined.filter(v => !usedSet.has(v));
  
  return {
    valid: missing.length === 0,
    missing,
    unused,
  };
}

/**
 * 生成颜色对比度测试
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 计算颜色的相对亮度
 */
function getLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 验证颜色对比度是否满足 WCAG 标准
 */
export function expectContrastRatio(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): number {
  const ratio = calculateContrastRatio(foreground, background);
  
  const minRatio = level === 'AA' ? 4.5 : 7;
  expect(ratio).toBeGreaterThanOrEqual(minRatio);
  
  return ratio;
}

/**
 * 验证 hex 颜色格式
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * 模拟 React 组件渲染
 */
export function renderMockComponent(
  tag: string,
  classes: string[],
  styles?: Record<string, string>
): HTMLElement {
  const element = document.createElement(tag);
  element.className = classes.join(' ');
  
  if (styles) {
    Object.entries(styles).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }
  
  document.body.appendChild(element);
  return element;
}
