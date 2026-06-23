# Proxy Logseq 设计方案

**版本**: v1.0  
**日期**: 2026-05-12  
**状态**: 设计中

---

## 1. 概述

集成 logseq-proxy，在 testAPP 页面支持 Mock 和 Proxy 模式切换，优化开发测试体验。

---

## 2. 系统架构

```
┌─────────────────────────────────────────┐
│  testAPP 页面                          │
│  ┌────────────────────────────────────┐  │
│  │ [Mock] ←→ [Proxy] + 🔧             │  │
│  └────────────────────────────────────┘  │
│                  ↓                        │
│  ┌────────────────────────────────────┐  │
│  │ logseq (统一入口)                  │  │
│  │ - mock: 使用现有 MockLogseq       │  │
│  │ - proxy: 直接使用 logseq-proxy     │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.1 文件结构

```
src/
├── logseq/
│   ├── index.ts             # 统一入口，支持模式切换
│   ├── editor.ts            # Editor API
│   ├── app.ts               # App API
│   ├── ui.ts               # UI API
│   ├── logger.ts            # Logger API
│   ├── utils.ts             # 工具函数
│   └── mock/               # Mock 实现
│       ├── index.ts
│       ├── app.ts
│       ├── editor.ts
│       ├── ui.ts
│       └── logger.ts
│
├── test/
│   ├── testAPP.tsx          # 扩展: 添加代理设置 UI
│   └── components/
│       └── ProxySettings/   # 新增: 代理设置组件
│           ├── index.tsx
│           ├── ModeSwitch.tsx
│           └── proxySettings.css
│
└── settings/
    ├── defaultSettings.ts   # 扩展: 添加代理设置
    └── types.ts             # 扩展: 添加代理类型
```

---

## 3. 核心设计

### 3.1 统一 API 入口

```typescript
// src/logseq/index.ts
import { MockLogseqAPI } from './mock';
import { logger } from './logger';

type APIMode = 'mock' | 'proxy';

let currentMode: APIMode = 'mock';
let mockAPI: MockLogseqAPI;
let proxyClient: any;

// 初始化
export function initLogseq() {
  mockAPI = new MockLogseqAPI();
  logger.log('[Logseq] Initialized in Mock mode');
}

// 切换模式
export function setMode(mode: APIMode) {
  currentMode = mode;
  logger.log(`[Logseq] Switched to ${mode} mode`);
}

export function getMode(): APIMode {
  return currentMode;
}

// 获取当前 API
export function getLogseq() {
  if (currentMode === 'mock') {
    return mockAPI;
  }
  
  // Proxy 模式：直接返回全局 logseq
  return (window as any).logseq || mockAPI;
}

// Proxy 连接管理
export async function connectProxy(url: string = 'http://localhost:12314') {
  try {
    logger.log(`[Proxy] Connecting to ${url}...`);
    
    // 简单检查连接
    const response = await fetch(`${url}/health`);
    if (response.ok) {
      logger.log('[Proxy] Connected successfully');
      return true;
    } else {
      logger.error('[Proxy] Connection failed');
      return false;
    }
  } catch (error) {
    logger.error('[Proxy] Connection error:', error);
    return false;
  }
}

export function disconnectProxy() {
  logger.log('[Proxy] Disconnected');
}
```

### 3.2 模式切换逻辑

```typescript
// src/logseq/index.ts
// 为了兼容现有代码，保持原有的属性访问方式
export const logseq = {
  get Editor() {
    return getLogseq().Editor;
  },
  get App() {
    return getLogseq().App;
  },
  get DB() {
    return getLogseq().DB;
  },
};
```

---

## 4. UI 组件设计

### 4.1 ModeSwitch 组件

```tsx
// src/test/components/ProxySettings/ModeSwitch.tsx
import { logger } from '../../../logseq';
import './proxySettings.css';

interface ModeSwitchProps {
  currentMode: 'mock' | 'proxy';
  onModeChange: (mode: 'mock' | 'proxy') => void;
}

export function ModeSwitch({ currentMode, onModeChange }: ModeSwitchProps) {
  const handleToggle = () => {
    const newMode = currentMode === 'mock' ? 'proxy' : 'mock';
    logger.log(`[UI] Switching to ${newMode} mode`);
    onModeChange(newMode);
  };

  return (
    <div className="mode-switch">
      <span className={`mode-label ${currentMode === 'mock' ? 'active' : ''}`}>
        Mock
      </span>
      
      <button className="mode-toggle" onClick={handleToggle}>
        <span className="toggle-track">
          <span 
            className="toggle-thumb" 
            style={{ 
              transform: currentMode === 'proxy' ? 'translateX(24px)' : 'translateX(0)' 
            }}
          />
        </span>
      </button>
      
      <span className={`mode-label ${currentMode === 'proxy' ? 'active' : ''}`}>
        Proxy
      </span>
    </div>
  );
}
```

### 4.2 ProxyConfig 组件

```tsx
// src/test/components/ProxySettings/ProxyConfig.tsx
import { useState } from 'react';
import { logger } from '../../../logseq';
import './proxySettings.css';

interface ProxyConfigProps {
  onConnect: (url: string) => Promise<boolean>;
  onDisconnect: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
}

export function ProxyConfig({ 
  onConnect, 
  onDisconnect, 
  connectionStatus,
  errorMessage 
}: ProxyConfigProps) {
  const [url, setUrl] = useState('http://localhost:12314');

  const handleConnect = async () => {
    logger.log(`[UI] Connecting to ${url}`);
    const success = await onConnect(url);
    if (!success) {
      logger.error('[UI] Connection failed');
    }
  };

  const handleTest = async () => {
    logger.log('[UI] Testing connection');
    await onConnect(url);
  };

  return (
    <div className="proxy-config">
      <div className="config-field">
        <label>Logseq 实例地址:</label>
        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:12314"
          disabled={connectionStatus === 'connected'}
        />
      </div>

      <div className="connection-status">
        <span className={`status-indicator ${connectionStatus}`}>
          {connectionStatus === 'connected' && '●'}
          {connectionStatus === 'connecting' && '◐'}
          {connectionStatus === 'disconnected' && '○'}
          {connectionStatus === 'error' && '✗'}
        </span>
        <span className="status-text">
          {connectionStatus === 'connected' && `已连接 (${url})`}
          {connectionStatus === 'connecting' && '连接中...'}
          {connectionStatus === 'disconnected' && '未连接'}
          {connectionStatus === 'error' && `错误: ${errorMessage}`}
        </span>
      </div>

      <div className="config-actions">
        <button 
          onClick={handleConnect}
          disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
        >
          连接
        </button>
        <button 
          onClick={onDisconnect}
          disabled={connectionStatus !== 'connected'}
        >
          断开
        </button>
        <button onClick={handleTest}>
          测试连接
        </button>
      </div>
    </div>
  );
}
```

### 4.3 样式文件

```css
/* src/test/components/ProxySettings/proxySettings.css */
.mode-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-label {
  font-size: 13px;
  color: var(--ls-secondary-text-color);
  transition: color 0.2s ease;
}

.mode-label.active {
  color: var(--ls-primary-color);
  font-weight: 600;
}

.mode-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.toggle-track {
  display: block;
  width: 48px;
  height: 24px;
  background: var(--ls-secondary-background-color);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--ls-primary-color);
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.proxy-config {
  padding: 16px;
  background: var(--ls-secondary-background-color);
  border-radius: 8px;
  margin-top: 8px;
}

.config-field {
  margin-bottom: 12px;
}

.config-field label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--ls-primary-text-color);
}

.config-field input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--ls-border-color);
  border-radius: 4px;
  font-size: 13px;
}

.config-field input:focus {
  outline: none;
  border-color: var(--ls-primary-color);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ls-primary-background-color);
  border-radius: 4px;
  margin-bottom: 12px;
}

.status-indicator {
  font-size: 14px;
}

.status-indicator.connected { color: #10b981; }
.status-indicator.connecting { color: #f59e0b; }
.status-indicator.disconnected { color: #6b7280; }
.status-indicator.error { color: #ef4444; }

.status-text {
  font-size: 13px;
  color: var(--ls-primary-text-color);
}

.config-actions {
  display: flex;
  gap: 8px;
}

.config-actions button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-actions button:first-child {
  background: var(--ls-primary-color);
  color: white;
}

.config-actions button:first-child:hover:not(:disabled) {
  opacity: 0.9;
}

.config-actions button:not(:first-child) {
  background: var(--ls-secondary-background-color);
  color: var(--ls-primary-text-color);
}

.config-actions button:not(:first-child):hover:not(:disabled) {
  background: var(--ls-border-color);
}

.proxy-panel {
  padding: 16px;
  background: var(--ls-primary-background-color);
  border-bottom: 1px solid var(--ls-border-color);
}

.proxy-settings-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.proxy-config-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.proxy-config-btn:hover {
  background: var(--ls-secondary-background-color);
}

.dark .proxy-config,
.dark .connection-status,
.dark .config-actions button:not(:first-child) {
  background: rgba(45, 52, 73, 0.8);
}

.dark .config-field input,
.dark .toggle-track {
  background: rgba(45, 52, 73, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}
```

---

## 5. testAPP.tsx 集成

```tsx
// src/test/testAPP.tsx
import { useState } from 'react';
import { ModeSwitch } from './components/ProxySettings/ModeSwitch';
import { ProxyConfig } from './components/ProxySettings/ProxyConfig';
import { logseq, setMode, getMode, connectProxy, disconnectProxy } from '../logseq';
import { logger } from '../logseq';

// 在组件内添加状态
const [apiMode, setApiMode] = useState<'mock' | 'proxy'>(getMode());
const [showProxyPanel, setShowProxyPanel] = useState(false);
const [proxyStatus, setProxyStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const [proxyError, setProxyError] = useState<string>('');

// 模式切换处理
const handleModeChange = (mode: 'mock' | 'proxy') => {
  setApiMode(mode);
  setMode(mode);
};

// 代理连接处理
const handleProxyConnect = async (url: string): Promise<boolean> => {
  setProxyStatus('connecting');
  try {
    const success = await connectProxy(url);
    setProxyStatus(success ? 'connected' : 'error');
    setProxyError(success ? '' : '连接失败');
    return success;
  } catch (error) {
    setProxyStatus('error');
    setProxyError(error.message);
    return false;
  }
};

const handleProxyDisconnect = () => {
  disconnectProxy();
  setProxyStatus('disconnected');
  setProxyError('');
};

// 在工具栏区域添加代理设置
return (
  <div id="app-container" className={`app ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
    {/* 工具栏 */}
    <div id="toolbar" className="toolbar-banner">
      <div className="toolbar-banner-content">
        <span className="toolbar-banner-text">工具栏演示</span>
        
        {/* 新增: 代理设置 */}
        <div className="proxy-settings-bar">
          <ModeSwitch 
            currentMode={apiMode} 
            onModeChange={handleModeChange} 
          />
          
          {apiMode === 'proxy' && (
            <button 
              className="proxy-config-btn"
              onClick={() => setShowProxyPanel(!showProxyPanel)}
            >
              🔧
            </button>
          )}
        </div>
        
        {/* ... 其他按钮 */}
      </div>
    </div>

    {/* 新增: 代理设置面板 (可折叠) */}
    {showProxyPanel && apiMode === 'proxy' && (
      <div className="proxy-panel">
        <ProxyConfig
          onConnect={handleProxyConnect}
          onDisconnect={handleProxyDisconnect}
          connectionStatus={proxyStatus}
          errorMessage={proxyError}
        />
      </div>
    )}

    {/* ... 其余内容 */}
  </div>
);
```

---

## 6. 使用说明

### 6.1 安装依赖

```bash
npm install logseq-proxy
```

### 6.2 启动 Logseq Proxy

```bash
# 确保 Logseq 正在运行，启用 API Server
# 设置 → Advanced → Enable API Server
```

### 6.3 测试模式切换

1. 打开 testAPP 页面
2. 点击模式切换开关选择 Mock 或 Proxy 模式
3. 在 Proxy 模式下，点击 🔧 按钮打开配置面板
4. 输入 Logseq 实例地址（默认 `http://localhost:12314`）
5. 点击「连接」按钮

### 6.4 调试

```typescript
// 查看当前 API 模式
console.log('Current API Mode:', getMode());

// 强制切换模式
setMode('proxy');

// 使用 logger
logger.log('Some message');
logger.error('Some error');
```

---

## 7. 相关文档

- [Architecture-Overview.md](./Architecture-Overview.md) - 整体架构
- [logseq-proxy npm](https://www.npmjs.com/package/logseq-proxy) - 官方文档

---

**文档结束**
