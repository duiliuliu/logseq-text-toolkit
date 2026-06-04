/**
 * Milestone 宏命令注册
 */

import type { MilestoneDisplayStyle, MilestoneConfig, MilestoneTemplate } from './types';
import { MilestoneQuery } from './query';
import { renderComponent, splitRendererArgs, parseRendererArgs, createMacroHandler, type MacroHandlerOptions } from '../render';
import logger from '../logger/index';
import { getSettings } from '../../settings/index.ts';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import React from 'react';

const PLUGIN_ID = 'milestone';

const MACRO_PREFIX = ':milestone';

let MilestoneComponent: React.FC<any> | null = null;

export function setMilestoneComponent(component: React.FC<any>) {
  MilestoneComponent = component;
}


/**
 * 渲染 Milestone 组件
 */
async function renderMilestone(slot: string, config: MilestoneConfig, currentBlockUuid?: string): Promise<boolean> {
  try {
    const data = await MilestoneQuery.query({
      filterTag: config.filterTag,
      property: config.property,
      filterPropKey: config.filterPropKey,
      milestonePropKey: config.milestonePropKey,
      milestoneList: config.milestoneList,
      dateField: config.dateField,
      currentBlockUuid: currentBlockUuid
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
 * 解析宏参数
 */
function mergeConfig(macroArgs: Record<string, string>, settingsConfig: Partial<MilestoneConfig>): MilestoneConfig {
  const settings = getSettings();
  const templates = settings?.milestone?.templates || [];
  const defaultColorScheme = settings?.milestone?.defaultColorScheme;
  
  let template: MilestoneTemplate | undefined;
  if (macroArgs.template) {
    template = templates.find(t => t.id === macroArgs.template || t.name === macroArgs.template);
  }

  const baseConfig: Partial<MilestoneConfig> = template ? {
    filterTag: template.filterTag,
    filterPropKey: template.filterPropKey,
    milestonePropKey: template.milestonePropKey,
    milestoneList: template.milestoneList,
    displayStyle: template.displayStyle,
    showProgress: template.showProgress,
    showLabel: template.showLabel,
    inline: template.inline,
    dateField: template.dateField,
    colorScheme: template.colorScheme,
  } : {};

  let displayStyle: MilestoneDisplayStyle = baseConfig.displayStyle || settingsConfig?.displayStyle || settings?.milestone?.defaultStyle || 'capsule';
  if (macroArgs.displayStyle && ['capsule', 'badge', 'track', 'card', 'compact', 'arrow-capsule', 'timeline-track'].includes(macroArgs.displayStyle)) {
    displayStyle = macroArgs.displayStyle as MilestoneDisplayStyle;
  }

  let inline: boolean = baseConfig.inline !== undefined ? baseConfig.inline : (settingsConfig?.inline !== undefined ? settingsConfig.inline : (settings?.milestone?.inline ?? false));
  if (macroArgs.inline !== undefined) {
    inline = macroArgs.inline !== 'false';
  }

  let finalMilestoneList = baseConfig.milestoneList;
  if (macroArgs.milestoneList) {
    finalMilestoneList = macroArgs.milestoneList.split(';').map(s => s.trim()).filter(Boolean);
  }

  let finalColorScheme = undefined;
  if (macroArgs.colorScheme) {
    finalColorScheme = JSON.parse(macroArgs.colorScheme);
  } else if (baseConfig.colorScheme) {
    finalColorScheme = baseConfig.colorScheme;
  } else if (defaultColorScheme) {
    finalColorScheme = defaultColorScheme;
  }

  return {
    template: macroArgs.template,
    filterTag: macroArgs.filterTag || baseConfig.filterTag || settingsConfig.filterTag,
    displayStyle: displayStyle,
    property: macroArgs.property || baseConfig.property || settingsConfig.property,
    filterPropKey: macroArgs.filterPropKey || baseConfig.filterPropKey || settingsConfig.filterPropKey,
    milestonePropKey: macroArgs.milestonePropKey || baseConfig.milestonePropKey || settingsConfig.milestonePropKey,
    milestoneList: finalMilestoneList,
    dateField: macroArgs.dateField || baseConfig.dateField || settingsConfig.dateField || 'scheduled',
    showProgress: macroArgs.showProgress !== undefined ? macroArgs.showProgress !== 'false' : (baseConfig.showProgress !== undefined ? baseConfig.showProgress : (settingsConfig.showProgress !== undefined ? settingsConfig.showProgress : settings?.milestone?.showProgress !== false)),
    showLabel: macroArgs.showLabel !== undefined ? macroArgs.showLabel !== 'false' : (baseConfig.showLabel !== undefined ? baseConfig.showLabel : (settingsConfig.showLabel !== undefined ? settingsConfig.showLabel : settings?.milestone?.showLabel !== false)),
    inline: inline,
    colorScheme: finalColorScheme,
    tooltipStyle: settings?.milestone?.tooltipStyle || 'compact',
  };
}

/**
 * 注册 Milestone 宏渲染器
 */
export function registerMilestone(): void {
  const handlerOptions: MacroHandlerOptions<MilestoneConfig> = {
    macroPrefix: MACRO_PREFIX,
    argModel: { positional: ['displayStyle'], named: ['inline'] },
    getConfigFromSettings: () => {
      const settings = getSettings();
      return settings?.milestone || {};
    },
    mergeConfig: mergeConfig,
    render: renderMilestone
  };

  const macroHandler = createMacroHandler(handlerOptions);
  logseqAPI.App.onMacroRendererSlotted(macroHandler);

  const settings = getSettings();
  if (settings?.milestone?.enabled !== false) {
    logseqAPI.Editor.registerSlashCommand(
      '[Text Toolkit] Insert Milestone',
      async () => {
        const milestoneSettings = getSettings()?.milestone;
        const defaultTemplate = milestoneSettings?.defaultSlashCommandTemplate
          || `${MACRO_PREFIX}, displayStyle=compact, inline=true, milestoneList=Initiation;Planning;Execution;Monitoring;Closure`;
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${defaultTemplate}}}`
        );
      }
    );
  }

  logger.info('✅ Milestone: Registered successfully');
}
