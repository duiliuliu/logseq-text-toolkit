# Proxy Logseq 设计方案

**版本**: v1.0  
**日期**: 2026-05-12  
**状态**: 设计中

---

## 1. 概述

### 1.1 项目背景

Text Toolkit 插件在开发过程中需要进行大量测试，目前使用 Mock 数据模拟 Logseq API。但 Mock 数据与真实环境存在差异，可能导致：
- 测试结果与实际运行不一致
- 无法测试真实数据场景
- 开发体验受限

为了提升开发效率和测试准确性，我们需要集成真实的 Logseq API 代理。

### 1.2 核心需求

| 需求编号 | 需求描述 | 优先级 |
|---------|---------|-------|
| PROXY-001 | 集成 logseq-proxy 包，连接真实 Logseq 实例 | P0 |
| PROXY-002 | 在 testAPP 页面添加代理设置 UI | P0 |
| PROXY-003 | 支持手动切换 mock 模式和代理模式 | P0 |
| PROXY-004 | 保持 API 接口一致性，透明切换 | P1 |
| PROXY-005 | 支持本地和远程 Logseq 实例连接 | P1 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Proxy Logseq 架构                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  testAPP 页面 (开发测试入口)                                │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │  ModeSwitch: [Mock] ←→ [Proxy]                       │ │   │
│  │  │  ProxySettings: URL 输入、连接状态、错误提示          │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LogseqAPIWrapper (统一 API 入口)                          │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │  mode: 'mock' | 'proxy'                              │ │   │
│  │  │  currentMode: 当前模式                                │ │   │
│  │  │  setMode(mode): 切换模式                             │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐   │   │
│  │  │  MockLogseqAPI      │    │  ProxyLogseqAPI          │   │   │
│  │  │  (现有 Mock 实现)    │    │  (logseq-proxy 封装)    │   │   │
│  │  │  - 使用本地测试数据  │    │  - 连接真实 Logseq 实例  │   │   │
│  │  │  - 无需网络连接      │    │  - 支持本地/远程实例     │   │   │
│  │  │  - 适合单元测试      │    │  - 适合集成测试          │   │   │
│  │  └─────────────────────┘    └─────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  logseq-proxy (外部依赖)                                   │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │  npm: logseq-proxy                                    │ │   │
│  │  │  功能: 提供 Logseq API 的 HTTP 代理接口               │ │   │
│  │  │  文档: https://www.npmjs.com/package/logseq-proxy     │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 文件结构

```
src/
├── logseq/                          # 现有 Logseq API 封装
│   ├── index.ts                     # API 入口
│   ├── editor.ts                    # Editor API
│   ├── app.ts                       # App API
│   ├── ui.ts                       # UI API
│   ├── logger.ts                    # Logger API
│   ├── utils.ts                    # 工具函数
│   │
│   ├── mock/                       # 现有 Mock 实现
│   │   ├── index.ts               # Mock 入口
│   │   ├── app.ts
│   │   ├── editor.ts
│   │   ├── ui.ts
│   │   └── logger.ts
│   │
│   └── proxy/                      # 新增: Proxy 实现
│       ├── index.ts               # Proxy 入口
│       ├── client.ts              # logseq-proxy 客户端
│       ├── config.ts              # 代理配置
│       ├── adapter.ts             # API 适配器
│       └── types.ts               # 类型定义
│
├── test/
│   ├── testAPP.tsx                # 扩展: 添加代理设置 UI
│   └── components/
│       └── ProxySettings/         # 新增: 代理设置组件
│           ├── index.tsx
│           ├── ModeSwitch.tsx     # 模式切换开关
│           ├── ProxyConfig.tsx    # 代理配置表单
│           ├── ConnectionStatus.tsx # 连接状态显示
│           └── proxySettings.css  # 样式文件
│
└── settings/
    ├── defaultSettings.ts          # 扩展: 添加代理设置
    └── types.ts                  # 扩展: 添加代理类型
```

---

## 3. 核心设计

### 3.1 API 模式切换机制

```typescript
// src/logseq/index.ts
type APIMode = 'mock' | 'proxy';

class LogseqAPIWrapper {
  private mode: APIMode = 'mock';
  private mockAPI: MockLogseqAPI;
  private proxyAPI: ProxyLogseqAPI;

  constructor() {
    this.mockAPI = new MockLogseqAPI();
    this.proxyAPI = new ProxyLogseqAPI();
  }

  get currentMode(): APIMode {
    return this.mode;
  }

  setMode(mode: APIMode): void {
    this.mode = mode;
    console.log(`[LogseqAPI] Switched to ${mode} mode`);
  }

  // Editor API
  get Editor() {
    return this.mode === 'mock' ? this.mockAPI.Editor : this.proxyAPI.Editor;
  }

  // App API
  get App() {
    return this.mode === 'mock' ? this.mockAPI.App : this.proxyAPI.App;
  }

  // DB API
  get DB() {
    return this.mode === 'mock' ? this.mockAPI.DB : this.proxyAPI.DB;
  }
}

export const logseqAPI = new LogseqAPIWrapper();
```

### 3.2 Proxy API 实现

基于 logseq-proxy 包封装：

```typescript
// src/logseq/proxy/client.ts
import { LogseqProxyClient } from 'logseq-proxy';

export interface ProxyConfig {
  baseURL: string;           // Logseq 实例地址
  apiKey?: string;           // API 密钥（如果需要）
  timeout?: number;          // 请求超时时间
  retryCount?: number;       // 重试次数
}

export class ProxyClient {
  private client: LogseqProxyClient;
  private config: ProxyConfig;
  private connected: boolean = false;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.client = new LogseqProxyClient({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      timeout: config.timeout || 10000,
    });
  }

  async connect(): Promise<boolean> {
    try {
      const health = await this.client.health();
      this.connected = health.status === 'ok';
      return this.connected;
    } catch (error) {
      console.error('[ProxyClient] Connection failed:', error);
      this.connected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  // Editor API
  async getBlock(id: string) {
    return this.client.getBlock(id);
  }

  async getBlockChildren(id: string) {
    return this.client.getBlockChildren(id);
  }

  async createBlock(parent: string, content: string, options?: any) {
    return this.client.createBlock(parent, content, options);
  }

  async updateBlock(id: string, content: string) {
    return this.client.updateBlock(id, content);
  }

  async deleteBlock(id: string) {
    return this.client.deleteBlock(id);
  }

  // App API
  async queryElementById(id: string) {
    return this.client.queryElement(id);
  }

  // DB API
  async datascriptQuery(query: string) {
    return this.client.query(query);
  }
}
```

### 3.3 API 适配器

确保 Proxy API 与 Mock API 接口一致：

```typescript
// src/logseq/proxy/adapter.ts
import { ProxyClient } from './client';

export class ProxyEditorAdapter {
  constructor(private client: ProxyClient) {}

  async getBlock(id: string) {
    const block = await this.client.getBlock(id);
    // 适配返回格式，确保与 Mock 一致
    return block ? {
      uuid: block.uuid,
      content: block.content,
      children: block.children || [],
      properties: block.properties || {},
    } : null;
  }

  async getBlockChildren(id: string) {
    const children = await this.client.getBlockChildren(id);
    return children.map(block => ({
      uuid: block.uuid,
      content: block.content,
      children: [],
      properties: block.properties || {},
    }));
  }

  async createBlock(parent: string, content: string, options?: any) {
    const result = await this.client.createBlock(parent, content, options);
    return {
      uuid: result.uuid,
      content: result.content,
    };
  }

  // ... 其他方法类似
}

export class ProxyAppAdapter {
  constructor(private client: ProxyClient) {}

  async queryElementById(id: string) {
    // Proxy 模式下可能需要特殊处理
    return document.getElementById(id);
  }

  // ... 其他方法
}

export class ProxyDBAdapter {
  constructor(private client: ProxyClient) {}

  async datascriptQuery(query: string) {
    return this.client.datascriptQuery(query);
  }
}
```

---

## 4. UI 设计

### 4.1 代理设置面板

在 testAPP 页面添加代理设置区域：

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔧 Proxy Settings                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  模式切换:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  [Mock] ←→ [Proxy]                                         │  │
│  │   ●                                                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  代理配置 (仅 Proxy 模式):                                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Logseq 实例地址:                                          │  │
│  │  ┌───────────────────────────────────────────────────────┐ │  │
│  │  │ http://localhost:12314                                 │ │  │
│  │  └───────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  连接状态:                                                 │  │
│  │  ┌───────────────────────────────────────────────────────┐ │  │
│  │  │ ● 已连接 (http://localhost:12314)                     │ │  │
│  │  └───────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  [连接]  [断开]  [测试连接]                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 ModeSwitch 组件

```tsx
// src/test/components/ProxySettings/ModeSwitch.tsx
import { useState } from 'react';
import './proxySettings.css';

interface ModeSwitchProps {
  currentMode: 'mock' | 'proxy';
  onModeChange: (mode: 'mock' | 'proxy') => void;
}

export function ModeSwitch({ currentMode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch">
      <span className={`mode-label ${currentMode === 'mock' ? 'active' : ''}`}>
        Mock
      </span>
      
      <button 
        className="mode-toggle"
        onClick={() => onModeChange(currentMode === 'mock' ? 'proxy' : 'mock')}
      >
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

### 4.3 ProxyConfig 组件

```tsx
// src/test/components/ProxySettings/ProxyConfig.tsx
import { useState } from 'react';
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
    const success = await onConnect(url);
    if (!success) {
      alert('连接失败，请检查 Logseq 实例地址');
    }
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
        <button onClick={() => onConnect(url)}>
          测试连接
        </button>
      </div>
    </div>
  );
}
```

### 4.4 testAPP.tsx 集成

在 testAPP 页面添加代理设置：

```tsx
// src/test/testAPP.tsx (第 282 行附近)
import { ModeSwitch } from './components/ProxySettings/ModeSwitch';
import { ProxyConfig } from './components/ProxySettings/ProxyConfig';
import { logseqAPI } from '../logseq';
import { proxyClient } from '../logseq/proxy';

// 添加状态管理
const [apiMode, setApiMode] = useState<'mock' | 'proxy'>('mock');
const [proxyStatus, setProxyStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const [proxyError, setProxyError] = useState<string>('');

// 模式切换处理
const handleModeChange = (mode: 'mock' | 'proxy') => {
  setApiMode(mode);
  logseqAPI.setMode(mode);
};

// 代理连接处理
const handleProxyConnect = async (url: string): Promise<boolean> => {
  setProxyStatus('connecting');
  try {
    const success = await proxyClient.connect(url);
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
  proxyClient.disconnect();
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

## 5. 样式设计

### 5.1 样式文件

**文件**: `src/test/components/ProxySettings/proxySettings.css`

```css
/* Mode Switch */
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

/* Proxy Config */
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

/* Connection Status */
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

.status-indicator.connected {
  color: #10b981;
}

.status-indicator.connecting {
  color: #f59e0b;
}

.status-indicator.disconnected {
  color: #6b7280;
}

.status-indicator.error {
  color: #ef4444;
}

.status-text {
  font-size: 13px;
  color: var(--ls-primary-text-color);
}

/* Actions */
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

/* Proxy Panel */
.proxy-panel {
  padding: 16px;
  background: var(--ls-primary-background-color);
  border-bottom: 1px solid var(--ls-border-color);
}

/* Proxy Settings Bar */
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

/* Dark Theme */
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

.dark .toggle-track {
  background: rgba(45, 52, 73, 0.8);
}
```

---

## 6. 集成步骤

### 6.1 安装依赖

```bash
npm install logseq-proxy
```

### 6.2 配置 package.json

```json
{
  "dependencies": {
    "logseq-proxy": "^1.0.0"
  }
}
```

### 6.3 初始化 Proxy 模块

在 `src/logseq/proxy/index.ts` 中：

```typescript
import { ProxyClient } from './client';
import { ProxyEditorAdapter } from './adapter';

export class ProxyLogseqAPI {
  private client: ProxyClient;
  public Editor: ProxyEditorAdapter;
  public App: any;
  public DB: any;

  constructor() {
    this.client = new ProxyClient({
      baseURL: 'http://localhost:12314',
      timeout: 10000,
    });
    
    this.Editor = new ProxyEditorAdapter(this.client);
    this.App = {};
    this.DB = {
      datascriptQuery: (query: string) => this.client.datascriptQuery(query),
    };
  }

  async connect(url: string): Promise<boolean> {
    this.client = new ProxyClient({ baseURL: url });
    return this.client.connect();
  }

  disconnect(): void {
    this.client.disconnect();
  }

  get isConnected(): boolean {
    return this.client.isConnected;
  }
}

export const proxyLogseqAPI = new ProxyLogseqAPI();
```

---

## 7. 使用说明

### 7.1 启动 Logseq Proxy

确保 Logseq 正在运行，并启动 proxy 服务：

```bash
# 方式1: 使用 npx
npx logseq-proxy

# 方式2: 如果 logseq-proxy 已全局安装
logseq-proxy --port 12314

# 方式3: 在 Logseq 中启用 API
# 设置 → Advanced → Enable API Server
```

### 7.2 测试模式切换

1. 打开 testAPP 页面
2. 点击模式切换开关选择 Mock 或 Proxy 模式
3. 在 Proxy 模式下，点击 🔧 按钮打开配置面板
4. 输入 Logseq 实例地址（默认 `http://localhost:12314`）
5. 点击「连接」按钮
6. 等待连接成功后，即可使用真实 Logseq 数据进行测试

### 7.3 调试技巧

```typescript
// 查看当前 API 模式
console.log('Current API Mode:', logseqAPI.currentMode);

// 强制切换模式
logseqAPI.setMode('proxy');

// 检查 Proxy 连接状态
console.log('Proxy Connected:', proxyLogseqAPI.isConnected);
```

---

## 8. 技术风险与应对

| 风险 | 影响 | 概率 | 应对策略 |
|-----|------|------|---------|
| Logseq API 版本不兼容 | 高 | 低 | 适配器模式，兼容不同版本 |
| 网络延迟影响测试 | 中 | 中 | Mock 模式作为备选 |
| Proxy 连接不稳定 | 中 | 中 | 重试机制、错误提示 |
| CORS 问题 | 高 | 中 | 使用 logseq-proxy 官方方案 |

---

## 9. 相关文档

- [Architecture-Overview.md](../Architecture-Overview.md) - 整体架构
- [logseq-proxy npm](https://www.npmjs.com/package/logseq-proxy) - 官方文档
- [DEVELOPMENT.md](../DEVELOPMENT.md) - 开发指南

---

**文档结束**
