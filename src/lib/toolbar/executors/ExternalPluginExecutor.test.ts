import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/types.ts';
import { logseqAPI } from '../../../logseq/index.ts';
import { externalPluginExecutor } from './ExternalPluginExecutor.ts';

const selectedData: SelectedData = {
  text: 'selected text',
};

const createItem = (invokeParams: ToolbarItem['invokeParams']): ToolbarItem => ({
  id: 'external-plugin',
  label: 'External Plugin',
  invoke: 'invokeExternalPlugin',
  invokeParams,
});

describe('externalPluginExecutor', () => {
  let getExternalPluginMock: ReturnType<typeof vi.fn>;
  let invokeExternalPluginMock: ReturnType<typeof vi.fn>;
  let showMsgMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getExternalPluginMock = vi.fn();
    invokeExternalPluginMock = vi.fn();
    showMsgMock = vi.fn().mockResolvedValue('mock-message-key');

    (logseqAPI.App as any).getExternalPlugin = getExternalPluginMock;
    (logseqAPI.App as any).invokeExternalPlugin = invokeExternalPluginMock;
    (logseqAPI.UI as any).showMsg = showMsgMock;
  });

  test('should reject non-string invokeParams without calling external plugin', async () => {
    const item = createItem({ regex: 'foo', replacement: 'bar' });

    const result = await externalPluginExecutor(item, selectedData);

    expect(result).toBe(selectedData.text);
    expect(getExternalPluginMock).not.toHaveBeenCalled();
    expect(invokeExternalPluginMock).not.toHaveBeenCalled();
    expect(showMsgMock).toHaveBeenCalledWith('未配置外部插件命令', 'error');
  });

  test('should warn when target plugin is not available', async () => {
    getExternalPluginMock.mockResolvedValue(null);

    const result = await externalPluginExecutor(
      createItem('demo-plugin.command'),
      selectedData,
    );

    expect(result).toBe(selectedData.text);
    expect(getExternalPluginMock).toHaveBeenCalledWith('demo-plugin');
    expect(invokeExternalPluginMock).not.toHaveBeenCalled();
    expect(showMsgMock).toHaveBeenCalledWith(
      '外部插件 demo-plugin 未安装或已禁用',
      'warning',
      { timeout: 10000 },
    );
  });

  test('should invoke external plugin through unified logseqAPI', async () => {
    getExternalPluginMock.mockResolvedValue({
      settings: {
        disabled: false,
      },
    });
    invokeExternalPluginMock.mockResolvedValue('processed text');

    const result = await externalPluginExecutor(
      createItem('demo-plugin.command'),
      selectedData,
    );

    expect(result).toBe('processed text');
    expect(invokeExternalPluginMock).toHaveBeenCalledWith('demo-plugin.command');
    expect(showMsgMock).toHaveBeenCalledWith('外部插件命令执行成功', 'success');
  });
});
