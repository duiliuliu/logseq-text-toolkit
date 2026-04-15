// 国际化支持
const i18n = {
  'zh-CN': {
    settings: '设置',
    loading: '加载设置中...',
    error: '加载设置失败',
    description: '管理应用程序的各项配置，每个区域可独立保存',
    tabs: {
      general: '⚙️ 通用设置',
      toolbar: '🛠️ 工具栏设置',
      advanced: '⚡ 高级设置'
    },
    general: {
      title: '通用设置',
      description: '配置应用的主题和语言',
      theme: '主题',
      language: '语言',
      save: '保存通用设置',
      saving: '保存中...'
    },
    toolbar: {
      title: '工具栏设置',
      description: '配置工具栏的外观和行为',
      enabled: '启用工具栏',
      showBorder: '显示边框',
      width: '宽度',
      height: '高度',
      hoverDelay: '悬停延时 (毫秒)',
      save: '保存工具栏设置',
      saving: '保存中...'
    },
    advanced: {
      title: '高级设置',
      description: '待添加的高级功能配置',
      placeholder: '此设置区域暂未配置',
      comingSoon: '敬请期待更多功能...'
    },
    theme: {
      light: '浅色',
      dark: '深色'
    },
    language: {
      'zh-CN': '简体中文',
      'en': 'English',
      'ja': '日本語'
    }
  },
  'en': {
    settings: 'Settings',
    loading: 'Loading settings...',
    error: 'Failed to load settings',
    description: 'Manage application configurations, each section can be saved independently',
    tabs: {
      general: '⚙️ General Settings',
      toolbar: '🛠️ Toolbar Settings',
      advanced: '⚡ Advanced Settings'
    },
    general: {
      title: 'General Settings',
      description: 'Configure app theme and language',
      theme: 'Theme',
      language: 'Language',
      save: 'Save General Settings',
      saving: 'Saving...'
    },
    toolbar: {
      title: 'Toolbar Settings',
      description: 'Configure toolbar appearance and behavior',
      enabled: 'Enable Toolbar',
      showBorder: 'Show Border',
      width: 'Width',
      height: 'Height',
      hoverDelay: 'Hover Delay (ms)',
      save: 'Save Toolbar Settings',
      saving: 'Saving...'
    },
    advanced: {
      title: 'Advanced Settings',
      description: 'Advanced features configuration coming soon',
      placeholder: 'This settings area is not configured yet',
      comingSoon: 'More features coming soon...'
    },
    theme: {
      light: 'Light',
      dark: 'Dark'
    },
    language: {
      'zh-CN': 'Simplified Chinese',
      'en': 'English',
      'ja': 'Japanese'
    }
  },
  'ja': {
    settings: '設定',
    loading: '設定を読み込んでいます...',
    error: '設定の読み込みに失敗しました',
    description: 'アプリケーションの設定を管理します。各セクションは独立して保存できます。',
    tabs: {
      general: '⚙️ 一般設定',
      toolbar: '🛠️ ツールバー設定',
      advanced: '⚡ 詳細設定'
    },
    general: {
      title: '一般設定',
      description: 'アプリのテーマと言語を設定します',
      theme: 'テーマ',
      language: '言語',
      save: '一般設定を保存',
      saving: '保存中...'
    },
    toolbar: {
      title: 'ツールバー設定',
      description: 'ツールバーの外観と動作を設定します',
      enabled: 'ツールバーを有効にする',
      showBorder: '枠線を表示',
      width: '幅',
      height: '高さ',
      hoverDelay: 'ホバー遅延 (ミリ秒)',
      save: 'ツールバー設定を保存',
      saving: '保存中...'
    },
    advanced: {
      title: '詳細設定',
      description: '追加予定の高度な機能設定',
      placeholder: 'この設定エリアはまだ設定されていません',
      comingSoon: '近日追加予定...'
    },
    theme: {
      light: 'ライト',
      dark: 'ダーク'
    },
    language: {
      'zh-CN': '简体中文',
      'en': 'English',
      'ja': '日本語'
    }
  }
};

const getTranslation = (key, lang = 'zh-CN') => {
  const keys = key.split('.');
  let result = i18n[lang] || i18n['zh-CN'];
  
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return key; // 如果没有找到翻译，返回原始键
    }
  }
  
  return result;
};

export { i18n, getTranslation };
