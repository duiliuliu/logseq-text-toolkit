/**
 * 行内注释功能类型定义
 */

export interface InlineCommentConfig {
  selectedText: string;
  comment: string;
}

export interface InlineCommentButtonConfig {
  id: string;
  label: string;
  onClick: (config: InlineCommentConfig) => void;
  primary?: boolean;
}

export interface InlineCommentModalProps {
  isOpen: boolean;
  selectedText: string;
  onClose?: () => void;
  onSave?: (config: InlineCommentConfig) => void;
  buttons?: InlineCommentButtonConfig[];
}
