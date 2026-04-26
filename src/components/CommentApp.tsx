/**
 * 独立的 Comment 应用组件
 * 负责管理所有 Comment 相关功能，通过事件总线与其他组件通信
 */

import React from 'react';
import CommentManager from './InlineComment/CommentManager.tsx';
import { SettingsProvider } from '../settings/useSettings.tsx';

export function CommentApp() {
  return (
    <SettingsProvider>
      <CommentManager />
    </SettingsProvider>
  );
}

export default CommentApp;
