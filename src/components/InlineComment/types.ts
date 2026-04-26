/**
 * 行内注释功能类型定义
 */

import type { SelectedData } from '../Toolbar/textProcessor.ts';

export interface InlineCommentConfig {
  selectedText: string;
  comment: string;
}

export interface InlineCommentModalProps {
  isOpen: boolean;
  selectedData: SelectedData;
  onClose?: () => void;
  onSave?: (config: InlineCommentConfig) => void;
}
