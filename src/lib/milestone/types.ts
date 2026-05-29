/**
 * Milestone 里程碑组件类型定义
 * 
 * 宏命令参数说明：
 * 
 * | 参数名          | 类型     | 必填  | 说明                                                                 |
 * |----------------|---------|------|----------------------------------------------------------------------|
 * | template       | string  | 否    | 预定义模板名称，如 :interview，使用此参数会忽略其他配置参数                |
 * | tag            | string  | 否    | 用于筛选的标签名称                                                    |
 * | propertyK      | string  | 否    | 分组/筛选用的属性键名，如 :user.property/company-dJukHEKU                |
 * | propertyV      | string  | 否    | 分组/筛选用的属性值，如 \"Web3 Holdings Limited\"                       |
 * | targetPropertyK| string  | 是    | 里程碑节点识别属性键名，如 :user.property/-y4PtK_O1，其值就是节点名称       |
 * | list           | string[]| 否    | 手动指定的里程碑节点列表，如 [\"投递简历\", \"HR筛选\", \"技术一面\"]      |
 * | style          | string  | 否    | 显示样式：capsule \| badge \| track \| card \| compact，默认 capsule       |
 * | showProgress   | boolean | 否    | 是否显示进度百分比，默认 true                                          |
 * | showLabels     | boolean | 否    | 是否显示节点标签，默认 true                                            |
 * | dateField      | string  | 否    | 用于计算状态和进度的日期字段，默认 scheduled                            |
 * 
 * 工作模式说明：
 * 1. 模板模式：使用 template 参数，直接调用预定义模板
 * 2. 属性模式：使用 targetPropertyK + (tag \| propertyK/propertyV)，从块属性中读取节点
 * 3. 列表模式：使用 list 参数，按固定列表检查节点是否存在
 */

export interface MilestoneItem {
  id: string;
  label: string;
  status: MilestoneStatus;
  date?: string;
  progress?: number;
  color?: string;
}

export type MilestoneStatus = 
  | 'completed'
  | 'in_progress'
  | 'pending'
  | 'failed'
  | 'skipped';

export interface MilestoneData {
  items: MilestoneItem[];
  totalCount: number;
  completedCount: number;
  inProgressCount?: number;
  pendingCount?: number;
  skippedCount?: number;
  overallProgress: number;
}

export interface MilestoneConfig {
  template?: string;
  property?: string;
  propertyK?: string;
  propertyV?: string;
  targetPropertyK?: string;
  list?: string[];
  tag?: string;
  style: MilestoneDisplayStyle;
  showProgress?: boolean;
  showLabels?: boolean;
  colorScheme?: ColorScheme;
  language?: string;
  dateField?: string;
}

export type MilestoneDisplayStyle = 
  | 'capsule'
  | 'badge'
  | 'track'
  | 'card'
  | 'compact';

export interface ColorScheme {
  completed: string;
  inProgress: string;
  pending: string;
  failed: string;
  skipped: string;
  background: string;
  text: string;
}

export interface BlockWithProperty {
  id: string;
  uuid: string;
  content: string;
  properties: {
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyEnumValue {
  value: string;
  count: number;
  blocks: BlockWithProperty[];
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description?: string;
  tag?: string;
  propertyK?: string;
  propertyV?: string;
  targetPropertyK?: string;
  list?: string[];
  defaultStyle?: MilestoneDisplayStyle;
  showProgress?: boolean;
  showLabels?: boolean;
  dateField?: string;
}

export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  skipped: '#9ca3af',
  background: '#ffffff',
  text: '#374151',
};

export const STYLE_LABELS: Record<MilestoneDisplayStyle, { zh: string; en: string }> = {
  capsule: { zh: '胶囊进度条', en: 'Capsule Progress' },
  badge: { zh: '数字徽标', en: 'Number Badge' },
  track: { zh: '极简轨道', en: 'Minimal Track' },
  card: { zh: '卡片浮层', en: 'Card Overlay' },
  compact: { zh: '状态徽章', en: 'Compact Badge' },
};
