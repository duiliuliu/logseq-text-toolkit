/**
 * MindMapView - 使用原生 DOM 操作，不依赖 React hooks
 * 在 Logseq 插件环境中，React hooks 可能不可用
 */

import { MindMapStateManager } from '../../../../lib/blockView/mindMap/state';
import { MindMapCanvasRenderer } from '../../../../lib/blockView/mindMap/CanvasRenderer';
import { MindMapBlockAPI } from '../../../../lib/blockView/mindMap/blockAPI';
import { createDebounceFn } from '../../../../lib/blockView/mindMap/debounce';
import type { MindMapThemeName } from '../../../../lib/blockView/mindMap/types';
import './mindMapView.css';

// 添加日志
const logger = {
  log: (...args: any[]) => console.log('[MindMapView]', ...args),
  error: (...args: any[]) => console.error('[MindMapView ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[MindMapView WARN]', ...args),
};

interface MindMapViewProps {
  rootUuid: string;
  content?: string;
  children?: any[];
}

/**
 * 创建 MindMap 视图的 DOM 结构
 */
export function createMindMapView(props: MindMapViewProps): HTMLElement {
  const { rootUuid, content, children } = props;
  
  logger.log('创建 MindMapView DOM', { rootUuid, content });
  
  // 创建主容器
  const container = document.createElement('div');
  container.className = 'ltt-mindmap-view';
  
  // 创建调试信息
  const debugInfo = document.createElement('div');
  debugInfo.className = 'ltt-mindmap-debug';
  debugInfo.style.cssText = 'font-size: 12px; color: #666; padding: 4px;';
  debugInfo.textContent = `Root: ${rootUuid} | Loading...`;
  container.appendChild(debugInfo);
  
  // 创建 Canvas 容器
  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'ltt-mindmap-canvas-container';
  container.appendChild(canvasContainer);
  
  // 创建 Canvas 元素
  const canvas = document.createElement('canvas');
  canvas.className = 'ltt-mindmap-canvas';
  canvasContainer.appendChild(canvas);
  
  // 创建编辑输入框（初始隐藏）
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'ltt-mindmap-edit-input';
  editInput.style.display = 'none';
  canvasContainer.appendChild(editInput);
  
  // 创建 StateManager
  const stateManager = new MindMapStateManager(rootUuid);
  let renderer: MindMapCanvasRenderer | null = null;
  let editingNode: string | null = null;
  
  // 防抖更新函数
  const debouncedUpdate = createDebounceFn(
    async (uuid: string, value: string) => {
      logger.log('防抖更新节点', { uuid, value });
      await MindMapBlockAPI.updateBlock(uuid, value);
      await stateManager.loadTree();
      updateRenderer();
    },
    500
  );
  
  // 更新渲染器
  function updateRenderer() {
    const nodes = stateManager.getState().nodes;
    logger.log('更新渲染器', { nodesCount: nodes.size });
    
    // 更新调试信息
    debugInfo.textContent = `Root: ${rootUuid} | Nodes: ${nodes.size}`;
    
    if (nodes.size === 0) {
      logger.warn('没有节点数据');
      return;
    }
    
    if (!renderer) {
      try {
        const themeName = 'pure' as MindMapThemeName;
        renderer = new MindMapCanvasRenderer(canvas, nodes, rootUuid, themeName);
        logger.log('渲染器创建成功');
      } catch (err) {
        logger.error('渲染器创建失败', err);
      }
    } else {
      renderer.updateNodes(nodes, rootUuid);
    }
  }
  
  // 处理 Canvas 鼠标移动
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    if (!renderer) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    renderer.handleMouseMove(x, y);
  });
  
  // 处理 Canvas 点击
  canvas.addEventListener('click', async (e: MouseEvent) => {
    if (!renderer) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { action, nodeUuid } = renderer.handleClick(x, y);
    
    logger.log('Canvas 点击', { action, nodeUuid });
    
    if (action === 'toggle-collapse' && nodeUuid) {
      // 切换折叠状态
      stateManager.setState(prev => {
        const nodes = new Map(prev.nodes);
        const node = nodes.get(nodeUuid);
        if (node) {
          nodes.set(nodeUuid, { ...node, collapsed: !node.collapsed });
        }
        return { ...prev, nodes };
      });
      updateRenderer();
    } else if (action === 'add-child' && nodeUuid) {
      // 添加子节点
      logger.log('添加子节点', { parentUuid: nodeUuid });
      const newUuid = await MindMapBlockAPI.addChild(nodeUuid, '');
      if (newUuid) {
        await stateManager.loadTree();
        updateRenderer();
        
        // 显示编辑框
        editingNode = newUuid;
        editInput.style.display = 'block';
        editInput.value = '';
        editInput.focus();
        editInput.style.position = 'absolute';
        editInput.style.left = '200px';
        editInput.style.top = '50px';
      }
    } else if (action === 'edit' && nodeUuid) {
      // 编辑节点
      const node = stateManager.getState().nodes.get(nodeUuid);
      if (node) {
        editingNode = nodeUuid;
        editInput.style.display = 'block';
        editInput.value = node.content;
        editInput.focus();
        editInput.style.position = 'absolute';
        editInput.style.left = '200px';
        editInput.style.top = '50px';
      }
    }
  });
  
  // 处理编辑输入
  editInput.addEventListener('input', () => {
    if (editingNode) {
      debouncedUpdate(editingNode, editInput.value);
    }
  });
  
  // 处理编辑框失焦
  editInput.addEventListener('blur', () => {
    if (editingNode && editInput.value) {
      MindMapBlockAPI.updateBlock(editingNode, editInput.value).then(() => {
        stateManager.loadTree().then(updateRenderer);
      });
    }
    editingNode = null;
    editInput.style.display = 'none';
  });
  
  // 加载数据
  logger.log('开始加载数据');
  stateManager.loadTree().then(() => {
    logger.log('数据加载完成');
    updateRenderer();
  }).catch((err) => {
    logger.error('数据加载失败', err);
    debugInfo.textContent = `Root: ${rootUuid} | Error loading data`;
  });
  
  return container;
}

// 导出 createElement 兼容函数（用于 React.createElement）
export function MindMapView(props: MindMapViewProps): HTMLElement {
  return createMindMapView(props);
}
