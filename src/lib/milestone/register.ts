/**
 * Milestone 宏命令注册
 *
 * 🔸 解析逻辑已迁移至 MacroSchema 框架 (P1.1)
 *    - schema.ts:  参数 Schema 声明
 *    - register.ts: 注册宏 & 调用 Schema 解析
 *
 * 三层覆盖原则：
 *   1. 宏参数（如 {{renderer :milestone, displayStyle=badge}}）
 *   2. 模板配置（Settings 中预定义的模板）
 *   3. 默认设置（Settings 中的全局默认值）
 */

import type { MilestoneConfig } from './types';
import { MilestoneQuery } from './query';
import {
  renderComponent,
  parseRendererArgs,
  resolveConfigFromTokens,
  type MacroArguments,
} from '../render';
import { MILESTONE_SCHEMAS, templateToPartialConfig } from './schema';
import logger from '../logger/index';
import { getSettingsWithSystem } from '../../settings/index.ts';
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
async function renderMilestone(
  slot: string,
  config: MilestoneConfig,
  currentBlockUuid?: string,
): Promise<boolean> {
  try {
    const data = await MilestoneQuery.query({
      filterTag: config.filterTag,
      property: config.property,
      filterPropKey: config.filterPropKey,
      milestonePropKey: config.milestonePropKey,
      milestoneList: config.milestoneList,
      dateField: config.dateField,
      currentBlockUuid,
    });

    if (!MilestoneComponent) {
      logger.warn('⚠️ Milestone: Component not registered');
      return false;
    }

    const containerId = `${PLUGIN_ID}__${slot}`;

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
 * 解析宏参数（使用 MacroSchema 框架）
 *
 * 原逻辑：~100 行手写解析 + 覆盖判断
 * 新逻辑：一次 resolveConfigFromTokens 调用
 */
async function parseMacroArguments(
  macroArgs: MacroArguments,
): Promise<MilestoneConfig> {
  // 1) 特殊处理 template 参数：模板引用，不在 Schema 里
  const rawValues = parseRendererArgs(macroArgs.type, macroArgs.tokens) as Record<
    string,
    string
  >;
  const templateIdOrName = rawValues.template;

  // 2) 从 settings 读取模板列表和默认设置
  const settings = await getSettingsWithSystem();
  const templates = settings?.milestone?.templates || [];

  const matchedTemplate = templateIdOrName
    ? templates.find(t => t.id === templateIdOrName || t.name === templateIdOrName)
    : undefined;

  const templateValues = templateToPartialConfig(matchedTemplate);

  // 3) 组装默认设置层
  const defaultValues: Partial<MilestoneConfig> = {
    displayStyle: settings?.milestone?.defaultStyle,
    tooltipStyle: settings?.milestone?.tooltipStyle,
    inline: settings?.milestone?.inline,
    showProgress:
      settings?.milestone?.showProgress !== undefined
        ? settings.milestone.showProgress
        : true,
    showLabel:
      settings?.milestone?.showLabel !== undefined
        ? settings.milestone.showLabel
        : true,
    colorScheme: settings?.milestone?.defaultColorScheme,
  };

  // 4) 使用统一的 MacroSchema 框架做三层合并
  const resolved = resolveConfigFromTokens<MilestoneConfig>(
    MILESTONE_SCHEMAS,
    macroArgs,
    templateValues,
    defaultValues,
    {
      macroType: macroArgs.type,
      macroName: 'milestone',
    },
  );

  return {
    ...resolved,
    template: templateIdOrName,
  } as MilestoneConfig;
}

/**
 * 注册 Milestone 宏渲染器
 */
export function registerMilestone(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    try {
      const tokens = (payload.arguments || [])
        .map(v => String(v))
        .flatMap(s => s.split(',').map(x => x.trim()))
        .filter(Boolean);

      if (tokens.length === 0) return;
      const type = tokens[0];
      if (!type || !type.startsWith(MACRO_PREFIX)) return;

      const restTokens = tokens.slice(1);
      const macroArgs: MacroArguments = { type, tokens: restTokens };

      const config = await parseMacroArguments(macroArgs);
      await renderMilestone(slot, config, payload.uuid);
    } catch (error) {
      logger.error('[Milestone] Render failed:', error);
    }
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Milestone',
    async () => {
      const settings = await getSettingsWithSystem();
      const template = settings?.milestone?.defaultSlashCommandTemplate || MACRO_PREFIX;
      await logseqAPI.Editor.insertAtEditingCursor(`{{renderer ${template}}}`);
    },
  );

  logger.info('✅ Milestone: Registered successfully (MacroSchema v2)');
}
