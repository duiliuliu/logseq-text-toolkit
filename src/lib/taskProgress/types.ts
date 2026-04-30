export interface TaskProgress {
  blockId: string;
  parentBlockId: string | null;
  totalTasks: number;
  completedTasks: number;
  statusStats: StatusStat[];
  progress: number;
}

export interface StatusStat {
  status: string;
  count: number;
  color?: string;
}

export interface TaskBlock {
  id: string;
  content: string;
  status?: string;
  isTask: boolean;
  taskTrackingEnabled: boolean;
  properties?: Record<string, unknown>;
}

export type ProgressDisplayType = 
  | 'mini-circle'
  | 'dot-matrix'
  | 'status-cursor'
  | 'progress-capsule'
  | 'step-progress';

export interface ProgressDisplayConfig {
  type: ProgressDisplayType;
  showLabel: boolean;
  labelFormat: 'fraction' | 'percentage' | 'both';
  size: 'small' | 'medium' | 'large';
  colors?: {
    todo: string;
    doing: string;
    done: string;
    [key: string]: string;
  };
}

export const STATUS_COLORS: Record<string, string> = {
  todo: '#f59e0b',
  doing: '#3b82f6',
  done: '#10b981',
  waiting: '#8b5cf6',
  canceled: '#6b7280',
};

export const DEFAULT_DISPLAY_CONFIG: ProgressDisplayConfig = {
  type: 'mini-circle',
  showLabel: true,
  labelFormat: 'fraction',
  size: 'small',
};
