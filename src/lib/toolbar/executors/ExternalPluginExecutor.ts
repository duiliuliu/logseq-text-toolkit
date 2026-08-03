/**
 * 外部插件执行器
 */

import type { ActionExecutorFn } from '../types.ts';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/types.ts';
import { logseqAPI } from '../../../logseq/index.ts';
import { t } from '../../../translations/i18n.ts';
import logger from '../../logger/index';

/**
 * 外部插件执行器
 */
export const externalPluginExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  try {
    const pluginCommand = item.invokeParams;
    if (typeof pluginCommand !== 'string' || !pluginCommand.trim()) {
      logseqAPI.UI.showMsg(t('toolbar.noPluginCommand', 'zh-CN'), 'error');
      return selectedData.text;
    }
    
    const pluginId = pluginCommand.split(".")[0];
    const pluginInfo = await logseqAPI.App.getExternalPlugin(pluginId) as {
      settings?: {
        disabled?: boolean;
      };
    } | null;
    
    if (pluginInfo != null && !pluginInfo.settings?.disabled) {
      const commandRet = await logseqAPI.App.invokeExternalPlugin(pluginCommand);
      // 这里可以根据需要处理返回结果
      logseqAPI.UI.showMsg(t('toolbar.pluginCommandSuccess', 'zh-CN'), 'success');
      return commandRet == null ? selectedData.text : String(commandRet);
    } else {
      logseqAPI.UI.showMsg(
        t('toolbar.pluginNotInstalled', 'zh-CN', {
          pluginId,
        }),
        'warning',
        { timeout: 10000 },
      );
      return selectedData.text;
    }
  } catch (error) {
    try {
      logseqAPI.UI.showMsg(`${t('toolbar.pluginCommandFailed', 'zh-CN')}: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } catch (uiError) {
      logger.error('Error showing message:', uiError);
    }
    return selectedData.text;
  }
};
