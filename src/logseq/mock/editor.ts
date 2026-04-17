// Mock Logseq Editor API
const Editor = {
  // 获取当前页面
  getCurrentPage: () => {
    console.log('Get current page');
    return Promise.resolve({
      uuid: 'test-page',
      id: 'test-page',
      name: 'Test Page',
      properties: {}
    });
  },
  
  // 获取当前块
  getCurrentBlock: () => {
    console.log('Get current block');
    return Promise.resolve({
      uuid: 'test-block',
      content: 'Test block content',
      properties: {}
    });
  },
  
  // 更新块内容
  updateBlock: (blockId: string, content: string) => {
    console.log('Update block:', blockId, content);
    return Promise.resolve(true);
  },
  
  // 替换选中的文本
  replaceSelectedText: (text: string) => {
    console.log('Replace selected text:', text);
    // 尝试在测试环境中替换选中的文本
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return Promise.resolve(true);
  },
  
  // 插入块
  insertBlock: (content: string, options?: {
    before?: string;
    after?: string;
    sibling?: boolean;
  }) => {
    console.log('Insert block:', content, options);
    return Promise.resolve({
      uuid: `block-${Date.now()}`,
      content,
      properties: {}
    });
  },
  
  // 获取块内容
  getBlock: (blockId: string) => {
    console.log('Get block:', blockId);
    return Promise.resolve({
      uuid: blockId,
      content: 'Block content',
      properties: {}
    });
  },
  
  // 删除块
  removeBlock: (blockId: string) => {
    console.log('Remove block:', blockId);
    return Promise.resolve(true);
  }
};

export default Editor;
