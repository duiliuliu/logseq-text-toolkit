/**
 * Milestone 属性枚举值获取模块
 */

import type { PropertyEnumValue, BlockWithProperty } from './types';
import logger from '../logger/index';
import { logseqAPI } from '../../logseq';

export class PropertyEnumService {
  /**
   * 获取属性的所有枚举值
   */
  static async getPropertyEnums(propertyKey: string): Promise<PropertyEnumValue[]> {
    if (!logseqAPI) {
      logger.warn('[PropertyEnum] Logseq API not initialized');
      return [];
    }

    try {
      const query = this.buildEnumQuery(propertyKey);
      const result = await logseqAPI.DB.datascriptQuery(query);
      
      if (!result || !Array.isArray(result)) {
        logger.warn('[PropertyEnum] No results found');
        return [];
      }

      return this.parseQueryResult(result, propertyKey);
    } catch (error) {
      logger.error('[PropertyEnum] Query failed:', error);
      return [];
    }
  }

  /**
   * 构建枚举查询语句
   */
  private static buildEnumQuery(propertyKey: string): string {
    const formattedKey = propertyKey.startsWith('user.property/') 
      ? propertyKey 
      : `user.property/${propertyKey}`;

    return `[:find (pull ?val [* {:block/refs [:block/title]}]) 
                    :where 
                    [_ :${formattedKey} ?val]]`;
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
        if (!item || !item['block/title']) continue;

        const value = item['block/title'];
        const refBlocks = item['block/refs'] || [];

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
          if (ref && ref['block/title']) {
            enumValue.blocks.push({
              id: ref.id?.toString() || '',
              uuid: ref.uuid || '',
              content: ref['block/title'],
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
      const query = this.buildFilteredEnumQuery(propertyKey, tag);
      const result = await logseqAPI.DB.datascriptQuery(query);

      if (!result || !Array.isArray(result)) {
        return [];
      }

      return this.parseQueryResult(result, propertyKey);
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
    const formattedKey = propertyKey.startsWith('user.property/') 
      ? propertyKey 
      : `user.property/${propertyKey}`;

    return `[:find (pull ?b [*])
                    :where
                    [?b :${formattedKey} ?val]
                    [?val :block/title ?title]
                    [?b :block/tags ?t]
                    [?t :block/title "${tag}"]]`;
  }
}
