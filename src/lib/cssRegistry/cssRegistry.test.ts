/**
 * CSS Registry 模块单元测试
 * 测试 src/lib/cssRegistry/index.ts 中的 CSS 资源管理功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerCSS,
  unregisterCSS,
  getCSSRegistration,
  getAllRegistrations,
  getCopyFiles,
  loadAllCSS,
} from './index';

// Mock logseq API
vi.mock('../../logseq', () => ({
  logseqAPI: {
    provideStyle: vi.fn(),
  },
}));

vi.mock('../logger', () => ({
  default: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('cssRegistry/index.ts', () => {
  beforeEach(() => {
    // 清理所有注册
    const regs = getAllRegistrations();
    regs.forEach(reg => unregisterCSS(reg.name));
  });

  describe('registerCSS', () => {
    it('应该注册内联 CSS', () => {
      registerCSS('inline-css', {
        type: 'inline',
        content: '.test { color: red; }',
      });

      const registration = getCSSRegistration('inline-css');
      expect(registration).toBeDefined();
      expect(registration?.source.type).toBe('inline');
    });

    it('应该注册外部 CSS', () => {
      registerCSS('external-css', {
        type: 'external',
        path: './styles/test.css',
      });

      const registration = getCSSRegistration('external-css');
      expect(registration).toBeDefined();
      expect(registration?.source.type).toBe('external');
      expect((registration?.source as any).path).toBe('./styles/test.css');
    });

    it('应该注册混合 CSS', () => {
      registerCSS('both-css', {
        type: 'both',
        inlineContent: '.inline { color: blue; }',
        externalPath: './styles/both.css',
      });

      const registration = getCSSRegistration('both-css');
      expect(registration).toBeDefined();
      expect(registration?.source.type).toBe('both');
    });

    it('不应该重复注册同名 CSS', () => {
      registerCSS('duplicate', {
        type: 'inline',
        content: 'first',
      });

      registerCSS('duplicate', {
        type: 'inline',
        content: 'second',
      });

      const registration = getCSSRegistration('duplicate');
      expect((registration?.source as any).content).toBe('first');
    });
  });

  describe('unregisterCSS', () => {
    it('应该能够取消注册 CSS', () => {
      registerCSS('to-unregister', {
        type: 'inline',
        content: '.test { }',
      });

      unregisterCSS('to-unregister');

      const registration = getCSSRegistration('to-unregister');
      expect(registration).toBeUndefined();
    });

    it('取消不存在的 CSS 不应该报错', () => {
      expect(() => {
        unregisterCSS('non-existent');
      }).not.toThrow();
    });
  });

  describe('getCSSRegistration', () => {
    it('应该返回已注册的 CSS', () => {
      registerCSS('get-test', {
        type: 'inline',
        content: '.test { }',
      });

      const registration = getCSSRegistration('get-test');
      expect(registration).toBeDefined();
      expect(registration?.name).toBe('get-test');
    });

    it('应该返回 undefined 当 CSS 不存在时', () => {
      const registration = getCSSRegistration('non-existent');
      expect(registration).toBeUndefined();
    });
  });

  describe('getAllRegistrations', () => {
    it('应该返回所有已注册的 CSS', () => {
      registerCSS('reg1', { type: 'inline', content: 'a' });
      registerCSS('reg2', { type: 'inline', content: 'b' });

      const all = getAllRegistrations();
      expect(all).toHaveLength(2);
      expect(all.map(r => r.name)).toContain('reg1');
      expect(all.map(r => r.name)).toContain('reg2');
    });

    it('应该返回空数组当没有注册时', () => {
      const all = getAllRegistrations();
      expect(all).toHaveLength(0);
    });

    it('返回的数组应该是原始数据的副本', () => {
      registerCSS('copy-test', { type: 'inline', content: 'test' });
      
      const all = getAllRegistrations();
      all.push({ name: 'fake', source: { type: 'inline', content: 'fake' } } as any);

      const allAgain = getAllRegistrations();
      expect(allAgain).toHaveLength(1);
    });
  });

  describe('getCopyFiles', () => {
    it('应该返回外部 CSS 文件列表', () => {
      registerCSS('external1', {
        type: 'external',
        path: './css/file1.css',
      });

      registerCSS('external2', {
        type: 'external',
        path: './css/file2.css',
        copyTo: 'dist/file2.css',
      });

      const files = getCopyFiles();
      expect(files).toHaveLength(2);
      expect(files[0].from).toBe('./css/file1.css');
      expect(files[1].from).toBe('./css/file2.css');
      expect(files[1].to).toBe('dist/file2.css');
    });

    it('应该返回混合 CSS 中的外部文件', () => {
      registerCSS('both', {
        type: 'both',
        inlineContent: '.test { }',
        externalPath: './css/both.css',
        copyTo: 'dist/both.css',
      });

      const files = getCopyFiles();
      expect(files).toHaveLength(1);
      expect(files[0].from).toBe('./css/both.css');
    });

    it('不应该返回内联 CSS', () => {
      registerCSS('inline-only', {
        type: 'inline',
        content: '.test { }',
      });

      const files = getCopyFiles();
      expect(files).toHaveLength(0);
    });

    it('应该返回空数组当没有外部文件时', () => {
      const files = getCopyFiles();
      expect(files).toHaveLength(0);
    });
  });

  describe('loadAllCSS', () => {
    it('应该加载所有已注册的 CSS', async () => {
      const { logseqAPI } = await import('../../logseq');
      
      registerCSS('load-test', {
        type: 'inline',
        content: '.test { color: red; }',
      });

      await loadAllCSS();

      expect(logseqAPI.provideStyle).toHaveBeenCalled();
    });

    it('应该标记已加载的 CSS', async () => {
      registerCSS('loaded-test', {
        type: 'inline',
        content: '.test { }',
      });

      const firstLoad = getCSSRegistration('loaded-test');
      
      await loadAllCSS();
      
      const afterLoad = getCSSRegistration('loaded-test');
      expect(afterLoad?.loaded).toBe(true);
    });
  });
});
