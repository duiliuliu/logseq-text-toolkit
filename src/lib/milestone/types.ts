/**
 * Milestone 里程碑组件类型定义
 * 
 * 宏命令参数说明：
 * 
 * | 参数名              | 类型     | 必填  | 说明 & 业务作用                                                                 |
 * |-------------------|---------|------|-------------------------------------------------------------------------------|
 * | template          | string  | 否    | 预定义里程碑模板名（如 interview）。传入后，对于详细的参数，依赖从Settings中获取；如果同时传入模版和其他参数，则用宏命令中的其他参数对预设参数覆盖。 |
 * | filterTag         | string  | 否    | 筛选标签：按标签过滤数据源块，示例：面试。对应查询条件：[?b :block/tags ?t] [?t :block/title \"面试\"] |
 * | filterPropKey     | string  | 否    | 筛选属性键：联合属性值做精准过滤，示例：:user.property/company-dJukHEKU。对应查询条件：[?b ?filterPropKey ?val] |
 * | filterPropValue   | string  | 否    | 筛选属性值：配合 filterPropKey 使用，示例：Web3 Holdings Limited、安克。对应查询条件：[?val :block/title \"xxx\"] |
 * | milestonePropKey  | string  | 是    | 里程碑标识属性键（原 targetPropertyK）。该字段两个作用，一是从筛选后的块中读取该属性的值，作为里程碑节点名称，示例：:user.property/-y4PtK_O1；二是，在没有list信息时，根据该属性，获取所有value，作为list。同时存在优先取list。 |
 * | milestoneList     | string[]| 否    | 手动静态里程碑列表。传入后走列表模式，不再从块中动态解析节点，示例：[\"投递简历\",\"技术一面\"] |
 * | displayStyle      | string  | 否    | 展示样式，枚举：capsule/badge/track/card/compact，默认 capsule |
 * | showProgress      | boolean | 否    | 是否展示进度百分比，默认 true |
 * | showLabel         | boolean | 否    | 是否展示节点文字标签，默认 true |
 * | dateField         | string  | 否    | 进度 / 状态计算依赖的日期属性，默认 scheduled |
 * 
 * 工作模式说明：
 * 1. 模板模式：使用 template 参数，直接调用预定义模板
 * 2. 属性模式：使用 milestonePropKey + (filterTag \| filterPropKey/filterPropValue)，从块属性中读取节点
 * 3. 列表模式：使用 milestoneList 参数，按固定列表检查节点是否存在
 */

export interface MilestoneItem {
  id: string;
  label: string;
  status: MilestoneStatus;
  date?: string;
  progress?: number;
  color?: string;
  blockId?: string;
  blockUuid?: string;
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
  filterPropKey?: string;
  milestonePropKey?: string;
  milestoneList?: string[];
  filterTag?: string;
  displayStyle: MilestoneDisplayStyle;
  showProgress?: boolean;
  showLabel?: boolean;
  inline?: boolean;
  colorScheme?: ColorScheme;
  language?: string;
  dateField?: string;
  // 当前渲染的block UUID，用于获取属性值
  currentBlockUuid?: string;
}

export type MilestoneDisplayStyle = 
  | 'capsule'
  | 'badge'
  | 'track'
  | 'card'
  | 'compact'
  | 'arrow-capsule'
  | 'timeline-track';

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
  scheduled?: string;
  deadline?: string;
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
  filterTag?: string;
  filterPropKey?: string;
  milestonePropKey?: string;
  milestoneList?: string[];
  displayStyle?: MilestoneDisplayStyle;
  showProgress?: boolean;
  showLabel?: boolean;
  dateField?: string;
  colorScheme?: ColorScheme;
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
  badge: { zh: '数字徽章', en: 'Number Badge' },
  track: { zh: '极简轨道', en: 'Minimal Track' },
  card: { zh: '卡片浮层', en: 'Card Overlay' },
  compact: { zh: '状态徽章', en: 'Compact Badge' },
  'arrow-capsule': { zh: '箭头胶囊', en: 'Arrow Capsule' },
  'timeline-track': { zh: '时间线轨道', en: 'Timeline Track' },
};
