/**
 * 编辑器服务工厂
 * 根据环境选择正确的编辑器服务实现
 */

// 导入Logseq编辑器服务
import logseqEditor from './logseq/editor.js';

// 导入Mock编辑器服务
import mockEditor from './mock/editor.js';

/**
 * 获取编辑器服务
 * @returns {Object} 编辑器服务实例
 */
export const getEditorService = () => {
  // 检查是否在Logseq环境中
  if (typeof logseq !== 'undefined' && logseq.Editor) {
    console.log('Using Logseq editor service');
    return logseqEditor;
  } else {
    console.log('Using Mock editor service');
    return mockEditor;
  }
};

export default getEditorService;
