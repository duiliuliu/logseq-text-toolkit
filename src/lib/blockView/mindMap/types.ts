/**
 * MindMap 模块类型定义
 */

/**
 * MindMap 节点数据结构
 */
export interface MindMapNode {
  uuid: string;
  content: string;
  children: string[]; // 子节点 UUID 列表
  collapsed: boolean;
  level: number;
  parentUuid: string | null;
}

/**
 * MindMap 视图状态
 */
export interface MindMapState {
  rootBlockUuid: string;
  nodes: Map<string, MindMapNode>;
  collapsedNodes: Set<string>;
  editingNode: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * MindMap 配色方案
 */
export interface MindMapColorScheme {
  // 节点样式
  nodeBorderColor: string;
  nodeBorderWidth: string;
  nodeBorderRadius: string;
  nodeBackgroundColor: string;
  nodeHoverBackgroundColor: string;
  
  // 文字样式
  textColor: string;
  textHoverColor: string;
  fontSize: string;
  fontWeight: string;
  
  // 连接线样式
  lineColor: string;
  lineWidth: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  
  // 整体背景
  backgroundColor: string;
  
  // 按钮样式
  buttonColor: string;
  buttonHoverColor: string;
}

/**
 * MindMap 预设主题名称
 */
export type MindMapThemeName = 'pure' | 'outline' | 'plain' | 'ink' | 'parchment' | 'mist' | 'focus' | 'deep' | 'night';

/**
 * MindMap 预设主题配置
 */
export interface MindMapTheme {
  name: MindMapThemeName;
  label: string;
  labelEn: string;
  scheme: MindMapColorScheme;
}

/**
 * MindMap 配置
 */
export interface MindMapConfig {
  debounceDelay: number; // 默认 500ms
  nodeSpacing: number;
  theme: MindMapThemeName;
  customColors: Partial<MindMapColorScheme>;
}
