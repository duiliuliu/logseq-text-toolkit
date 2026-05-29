/**
 * CSS 测试工具函数
 * 用于测试 CSS 变量和组件样式
 */

export interface CSSVariable {
  name: string;
  value: string;
  description?: string;
}

export function getCSSVariable(element: HTMLElement, variableName: string): string | null {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.getPropertyValue(variableName).trim();
}

export function getAllCSSVariables(element: HTMLElement): CSSVariable[] {
  const computedStyle = window.getComputedStyle(element);
  const variables: CSSVariable[] = [];
  
  for (let i = 0; i < computedStyle.length; i++) {
    const propName = computedStyle[i];
    if (propName.startsWith('--')) {
      variables.push({
        name: propName,
        value: computedStyle.getPropertyValue(propName).trim()
      });
    }
  }
  
  return variables;
}

export function createTestElement(
  tag: string = 'div',
  className: string = '',
  styles: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  Object.entries(styles).forEach(([key, value]) => {
    (element.style as any)[key] = value;
  });
  document.body.appendChild(element);
  return element;
}

export function cleanupTestElement(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export function applyTheme(
  element: HTMLElement,
  theme: 'light' | 'dark'
): void {
  element.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    element.classList.add('dark');
  } else {
    element.classList.remove('dark');
  }
}

export function getComputedStyleValue(
  element: HTMLElement,
  property: string
): string {
  const computed = window.getComputedStyle(element);
  return computed.getPropertyValue(property).trim();
}

export function getBackgroundColor(element: HTMLElement): string {
  return getComputedStyleValue(element, 'background-color');
}

export function getTextColor(element: HTMLElement): string {
  return getComputedStyleValue(element, 'color');
}

export function getBorderColor(element: HTMLElement): string {
  return getComputedStyleValue(element, 'border-color');
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

export function getElementDimensions(element: HTMLElement): {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight
  };
}

export function simulateClick(element: HTMLElement): void {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

export function simulateMouseEnter(element: HTMLElement): void {
  const event = new MouseEvent('mouseenter', {
    bubbles: false,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

export function simulateMouseLeave(element: HTMLElement): void {
  const event = new MouseEvent('mouseleave', {
    bubbles: false,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

export function waitFor(
  condition: () => boolean,
  timeout: number = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
}

export function isColorValid(color: string): boolean {
  const cssColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
  
  return cssColorRegex.test(color) || 
         rgbRegex.test(color) || 
         rgbaRegex.test(color);
}

export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 
        ? val / 12.92 
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}
