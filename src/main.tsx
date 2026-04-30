/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口文件
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import CommentApp from './components/Comment/CommentApp.tsx'
import TaskProgress from './components/TaskProgress/TaskProgress.tsx'
import { SettingsProvider } from './settings/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { getSettings } from './settings/index.ts'
import { getDocument } from './logseq/utils.ts'
import { logger } from './lib/logger/logger.ts'
import { initI18n } from './translations/i18n.ts'
import { registerTaskProgress, setTaskProgressComponent } from './lib/taskProgress/register.ts'
import { settingsModalCSS, modalCSS, toolbarCSS, inlineCommentCSS, cssConfigCSS, taskProgressCSS } from './styles/index.ts'

const loadCSS = async () => {
  try {
    const cssFiles = [
      { name: 'settingsModal.css', content: settingsModalCSS },
      { name: 'modal.css', content: modalCSS },
      { name: 'toolbar.css', content: toolbarCSS },
      { name: 'inlineComment.css', content: inlineCommentCSS },
      { name: 'customsToolbarItems.css', content: cssConfigCSS },
      { name: 'taskProgress.css', content: taskProgressCSS }
    ];

    for (const cssFile of cssFiles) {
      try {
        const response = await fetch(`./${cssFile.name}`);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/css')) {
            const cssContent = await response.text();
            if (cssContent.trim()) {
              logseqAPI.provideStyle(cssContent);
              logger.info(`Loaded CSS file from root: ${cssFile.name}`);
            } else {
              logger.info(`CSS file is empty in root, using built-in CSS: ${cssFile.name}`);
              if (cssFile.content) {
                logseqAPI.provideStyle(cssFile.content);
                logger.info(`Loaded built-in CSS for ${cssFile.name}`);
              }
            }
          } else {
            logger.info(`Response is not CSS, using built-in CSS: ${cssFile.name}`);
            if (cssFile.content) {
              logseqAPI.provideStyle(cssFile.content);
              logger.info(`Loaded built-in CSS for ${cssFile.name}`);
            }
          }
        } else {
          logger.info(`CSS file not found in root, using built-in CSS: ${cssFile.name}`);
          if (cssFile.content) {
            logseqAPI.provideStyle(cssFile.content);
            logger.info(`Loaded built-in CSS for ${cssFile.name}`);
          }
        }
      } catch (error) {
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
        isOpen: settingsModalOpen,
        onClose: () => {
          settingsModalOpen = false;
          showSettingUI();
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
    await loadCSS()

    await initI18n()
    logger.info('I18n initialized successfully')

    logseqAPI.provideModel({ settingToggle })

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
    
    // 注册任务进度功能
    setTaskProgressComponent(TaskProgress)
    registerTaskProgress()
    logger.info('Task progress registered successfully')
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <TestApp />
      </React.StrictMode>
    )
  }
  logseqAPI.ready(main).catch((err) => logger.error('Plugin ready error:', err))
} else { 
  logseqAPI.ready(main).catch((err) => logger.error('Plugin ready error:', err))
}
