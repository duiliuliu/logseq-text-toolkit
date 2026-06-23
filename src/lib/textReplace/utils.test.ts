/**
 * textReplace 模块单元测试
 * 测试 src/lib/textReplace/utils.ts 中的纯函数（不依赖 logseq API）
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  // 格式检测与处理（纯函数）
  hasExistingFormat,
  parseNestedFormat,
  parseWrapperPattern,
  
  // 引号处理（纯函数）
  needsQuotes,
  wrapWithQuotesIfNeeded,
  handleNestedQuotes,
  
  // 辅助函数（纯函数）
  findAndReplaceText,
  convertNewlinesToHtml,
  processTextWithNewlines,
  
  // 类型判断
  isRegexReplaceParams,
} from './utils';

describe('textReplace/utils.ts (纯函数测试)', () => {
  describe('isRegexReplaceParams', () => {
    it('应该正确识别正则替换参数对象', () => {
      const params = { regex: 'test', replacement: 'replaced', flags: 'g' };
      expect(isRegexReplaceParams(params)).toBe(true);
    });

    it('应该拒绝字符串参数', () => {
      const params = '**${selectedText}**';
      expect(isRegexReplaceParams(params)).toBe(false);
    });

    it('应该拒绝 null', () => {
      expect(isRegexReplaceParams(null as any)).toBe(false);
    });

    it('应该拒绝 undefined', () => {
      expect(isRegexReplaceParams(undefined as any)).toBe(false);
    });
  });

  describe('hasExistingFormat', () => {
    it('应该识别hiccup格式', () => {
      expect(hasExistingFormat('[:b "text"]')).toBe(true);
      expect(hasExistingFormat('[:span.red "text"]')).toBe(true);
    });

    it('应该识别Markdown粗体', () => {
      expect(hasExistingFormat('**bold text**')).toBe(true);
      expect(hasExistingFormat('**text**')).toBe(true);
    });

    it('应该识别Markdown斜体', () => {
      expect(hasExistingFormat('*italic text*')).toBe(true);
      expect(hasExistingFormat('*text*')).toBe(true);
    });

    it('应该识别Markdown删除线', () => {
      expect(hasExistingFormat('~~strikethrough~~')).toBe(true);
    });

    it('应该识别Markdown高亮', () => {
      expect(hasExistingFormat('==highlight==')).toBe(true);
    });

    it('应该识别Markdown代码', () => {
      expect(hasExistingFormat('`code`')).toBe(true);
    });

    it('应该拒绝普通文本', () => {
      expect(hasExistingFormat('plain text')).toBe(false);
      expect(hasExistingFormat('中文文本')).toBe(false);
    });
  });

  describe('parseNestedFormat', () => {
    it('应该直接返回已经是hiccup格式的文本', () => {
      expect(parseNestedFormat('[:b "text"]')).toBe('[:b "text"]');
    });

    it('应该转换粗体标记（不带引号）', () => {
      expect(parseNestedFormat('**bold**')).toBe('[:b bold]');
    });

    it('应该转换斜体标记（不带引号）', () => {
      expect(parseNestedFormat('*italic*')).toBe('[:i italic]');
    });

    it('应该转换删除线标记（不带引号）', () => {
      expect(parseNestedFormat('~~deleted~~')).toBe('[:s deleted]');
    });

    it('应该转换高亮标记（不带引号）', () => {
      expect(parseNestedFormat('==highlight==')).toBe('[:mark highlight]');
    });

    it('应该转换代码标记（不带引号）', () => {
      expect(parseNestedFormat('`code`')).toBe('[:code code]');
    });

    it('应该处理相邻格式', () => {
      const result = parseNestedFormat('**bold** and *italic*');
      expect(result).toContain('[:b');
      expect(result).toContain('[:i');
    });
  });

  describe('parseWrapperPattern', () => {
    it('应该解析包裹模式', () => {
      const result = parseWrapperPattern('**${selectedText}**');
      expect(result).toEqual({ prefix: '**', suffix: '**' });
    });

    it('应该解析hiccup包裹模式', () => {
      const result = parseWrapperPattern('[:b "${selectedText}"]');
      expect(result).toEqual({ prefix: '[:b "', suffix: '"]' });
    });

    it('应该返回null当没有匹配时', () => {
      expect(parseWrapperPattern('no placeholder')).toBeNull();
    });

    it('应该处理复杂包裹模式', () => {
      const result = parseWrapperPattern('[:span.red "${selectedText}"]');
      expect(result).toEqual({ prefix: '[:span.red "', suffix: '"]' });
    });
  });

  describe('needsQuotes', () => {
    it('当前实现应该始终返回false（优化后）', () => {
      expect(needsQuotes('plain text')).toBe(false);
      expect(needsQuotes('中文文本')).toBe(false);
      expect(needsQuotes('text with "quotes"')).toBe(false);
    });

    it('应该处理各种空格变体', () => {
      expect(needsQuotes('text\u00A0with nbsp')).toBe(false);
      expect(needsQuotes('text\u3000with ideographic space')).toBe(false);
    });

    it('应该对包含/字符的文本返回true（修复斜杠解析问题）', () => {
      expect(needsQuotes('回滚/降级/不合理SQLkill')).toBe(true);
      expect(needsQuotes('text/with/slashes')).toBe(true);
      expect(needsQuotes('合理SQL 前置开发拦截 + 中间件拦截 + 回滚/降级/不合理SQLkill + 治理')).toBe(true);
    });

    it('应该对不包含/字符的普通文本返回false', () => {
      expect(needsQuotes('普通文本')).toBe(false);
      expect(needsQuotes('no slashes here')).toBe(false);
    });
  });

  describe('wrapWithQuotesIfNeeded', () => {
    it('应该直接包裹hiccup格式文本（不添加引号）', () => {
      const result = wrapWithQuotesIfNeeded('[:b "', '"]', '[:i "text"]');
      expect(result).toBe('[:b "[:i "text"]"]');
    });

    it('应该包裹包含hiccup片段的文本（不添加引号）', () => {
      const result = wrapWithQuotesIfNeeded('[:b "', '"]', 'some [:i text]');
      expect(result).toBe('[:b "some [:i text]"]');
    });

    it('应该正确处理普通文本（不添加引号）', () => {
      const result = wrapWithQuotesIfNeeded('**', '**', 'plain text');
      expect(result).toBe('**plain text**');
    });

    it('应该对包含/字符的文本添加引号包裹', () => {
      const result = wrapWithQuotesIfNeeded('[:span.blue "', '"]', '回滚/降级/不合理SQLkill');
      expect(result).toBe('[:span.blue "回滚/降级/不合理SQLkill"]');
    });

    it('应该对包含/字符的普通文本添加引号包裹', () => {
      const result = wrapWithQuotesIfNeeded('**', '**', 'text/with/slashes');
      expect(result).toBe('**"text/with/slashes"**');
    });

    it('应该处理包含/的复杂文本', () => {
      const result = wrapWithQuotesIfNeeded(
        '[:span.blue "',
        '"]',
        '不合理SQL 前置开发拦截 + 中间件拦截 + 回滚/降级/不合理SQLkill + 治理'
      );
      expect(result).toBe('[:span.blue "不合理SQL 前置开发拦截 + 中间件拦截 + 回滚/降级/不合理SQLkill + 治理"]');
    });
  });

  describe('handleNestedQuotes', () => {
    it('应该处理已经是嵌套格式的文本', () => {
      const result = handleNestedQuotes('[:b "', '"]', '[:i "text"]', '[:i "text"]');
      expect(result).toBe('[:b [:i "text"]]');
    });

    it('应该处理完全包裹的格式', () => {
      const result = handleNestedQuotes('[:b "', '"]', '**bold**', '[:b bold]');
      expect(result).toContain('[:b');
    });

    it('应该处理部分格式的文本', () => {
      const result = handleNestedQuotes('[:b "', '"]', 'partial **format', 'partial [:b format]');
      expect(result).toContain('[:b');
    });
  });

  describe('findAndReplaceText', () => {
    it('应该找到并替换文本', () => {
      const result = findAndReplaceText('hello world', 'world', 'there');
      expect(result).toBe('hello there');
    });

    it('应该处理找不到匹配的情况', () => {
      const result = findAndReplaceText('hello world', 'missing', 'replaced');
      expect(result).toBe('hello world');
    });

    it('应该替换第一个匹配', () => {
      const result = findAndReplaceText('test test test', 'test', 'replaced');
      expect(result).toBe('replaced test test');
    });
  });

  describe('convertNewlinesToHtml', () => {
    it('应该将换行转换为<br>标签', () => {
      expect(convertNewlinesToHtml('line1\nline2')).toBe('line1<br>line2');
    });

    it('应该处理多个换行', () => {
      expect(convertNewlinesToHtml('line1\nline2\nline3')).toBe('line1<br>line2<br>line3');
    });

    it('应该处理无换行的文本', () => {
      expect(convertNewlinesToHtml('no newlines')).toBe('no newlines');
    });
  });

  describe('processTextWithNewlines', () => {
    it('应该将换行文本转换为div包裹', () => {
      const result = processTextWithNewlines('line1\nline2');
      expect(result).toBe('[:div line1][:div line2]');
    });

    it('应该过滤空行', () => {
      const result = processTextWithNewlines('line1\n\nline2');
      expect(result).toBe('[:div line1][:div line2]');
    });

    it('应该处理单行文本', () => {
      const result = processTextWithNewlines('single line');
      expect(result).toBe('single line');
    });

    it('应该处理全是空行的文本', () => {
      const result = processTextWithNewlines('\n\n\n');
      expect(result).toBe('');
    });

    it('应该处理无换行的文本', () => {
      const result = processTextWithNewlines('no newline');
      expect(result).toBe('no newline');
    });
  });
});