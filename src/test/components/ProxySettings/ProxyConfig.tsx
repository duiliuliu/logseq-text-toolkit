import React, { useState } from 'react';
import logger from '../../../logseq/logger';
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
