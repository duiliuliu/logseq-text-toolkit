/**
 * 编辑器服务工厂
 * 根据环境选择正确的编辑器服务实现
 */

// 导入统一的Logseq API接口
import { logseqAPI } from '../logseq/index.js';

/**
 * 获取编辑器服务
 * @returns {Object} 编辑器服务实例
 */
export const getEditorService = () => {
  return {
    getCurrentBlock: logseqAPI.Editor.getCurrentBlock,
    updateBlock: logseqAPI.Editor.updateBlock,
    replaceSelectedText: logseqAPI.Editor.replaceSelectedText
  };
};

export default getEditorService;
