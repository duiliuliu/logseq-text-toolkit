/**
 * Vitest 配置文件
 * 用于 Logseq Text Toolkit 项目的单元测试
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境 - 支持 node 和 jsdom
    environment: 'jsdom',
    
    // 测试设置文件
    setupFiles: ['./src/test/setup.ts'],
    
    // 测试文件匹配模式
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
    ],
    
    // 排除的文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.js', // 排除普通 JS 文件，只测试 TypeScript
    ],
    
    // 全局测试超时时间
    testTimeout: 10000,
    
    // 断言超时时间
    hookTimeout: 5000,
    
    // 清理模拟
    clearMocks: true,
    restoreMocks: true,
    
    // 覆盖率配置（可选，需要 @vitest/coverage-v8）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/index.ts', // 排除入口文件
      ],
    },
    
    // reporters 配置
    reporters: ['default', 'verbose'],
    
    // 输出配置
    outputFile: {
      json: './test-results/test-results.json',
    },
    
    // 全局 CSS 文件
    css: {
      modules: {
        classNameStrategy: 'same',
      },
    },
  },
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
