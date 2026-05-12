import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import { Switch } from '../Switch';
import './ProxySettings.css';

interface ProxySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiMode: 'mock' | 'proxy';
  onModeChange: (mode: 'mock' | 'proxy') => void;
  proxyUrl: string;
  onProxyUrlChange: (url: string) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
}

export const ProxySettings: React.FC<ProxySettingsProps> = ({
  isOpen,
  onClose,
  apiMode,
  onModeChange,
  proxyUrl,
  onProxyUrlChange,
  onConnect,
  onDisconnect,
  connectionStatus,
  errorMessage,
}) => {
  const handleSwitchMode = (checked: boolean) => {
    onModeChange(checked ? 'proxy' : 'mock');
  };

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return '●';
      case 'connecting':
        return '◐';
      case 'disconnected':
        return '○';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `已连接 (${proxyUrl})`;
      case 'connecting':
        return '连接中...';
      case 'disconnected':
        return '未连接';
      case 'error':
        return `错误: ${errorMessage}`;
      default:
        return '未连接';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#10b981';
      case 'connecting':
        return '#f59e0b';
      case 'disconnected':
        return '#6b7280';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      title="🔗 Proxy 设置"
      isOpen={isOpen}
      onClose={onClose}
      width="500px"
    >
      <div className="proxy-settings-modal">
        <div className="setting-section">
          <div className="setting-header">
            <h3>API 模式</h3>
            <Switch
              checked={apiMode === 'proxy'}
              onChange={handleSwitchMode}
            />
          </div>
          <p className="setting-description">
            {apiMode === 'mock' 
              ? 'Mock 模式：使用模拟数据进行开发测试' 
              : 'Proxy 模式：连接到真实的 Logseq 实例'
            }
          </p>
        </div>

        {apiMode === 'proxy' && (
          <div className="setting-section">
            <h3>Logseq 实例地址</h3>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => onProxyUrlChange(e.target.value)}
              placeholder="http://localhost:12314"
              disabled={connectionStatus === 'connected'}
              className="proxy-url-input"
            />

            <div className="connection-status">
              <span 
                className="status-indicator"
                style={{ color: getStatusColor() }}
              >
                {getStatusIndicator()}
              </span>
              <span className="status-text">{getStatusText()}</span>
            </div>

            <div className="connection-actions">
              <button
                onClick={onConnect}
                disabled={
                  connectionStatus === 'connected' || 
                  connectionStatus === 'connecting'
                }
                className="action-btn primary"
              >
                连接
              </button>
              <button
                onClick={onDisconnect}
                disabled={connectionStatus !== 'connected'}
                className="action-btn secondary"
              >
                断开
              </button>
            </div>
          </div>
        )}

        <div className="setting-section info-section">
          <h3>ℹ️ 使用说明</h3>
          <ul className="info-list">
            <li>在 Logseq 中启用 API Server (设置 → Advanced → Enable API Server)</li>
            <li>确保 Logseq 正在运行</li>
            <li>在 Mock 模式下，使用模拟数据进行开发</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
