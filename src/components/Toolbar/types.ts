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
  before?: string;
  after?: string;
  block?: BlockEntity;
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
