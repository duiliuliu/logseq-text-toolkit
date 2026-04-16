// src/hooks/useLogseq.ts
import { useEffect, useState } from 'react';
import { logseqAPI } from '../logseq/index.ts';
import { BlockEntity, PageEntity } from '../types/logseq.ts';

interface Command {
  key: string;
  label: string;
  icon?: string;
  handler: () => void;
  shortcut?: string;
}

interface UserConfigs {
  darkMode: boolean;
  preferredLanguage: string;
  [key: string]: any;
}

/**
 * 自定义 Hook，用于处理 Logseq 相关的逻辑
 * @returns {Object} Logseq 相关的状态和方法
 */
const useLogseq = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initLogseq = async () => {
      try {
        await logseqAPI.ready();
        setIsReady(true);
      } catch (err) {
        console.error('Logseq initialization error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initLogseq();
  }, []);

  /**
   * 注册命令
   * @param {Command} command 命令对象
   */
  const registerCommand = (command: Command) => {
    if (isReady) {
      try {
        logseqAPI.App.registerCommand(command);
      } catch (err) {
        console.error('Failed to register command:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  /**
   * 监听事件
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (isReady) {
      try {
        logseqAPI.App.on(event, callback);
      } catch (err) {
        console.error('Failed to register event listener:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  /**
   * 取消监听事件
   * @param {string} event 事件名称
   */
  const off = (event: string) => {
    if (isReady) {
      try {
        logseqAPI.App.off(event);
      } catch (err) {
        console.error('Failed to unregister event listener:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  /**
   * 获取用户配置
   * @returns {Promise<UserConfigs | null>} 用户配置
   */
  const getUserConfigs = async (): Promise<UserConfigs | null> => {
    if (isReady) {
      try {
        return await logseqAPI.App.getUserConfigs();
      } catch (err) {
        console.error('Failed to get user configs:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    }
    return null;
  };

  /**
   * 获取当前页面
   * @returns {Promise<PageEntity | null>} 当前页面
   */
  const getCurrentPage = async (): Promise<PageEntity | null> => {
    if (isReady) {
      try {
        // 注意：这里假设 logseqAPI.Editor 有 getCurrentPage 方法
        // 如果实际 API 中没有此方法，需要根据实际情况调整
        return await (logseqAPI.Editor as any).getCurrentPage();
      } catch (err) {
        console.error('Failed to get current page:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    }
    return null;
  };

  /**
   * 获取当前块
   * @returns {Promise<BlockEntity | null>} 当前块
   */
  const getCurrentBlock = async (): Promise<BlockEntity | null> => {
    if (isReady) {
      try {
        return await logseqAPI.Editor.getCurrentBlock();
      } catch (err) {
        console.error('Failed to get current block:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    }
    return null;
  };

  /**
   * 更新块内容
   * @param {string} blockId 块ID
   * @param {string} content 新内容
   * @returns {Promise<boolean>} 更新是否成功
   */
  const updateBlock = async (blockId: string, content: string): Promise<boolean> => {
    if (isReady) {
      try {
        return await logseqAPI.Editor.updateBlock(blockId, content);
      } catch (err) {
        console.error('Failed to update block:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    }
    return false;
  };

  /**
   * 替换选中的文字
   * @param {string} processedText 处理后的文字
   * @returns {Promise<boolean>} 替换是否成功
   */
  const replaceSelectedText = async (processedText: string): Promise<boolean> => {
    if (isReady) {
      try {
        return await logseqAPI.Editor.replaceSelectedText(processedText);
      } catch (err) {
        console.error('Failed to replace selected text:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    }
    return false;
  };

  return {
    isReady,
    error,
    registerCommand,
    on,
    off,
    getUserConfigs,
    getCurrentPage,
    getCurrentBlock,
    updateBlock,
    replaceSelectedText,
    logseqAPI
  };
};

export default useLogseq;
