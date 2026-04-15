// Mock useLogseq hook for testing
import { useState, useEffect } from 'react';

/**
 * 模拟 useLogseq hook，用于测试环境
 * @returns {Object} Logseq 相关的状态和方法
 */
const useLogseq = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initLogseq = async () => {
      try {
        // 模拟 Logseq 初始化
        if (typeof window.logseq !== 'undefined') {
          await window.logseq.ready();
          setIsReady(true);
        } else {
          // 在测试模式下，直接设置为就绪
          setIsReady(true);
        }
      } catch (err) {
        console.error('Logseq initialization error:', err);
        setError(err);
      }
    };

    initLogseq();
  }, []);

  /**
   * 注册命令
   * @param {Object} command 命令对象
   */
  const registerCommand = (command) => {
    if (isReady && typeof window.logseq !== 'undefined') {
      try {
        window.logseq.App.registerCommand(command);
      } catch (err) {
        console.error('Failed to register command:', err);
        setError(err);
      }
    }
  };

  /**
   * 监听事件
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  const on = (event, callback) => {
    if (isReady && typeof window.logseq !== 'undefined') {
      try {
        window.logseq.App.on(event, callback);
      } catch (err) {
        console.error('Failed to register event listener:', err);
        setError(err);
      }
    }
  };

  /**
   * 取消监听事件
   * @param {string} event 事件名称
   */
  const off = (event) => {
    if (isReady && typeof window.logseq !== 'undefined') {
      try {
        window.logseq.App.off(event);
      } catch (err) {
        console.error('Failed to unregister event listener:', err);
        setError(err);
      }
    }
  };

  /**
   * 获取用户配置
   * @returns {Promise<Object>} 用户配置
   */
  const getUserConfigs = async () => {
    if (isReady && typeof window.logseq !== 'undefined') {
      try {
        return await window.logseq.App.getUserConfigs();
      } catch (err) {
        console.error('Failed to get user configs:', err);
        setError(err);
        return null;
      }
    }
    return null;
  };

  /**
   * 获取当前页面
   * @returns {Promise<Object>} 当前页面
   */
  const getCurrentPage = async () => {
    if (isReady && typeof window.logseq !== 'undefined') {
      try {
        return await window.logseq.Editor.getCurrentPage();
      } catch (err) {
        console.error('Failed to get current page:', err);
        setError(err);
        return null;
      }
    }
    return null;
  };

  return {
    isReady,
    error,
    registerCommand,
    on,
    off,
    getUserConfigs,
    getCurrentPage
  };
};

export default useLogseq;
