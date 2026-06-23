import React from 'react';
import logger from '../../../logseq/logger';
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
