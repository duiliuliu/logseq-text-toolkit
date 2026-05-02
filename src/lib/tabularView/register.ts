/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Tabular View 注册逻辑
 * 支持两种标签模式：
 *   1. Tags 模式: #tabular (更友好)
 *   2. Properties 模式: #.tabular (logseq13-missing-commands 兼容)
 * 支持多种触发方式：斜杠命令、快捷键、右键菜单
 */

import { logseqAPI } from '../../logseq'
import { logger } from '../logger/logger'

const PLUGIN_ID = 'text-toolkit-tabularview'

/* ============================================
   标签常量 - 支持两种模式
   Tags 模式: #tabular, #tabular-compact, #tabular0 等
   Properties 模式: #.tabular, #.tabular-compact 等 (logseq13-missing-commands 兼容)
   ============================================ */

export const TABULAR_TAG = '#tabular'
export const TABULAR_COMPACT_TAG = '#tabular-compact'
export const TABULAR_NOCOL_HEADER_TAG = '#tabular0'
export const TABULAR_CENTER_TAG = '#tabular-center'
export const TABULAR_RIGHT_TAG = '#tabular-right'

export const TABULAR_PROP_TAG = '#.tabular'
export const TABULAR_COMPACT_PROP_TAG = '#.tabular-compact'
export const TABULAR_NOCOL_HEADER_PROP_TAG = '#.tabular0'
export const TABULAR_CENTER_PROP_TAG = '#.tabular-center'
export const TABULAR_RIGHT_PROP_TAG = '#.tabular-right'

export interface TabularViewOptions {
  mode?: 'default' | 'compact' | 'nocursor' | 'center' | 'right'
  columnWidth?: number
}

export function registerTabularView(): void {
  registerSlashCommands()
  registerBlockContextMenu()
  registerKeyboardShortcuts()
  logger.info('[TabularView] Registered successfully')
}

function registerSlashCommands(): void {
  logseqAPI.Editor.registerSlashCommand(
    'Insert Tabular View',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_TAG}\n`)
      }
    }
  )

  logseqAPI.Editor.registerSlashCommand(
    'Insert Tabular View (Property)',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_PROP_TAG}\n`)
      }
    }
  )

  logseqAPI.Editor.registerSlashCommand(
    'Insert Compact Table',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_COMPACT_TAG}\n`)
      }
    }
  )

  logseqAPI.Editor.registerSlashCommand(
    'Insert Data Table (No Header)',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_NOCOL_HEADER_TAG}\n`)
      }
    }
  )

  logseqAPI.Editor.registerSlashCommand(
    'Toggle Tabular View',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid && block.content) {
        let newContent = block.content
        if (hasAnyTabularTag(newContent)) {
          newContent = removeAllTabularTags(newContent)
        } else {
          newContent = newContent + `\n${TABULAR_TAG}`
        }
        await logseqAPI.Editor.updateBlock(block.uuid, newContent.trim())
      }
    }
  )

  logger.info('[TabularView] Slash commands registered')
}

function registerBlockContextMenu(): void {
  logseqAPI.Editor.registerBlockContextMenuItem(
    'Toggle Tabular View',
    async ({ uuid }) => {
      const block = await logseqAPI.Editor.getBlock(uuid)
      if (block?.content) {
        let newContent = block.content
        if (hasAnyTabularTag(newContent)) {
          newContent = removeAllTabularTags(newContent)
        } else {
          newContent = newContent + `\n${TABULAR_TAG}`
        }
        await logseqAPI.Editor.updateBlock(uuid, newContent.trim())
      }
    }
  )

  logseqAPI.Editor.registerBlockContextMenuItem(
    'Apply: Compact Table',
    async ({ uuid }) => {
      const block = await logseqAPI.Editor.getBlock(uuid)
      if (block?.content) {
        let newContent = removeAllTabularTags(block.content)
        newContent = newContent + `\n${TABULAR_COMPACT_TAG}`
        await logseqAPI.Editor.updateBlock(uuid, newContent.trim())
      }
    }
  )

  logseqAPI.Editor.registerBlockContextMenuItem(
    'Apply: No Header Table',
    async ({ uuid }) => {
      const block = await logseqAPI.Editor.getBlock(uuid)
      if (block?.content) {
        let newContent = removeAllTabularTags(block.content)
        newContent = newContent + `\n${TABULAR_NOCOL_HEADER_TAG}`
        await logseqAPI.Editor.updateBlock(uuid, newContent.trim())
      }
    }
  )

  logger.info('[TabularView] Block context menu registered')
}

function registerKeyboardShortcuts(): void {
  logseqAPI.App.registerCommandShortcut(
    {
      binding: 'mod+shift+t',
      mode: 'non-editing',
    },
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid && block.content) {
        let newContent = block.content
        if (hasAnyTabularTag(newContent)) {
          newContent = removeAllTabularTags(newContent)
        } else {
          newContent = newContent + `\n${TABULAR_TAG}`
        }
        await logseqAPI.Editor.updateBlock(block.uuid, newContent.trim())
      }
    }
  )

  logger.info('[TabularView] Keyboard shortcuts registered')
}

/* ============================================
   辅助函数
   ============================================ */

function hasAnyTabularTag(content: string): boolean {
  return content.includes(TABULAR_TAG) ||
         content.includes(TABULAR_COMPACT_TAG) ||
         content.includes(TABULAR_NOCOL_HEADER_TAG) ||
         content.includes(TABULAR_CENTER_TAG) ||
         content.includes(TABULAR_RIGHT_TAG) ||
         content.includes(TABULAR_PROP_TAG) ||
         content.includes(TABULAR_COMPACT_PROP_TAG) ||
         content.includes(TABULAR_NOCOL_HEADER_PROP_TAG) ||
         content.includes(TABULAR_CENTER_PROP_TAG) ||
         content.includes(TABULAR_RIGHT_PROP_TAG)
}

function removeAllTabularTags(content: string): string {
  let newContent = content
  // Remove tags
  newContent = newContent.replace(TABULAR_TAG, '')
  newContent = newContent.replace(TABULAR_COMPACT_TAG, '')
  newContent = newContent.replace(TABULAR_NOCOL_HEADER_TAG, '')
  newContent = newContent.replace(TABULAR_CENTER_TAG, '')
  newContent = newContent.replace(TABULAR_RIGHT_TAG, '')
  // Remove properties
  newContent = newContent.replace(TABULAR_PROP_TAG, '')
  newContent = newContent.replace(TABULAR_COMPACT_PROP_TAG, '')
  newContent = newContent.replace(TABULAR_NOCOL_HEADER_PROP_TAG, '')
  newContent = newContent.replace(TABULAR_CENTER_PROP_TAG, '')
  newContent = newContent.replace(TABULAR_RIGHT_PROP_TAG, '')
  return newContent
}

export async function toggleTabularView(blockUuid: string): Promise<boolean> {
  try {
    const block = await logseqAPI.Editor.getBlock(blockUuid)
    if (!block?.content) return false

    let newContent = block.content
    if (hasAnyTabularTag(newContent)) {
      newContent = removeAllTabularTags(newContent)
    } else {
      newContent = newContent + `\n${TABULAR_TAG}`
    }

    await logseqAPI.Editor.updateBlock(blockUuid, newContent.trim())
    return true
  } catch (error) {
    logger.error('[TabularView] Toggle error:', error)
    return false
  }
}

export async function setTabularMode(blockUuid: string, mode: TabularViewOptions['mode']): Promise<boolean> {
  try {
    const block = await logseqAPI.Editor.getBlock(blockUuid)
    if (!block?.content) return false

    let newContent = removeAllTabularTags(block.content)
    const tag = mode === 'compact' ? TABULAR_COMPACT_TAG :
               mode === 'nocursor' ? TABULAR_NOCOL_HEADER_TAG :
               mode === 'center' ? TABULAR_CENTER_TAG :
               mode === 'right' ? TABULAR_RIGHT_TAG :
               TABULAR_TAG

    newContent = newContent + `\n${tag}`
    await logseqAPI.Editor.updateBlock(blockUuid, newContent.trim())
    return true
  } catch (error) {
    logger.error('[TabularView] Set mode error:', error)
    return false
  }
}
