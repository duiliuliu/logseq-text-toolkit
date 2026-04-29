/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import type { ConfigParser as IConfigParser } from './types.ts';
import type { ToolbarItem, ToolbarGroup } from '../../components/Toolbar/types.ts';
import { parseItems } from '../../components/Toolbar/ToolbarLogic.ts';

/**
 * 配置解析器实现
 */
export class ConfigParser implements IConfigParser {
  private items: (ToolbarItem | ToolbarGroup)[] = [];
  private itemMap: Map<string, ToolbarItem | ToolbarGroup> = new Map();

  /**
   * 解析配置
   */
  parse(config: any): (ToolbarItem | ToolbarGroup)[] {
    let toolbarConfig: any[] = [];
    
    if (Array.isArray(config)) {
      toolbarConfig = config;
    } else if (config && typeof config === 'object' && config.ToolbarItems) {
      toolbarConfig = config.ToolbarItems;
    }

    // 解析配置
    this.items = parseItems(toolbarConfig);
    
    // 建立映射
    this.itemMap.clear();
    this.buildItemMap(this.items);

    return this.items;
  }

  /**
   * 验证配置
   */
  validate(config: any): boolean {
    try {
      // 基本结构验证
      if (!config) return false;
      
      let toolbarConfig: any[] = [];
      if (Array.isArray(config)) {
        toolbarConfig = config;
      } else if (config && typeof config === 'object' && config.ToolbarItems) {
        toolbarConfig = config.ToolbarItems;
      } else {
        return false;
      }

      // 验证每个项目
      for (const item of toolbarConfig) {
        if (!item || typeof item !== 'object') {
          return false;
        }
        if (!item.id || !item.label) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Config validation failed:', error);
      return false;
    }
  }

  /**
   * 获取指定项目
   */
  getItem(id: string): ToolbarItem | ToolbarGroup | undefined {
    return this.itemMap.get(id);
  }

  /**
   * 获取所有项目
   */
  getItems(): (ToolbarItem | ToolbarGroup)[] {
    return [...this.items];
  }

  /**
   * 构建项目映射
   */
  private buildItemMap(items: (ToolbarItem | ToolbarGroup)[]): void {
    for (const item of items) {
      this.itemMap.set(item.id, item);
      
      // 处理分组的子项目
      if ('subItems' in item && item.subItems) {
        this.buildItemMap(item.subItems as any[]);
      }
    }
  }
}

// 导出单例实例
export const configParser = new ConfigParser();
