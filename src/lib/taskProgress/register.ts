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
import { getSettingsWithSystem } from '../../settings'
import logger from '../logger/index'

const MACRO_PREFIX = ':taskprogress'
const PLUGIN_ID = 'text-toolkit-taskprogress'

const DISPLAY_TYPE_MAP: Record<string, ProgressDisplayType> = {
  'mini-circle': 'mini-circle',
  'minicircle': 'mini-circle',
  '微型圆环': 'mini-circle',
  'mini circle': 'mini-circle',
  'dot-matrix': 'dot-matrix',
  'dotmatrix': 'dot-matrix',
  '点阵进度': 'dot-matrix',
  'dot matrix': 'dot-matrix',
  'status-cursor': 'status-cursor',
  'statuscursor': 'status-cursor',
  '状态光标': 'status-cursor',
  'status cursor': 'status-cursor',
  'progress-capsule': 'progress-capsule',
  'progresscapsule': 'progress-capsule',
  '进度胶囊': 'progress-capsule',
  'progress capsule': 'progress-capsule',
  'step-progress': 'step-progress',
  'stepprogress': 'step-progress',
  '阶梯进度': 'step-progress',
  'step progress': 'step-progress',
}

let TaskProgressComponent: React.FC<any> | null = null

export function setTaskProgressComponent(component: React.FC<any>) {
  TaskProgressComponent = component
}

async function renderProgress(blockId: string, slot: string, displayTypeArg?: string): Promise<boolean> {
  try {
    const settings = await getSettingsWithSystem()
    
    let displayType: ProgressDisplayType = settings?.taskProgress?.defaultDisplayType || 'mini-circle'
    
    if (displayTypeArg) {
      const normalizedArg = displayTypeArg.toLowerCase().trim()
      if (DISPLAY_TYPE_MAP[normalizedArg]) {
        displayType = DISPLAY_TYPE_MAP[normalizedArg]
      }
    }
    
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

    const lang = settings?.language || 'zh-CN'

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
    const [type, displayTypeArg] = payload.arguments || []

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
      await renderProgress(blockId, slot, displayTypeArg)
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
