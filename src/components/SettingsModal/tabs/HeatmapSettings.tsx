import React from 'react';
import { HeatmapSettings } from '../../../settings/types';

interface HeatmapSettingsProps {
  settings: HeatmapSettings;
  onUpdate: (settings: Partial<HeatmapSettings>) => void;
}

const HeatmapSettings: React.FC<HeatmapSettingsProps> = ({ settings, onUpdate }) => {
  const handleToggle = (key: keyof HeatmapSettings) => {
    if (typeof settings[key] === 'boolean') {
      onUpdate({ [key]: !settings[key] });
    }
  };

  const handleSelect = (key: keyof HeatmapSettings, value: string) => {
    onUpdate({ [key]: value });
  };

  const handleColorChange = (key: 'minColor' | 'maxColor', value: string) => {
    onUpdate({
      colorScheme: {
        ...settings.colorScheme,
        [key]: value,
      },
    });
  };

  return (
    <div className="heatmap-settings">
      <div className="settings-section">
        <h3>Heatmap Settings</h3>
        
        <div className="settings-row">
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={() => handleToggle('enabled')}
            />
            <span>Enable Heatmap</span>
          </label>
          <p className="settings-description">Show heatmap statistics on your journal pages</p>
        </div>

        <div className="settings-row">
          <label className="settings-label">Default View</label>
          <select
            value={settings.defaultViewType}
            onChange={(e) => handleSelect('defaultViewType', e.target.value)}
            className="settings-select"
          >
            <option value="year">Year View</option>
            <option value="month">Month View</option>
            <option value="week">Week View</option>
          </select>
        </div>

        <div className="settings-row">
          <label className="settings-label">Default Display Mode</label>
          <select
            value={settings.defaultDisplayMode}
            onChange={(e) => handleSelect('defaultDisplayMode', e.target.value)}
            className="settings-select"
          >
            <option value="full">Full Mode</option>
            <option value="basic">Basic Mode</option>
            <option value="minimal">Minimal Mode</option>
          </select>
        </div>

        <div className="settings-row">
          <label className="settings-label">Default Color Formula</label>
          <select
            value={settings.defaultColorFormula}
            onChange={(e) => handleSelect('defaultColorFormula', e.target.value)}
            className="settings-select"
          >
            <option value="simple">Simple (Block Count)</option>
            <option value="weighted">Weighted (With Children)</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Color Scheme</h3>
        
        <div className="settings-row">
          <label className="settings-label">Minimum Color</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={settings.colorScheme.minColor}
              onChange={(e) => handleColorChange('minColor', e.target.value)}
              className="color-input"
            />
            <span className="color-value">{settings.colorScheme.minColor}</span>
          </div>
        </div>

        <div className="settings-row">
          <label className="settings-label">Maximum Color</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={settings.colorScheme.maxColor}
              onChange={(e) => handleColorChange('maxColor', e.target.value)}
              className="color-input"
            />
            <span className="color-value">{settings.colorScheme.maxColor}</span>
          </div>
        </div>

        <div className="color-preview">
          <div className="color-preview-label">Preview:</div>
          <div className="color-gradient">
            <div
              className="color-cell"
              style={{ backgroundColor: settings.colorScheme.minColor }}
            />
            <div className="color-cell" style={{ backgroundColor: '#e0e7ff' }} />
            <div className="color-cell" style={{ backgroundColor: '#c7d2fe' }} />
            <div className="color-cell" style={{ backgroundColor: '#a5b4fc' }} />
            <div className="color-cell" style={{ backgroundColor: settings.colorScheme.maxColor }} />
          </div>
        </div>
      </div>

      <style>{`
        .heatmap-settings {
          padding: 16px;
        }
        
        .settings-section {
          margin-bottom: 24px;
        }
        
        .settings-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--ls-primary-text-color, #1f2937);
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--ls-border-color, #e5e7eb);
        }
        
        .settings-row {
          margin-bottom: 16px;
        }
        
        .settings-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--ls-primary-text-color, #374151);
          margin-bottom: 6px;
        }
        
        .settings-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        
        .settings-description {
          font-size: 12px;
          color: var(--ls-secondary-text-color, #6b7280);
          margin: 0;
          padding-left: 24px;
        }
        
        .settings-select {
          width: 100%;
          max-width: 300px;
          padding: 8px 12px;
          font-size: 13px;
          border: 1px solid var(--ls-border-color, #e5e7eb);
          border-radius: 6px;
          background: var(--ls-secondary-background-color, #fff);
          color: var(--ls-primary-text-color, #374151);
          cursor: pointer;
        }
        
        .settings-select:focus {
          outline: none;
          border-color: var(--ls-primary-color, #3b82f6);
        }
        
        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .color-input {
          width: 40px;
          height: 40px;
          border: 1px solid var(--ls-border-color, #e5e7eb);
          border-radius: 6px;
          cursor: pointer;
          padding: 2px;
        }
        
        .color-value {
          font-family: monospace;
          font-size: 12px;
          color: var(--ls-secondary-text-color, #6b7280);
        }
        
        .color-preview {
          margin-top: 16px;
        }
        
        .color-preview-label {
          font-size: 12px;
          color: var(--ls-secondary-text-color, #6b7280);
          margin-bottom: 8px;
        }
        
        .color-gradient {
          display: flex;
          gap: 4px;
        }
        
        .color-cell {
          width: 40px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--ls-border-color, #e5e7eb);
        }
      `}</style>
    </div>
  );
};

export default HeatmapSettings;