/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 文本处理相关类型定义
 */

export interface SelectedData {
  text: string;
  timestamp?: string;
  rect?: DOMRect | { 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    top: number; 
    right: number; 
    bottom: number; 
    left: number; 
  };
  before?: string;
  after?: string;
  block?: {
    uuid: string;
    content?: string;
    properties?: Record<string, any>;
  };
}
