import { getSelection, getDocument } from '../utils.ts';

const Editor: any = {
  getCurrentBlock: () => {
    console.log('Get current block');
    return Promise.resolve({
      uuid: 'default-block',
      content: 'Default block content',
      properties: {}
    });
  },

  getEditingCursorPosition: () => {
    console.log('Get editing cursor position');
    return Promise.resolve({
      top: 0,
      left: 0,
      rect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    });
  },

  updateBlock: (blockId: string, content: string) => {
    console.log('Update block:', blockId, content);
    return Promise.resolve(true);
  }
};

export default Editor;
