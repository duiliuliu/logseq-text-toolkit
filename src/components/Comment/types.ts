/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 注释功能类型定义
 */

import type { SelectedData } from '../Toolbar/textProcessor.ts';

export interface CommentConfig {
  selectedText: string;
  comment: string;
}

export interface CommentModalProps {
  isOpen: boolean;
  selectedData: SelectedData;
  onClose?: () => void;
  onSave?: (config: CommentConfig) => void;
}
