/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
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
  /** 选区在 block.content 中的起始字符偏移（DB 图由 SDK 事件提供） */
  start?: number;
  /** 选区在 block.content 中的结束字符偏移（DB 图由 SDK 事件提供） */
  end?: number;
  /** 浮动工具栏锚点（通常是 mouseup 的 clientX/clientY） */
  point?: { x: number; y: number };
  before?: string;
  after?: string;
  block?: BlockEntity;
  /** 选区来源：SDK 事件或原生 DOM Selection */
  source?: 'sdk' | 'native';
}

/**
 * 正则替换配置
 */
export interface RegexReplaceParams {
  regex: string;
  replacement: string;
  flags?: string;
}

/**
 * invokeParams 支持两种类型：
 * 1. 字符串 - 普通的模板字符串替换
 * 2. RegexReplaceParams 对象 - 正则替换配置
 */
export type InvokeParams = string | RegexReplaceParams;

/**
 * Toolbar 项目类型
 */
export interface ToolbarItem {
  id: string;
  label: string;
  binding?: string;
  icon?: string;
  invoke: string;
  invokeParams: InvokeParams;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
  // 兼容旧版本
  funcmode?: string;
  clickfunc?: string;
}

/**
 * Toolbar 组类型
 */
export interface ToolbarGroup extends ToolbarItem {
  subItems: ToolbarItem[];
}

/**
 * Toolbar 配置类型
 */
export interface ToolbarConfig {
  enabled: boolean;
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  ToolbarItems: Array<ToolbarItem | ToolbarGroup>;
}
