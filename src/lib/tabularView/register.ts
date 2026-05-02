/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Tabular View - 使用 Logseq Experiments API 实现
 *
 * 两种实现方案：
 * 1. 纯 CSS 方案（向后兼容）- 当前实现
 * 2. Experiments API 方案（推荐）
 */

import { logseqAPI } from '../../logseq'
import { logger } from '../logger/logger'

const PLUGIN_ID = 'text-toolkit-tabularview'

// 标签常量
export const TABULAR_TAG = '#tabular'
export const TABULAR_PROP_TAG = '#.tabular'
export const TABULAR_COMPACT_TAG = '#tabular-compact'
export const TABULAR_NOCOL_HEADER_TAG = '#tabular0'

/**
 * 检查是否有 Experiments API 支持
 */
function hasExperimentsApi(): boolean {
  try {
    return typeof (logseqAPI as any)?.Experiments?.registerBlockRenderer === 'function'
  } catch (e) {
    return false
  }
}

/**
 * 使用 Experiments API 注册表格渲染器
 */
function registerWithExperiments(): void {
  try {
    const Experiments = (logseqAPI as any)?.Experiments
    if (!Experiments?.registerBlockRenderer) {
      logger.info('[TabularView] Experiments API not available, falling back to CSS mode')
      return
    }

    // 注册表格块渲染器
    Experiments.registerBlockRenderer('tabular-view', {
      // 条件：块有 tabular 标签/属性
      when: ({ properties, content }: any) => {
        return (content?.includes(TABULAR_TAG) || 
                content?.includes(TABULAR_PROP_TAG) ||
                properties?.view === 'tabular')
      },
      includeChildren: true, // 包括子块数据
      priority: 20,
      render: renderTableView
    })

    logger.info('[TabularView] Registered with Experiments API (block renderer)')
  } catch (error) {
    logger.error('[TabularView] Failed to register with Experiments:', error)
  }
}

/**
 * 表格视图渲染器
 */
function renderTableView(props: {
  blockId: string
  content: string
  children: Array<any>
  properties: Record<string, any>
}) {
  const React = (logseqAPI as any).Experiments.React

  const { children = [] } = props

  // 表头行（第一行子块）
  const headerRow = children[0]
  const dataRows = children.slice(1)

  // 渲染表头列
  const renderRow = (row: any, isHeader: boolean) => {
    if (!row) return null

    // 获取子块作为列
    const columns = row.children || []

    // 第一列是行标题
    const rowTitle = row.content || row.title || ''

    const cells = [
      // 行标题单元格
      React.createElement('div', { 
        key: 'title', 
        className: 'tabular-cell tabular-title-cell'
      }, rowTitle)
    ]

    // 列单元格
    columns.forEach((col: any, index: number) => {
      cells.push(
        React.createElement('div', { 
          key: index, 
          className: 'tabular-cell'
        }, col.content || col.title || '')
      )
    })

    return React.createElement('div', { 
      className: `tabular-row ${isHeader ? 'tabular-header' : ''}`
    }, cells)
  }

  // 主表格
  const rows = [
    // 渲染表头
    headerRow && renderRow(headerRow, true),
    // 渲染数据行
    ...dataRows.map((row, index) => renderRow(row, false))
  ].filter(Boolean)

  return React.createElement('div', { 
    className: 'tabular-container'
  }, rows)
}

/**
 * 注册入口
 */
export function registerTabularView(): void {
  // 尝试使用 Experiments API
  if (hasExperimentsApi()) {
    registerWithExperiments()
  }

  // 仍然保留 CSS 方案用于向后兼容
  registerCssMode()

  logger.info('[TabularView] Registered successfully')
}

/**
 * CSS 模式（向后兼容）
 */
function registerCssMode(): void {
  // 斜杠命令
  logseqAPI.Editor.registerSlashCommand(
    'Insert Tabular View',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_TAG}\n`)
      }
    }
  )

  // 右键菜单
  logseqAPI.Editor.registerBlockContextMenuItem(
    'Toggle Tabular View',
    async ({ uuid }) => {
      const block = await logseqAPI.Editor.getBlock(uuid)
      if (block?.content) {
        let newContent = block.content
        if (newContent.includes(TABULAR_TAG)) {
          newContent = newContent.replace(TABULAR_TAG, '')
        } else {
          newContent += `\n${TABULAR_TAG}`
        }
        await logseqAPI.Editor.updateBlock(uuid, newContent.trim())
      }
    }
  )

  // 快捷键
  logseqAPI.App.registerCommandShortcut(
    {
      binding: 'mod+shift+t',
      mode: 'non-editing',
    },
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid && block.content) {
        let newContent = block.content
        if (newContent.includes(TABULAR_TAG)) {
          newContent = newContent.replace(TABULAR_TAG, '')
        } else {
          newContent += `\n${TABULAR_TAG}`
        }
        await logseqAPI.Editor.updateBlock(block.uuid, newContent.trim())
      }
    }
  )
}
