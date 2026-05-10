/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Logseq API 注册 - 宏渲染器和斜杠命令
 */

import { calculateTaskProgress } from './taskQuery'
import { ProgressDisplayType } from '../../components/TaskProgress/types'
import TaskProgress from '../../components/TaskProgress/TaskProgress'
import { logseqAPI } from '../../logseq'
import { getDocument } from '../../logseq/utils'
import { getSettingsWithSystem } from '../../settings'
import { renderComponent, registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render'
import logger from '../logger'

const MACRO_PREFIX = ':taskprogress'
const PLUGIN_ID = 'text-toolkit-taskprogress'

registerRendererArgModel(MACRO_PREFIX, { positional: ['display', 'size'] })

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
    const fireworksOnComplete = settings?.taskProgress?.fireworksOnComplete ?? true

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

    const containerId = PLUGIN_ID + slot

    logseqAPI.provideUI({
      key: PLUGIN_ID + '__' + slot,
      slot,
      reset: true,
      template: `<div id="${containerId}"></div>`,
    })

    setTimeout(() => {
      const container = getDocument().getElementById(containerId)
      if (container) {
        renderComponent(container, TaskProgress, {
          progressData,
          displayType,
          config: { ...config, showLabel, labelFormat, fireworksOnComplete },
          lang,
          nestingLevel,
          onlyLeaves,
          showNestingIndicator,
        })
      }
    }, 1)

    return true
  } catch (err) {
    logger.error('❌ TaskProgress: Render error', err)
    return false
  }
}

export function registerTaskProgress(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments)
    const type = split?.type
    const argMap = type ? parseRendererArgs(type, split?.tokens || []) : {}
    const displayTypeArg = argMap.display
    const sizeArg = argMap.size

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
      logger.debug('📊 TaskProgress: Rendering progress', { blockId, displayTypeArg });
      const settings = await getSettingsWithSystem()
      const defaultType = settings?.taskProgress?.defaultDisplayType || 'mini-circle'
      const normalizedDisplay = (displayTypeArg || '').toLowerCase().trim()
      const displayType = normalizedDisplay && DISPLAY_TYPE_MAP[normalizedDisplay] ? DISPLAY_TYPE_MAP[normalizedDisplay] : defaultType
      const config = settings?.taskProgress?.displayOptions?.[displayType] || {}
      const showLabel = settings?.taskProgress?.showLabel ?? true
      const labelFormat = settings?.taskProgress?.labelFormat || 'fraction'
      const nestingLevel = settings?.taskProgress?.nestingLevel ?? 1
      const onlyLeaves = settings?.taskProgress?.onlyLeaves ?? false
      const showNestingIndicator = settings?.taskProgress?.showNestingIndicator ?? false
      const fireworksOnComplete = settings?.taskProgress?.fireworksOnComplete ?? true

      const size = (sizeArg || '').toLowerCase().trim()
      const extraConfig = size === 'small' || size === 'medium' || size === 'large' ? { size } : {}

      const progressData = await calculateTaskProgress(blockId, { nestingLevel, onlyLeaves })

      if (!progressData) {
        logseqAPI.provideUI({
          key: PLUGIN_ID + '__' + slot,
          slot,
          reset: true,
          template: '',
        })
        return
      }

      const lang = settings?.language || 'zh-CN'
      const containerId = PLUGIN_ID + slot

      logseqAPI.provideUI({
        key: PLUGIN_ID + '__' + slot,
        slot,
        reset: true,
        template: `<div id="${containerId}"></div>`,
      })

      setTimeout(() => {
        const container = getDocument().getElementById(containerId)
        if (container) {
          renderComponent(container, TaskProgress, {
            progressData,
            displayType,
            config: { ...config, ...extraConfig, showLabel, labelFormat, fireworksOnComplete },
            lang,
            nestingLevel,
            onlyLeaves,
            showNestingIndicator,
          })
        }
      }, 1)
    }
  })

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Task Progress',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${MACRO_PREFIX}, display=mini-circle}}`
        )
      }
    }
  )

  logger.info('✅ TaskProgress: Registered successfully')
}
