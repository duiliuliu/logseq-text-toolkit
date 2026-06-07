/**
 * MindMap Canvas 渲染器 - 参考 logseq-outline-canvas 的 right-tree 实现
 */

import { MindMapNode, MindMapColorScheme } from './types';
import { MIND_MAP_THEMES } from './themes';

// 布局常量
const NODE_HEIGHT = 40;
const NODE_PADDING = 16;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 16;
const LINE_WIDTH = 2;
const CORNER_RADIUS = 6;
const BUTTON_SIZE = 24;
const BUTTON_PADDING = 8;

// 日志
const logger = {
  log: (...args: any[]) => console.log('[CanvasRenderer]', ...args),
  error: (...args: any[]) => console.error('[CanvasRenderer ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[CanvasRenderer WARN]', ...args),
};

export interface CanvasNode {
  uuid: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  children: CanvasNode[];
  collapsed: boolean;
  parentUuid: string | null;
}

export class MindMapCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nodes: Map<string, MindMapNode>;
  private rootUuid: string;
  private colorScheme: MindMapColorScheme;
  private hoveredNode: CanvasNode | null = null;
  private canvasNodes: CanvasNode[] = [];
  private dpr = window.devicePixelRatio || 1;

  constructor(
    canvas: HTMLCanvasElement,
    nodes: Map<string, MindMapNode>,
    rootUuid: string,
    themeName: string = 'pure'
  ) {
    logger.log('初始化 CanvasRenderer', { 
      canvas: !!canvas, 
      nodesCount: nodes.size, 
      rootUuid,
      themeName 
    });
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.nodes = nodes;
    this.rootUuid = rootUuid;
    this.colorScheme = MIND_MAP_THEMES[themeName as keyof typeof MIND_MAP_THEMES]?.scheme || MIND_MAP_THEMES.pure.scheme;
    
    this.setupCanvas();
    this.calculateLayout();
    this.render();
    
    logger.log('CanvasRenderer 初始化完成', { 
      canvasNodesCount: this.canvasNodes.length 
    });
  }

  private setupCanvas(): void {
    const container = this.canvas.parentElement;
    const width = container?.clientWidth || 800;
    const height = Math.max(400, this.canvasNodes.length * (NODE_HEIGHT + VERTICAL_SPACING) + 100);
    
    logger.log('设置 Canvas 尺寸', { width, height, containerWidth: container?.clientWidth });
    
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.ctx.scale(this.dpr, this.dpr);
  }

  private measureTextWidth(text: string, fontSize: number = 14): number {
    this.ctx.font = `${this.colorScheme.fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
    return this.ctx.measureText(text).width;
  }

  private calculateLayout(): void {
    this.canvasNodes = [];
    
    const root = this.nodes.get(this.rootUuid);
    if (!root) {
      logger.warn('未找到根节点', this.rootUuid, '可用节点:', Array.from(this.nodes.keys()));
      return;
    }

    logger.log('开始计算布局', { rootUuid: this.rootUuid, rootContent: root.content });

    let currentY = 50;
    const levels: number[] = [0]; // 每个层级的起始 x 坐标
    
    const buildCanvasNode = (node: MindMapNode, level: number): CanvasNode => {
      // 计算节点宽度
      const textWidth = this.measureTextWidth(node.content);
      const width = NODE_PADDING * 2 + textWidth;
      const height = NODE_HEIGHT;
      
      // 计算 x 位置
      let x: number;
      if (level === 0) {
        x = 30;
      } else {
        // 确保 levels 数组有足够的元素
        while (levels.length <= level) {
          levels.push(0);
        }
        
        // 计算子节点起始 x
        if (level === 1) {
          const parent = this.nodes.get(node.parentUuid!);
          if (parent) {
            const parentTextWidth = this.measureTextWidth(parent.content);
            const parentWidth = NODE_PADDING * 2 + parentTextWidth;
            x = 30 + parentWidth + HORIZONTAL_SPACING;
          } else {
            x = 300;
          }
        } else {
          // 更深层级向右偏移
          x = levels[level - 1] + HORIZONTAL_SPACING;
        }
        
        levels[level] = Math.max(levels[level], x + width);
      }
      
      const canvasNode: CanvasNode = {
        uuid: node.uuid,
        content: node.content,
        x,
        y: currentY,
        width,
        height,
        level,
        children: [],
        collapsed: node.collapsed,
        parentUuid: node.parentUuid
      };
      
      this.canvasNodes.push(canvasNode);
      
      // 处理子节点
      if (!node.collapsed && node.children.length > 0) {
        for (const childUuid of node.children) {
          const child = this.nodes.get(childUuid);
          if (child) {
            currentY += NODE_HEIGHT + VERTICAL_SPACING;
            const childCanvasNode = buildCanvasNode(child, level + 1);
            canvasNode.children.push(childCanvasNode);
          }
        }
      }
      
      return canvasNode;
    };
    
    buildCanvasNode(root, 0);
    
    logger.log('布局计算完成', { 
      canvasNodesCount: this.canvasNodes.length,
      levels: levels 
    });
  }

  private drawLine(fromX: number, fromY: number, toX: number, toY: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = this.colorScheme.lineColor;
    this.ctx.lineWidth = LINE_WIDTH;
    this.ctx.lineCap = 'round';
    
    // 绘制垂直连线
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY + NODE_HEIGHT / 2);
    this.ctx.lineTo(fromX + (toX - fromX) / 2, fromY + NODE_HEIGHT / 2);
    this.ctx.lineTo(fromX + (toX - fromX) / 2, toY + NODE_HEIGHT / 2);
    this.ctx.lineTo(toX, toY + NODE_HEIGHT / 2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private drawNode(node: CanvasNode, isRoot: boolean = false): void {
    const isHovered = this.hoveredNode?.uuid === node.uuid;
    
    // 绘制节点背景
    this.ctx.save();
    this.ctx.fillStyle = isHovered 
      ? this.colorScheme.nodeHoverBackgroundColor 
      : this.colorScheme.nodeBackgroundColor;
    this.ctx.strokeStyle = this.colorScheme.nodeBorderColor;
    this.ctx.lineWidth = parseFloat(this.colorScheme.nodeBorderWidth) || 1;
    this.ctx.beginPath();
    this.ctx.roundRect(
      node.x, 
      node.y, 
      node.width, 
      node.height, 
      parseFloat(this.colorScheme.nodeBorderRadius) || CORNER_RADIUS
    );
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    
    // 绘制文字
    this.ctx.save();
    this.ctx.fillStyle = isHovered 
      ? this.colorScheme.textHoverColor 
      : this.colorScheme.textColor;
    this.ctx.font = `${this.colorScheme.fontWeight} ${this.colorScheme.fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      node.content, 
      node.x + NODE_PADDING, 
      node.y + NODE_HEIGHT / 2
    );
    this.ctx.restore();
    
    // 绘制展开/折叠按钮（有子节点时）
    if (node.children.length > 0 || this.nodes.get(node.uuid)?.children.length > 0) {
      this.drawCollapseButton(node);
    }
    
    // 绘制添加子节点按钮
    this.drawAddButton(node);
    
    // 绘制连线到子节点
    for (const child of node.children) {
      this.drawLine(
        node.x + node.width, 
        node.y, 
        child.x, 
        child.y
      );
    }
  }

  private drawCollapseButton(node: CanvasNode): void {
    const isHovered = this.hoveredNode?.uuid === node.uuid;
    const isCollapsed = node.collapsed;
    
    const buttonX = node.x - BUTTON_PADDING - BUTTON_SIZE;
    const buttonY = node.y + (NODE_HEIGHT - BUTTON_SIZE) / 2;
    
    // 只有 hover 时显示按钮
    if (!isHovered) return;
    
    this.ctx.save();
    this.ctx.fillStyle = this.colorScheme.buttonColor;
    this.ctx.beginPath();
    this.ctx.roundRect(buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE, 6);
    this.ctx.fill();
    
    // 绘制 +/- 符号
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      isCollapsed ? '+' : '-',
      buttonX + BUTTON_SIZE / 2,
      buttonY + BUTTON_SIZE / 2
    );
    this.ctx.restore();
  }

  private drawAddButton(node: CanvasNode): void {
    const isHovered = this.hoveredNode?.uuid === node.uuid;
    
    const buttonX = node.x + node.width + BUTTON_PADDING;
    const buttonY = node.y + (NODE_HEIGHT - BUTTON_SIZE) / 2;
    
    // 只有 hover 时显示按钮
    if (!isHovered) return;
    
    this.ctx.save();
    this.ctx.fillStyle = this.colorScheme.buttonColor;
    this.ctx.beginPath();
    this.ctx.roundRect(buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE, 6);
    this.ctx.fill();
    
    // 绘制 + 符号
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '+',
      buttonX + BUTTON_SIZE / 2,
      buttonY + BUTTON_SIZE / 2
    );
    this.ctx.restore();
  }

  public render(): void {
    logger.log('开始渲染 Canvas', { canvasNodesCount: this.canvasNodes.length });
    
    // 清空画布
    const container = this.canvas.parentElement;
    const width = container?.clientWidth || 800;
    const height = this.canvas.height / this.dpr;
    
    this.ctx.clearRect(0, 0, width, height);
    
    // 重新计算布局并绘制
    this.calculateLayout();
    
    // 绘制连线（先绘制）
    for (const node of this.canvasNodes) {
      for (const child of node.children) {
        this.drawLine(
          node.x + node.width, 
          node.y, 
          child.x, 
          child.y
        );
      }
    }
    
    // 绘制节点
    for (const node of this.canvasNodes) {
      this.drawNode(node, node.level === 0);
    }
    
    logger.log('Canvas 渲染完成');
  }

  public updateNodes(nodes: Map<string, MindMapNode>, rootUuid: string): void {
    logger.log('更新节点', { nodesCount: nodes.size, rootUuid });
    this.nodes = nodes;
    this.rootUuid = rootUuid;
    this.setupCanvas();
    this.render();
  }

  public handleMouseMove(x: number, y: number): void {
    const oldHovered = this.hoveredNode;
    let newHovered: CanvasNode | null = null;
    
    // 查找鼠标位置的节点
    for (const node of this.canvasNodes) {
      if (
        x >= node.x && 
        x <= node.x + node.width &&
        y >= node.y && 
        y <= node.y + node.height
      ) {
        newHovered = node;
        break;
      }
    }
    
    if (newHovered?.uuid !== oldHovered?.uuid) {
      this.hoveredNode = newHovered;
      this.render();
    }
  }

  public handleClick(x: number, y: number): { action: 'toggle-collapse' | 'add-child' | 'edit' | null, nodeUuid: string | null } {
    for (const node of this.canvasNodes) {
      // 检查折叠按钮
      const collapseBtnX = node.x - BUTTON_PADDING - BUTTON_SIZE;
      const collapseBtnY = node.y + (NODE_HEIGHT - BUTTON_SIZE) / 2;
      if (
        x >= collapseBtnX && 
        x <= collapseBtnX + BUTTON_SIZE &&
        y >= collapseBtnY && 
        y <= collapseBtnY + BUTTON_SIZE
      ) {
        return { action: 'toggle-collapse', nodeUuid: node.uuid };
      }
      
      // 检查添加按钮
      const addBtnX = node.x + node.width + BUTTON_PADDING;
      const addBtnY = node.y + (NODE_HEIGHT - BUTTON_SIZE) / 2;
      if (
        x >= addBtnX && 
        x <= addBtnX + BUTTON_SIZE &&
        y >= addBtnY && 
        y <= addBtnY + BUTTON_SIZE
      ) {
        return { action: 'add-child', nodeUuid: node.uuid };
      }
      
      // 检查节点本身
      if (
        x >= node.x && 
        x <= node.x + node.width &&
        y >= node.y && 
        y <= node.y + node.height
      ) {
        return { action: 'edit', nodeUuid: node.uuid };
      }
    }
    
    return { action: null, nodeUuid: null };
  }
}
