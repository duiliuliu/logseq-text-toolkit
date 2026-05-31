/**
 * Milestone inline 参数测试
 */

import { describe, it, expect, vi } from 'vitest';
import { registerRendererArgModel, parseRendererArgs } from '../render/rendererArgs';

// 模拟 settings
const mockSettings = {
  milestone: {
    inline: false,
    defaultStyle: 'capsule',
    showProgress: true,
    showLabel: true,
  }
};

// 模拟 getSettings
vi.mock('../../settings', () => ({
  getSettings: () => mockSettings
}));

describe('Milestone inline 参数测试', () => {
  describe('registerRendererArgModel', () => {
    it('应该注册 milestone 宏模型', () => {
      // 注册
      registerRendererArgModel(':milestone', {
        positional: ['displayStyle'],
        named: ['inline']
      });
      
      // 验证：parseRendererArgs 应该能解析 inline 参数
      const tokens = ['displayStyle=capsule', 'inline=true'];
      const parsed = parseRendererArgs(':milestone', tokens);
      
      expect(parsed).toHaveProperty('displayStyle');
      expect(parsed).toHaveProperty('inline');
      expect(parsed.displayStyle).toBe('capsule');
      expect(parsed.inline).toBe('true');
    });
  });

  describe('inline 参数解析', () => {
    it('应该正确解析 inline=true', () => {
      registerRendererArgModel(':milestone', {
        positional: ['displayStyle'],
        named: ['inline']
      });
      
      const tokens = ['displayStyle=compact', 'inline=true'];
      const parsed = parseRendererArgs(':milestone', tokens);
      
      expect(parsed.inline).toBe('true');
    });

    it('应该正确解析 inline=false', () => {
      const tokens = ['displayStyle=badge', 'inline=false'];
      const parsed = parseRendererArgs(':milestone', tokens);
      
      expect(parsed.inline).toBe('false');
    });

    it('应该处理缺少 inline 参数的情况', () => {
      const tokens = ['displayStyle=track'];
      const parsed = parseRendererArgs(':milestone', tokens);
      
      expect(parsed).not.toHaveProperty('inline');
    });
  });
});
