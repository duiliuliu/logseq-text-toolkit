/**
 * Milestone 宏命令注册
 */

import type { MilestoneDisplayStyle, MilestoneConfig, MilestoneTemplate } from './types';
import { MilestoneQuery } from './query';
import { renderComponent, registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import logger from '../logger/index';
import { getSettings } from '../../settings/index.ts';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import React from 'react';

const PLUGIN_ID = 'milestone';

registerRendererArgModel(':milestone', {
  positional: ['displayStyle']
});

let MilestoneComponent: React.FC<any> | null = null;

export function setMilestoneComponent(component: React.FC<any>) {
  MilestoneComponent = component;
}



/**
 * 渲染 Milestone 组件
 */
async function renderMilestone(slot: string, config: MilestoneConfig): Promise<boolean> {
  try {
    const data = await MilestoneQuery.query({
      filterTag: config.filterTag,
      property: config.property,
      filterPropKey: config.filterPropKey,
      filterPropValue: config.filterPropValue,
      milestonePropKey: config.milestonePropKey,
      milestoneList: config.milestoneList,
      dateField: config.dateField
    });

    if (!MilestoneComponent) {
      logger.warn('⚠️ Milestone: Component not registered');
      return false;
    }

    const containerId = PLUGIN_ID + '__' + slot;

    logseqAPI.provideUI({
      key: containerId,
      slot,
      reset: true,
      template: `<div id="${containerId}"></div>`,
    });

    setTimeout(() => {
      const container = getDocument().getElementById(containerId);
      if (container) {
        logger.debug('🎯 Milestone: Rendering component', { containerId });
        renderComponent(container, MilestoneComponent, { data, config });
      } else {
        logger.warn('🎯 Milestone: Container not found', { containerId });
      }
    }, 1);

    return true;
  } catch (err) {
    logger.error('❌ Milestone: Render error', err);
    return false;
  }
}

/**
 * 注册 Milestone 宏渲染器
 */
export function registerMilestone(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    try {
      const split = splitRendererArgs(payload.arguments);
      if (!split) {
        logger.warn('[Milestone] Invalid macro arguments');
        return;
      }

      const config = parseMacroArguments(split.type, split.tokens);
      await renderMilestone(slot, config);
    } catch (error) {
      logger.error('[Milestone] Render failed:', error);
    }
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Milestone',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer :milestone, displayStyle=capsule}}`
      );
    }
  );

  logger.info('✅ Milestone: Registered successfully');
}

/**
 * 解析宏参数
 */
function parseMacroArguments(type: string, tokens: any): MilestoneConfig {
  const parsed = parseRendererArgs(type, tokens);

  // 检查是否使用了模板
  let template: MilestoneTemplate | undefined;
  const settings = getSettings();
  const templates = settings?.milestone?.templates || [];
  
  if (parsed.template) {
    // 支持两种格式：id 或者 name
    template = templates.find(t => t.id === parsed.template || t.name === parsed.template);
  }

  // 合并配置：模板为基础，宏参数覆盖
  const baseConfig: Partial<MilestoneConfig> = template ? {
    filterTag: template.filterTag,
    filterPropKey: template.filterPropKey,
    filterPropValue: template.filterPropValue,
    milestonePropKey: template.milestonePropKey,
    milestoneList: template.milestoneList,
    displayStyle: template.displayStyle,
    showProgress: template.showProgress,
    showLabel: template.showLabel,
    dateField: template.dateField,
  } : {};

  // 解析 displayStyle，优先使用宏参数，否则使用模板或默认值
  let displayStyle: MilestoneDisplayStyle = baseConfig.displayStyle || 'capsule';
  if (parsed.displayStyle && ['capsule', 'badge', 'track', 'card', 'compact'].includes(parsed.displayStyle)) {
    displayStyle = parsed.displayStyle as MilestoneDisplayStyle;
  }

  // 解析 milestoneList，优先使用宏参数
  let finalMilestoneList = baseConfig.milestoneList;
  if (parsed.milestoneList) {
    finalMilestoneList = parsed.milestoneList.split(';').map(s => s.trim()).filter(Boolean);
  }

  return {
    template: parsed.template,
    filterTag: parsed.filterTag || baseConfig.filterTag,
    displayStyle: displayStyle,
    property: parsed.property,
    filterPropKey: parsed.filterPropKey || baseConfig.filterPropKey,
    filterPropValue: parsed.filterPropValue || baseConfig.filterPropValue,
    milestonePropKey: parsed.milestonePropKey || baseConfig.milestonePropKey,
    milestoneList: finalMilestoneList,
    dateField: parsed.dateField || baseConfig.dateField || 'scheduled',
    showProgress: parsed.showProgress !== undefined ? parsed.showProgress !== 'false' : baseConfig.showProgress !== false,
    showLabel: parsed.showLabel !== undefined ? parsed.showLabel !== 'false' : baseConfig.showLabel !== false,
    colorScheme: parsed.colorScheme ? JSON.parse(parsed.colorScheme) : undefined,
  };
}
