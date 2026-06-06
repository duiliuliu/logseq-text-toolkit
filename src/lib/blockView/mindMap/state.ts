/**
 * MindMap 状态管理
 */

import { logseqAPI } from '../../../logseq';
import type { MindMapNode, MindMapState } from './types';
import logger from '../../logger';

export class MindMapStateManager {
  private state: MindMapState;
  private listeners: Set<(state: MindMapState) => void>;

  constructor(rootUuid: string) {
    this.state = {
      rootBlockUuid: rootUuid,
      nodes: new Map(),
      collapsedNodes: new Set(),
      editingNode: null,
      isLoading: false,
      error: null,
    };
    this.listeners = new Set();
  }

  subscribe(listener: (state: MindMapState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  setState(updater: Partial<MindMapState> | ((state: MindMapState) => Partial<MindMapState>)): void {
    const updates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  getState(): MindMapState {
    return this.state;
  }

  /**
   * 从 Logseq 加载节点树
   */
  async loadTree(): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const nodes = new Map<string, MindMapNode>();
      await this.loadNodeRecursive(this.state.rootBlockUuid, nodes, 0);
      
      this.setState({
        nodes,
        isLoading: false,
      });
    } catch (error) {
      logger.error('[MindMap] Failed to load tree:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async loadNodeRecursive(
    uuid: string,
    nodes: Map<string, MindMapNode>,
    level: number
  ): Promise<void> {
    const block = await logseqAPI.Editor.getBlock(uuid, {
      includeChildren: true,
    });

    if (!block) {
      logger.warn('[MindMap] Block not found:', uuid);
      return;
    }

    const node: MindMapNode = {
      uuid: block.uuid,
      content: block.content || block.title || '',
      children: [],
      collapsed: block['collapsed?'] || false,
      level,
      parentUuid: level === 0 ? null : block.parent?.uuid || null,
    };

    // 递归加载子节点
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        const childUuid = typeof child === 'string' ? child : child.uuid;
        if (childUuid) {
          node.children.push(childUuid);
          await this.loadNodeRecursive(childUuid, nodes, level + 1);
        }
      }
    }

    nodes.set(uuid, node);
  }
}
