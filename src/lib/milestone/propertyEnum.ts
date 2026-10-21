/**
 * Milestone 属性枚举值获取模块
 */

import type { PropertyEnumValue, BlockWithProperty } from './types';
import logger from '../logger/index';
import { logseqAPI } from '../../logseq';

export class PropertyEnumService {
  /**
   * 格式化属性键，如果没有前缀则添加 :user.property/ 前缀
   */
  private static formatPropertyKey(key: string): string {
    const trimmed = key.trim();

    // 已带 user/logseq/plugin 属性前缀（含无冒号形式）时直接规范化
    if (/^(?::)?(?:user|logseq|plugin)\.property[./]/.test(trimmed)) {
      return trimmed.startsWith(':') ? trimmed : `:${trimmed}`;
    }

    // 移除可能的前导冒号，普通属性名默认按 user.property 处理
    const cleanKey = trimmed.replace(/^:/, '');
    return `:user.property/${cleanKey}`;
  }

  private static escapeQueryString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /**
   * 获取属性的所有枚举值
   */
  static async getPropertyEnums(propertyKey: string): Promise<PropertyEnumValue[]> {
    if (!logseqAPI) {
      logger.warn('[PropertyEnum] Logseq API not initialized');
      return [];
    }

    try {
      const formattedKey = this.formatPropertyKey(propertyKey);
      const query = this.buildEnumQuery(formattedKey);
      const result = await logseqAPI.DB.datascriptQuery(query);
      
      if (!result || !Array.isArray(result)) {
        logger.warn('[PropertyEnum] No results found');
        return [];
      }

      return this.parseQueryResult(result, formattedKey);
    } catch (error) {
      logger.error('[PropertyEnum] Query failed:', error);
      return [];
    }
  }

  /**
   * 构建枚举查询语句
   */
  private static buildEnumQuery(propertyKey: string): string {
    const cleanKey = propertyKey.startsWith(':') ? propertyKey.slice(1) : propertyKey;
    
    return `[:find (pull ?val [* {:block/refs [:block/title]}]) 
                    :where 
                    [_ :${cleanKey} ?val]]`;
  }

  /**
   * 解析查询结果
   */
  private static parseQueryResult(
    result: any[], 
    propertyKey: string
  ): PropertyEnumValue[] {
    const enumMap = new Map<string, PropertyEnumValue>();

    for (const row of result) {
      if (!row || !Array.isArray(row)) continue;

      for (const item of row) {
        const value = item?.['block/title'] ?? item?.[':block/title'] ?? item?.title;
        if (!item || !value) continue;

        const refBlocksRaw = item['block/refs'] || item[':block/refs'] || item['refs'] || [];
        const refBlocks = Array.isArray(refBlocksRaw) ? refBlocksRaw : [];

        if (!enumMap.has(value)) {
          enumMap.set(value, {
            value,
            count: 0,
            blocks: [],
          });
        }

        const enumValue = enumMap.get(value)!;
        enumValue.count++;

        refBlocks.forEach((ref: any) => {
          const refTitle = ref?.['block/title'] ?? ref?.[':block/title'] ?? ref?.title;
          if (ref && refTitle) {
            enumValue.blocks.push({
              id: ref.id?.toString() || ref['db/id']?.toString() || '',
              uuid: ref.uuid || ref['block/uuid'] || '',
              content: refTitle,
              properties: {},
              createdAt: '',
              updatedAt: '',
            });
          }
        });
      }
    }

    return Array.from(enumMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * 获取带标签过滤的属性枚举值
   */
  static async getPropertyEnumsWithTag(
    propertyKey: string,
    tag: string
  ): Promise<PropertyEnumValue[]> {
    if (!logseqAPI) {
      logger.warn('[PropertyEnum] Logseq API not initialized');
      return [];
    }

    try {
      const formattedKey = this.formatPropertyKey(propertyKey);
      const query = this.buildFilteredEnumQuery(formattedKey, tag);
      const result = await logseqAPI.DB.datascriptQuery(query);

      if (!result || !Array.isArray(result)) {
        return [];
      }

      return this.parseQueryResult(result, formattedKey);
    } catch (error) {
      logger.error('[PropertyEnum] Filtered query failed:', error);
      return [];
    }
  }

  /**
   * 构建带标签过滤的查询语句
   */
  private static buildFilteredEnumQuery(
    propertyKey: string,
    tag: string
  ): string {
    const cleanKey = propertyKey.startsWith(':') ? propertyKey.slice(1) : propertyKey;

    return `[:find (pull ?b [*])
                    :where
                    [?b :${cleanKey} ?val]
                    [?val :block/title ?title]
                    [?b :block/tags ?t]
                    [?t :block/title "${this.escapeQueryString(tag)}"]]`;
  }
}
