import React from 'react';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import logger from '../logger';
import {
  renderComponent,
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater
} from '../render';
import { getChildBlocks } from './query';
import {
  VIEW_TYPE_MAP,
  TABLE_THEME_MAP,
  PRESET_THEMES,
  DEFAULT_COLUMNS,
  CustomTableTheme
} from './types';
import type {
  BlockViewType,
  TableTheme,
  ColumnWidths,
  BlockViewConfig
} from './types';

// 组件引用
let BlockViewComponent: React.FC<any> | null = null;

// 宏前缀
const MACRO_PREFIX = ':block-view';
const MACRO_PREFIX_CN = ':块视图';
const PLUGIN_ID = 'text-toolkit-block-view';

// 注册参数模型
registerRendererArgModel(MACRO_PREFIX, { positional: ['view'] });
registerRendererArgModel(MACRO_PREFIX_CN, { positional: ['view'] });

// 创建参数更新器
const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([
  MACRO_PREFIX,
  MACRO_PREFIX_CN
]);

export { updateBlockViewArgs };

// 设置组件引用
export function setBlockViewComponent(component: React.FC<any>) {
  BlockViewComponent = component;
}

interface ParsedMacroArgs {
  viewType: BlockViewType;
  theme: TableTheme;
  showStriped: boolean;
  showBorder: boolean;
  showColumns: string[];
  customTheme?: CustomTableTheme;
  columnWidths?: ColumnWidths;
}

// 解析宏参数
function parseMacroArguments(
  tokens: string[],
  argMap: Record<string, string>
): ParsedMacroArgs {
  let viewType: BlockViewType = 'table';
  let theme: TableTheme = 'default';
  let showStriped = true;
  let showBorder = true;
  let showColumns = [...DEFAULT_COLUMNS];
  let columnWidths: ColumnWidths | undefined;

  // 从 argMap 读取
  if (argMap.view || argMap.viewType) {
    const viewVal = VIEW_TYPE_MAP[argMap.view || argMap.viewType || ''];
    if (viewVal) viewType = viewVal;
  }
  if (argMap.theme) {
    const themeVal = TABLE_THEME_MAP[argMap.theme];
    if (themeVal) theme = themeVal;
  }
  if (argMap.striped !== undefined) {
    showStriped = argMap.striped === 'true';
  }
  if (argMap.border !== undefined) {
    showBorder = argMap.border === 'true';
  }
  if (argMap.columns) {
    showColumns = argMap.columns.split(',').map(c => c.trim());
  }
  if (argMap.colWidths) {
    try {
      columnWidths = JSON.parse(argMap.colWidths);
    } catch {
      // 忽略解析错误
    }
  }

  // 从 tokens 读取
  for (const token of tokens) {
    const t = token.trim();
    if (!t) continue;
    if (t.includes('=')) continue;

    if (VIEW_TYPE_MAP[t]) {
      viewType = VIEW_TYPE_MAP[t];
    }
    if (TABLE_THEME_MAP[t]) {
      theme = TABLE_THEME_MAP[t];
    }
  }

  return {
    viewType,
    theme,
    showStriped,
    showBorder,
    showColumns,
    columnWidths
  };
}

// 渲染函数
async function renderBlockView(
  slot: string,
  type: string,
  tokens: string[],
  blockUuid?: string
): Promise<boolean> {
  try {
    logger.debug('[BlockView] Rendering', { type, blockUuid });

    const argMap = parseRendererArgs(type, tokens);
    const parsedArgs = parseMacroArguments(tokens, argMap);
    const settings = await getSettingsWithSystem();

    // 优先级：宏命令 > Settings > 默认
    const resolvedViewType = parsedArgs.viewType || settings?.blockView?.defaultViewType || 'table';
    const resolvedTheme = parsedArgs.theme || settings?.blockView?.table?.defaultTheme || 'default';
    const resolvedShowStriped =
      parsedArgs.showStriped ?? settings?.blockView?.table?.defaultShowStriped ?? true;
    const resolvedShowBorder =
      parsedArgs.showBorder ?? settings?.blockView?.table?.defaultShowBorder ?? true;
    const resolvedShowColumns =
      parsedArgs.showColumns || settings?.blockView?.table?.defaultColumns || DEFAULT_COLUMNS;
    const resolvedCustomTheme =
      (resolvedTheme === 'custom'
        ? { ...PRESET_THEMES.default, ...settings?.blockView?.table?.customTheme }
        : undefined);

    // 获取块数据
    const blocks = blockUuid ? await getChildBlocks(blockUuid) : [];

    if (!BlockViewComponent) {
      logger.warn('[BlockView] Component not registered');
      return false;
    }

    const config: BlockViewConfig = {
      viewType: resolvedViewType,
      table: {
        theme: resolvedTheme,
        showRowStriped: resolvedShowStriped,
        showBorder: resolvedShowBorder,
        showColumns: resolvedShowColumns,
        customTheme: resolvedCustomTheme,
        columnWidths: parsedArgs.columnWidths
      }
    };

    const containerId = `${PLUGIN_ID}__${slot}`;

    logseqAPI.provideUI({
      key: containerId,
      slot,
      reset: true,
      template: `<div id="${containerId}"></div>`
    });

    setTimeout(() => {
      const container = getDocument().getElementById(containerId);
      if (container) {
        renderComponent(container, BlockViewComponent, {
          blocks,
          config,
          onBlockId: blockUuid
        });
      }
    }, 1);

    return true;
  } catch (err) {
    logger.error('[BlockView] Render error', err);
    return false;
  }
}

// 注册函数
export function registerBlockView(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments);
    const type = split?.type || '';
    const tokens = split?.tokens || [];
    const blockUuid = payload.uuid;

    if (!type || (!type.startsWith(MACRO_PREFIX) && !type.startsWith(MACRO_PREFIX_CN))) {
      return;
    }

    await renderBlockView(slot, type, tokens, blockUuid);
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${MACRO_PREFIX}, view=table, theme=default}}`
      );
    }
  );

  logger.info('[BlockView] Registered successfully');
}
