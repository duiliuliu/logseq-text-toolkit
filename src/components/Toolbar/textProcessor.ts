/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 文本处理相关类型定义
 */

import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

/**
 * 选中数据接口
 */
export interface SelectedData {
  text: string;
  timestamp?: string;
  range?: Range;
  rect?: DOMRect;
  before?: string;
  after?: string;
  block?: BlockEntity;
}
