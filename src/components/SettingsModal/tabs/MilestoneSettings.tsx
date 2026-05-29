/**
 * Milestone Settings Tab
 */

import { t } from '../../../translations/i18n.ts';
import CustomSelect from '../../CustomSelect/index.tsx';
import { Settings } from '../../../settings/types.ts';
import { TabComponentProps } from '../index.tsx';

const styleOptions = [
  { value: 'capsule', label: t('settings.milestone.styleCapsule', '胶囊') },
  { value: 'badge', label: t('settings.milestone.styleBadge', '徽章') },
  { value: 'track', label: t('settings.milestone.styleTrack', '轨道') },
  { value: 'card', label: t('settings.milestone.styleCard', '卡片') },
  { value: 'compact', label: t('settings.milestone.styleCompact', '紧凑') },
];

function MilestoneSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const milestone = settings.milestone || {
    enabled: true,
    defaultStyle: 'capsule',
    showLabels: true,
    showProgress: true,
  };

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.milestoneDescription', '配置里程碑组件的默认行为和显示样式。')}
      </p>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.enabled', '启用里程碑功能')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.enabled || false}
            onChange={(e) => handleSettingChange('milestone.enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.defaultStyle', '默认显示样式')}</label>
        <CustomSelect
          options={styleOptions}
          value={milestone.defaultStyle || 'capsule'}
          onChange={(value) => handleSettingChange('milestone.defaultStyle', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.showLabels', '显示标签')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.showLabels ?? true}
            onChange={(e) => handleSettingChange('milestone.showLabels', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.showProgress', '显示进度')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.showProgress ?? true}
            onChange={(e) => handleSettingChange('milestone.showProgress', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', '保存中...') : t('settings.saveMilestoneSettings', '保存里程碑设置')}
        </button>
      </div>
    </div>
  );
}

export default MilestoneSettings;
