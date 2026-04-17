/**
 * Logseq 工具函数
 * 提供跨环境（iframe/非iframe）的工具函数
 */

/**
 * 获取正确的document对象
 * 在Logseq中，插件是按照iframe加载的，需要使用parent.document
 * 在测试环境中，使用当前document
 * @returns {Document} 正确的document对象
 */
export const getDocument = (): Document => {
  // 检测是否在测试模式
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (!isTestMode && typeof window !== 'undefined' && window.parent !== window) {
    // 在iframe中且非测试模式，使用parent.document
    return window.parent.document;
  } else {
    // 测试模式或不在iframe中，使用当前document
    return document;
  }
};

/**
 * 获取正确的window对象
 * 在Logseq中，插件是按照iframe加载的，需要使用parent.window
 * 在测试环境中，使用当前window
 * @returns {Window} 正确的window对象
 */
export const getWindow = (): Window => {
  // 检测是否在测试模式
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (!isTestMode && typeof window !== 'undefined' && window.parent !== window) {
    // 在iframe中且非测试模式，使用parent.window
    return window.parent;
  } else {
    // 测试模式或不在iframe中，使用当前window
    return window;
  }
};

/**
 * 获取选择对象
 * 在不同环境中获取正确的Selection对象
 * @returns {Selection | null} 选择对象
 */
export const getSelection = (): Selection | null => {
  const doc = getDocument();
  if (doc) {
    return doc.getSelection();
  }
  return null;
};
