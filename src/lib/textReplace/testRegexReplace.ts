import { testRegexReplace } from './testRegexReplaceSimple.ts';
import logger from '../logger/index';

const result = testRegexReplace();

logger.info(`\nFinal Test Result: ${result ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

// 导出测试函数
if (import.meta.vitest) {
  describe('regexReplaceText', () => {
    it('should remove all formatting from text', () => {
      expect(testRegexReplace()).toBe(true);
    });
  });
}
