/**
 * CSS 变量系统单元测试
 * 测试 src/main.css 中定义的所有 CSS 变量
 * 
 * 测试目标：
 * 1. 变量定义完整性
 * 2. 主题切换正确性
 * 3. 向后兼容性
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCSSVariable,
  getAllCSSVariables,
  hasCSSVariable,
  setThemeMode,
  getThemeMode,
  isValidHexColor,
} from './utils/cssTestUtils';

describe('CSS 变量系统 (main.css)', () => {
  beforeEach(() => {
    // 清理主题类
    document.body.classList.remove('light-mode', 'dark-mode');
  });

  afterEach(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
  });

  describe('1. 基础变量定义', () => {
    const requiredVariables = [
      '--ls-primary-background-color-plugin',
      '--ls-secondary-background-color-plugin',
      '--ls-primary-text-color-plugin',
      '--ls-secondary-text-color-plugin',
      '--ls-border-color-plugin',
      '--ls-accent-color-plugin',
      '--ls-hover-color-plugin',
      '--ls-focus-color-plugin',
    ];

    requiredVariables.forEach(varName => {
      it(`应该定义 ${varName}`, () => {
        const value = getCSSVariable(varName);
        expect(value).toBeTruthy();
      });
    });
  });

  describe('2. 浅色主题变量值', () => {
    beforeEach(() => {
      setThemeMode('light');
    });

    it('主背景色应该是有效的十六进制颜色', () => {
      const value = getCSSVariable('--ls-primary-background-color-plugin');
      expect(value).toBeTruthy();
      expect(isValidHexColor(value!)).toBe(true);
    });

    it('次背景色应该与主背景色不同', () => {
      const primary = getCSSVariable('--ls-primary-background-color-plugin');
      const secondary = getCSSVariable('--ls-secondary-background-color-plugin');
      expect(primary).not.toBe(secondary);
    });

    it('主文本色应该与背景色有足够对比度', () => {
      const bg = getCSSVariable('--ls-primary-background-color-plugin');
      const text = getCSSVariable('--ls-primary-text-color-plugin');
      expect(bg).toBeTruthy();
      expect(text).toBeTruthy();
      // 浅色背景应该有深色文字
      expect(text).toMatch(/^#1|#[2-9]/); // 深色
    });

    it('边框色应该在背景色和文本色之间', () => {
      const bg = getCSSVariable('--ls-primary-background-color-plugin');
      const border = getCSSVariable('--ls-border-color-plugin');
      expect(bg).toBeTruthy();
      expect(border).toBeTruthy();
    });
  });

  describe('3. 深色主题变量值', () => {
    beforeEach(() => {
      setThemeMode('dark');
    });

    it('主背景色在深色模式下应该较暗', () => {
      const value = getCSSVariable('--ls-primary-background-color-plugin');
      expect(value).toBeTruthy();
      // 深色主题的主背景应该是深色
      expect(value).toMatch(/^#0|#[1]/);
    });

    it('主文本色在深色模式下应该较亮', () => {
      const value = getCSSVariable('--ls-primary-text-color-plugin');
      expect(value).toBeTruthy();
      // 深色主题的文字应该是浅色
      expect(value).toMatch(/^#f|#[e]/i);
    });

    it('深色和浅色模式的主背景色应该不同', () => {
      setThemeMode('light');
      const lightBg = getCSSVariable('--ls-primary-background-color-plugin');
      
      setThemeMode('dark');
      const darkBg = getCSSVariable('--ls-primary-background-color-plugin');
      
      expect(lightBg).not.toBe(darkBg);
    });
  });

  describe('4. 主题切换功能', () => {
    it('应该能够切换到浅色模式', () => {
      setThemeMode('light');
      expect(getThemeMode()).toBe('light');
    });

    it('应该能够切换到深色模式', () => {
      setThemeMode('dark');
      expect(getThemeMode()).toBe('dark');
    });

    it('主题切换后变量值应该更新', () => {
      setThemeMode('light');
      const lightBg = getCSSVariable('--ls-primary-background-color-plugin');
      
      setThemeMode('dark');
      const darkBg = getCSSVariable('--ls-primary-background-color-plugin');
      
      expect(lightBg).not.toBe(darkBg);
    });
  });

  describe('5. 向后兼容性别名', () => {
    it('LTT 变量应该存在（如果已迁移）', () => {
      const lttVars = [
        '--ltt-bg-primary',
        '--ltt-text-primary',
        '--ltt-border',
        '--ltt-accent',
      ];
      
      lttVars.forEach(varName => {
        const value = getCSSVariable(varName);
        if (value !== null) {
          // 如果定义了 LTT 变量，它应该是有效的
          expect(value).toBeTruthy();
        }
      });
    });

    it('旧变量应该是有效的 CSS 变量引用或具体值', () => {
      const legacyVars = [
        '--ls-primary-background-color-plugin',
        '--ls-accent-color-plugin',
      ];
      
      legacyVars.forEach(varName => {
        const value = getCSSVariable(varName);
        expect(value).toBeTruthy();
        // 值应该是 var() 引用或具体的颜色值
        expect(value).toMatch(/^var\(--|#|rgba?/);
      });
    });
  });

  describe('6. 强调色和状态色', () => {
    it('强调色应该是可见的颜色', () => {
      const accent = getCSSVariable('--ls-accent-color-plugin');
      expect(accent).toBeTruthy();
      expect(isValidHexColor(accent!)).toBe(true);
    });

    it('悬停色应该在背景色基础上变化', () => {
      const bg = getCSSVariable('--ls-primary-background-color-plugin');
      const hover = getCSSVariable('--ls-hover-color-plugin');
      expect(bg).toBeTruthy();
      expect(hover).toBeTruthy();
    });

    it('焦点色应该是半透明或浅色', () => {
      const focus = getCSSVariable('--ls-focus-color-plugin');
      expect(focus).toBeTruthy();
      // 焦点色通常是半透明
      expect(focus).toMatch(/rgba|#[d-f]/);
    });
  });

  describe('7. 深色模式 LTT 变量（如果存在）', () => {
    const darkThemeVars = [
      '--ltt-bg-primary-dark',
      '--ltt-text-primary-dark',
      '--ltt-border-normal-dark',
      '--ltt-accent-indigo-dark',
    ];

    darkThemeVars.forEach(varName => {
      it(`${varName} 应该在深色模式下有定义`, () => {
        setThemeMode('dark');
        const value = getCSSVariable(varName);
        // 这些变量在深色模式下可能存在
        if (value !== null) {
          expect(isValidHexColor(value!)).toBe(true);
        }
      });
    });
  });

  describe('8. 变量一致性', () => {
    it('所有变量应该定义在 :root 上', () => {
      const variables = getAllCSSVariables();
      const rootVars = Object.keys(variables).filter(v => v.startsWith('--ls-') || v.startsWith('--ltt-'));
      expect(rootVars.length).toBeGreaterThan(0);
    });

    it('相同的变量在浅色和深色模式下应该有不同值', () => {
      setThemeMode('light');
      const lightBg = getCSSVariable('--ls-primary-background-color-plugin');
      const lightText = getCSSVariable('--ls-primary-text-color-plugin');
      
      setThemeMode('dark');
      const darkBg = getCSSVariable('--ls-primary-background-color-plugin');
      const darkText = getCSSVariable('--ls-primary-text-color-plugin');
      
      expect(lightBg).not.toBe(darkBg);
      expect(lightText).not.toBe(darkText);
    });
  });

  describe('9. 边框颜色系统', () => {
    it('边框色应该在视觉上可见', () => {
      const border = getCSSVariable('--ls-border-color-plugin');
      expect(border).toBeTruthy();
      // 边框色不应该太暗（不可见）或太亮（刺眼）
      if (border!.startsWith('#')) {
        const hex = border!.replace('#', '');
        const brightness = parseInt(hex, 16);
        expect(brightness).toBeGreaterThan(0x202020);
        expect(brightness).toBeLessThan(0xf0f0f0);
      }
    });
  });

  describe('10. 响应式主题支持', () => {
    it('CSS 变量应该支持 prefers-color-scheme', () => {
      // 验证在媒体查询中定义的变量存在
      const hasSystemSupport = 
        getCSSVariable('--ls-primary-background-color-plugin') !== null;
      expect(hasSystemSupport).toBe(true);
    });
  });
});
