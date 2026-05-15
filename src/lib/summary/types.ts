export type SummaryType = 'weekly' | 'monthly' | 'yearly' | 'custom';

export type TemplateType = 
  | 'gtd-work-review'
  | 'minimal-dashboard'
  | 'bullet-journal'
  | 'okr-review'
  | 'study-summary';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BlockNode {
  content: string;
  children?: BlockNode[];
}

export interface BlockStats {
  total: number;
  created: number;
  modified: number;
  avgContentLength: number;
  tags: Record<string, number>;
  pages?: Record<string, number>;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  completionRate: number;
  byPriority: Record<string, number>;
}

export interface PageStats {
  total: number;
  newPages: number;
  modifiedPages: number;
  byTag: Record<string, number>;
  byProperty: Record<string, Record<string, number>>;
}

export interface SummaryData {
  dateRange: DateRange;
  blocks: BlockStats;
  tasks: TaskStats;
  pages: PageStats;
  aiSuggestions?: string[];
}

export interface TemplateConfig {
  type: TemplateType;
  name: string;
  description: string;
  supportedTypes: SummaryType[];
  params: Record<string, any>;
}

export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  apiUrl?: string;
  model?: string;
  promptTemplate?: string;
}

export interface SummarySettings {
  enabled: boolean;
  defaultTemplate: TemplateType;
  defaultType: SummaryType;
  dateFormat: string;
  ai: AIConfig;
  pageNameTemplate: string;
}

export interface SummaryTemplate {
  id: TemplateType;
  name: string;
  description: string;
  supportedTypes: SummaryType[];
  render(data: SummaryData, params: Record<string, any>): BlockNode[];
}
