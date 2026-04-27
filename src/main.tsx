
import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import CommentApp from './components/Comment/CommentApp.tsx'
import { SettingsProvider } from './settings/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { toolbarItems as defaultToolbarItems } from './test/testData.ts'
import { getSettings } from './settings/index.ts'
import { getDocument, getWindow } from './logseq/utils.ts'
import { logger } from './lib/logger/logger.ts'
import { initI18n } from './translations/i18n.ts'
import { settingsModalCSS, modalCSS, toolbarCSS, inlineCommentCSS, cssConfigCSS } from './styles/index.ts'

// 加载CSS文件
const loadCSS = async () => {
  try {
    // CSS文件列表
    const cssFiles = [
      { name: 'settingsModal.css', content: settingsModalCSS },
      { name: 'modal.css', content: modalCSS },
      { name: 'toolbar.css', content: toolbarCSS },
      { name: 'inlineComment.css', content: inlineCommentCSS },
      { name: 'customsToolbarItems.css', content: cssConfigCSS }
    ];

    for (const cssFile of cssFiles) {
      try {
        // 优先尝试加载插件根目录下的CSS文件
        const response = await fetch(`./${cssFile.name}`);
        if (response.ok) {
          const cssContent = await response.text();
          logseqAPI.provideStyle(cssContent);
          logger.info(`Loaded CSS file from root: ${cssFile.name}`);
        } else {
          // 如果根目录下的CSS文件不存在，使用内置CSS作为兜底
          logger.info(`CSS file not found in root, using built-in CSS: ${cssFile.name}`);
          if (cssFile.content) {
            logseqAPI.provideStyle(cssFile.content);
            logger.info(`Loaded built-in CSS for ${cssFile.name}`);
          }
        }
      } catch (error) {
        // 加载失败时使用内置CSS作为兜底
        logger.warn(`Error loading CSS file from root ${cssFile.name}:`, error);
        if (cssFile.content) {
          logseqAPI.provideStyle(cssFile.content);
          logger.info(`Loaded built-in CSS for ${cssFile.name} (fallback)`);
        }
      }
    }
  } catch (error) {
    logger.error('Error in loadCSS:', error);
  }
};

const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'
const COMMENT_APP_ID = 'text-toolkit-comment-app'

interface RenderComponentProps {
  [key: string]: any
}

const renderComponent = (container: HTMLElement | null, Component: React.ComponentType<any>, props: RenderComponentProps = {}) => {
  if (container) {
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

// 存储设置面板的显示状态
let settingsModalOpen = false;

const showSettingUI = async () => {
  logseqAPI.provideUI({
    key: SETTINGS_ID,
    path: '#app-container',
    template: `<div id="${SETTINGS_ID}"></div>`,
  })

  setTimeout(() => {
    const container = getDocument().getElementById(SETTINGS_ID)
    if (container) {
      const currentSettings = getSettings()
      renderComponent(container, SettingsModal, {
        isOpen: settingsModalOpen, // 根据 settingsModalOpen 的值决定是否显示
        onClose: () => {
          settingsModalOpen = false;
          showSettingUI(); // 关闭后重新渲染以更新状态
        },
        theme: currentSettings.theme,
      })
    }
  }, 1)
}

const settingToggle = async () => {
  settingsModalOpen = !settingsModalOpen;
  showSettingUI();
}

const showCommentApp = async () => {
  logseqAPI.provideUI({
    key: COMMENT_APP_ID,
    path: '#app-container',
    template: `<div id="${COMMENT_APP_ID}"></div>`,
  })

  setTimeout(() => {
    const commentContainer = getDocument().getElementById(COMMENT_APP_ID)
    if (commentContainer) {
      renderComponent(commentContainer, CommentApp)
    }
  }, 1)
}

const showSelectToolbar = async () => {
  const currentSettings = getSettings()
  if (currentSettings.toolbar) {
    logseqAPI.provideUI({
      key: TOOLBAR_ID,
      path: '#app-container',
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })

    setTimeout(() => {
      const toolbarContainer = getDocument().getElementById(TOOLBAR_ID)
      const mainContentContainer = getDocument().getElementById('main-content-container')
      if (toolbarContainer && mainContentContainer) {
        const currentSettings = getSettings()
        // 使用ToolbarItems作为工具栏配置
        const toolbarItems = currentSettings.ToolbarItems || []
        
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: toolbarItems,
        })
      }
    }, 1)
  }
}

const main = async () => {
  try {
    // 动态加载CSS文件
    await loadCSS()

    // 初始化国际化
    await initI18n()
    logger.info('I18n initialized successfully')

    // 先提供设置切换函数
    logseqAPI.provideModel({ settingToggle })

    // 初始渲染设置组件（默认隐藏）
    await showSettingUI()

    logseqAPI.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <a class="button" id="ltt-settings-button"
        data-on-click="settingToggle"
        data-rect>
         <i class="ti ti-text-wrap"></i>
        </a>
      `,
    })

    await showSelectToolbar()
    await showCommentApp()
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  // 先加载CSS，然后再渲染组件
  loadCSS().then(() => {
    renderComponent(rootElement, TestApp)
    logseqAPI.ready(main).catch(console.error)
  }).catch(error => {
    console.error('Error loading CSS in test mode:', error)
    // 即使CSS加载失败，也渲染组件
    renderComponent(rootElement, TestApp)
    logseqAPI.ready(main).catch(console.error)
  })
} else { 
  logseqAPI.ready(main).catch(console.error)
}
