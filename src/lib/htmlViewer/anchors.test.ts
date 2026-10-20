import { describe, expect, it } from 'vitest';
import { anchorToRange, bodyText, rangeToAnchor } from './anchors';

function docWith(html: string): Document {
  const doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = html;
  return doc;
}

function rangeForText(doc: Document, text: string): Range {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    const content = node.textContent || '';
    const index = content.indexOf(text);
    if (index >= 0) {
      const range = doc.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + text.length);
      return range;
    }
    node = walker.nextNode();
  }
  throw new Error('text not found');
}

describe('HTML text anchors', () => {
  it('应该生成 quote/offset/prefix/suffix', () => {
    const doc = docWith('<p>hello world</p><p>next line</p>');
    const anchor = rangeToAnchor(doc, rangeForText(doc, 'world'));
    expect(anchor).not.toBeNull();
    expect(anchor?.quote).toBe('world');
    expect(anchor?.start).toBe(6);
    expect(anchor?.end).toBe(11);
    expect(anchor?.prefix).toBe('hello ');
    expect(anchor?.suffix).toBe('next line');
  });

  it('应该优先用精确 offset 还原', () => {
    const doc = docWith('<p>hello world</p>');
    const anchor = rangeToAnchor(doc, rangeForText(doc, 'world'))!;
    const range = anchorToRange(doc, anchor);
    expect(range?.toString()).toBe('world');
  });

  it('文本漂移时应该用引文回退', () => {
    const doc = docWith('<p>new intro hello world tail</p>');
    const range = anchorToRange(doc, {
      quote: 'world',
      start: 6,
      end: 11,
      prefix: 'hello ',
      suffix: ' tail',
    });
    expect(range?.toString()).toBe('world');
  });

  it('找不到引文时应该返回 null', () => {
    const doc = docWith('<p>other</p>');
    expect(anchorToRange(doc, {
      quote: 'missing', start: 0, end: 7, prefix: '', suffix: '',
    })).toBeNull();
  });

  it('bodyText 应该拼接文本节点', () => {
    expect(bodyText(docWith('<p>a</p><p>b</p>'))).toBe('ab');
  });
});
