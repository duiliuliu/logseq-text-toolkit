import { testRegexReplace } from './testRegexReplaceSimple.ts';

// 运行测试
const result = testRegexReplace();

// 输出测试结果
console.log(`\nFinal Test Result: ${result ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

// 导出测试函数
if (import.meta.vitest) {
  describe('regexReplaceText', () => {
    it('should remove all formatting from text', () => {
      expect(testRegexReplace()).toBe(true);
    });
  });
}
