import { describe, expect, it } from 'vitest';
import { parseQuerySource, propertyValue, statusOf, valueToText } from './query';

describe('BlockView query helpers', () => {
  it('parses tag and page sources', () => {
    expect(parseQuerySource(['tag=tt-e2e', 'view=table'])).toEqual({ type: 'tag', value: 'tt-e2e' });
    expect(parseQuerySource(['page=TT Full Test'])).toEqual({ type: 'page', value: 'TT Full Test' });
    expect(parseQuerySource(['view=table'])).toBeNull();
  });

  it('normalizes property values', () => {
    expect(valueToText({ title: 'Done' })).toBe('Done');
    expect(valueToText([{ title: 'a' }, 'b'])).toBe('a, b');
    expect(propertyValue({ properties: { 'logseq.property/status': { title: 'Doing' } } } as any, 'logseq.property/status')).toBe('Doing');
    expect(statusOf({ properties: {} } as any)).toBe('Unset');
  });
});
