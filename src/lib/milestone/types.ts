/**
 * Milestone 里程碑组件类型定义
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
  property?: string;
  propertyK?: string;
  propertyV?: string;
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
