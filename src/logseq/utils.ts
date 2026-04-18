/**
 * Logseq 工具函数
 * 提供跨环境（iframe/非iframe）的工具函数
 */

/**
 * 获取正确的document对象
 * 在Logseq中，插件是按照iframe加载的，使用当前document（Logseq会处理iframe通信）
 * 在测试环境中，使用当前document
 * @returns {Document} 正确的document对象
 */
export const getDocument = (): Document => {
  // 直接使用当前document，Logseq会处理iframe通信
  return document;
};

/**
 * 获取正确的window对象
 * 在Logseq中，插件是按照iframe加载的，使用当前window（Logseq会处理iframe通信）
 * 在测试环境中，使用当前window
 * @returns {Window} 正确的window对象
 */
export const getWindow = (): Window => {
  // 直接使用当前window，Logseq会处理iframe通信
  return window;
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
