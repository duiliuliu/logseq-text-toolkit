/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq API 注册 - 宏渲染器和斜杠命令
 */

import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { calculateTaskProgress } from './taskQuery'
import { ProgressDisplayType } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'
import { logger } from '../logger/logger'
import { SupportedLanguage } from '../../translations/translations'

const MACRO_PREFIX = ':taskprogress'
const PLUGIN_ID = 'text-toolkit-taskprogress'

let TaskProgressComponent: React.FC<any> | null = null

export function setTaskProgressComponent(component: React.FC<any>) {
  TaskProgressComponent = component
}

async function renderProgress(blockId: string, slot: string): Promise<boolean> {
  try {
    const settings = getSettings()
    const displayType: ProgressDisplayType = settings?.taskProgress?.defaultDisplayType || 'mini-circle'
    const config = settings?.taskProgress?.displayOptions?.[displayType]
    const showLabel = settings?.taskProgress?.showLabel ?? true
    const labelFormat = settings?.taskProgress?.labelFormat || 'fraction'
    const nestingLevel = settings?.taskProgress?.nestingLevel ?? 1
    const onlyLeaves = settings?.taskProgress?.onlyLeaves ?? false
    const showNestingIndicator = settings?.taskProgress?.showNestingIndicator ?? false
    
    const progressData = await calculateTaskProgress(blockId, { nestingLevel, onlyLeaves })
    
    if (!progressData) {
      logseqAPI.provideUI({
        key: PLUGIN_ID + '__' + slot,
        slot,
        reset: true,
        template: '',
      })
      return false
    }
    
    let lang: SupportedLanguage = 'zh-CN'
    const settingsLang = settings?.language
    if (settingsLang === 'en' || settingsLang === 'ja' || settingsLang === 'zh-CN') {
      lang = settingsLang
    } else if (settingsLang === 'system') {
      const browserLang = navigator.language
      if (browserLang.startsWith('ja')) {
        lang = 'ja'
      } else if (browserLang.startsWith('en')) {
        lang = 'en'
      } else {
        lang = 'zh-CN'
      }
    }
    
    if (!TaskProgressComponent) {
      logger.warn('[TaskProgress] Component not registered')
      return false
    }
    
    const template = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TaskProgressComponent, {
        progressData,
        displayType,
        config: { ...config, showLabel, labelFormat },
        lang,
        nestingLevel,
        onlyLeaves,
        showNestingIndicator,
      })
    )
    
    logseqAPI.provideUI({
      key: PLUGIN_ID + '__' + slot,
      slot,
      reset: true,
      template,
    })
    
    return true
  } catch (err) {
    logger.error('[TaskProgress] Render error:', err)
    return false
  }
}

export function registerTaskProgress(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const [type] = payload.arguments || []
    
    if (!type || !type.startsWith(MACRO_PREFIX)) {
      return
    }
    
    let blockId: string | null = null
    
    if (type === MACRO_PREFIX) {
      blockId = payload.uuid
    } else {
      blockId = type.substring(MACRO_PREFIX.length + 1)
    }
    
    if (blockId) {
      await renderProgress(blockId, slot)
    }
  })
  
  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Task Progress',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${MACRO_PREFIX}}}`
        )
      }
    }
  )
  
  logger.info('[TaskProgress] Registered successfully')
}
