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
  positional: ['style']
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
      tag: config.tag,
      property: config.property,
      propertyK: config.propertyK,
      propertyV: config.propertyV,
      targetPropertyK: config.targetPropertyK,
      list: config.list,
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

  let style: MilestoneDisplayStyle = 'capsule';
  if (parsed.style && ['capsule', 'badge', 'track', 'card', 'compact'].includes(parsed.style)) {
    style = parsed.style as MilestoneDisplayStyle;
  }

  let list: string[] | undefined;
  if (parsed.list) {
    list = parsed.list.split(';').map(s => s.trim()).filter(Boolean);
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
    tag: template.tag,
    propertyK: template.propertyK,
    propertyV: template.propertyV,
    targetPropertyK: template.targetPropertyK,
    list: template.list,
    style: template.defaultStyle,
    showLabels: template.showLabels,
    showProgress: template.showProgress,
    dateField: template.dateField,
  } : {};

  let finalList = list || baseConfig.list;
  if (parsed.list) {
    finalList = parsed.list.split(';').map(s => s.trim()).filter(Boolean);
  }

  return {
    template: parsed.template,
    tag: parsed.tag || baseConfig.tag,
    style: parsed.style ? (parsed.style as MilestoneDisplayStyle) : baseConfig.style || style,
    property: parsed.property,
    propertyK: parsed.propertyK || baseConfig.propertyK,
    propertyV: parsed.propertyV || baseConfig.propertyV,
    targetPropertyK: parsed.targetPropertyK || baseConfig.targetPropertyK,
    list: finalList,
    dateField: parsed.dateField || baseConfig.dateField || 'scheduled',
    showLabels: parsed.showLabels !== undefined ? parsed.showLabels !== 'false' : baseConfig.showLabels !== false,
    showProgress: parsed.showProgress !== undefined ? parsed.showProgress !== 'false' : baseConfig.showProgress !== false,
    colorScheme: parsed.colorScheme ? JSON.parse(parsed.colorScheme) : undefined,
  };
}
