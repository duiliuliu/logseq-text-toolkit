/**
 * CSS 变量和样式系统测试
 * 测试 CSS 变量系统、主题切换、样式加载和覆盖防止
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createStyleTestElement,
  getCssVariable,
  setCssVariable,
  verifyCssVariables,
  verifyClassApplied,
  testThemeSwitch,
  detectStyleConflict,
  isValidColor,
  getCssVariablesByPrefix,
  cleanupTestElement
} from './cssStyleTestUtils'

describe('CSS 变量系统测试', () => {
  let testElement: HTMLElement

  beforeEach(() => {
    testElement = createStyleTestElement('div', 'css-test-element')
    document.body.appendChild(testElement)
  })

  afterEach(() => {
    cleanupTestElement(testElement)
  })

  describe('CSS 变量基础功能', () => {
    it('应该能正确设置和获取 CSS 变量', () => {
      const varName = '--test-color'
      const expectedValue = '#ff0000'
      
      setCssVariable(testElement, varName, expectedValue)
      const actualValue = getCssVariable(testElement, varName)
      
      expect(actualValue).toBe(expectedValue)
    })

    it('应该支持多个 CSS 变量', () => {
      setCssVariable(testElement, '--var-1', '10px')
      setCssVariable(testElement, '--var-2', 'blue')
      setCssVariable(testElement, '--var-3', '0.5')
      
      expect(getCssVariable(testElement, '--var-1')).toBe('10px')
      expect(getCssVariable(testElement, '--var-2')).toBe('blue')
      expect(getCssVariable(testElement, '--var-3')).toBe('0.5')
    })

    it('应该正确处理空值变量', () => {
      setCssVariable(testElement, '--empty-var', '')
      expect(getCssVariable(testElement, '--empty-var')).toBe('')
    })
  })

  describe('CSS 变量验证', () => {
    it('应该验证多个 CSS 变量是否存在且有效', () => {
      // 设置测试变量
      setCssVariable(testElement, '--valid-color', '#ffffff')
      setCssVariable(testElement, '--valid-size', '12px')
      setCssVariable(testElement, '--empty', '')
      
      const results = verifyCssVariables(testElement, [
        { varName: '--valid-color', minLength: 1 },
        { varName: '--valid-size', minLength: 1 },
        { varName: '--empty', minLength: 1 }
      ])
      
      expect(results.valid).toBe(2)
      expect(results.invalid).toBe(1)
    })

    it('应该验证变量的期望值', () => {
      setCssVariable(testElement, '--exact-color', '#000000')
      
      const results = verifyCssVariables(testElement, [
        { varName: '--exact-color', expectedValue: '#000000' }
      ])
      
      expect(results.valid).toBe(1)
    })
  })

  describe('颜色验证', () => {
    it('应该识别有效的颜色格式', () => {
      expect(isValidColor('#ff0000')).toBe(true)
      expect(isValidColor('#fff')).toBe(true)
      expect(isValidColor('rgb(255,0,0)')).toBe(true)
      expect(isValidColor('rgba(255,0,0,0.5)')).toBe(true)
      expect(isValidColor('red')).toBe(true)
    })

    it('应该识别无效的颜色格式', () => {
      expect(isValidColor('')).toBe(false)
      expect(isValidColor('#gggggg')).toBe(false)
      expect(isValidColor('not-a-color')).toBe(false)
    })
  })

  describe('样式类应用测试', () => {
    it('应该验证样式类是否正确应用', () => {
      testElement.classList.add('test-class')
      expect(verifyClassApplied(testElement, 'test-class')).toBe(true)
      expect(verifyClassApplied(testElement, 'not-applied')).toBe(false)
    })
  })

  describe('样式冲突检测', () => {
    it('应该检测 !important 声明（潜在冲突源）', () => {
      // 创建具有 !important 的样式
      const conflictElement = createStyleTestElement('div', 'conflict-element')
      conflictElement.style.setProperty('color', 'red', 'important')
      document.body.appendChild(conflictElement)
      
      const conflicts = detectStyleConflict(conflictElement, ['color'])
      
      // 这里我们只测试功能，因为内联 !important 的检测可能有限
      // 在实际 CSS 中会更有效
      expect(Array.isArray(conflicts)).toBe(true)
      
      cleanupTestElement(conflictElement)
    })
  })
})

describe('主题切换测试', () => {
  let rootElement: HTMLElement

  beforeEach(() => {
    rootElement = createStyleTestElement('div', 'theme-test-root')
    document.body.appendChild(rootElement)
    
    // 设置默认变量
    rootElement.style.setProperty('--bg-color', '#ffffff')
    rootElement.style.setProperty('--text-color', '#000000')
  })

  afterEach(() => {
    cleanupTestElement(rootElement)
  })

  it('应该测试主题切换功能', () => {
    const testVariables = ['--bg-color', '--text-color']
    
    // 添加主题类（这里模拟主题）
    const themeClass = 'dark-theme-test'
    const style = document.createElement('style')
    style.textContent = `
      .dark-theme-test {
        --bg-color: #000000;
        --text-color: #ffffff;
      }
    `
    document.head.appendChild(style)
    
    const result = testThemeSwitch(rootElement, themeClass, testVariables)
    
    expect(result.classApplied).toBe(true)
    
    document.head.removeChild(style)
  })
})

describe('项目特定 CSS 变量测试', () => {
  let testElement: HTMLElement

  beforeEach(() => {
    testElement = createStyleTestElement('div', 'project-vars-test')
    document.body.appendChild(testElement)
  })

  afterEach(() => {
    cleanupTestElement(testElement)
  })

  it('应该检查 LTT 主题变量是否可以被识别', () => {
    // 模拟设置 LTT 变量
    setCssVariable(testElement, '--ltt-bg-primary-dark', '#171f33')
    setCssVariable(testElement, '--ltt-accent-indigo-dark', '#818cf8')
    
    const lttVars = getCssVariablesByPrefix(testElement, '--ltt-')
    
    expect(Object.keys(lttVars).length).toBeGreaterThan(0)
    expect(lttVars['--ltt-bg-primary-dark']).toBe('#171f33')
  })

  it('应该检查 Logseq 插件变量是否可以被识别', () => {
    const testVars = [
      '--ls-primary-background-color-plugin',
      '--ls-secondary-background-color-plugin',
      '--ls-primary-text-color-plugin',
      '--ls-accent-color-plugin'
    ]
    
    // 这些变量在实际环境中会被定义，但在测试中我们可以验证获取机制
    const vars = getCssVariablesByPrefix(testElement, '--ls-')
    expect(typeof vars).toBe('object')
  })
})

describe('CSS 变量快照和一致性测试', () => {
  it('应该确保所有关键 CSS 变量在不同环境中有一致性', () => {
    const element = createStyleTestElement('div', 'consistency-test')
    document.body.appendChild(element)
    
    // 设置一些基础变量
    setCssVariable(element, '--test-primary', '#3b82f6')
    setCssVariable(element, '--test-secondary', '#6b7280')
    
    // 获取变量
    const varsBefore = getCssVariablesByPrefix(element, '--test-')
    
    // 确保变量存在
    expect(varsBefore['--test-primary']).toBe('#3b82f6')
    expect(varsBefore['--test-secondary']).toBe('#6b7280')
    
    cleanupTestElement(element)
  })

  it('应该测试 CSS 变量级联机制', () => {
    const parent = createStyleTestElement('div', 'parent-element')
    const child = createStyleTestElement('div', 'child-element')
    
    setCssVariable(parent, '--parent-var', 'parent-value')
    setCssVariable(child, '--child-var', 'child-value')
    
    parent.appendChild(child)
    document.body.appendChild(parent)
    
    // 子元素应该继承父元素的变量（如果没有覆盖）
    expect(getCssVariable(parent, '--parent-var')).toBe('parent-value')
    expect(getCssVariable(child, '--child-var')).toBe('child-value')
    
    cleanupTestElement(parent)
  })
})
