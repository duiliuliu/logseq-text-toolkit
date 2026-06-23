/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * SelectionManager 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SelectionEventAdapter, calculateToolbarPosition, type SelectionInfo, type AdaptedSelection } from './SelectionManager';

describe('SelectionEventAdapter', () => {
  describe('fromSDKEvent', () => {
    it('should convert SDK event to AdaptedSelection', () => {
      const sdkEvent: SelectionInfo = {
        text: 'Hello World',
        start: 0,
        end: 11,
        caret: {
          left: 100,
          top: 50,
          height: 20,
          pos: 0,
          rect: new DOMRect(100, 50, 80, 20)
        },
        point: {
          x: 150,
          y: 60
        }
      };

      const result = SelectionEventAdapter.fromSDKEvent(sdkEvent);

      expect(result.text).toBe('Hello World');
      expect(result.start).toBe(0);
      expect(result.end).toBe(11);
      expect(result.caret.left).toBe(100);
      expect(result.caret.top).toBe(50);
      expect(result.point.x).toBe(150);
      expect(result.point.y).toBe(60);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle missing caret information', () => {
      const sdkEvent: SelectionInfo = {
        text: 'Test',
        start: 0,
        end: 4
      };

      const result = SelectionEventAdapter.fromSDKEvent(sdkEvent);

      expect(result.text).toBe('Test');
      expect(result.rect).toBeDefined();
      expect(result.caret.left).toBe(0);
      expect(result.caret.top).toBe(0);
      expect(result.caret.height).toBe(20);
    });

    it('should handle missing point information', () => {
      const sdkEvent: SelectionInfo = {
        text: 'Test',
        start: 0,
        end: 4,
        caret: {
          left: 50,
          top: 30,
          height: 18,
          pos: 0,
          rect: new DOMRect(50, 30, 60, 18)
        }
      };

      const result = SelectionEventAdapter.fromSDKEvent(sdkEvent);

      expect(result.point.x).toBe(0);
      expect(result.point.y).toBe(0);
    });
  });

  describe('enrichWithContext', () => {
    it('should enrich selection with block context', () => {
      const selection: AdaptedSelection = {
        text: 'Hello',
        start: 0,
        end: 5,
        rect: new DOMRect(0, 0, 50, 20),
        caret: { left: 0, top: 0, height: 20 },
        point: { x: 0, y: 0 },
        before: '',
        after: '',
        timestamp: new Date().toISOString()
      };

      const block = {
        uuid: 'test-block-uuid',
        content: 'Hello World!',
        properties: {}
      };

      const result = SelectionEventAdapter.enrichWithContext(selection, block);

      expect(result.start).toBe(0);
      expect(result.end).toBe(5);
      expect(result.before).toBe('');
      expect(result.after).toBe(' World!');
      expect(result.block).toBe(block);
    });

    it('should handle text not found in block content', () => {
      const selection: AdaptedSelection = {
        text: 'NotFound',
        start: 0,
        end: 8,
        rect: new DOMRect(0, 0, 80, 20),
        caret: { left: 0, top: 0, height: 20 },
        point: { x: 0, y: 0 },
        before: '',
        after: '',
        timestamp: new Date().toISOString()
      };

      const block = {
        uuid: 'test-block-uuid',
        content: 'Hello World!',
        properties: {}
      };

      const result = SelectionEventAdapter.enrichWithContext(selection, block);

      expect(result.start).toBe(0);
      expect(result.end).toBe(8);
      expect(result.before).toBe('');
      expect(result.after).toBe('');
      expect(result.block).toBe(block);
    });

    it('should handle empty block content', () => {
      const selection: AdaptedSelection = {
        text: 'Test',
        start: 0,
        end: 4,
        rect: new DOMRect(0, 0, 40, 20),
        caret: { left: 0, top: 0, height: 20 },
        point: { x: 0, y: 0 },
        before: '',
        after: '',
        timestamp: new Date().toISOString()
      };

      const block = {
        uuid: 'test-block-uuid',
        content: '',
        properties: {}
      };

      const result = SelectionEventAdapter.enrichWithContext(selection, block);

      expect(result.text).toBe('Test');
      expect(result.block).toBe(block);
    });
  });
});

describe('calculateToolbarPosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
  });

  it('should position toolbar above selection when space is available', () => {
    const selection: AdaptedSelection = {
      text: 'Test',
      start: 0,
      end: 4,
      rect: new DOMRect(100, 400, 80, 20),
      caret: { left: 100, top: 400, height: 20 },
      point: { x: 140, y: 410 },
      before: '',
      after: '',
      timestamp: new Date().toISOString()
    };

    const position = calculateToolbarPosition(selection, 200, 32, 3);

    expect(position.y).toBe(365);
  });

  it('should position toolbar below selection when space above is insufficient', () => {
    const selection: AdaptedSelection = {
      text: 'Test',
      start: 0,
      end: 4,
      rect: new DOMRect(100, 50, 80, 20),
      caret: { left: 100, top: 50, height: 20 },
      point: { x: 140, y: 60 },
      before: '',
      after: '',
      timestamp: new Date().toISOString()
    };

    const position = calculateToolbarPosition(selection, 200, 32, 3);

    expect(position.y).toBe(15);
  });

  it('should center toolbar horizontally', () => {
    const selection: AdaptedSelection = {
      text: 'Test',
      start: 0,
      end: 4,
      rect: new DOMRect(500, 400, 100, 20),
      caret: { left: 500, top: 400, height: 20 },
      point: { x: 550, y: 410 },
      before: '',
      after: '',
      timestamp: new Date().toISOString()
    };

    const position = calculateToolbarPosition(selection, 200, 32, 3);

    expect(position.x).toBe(550);
  });

  it('should clamp position to viewport boundaries', () => {
    const selection: AdaptedSelection = {
      text: 'Test',
      start: 0,
      end: 4,
      rect: new DOMRect(10, 400, 80, 20),
      caret: { left: 10, top: 400, height: 20 },
      point: { x: 50, y: 410 },
      before: '',
      after: '',
      timestamp: new Date().toISOString()
    };

    const position = calculateToolbarPosition(selection, 200, 32, 3);

    expect(position.x).toBe(100);
  });
});
