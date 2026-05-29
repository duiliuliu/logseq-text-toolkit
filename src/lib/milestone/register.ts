/**
 * Milestone 宏命令注册
 */

import type { MilestoneDisplayStyle, MilestoneConfig } from './types';
import { renderComponent, registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import logger from '../logger/index';

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
    MilestoneQuery.query({
      tag: config.tag,
      property: config.property,
      propertyK: config.propertyK,
      propertyV: config.propertyV,
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
        renderFn(container, { data: null, config });
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
function parseMacroArguments(type: string, tokens: string[]): MilestoneConfig {
  const parsed = parseRendererArgs(type, tokens);

  let style: MilestoneDisplayStyle = 'capsule';
  if (parsed.style && ['capsule', 'badge', 'track', 'card', 'compact'].includes(parsed.style)) {
    style = parsed.style as MilestoneDisplayStyle;
  }

  let list: string[] | undefined;
  if (parsed.list) {
    list = parsed.list.split(';').map(s => s.trim()).filter(Boolean);
  }

  return {
    tag: parsed.tag,
    style,
    property: parsed.property,
    propertyK: parsed.propertyK,
    propertyV: parsed.propertyV,
    list,
    dateField: parsed.dateField || 'scheduled',
    showLabels: parsed.showLabels !== 'false',
    showProgress: parsed.showProgress !== 'false',
    colorScheme: parsed.colorScheme ? JSON.parse(parsed.colorScheme) : undefined,
  };
}
