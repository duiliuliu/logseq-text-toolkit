/**
 * Milestone 宏命令注册
 */

import type { MilestoneDisplayStyle, MilestoneConfig, MilestoneTemplate } from './types';
import { renderComponent, registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import logger from '../logger/index';
import { getSettings } from '../../settings/index.ts';

let logseqAPI: any = null;

export function setMilestoneLogseqAPI(api: any): void {
  logseqAPI = api;
}

const PLUGIN_ID = 'milestone';

registerRendererArgModel(':milestone', {
  positional: ['displayStyle']
});

interface MacroPayload {
  arguments: string[];
  uuid: string;
}

interface MacroSlot {
  slot: string;
}

/**
 * 渲染 Milestone 组件
 */
export async function renderMilestoneComponent(
  slot: string,
  config: MilestoneConfig,
  renderFn: (container: HTMLElement, props: any) => void
): Promise<boolean> {
  if (!logseqAPI) {
    logger.warn('[Milestone] Logseq API not initialized');
    return false;
  }

  try {
    const { MilestoneQuery } = await import('./query');
    const data = await MilestoneQuery.query({
      filterTag: config.filterTag,
      property: config.property,
      filterPropKey: config.filterPropKey,
      filterPropValue: config.filterPropValue,
      milestonePropKey: config.milestonePropKey,
      milestoneList: config.milestoneList,
      dateField: config.dateField
    });

    const containerId = PLUGIN_ID + '__' + slot;

    logseqAPI.provideUI({
      key: containerId,
      slot,
      reset: true,
      template: `<div id="${containerId}"></div>`,
    });

    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (container) {
        logger.debug('🎯 Milestone: Rendering component', { containerId });
        renderFn(container, { data, config });
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
export function registerMilestone(
  renderFn: (container: HTMLElement, props: any) => void
): void {
  if (!logseqAPI) {
    logger.warn('[Milestone] Logseq API not initialized');
    return;
  }

  logseqAPI.App.onMacroRendererSlotted(async ({ 
    payload, 
    slot 
  }: MacroPayload & MacroSlot) => {
    try {
      const split = splitRendererArgs(payload.arguments);
      if (!split) {
        logger.warn('[Milestone] Invalid macro arguments');
        return;
      }

      const config = parseMacroArguments(split.type, split.tokens);
      await renderMilestoneComponent(slot, config, renderFn);
    } catch (error) {
      logger.error('[Milestone] Render failed:', error);
    }
  });
}

/**
 * 解析宏参数
 */
function parseMacroArguments(type: string, tokens: any): MilestoneConfig {
  const parsed = parseRendererArgs(type, tokens);

  let displayStyle: MilestoneDisplayStyle = 'capsule';
  if (parsed.displayStyle && ['capsule', 'badge', 'track', 'card', 'compact'].includes(parsed.displayStyle)) {
    displayStyle = parsed.displayStyle as MilestoneDisplayStyle;
  } else if (parsed.style && ['capsule', 'badge', 'track', 'card', 'compact'].includes(parsed.style)) {
    // 向后兼容
    displayStyle = parsed.style as MilestoneDisplayStyle;
  }

  let milestoneList: string[] | undefined;
  if (parsed.milestoneList) {
    milestoneList = parsed.milestoneList.split(';').map(s => s.trim()).filter(Boolean);
  } else if (parsed.list) {
    // 向后兼容
    milestoneList = parsed.list.split(';').map(s => s.trim()).filter(Boolean);
  }

  // 检查是否使用了模板
  let template: MilestoneTemplate | undefined;
  const settings = getSettings();
  const templates = settings?.milestone?.templates || [];
  
  if (parsed.template) {
    // 支持两种格式：:id 或者直接 id
    const templateId = parsed.template.startsWith(':') ? parsed.template.slice(1) : parsed.template;
    template = templates.find(t => t.id === templateId || t.id === `template_${templateId}`);
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

  let finalMilestoneList = milestoneList || baseConfig.milestoneList;
  if (parsed.milestoneList) {
    finalMilestoneList = parsed.milestoneList.split(';').map(s => s.trim()).filter(Boolean);
  } else if (parsed.list) {
    finalMilestoneList = parsed.list.split(';').map(s => s.trim()).filter(Boolean);
  }

  return {
    template: parsed.template,
    filterTag: parsed.filterTag || parsed.tag || baseConfig.filterTag,
    displayStyle: displayStyle || baseConfig.displayStyle,
    property: parsed.property,
    filterPropKey: parsed.filterPropKey || parsed.propertyK || baseConfig.filterPropKey,
    filterPropValue: parsed.filterPropValue || parsed.propertyV || baseConfig.filterPropValue,
    milestonePropKey: parsed.milestonePropKey || parsed.targetPropertyK || baseConfig.milestonePropKey,
    milestoneList: finalMilestoneList,
    dateField: parsed.dateField || baseConfig.dateField || 'scheduled',
    showProgress: parsed.showProgress !== undefined ? parsed.showProgress !== 'false' : baseConfig.showProgress !== false,
    showLabel: parsed.showLabel !== undefined ? parsed.showLabel !== 'false' : baseConfig.showLabel !== false,
    // 向后兼容
    showLabels: parsed.showLabels !== undefined ? parsed.showLabels !== 'false' : baseConfig.showLabel !== false,
    colorScheme: parsed.colorScheme ? JSON.parse(parsed.colorScheme) : undefined,
  };
}
