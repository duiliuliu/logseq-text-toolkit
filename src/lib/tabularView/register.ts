/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Tabular View - 使用 Logseq Experiments API 实现
 *
 * 仅推荐使用 Experiments API 模式，向后兼容性 CSS 模式保留
 */

import { logseqAPI } from '../../logseq'
import { logger } from '../logger/logger'

const PLUGIN_ID = 'text-toolkit-tabularview'

// 标签常量
export const TABULAR_TAG = '#tabular'
export const TABULAR_PROP_TAG = '#.tabular'
export const TABULAR_COMPACT_TAG = '#tabular-compact'
export const TABULAR_NOCOL_HEADER_TAG = '#tabular0'

// ---------------------------------------------------------------------------
// 核心：使用 Experiments API 注册表格渲染器
// ---------------------------------------------------------------------------

/**
 * 检查是否有 Experiments API 支持
 */
function hasExperimentsApi(): boolean {
  try {
    return (
      typeof (logseqAPI as any)?.Experiments?.registerBlockRenderer === 'function' &&
      typeof (logseqAPI as any)?.Experiments?.React !== 'undefined'
    )
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
      logger.info('[TabularView] Experiments API not available, skipping')
      return
    }

    // 注册表格块渲染器
    Experiments.registerBlockRenderer('tabular-view', {
      // 触发条件
      when: ({ properties, content }: any) => {
        return (
          content?.includes(TABULAR_TAG) || 
          content?.includes(TABULAR_PROP_TAG) ||
          content?.includes(TABULAR_COMPACT_TAG) ||
          content?.includes(TABULAR_NOCOL_HEADER_TAG) ||
          properties?.view === 'tabular' ||
          properties?.tabular === true
        )
      },
      includeChildren: true, // 获取子块树形结构
      priority: 20, // 较高优先级，覆盖部分其他渲染器
      
      // 自定义渲染函数
      render: renderTableView
    })

    logger.info('[TabularView] Registered with Experiments API (block renderer)')
  } catch (error) {
    logger.error('[TabularView] Failed to register with Experiments:', error)
  }
}

// ---------------------------------------------------------------------------
// React 渲染器：构建表格 UI
// ---------------------------------------------------------------------------

/**
 * 表格视图渲染器
 * 
 * 使用宿主 React，通过 logseq.Experiments.React 获取
 */
function renderTableView(props: {
  blockId: string
  content: string
  children: Array<any>
  properties: Record<string, any>
}) {
  const React = (logseqAPI as any).Experiments.React
  const { children = [], properties = {} } = props

  // 判断模式
  const isCompactMode = props.content?.includes(TABULAR_COMPACT_TAG) || properties.mode === 'compact'
  const isNoHeaderMode = props.content?.includes(TABULAR_NOCOL_HEADER_TAG) || properties.mode === 'no-header'

  // 表头数据（第一行）
  const headerRow = isNoHeaderMode ? null : children[0]
  const dataRows = isNoHeaderMode ? children : children.slice(1)

  // 渲染一行表格
  const renderRow = (row: any, isHeader: boolean, rowIndex: number) => {
    if (!row) return null

    const columns = row.children || []
    const rowTitle = row.content || row.title || ''
    
    // 构建单元格数组
    const cells = [
      // 第一列：行标题
      React.createElement('div', { 
        key: `row-${rowIndex}-title`, 
        className: 'tabular-cell tabular-title-cell'
      }, rowTitle)
    ]

    // 子列单元格
    columns.forEach((col: any, colIndex: number) => {
      cells.push(
        React.createElement('div', { 
          key: `row-${rowIndex}-col-${colIndex}`, 
          className: 'tabular-cell'
        }, 
          col.content || col.title || col.page || '')
      )
    })

    return React.createElement('div', { 
      key: `row-${rowIndex}`,
      className: `tabular-row ${isHeader ? 'tabular-header' : ''} ${isCompactMode ? 'tabular-compact' : ''}`
    }, cells)
  }

  // 构建所有行
  const rows: any[] = []
  if (headerRow) {
    rows.push(renderRow(headerRow, true, 0))
  }
  dataRows.forEach((row: any, index: number) => {
    rows.push(renderRow(row, false, index + (headerRow ? 1 : 0)))
  })

  // 空状态
  if (rows.length === 0) {
    return React.createElement('div', { 
      className: 'tabular-empty' 
    }, '没有数据，添加子块来显示表格')
  }

  // 主表格容器
  return React.createElement('div', { 
    className: `tabular-container ${isCompactMode ? 'tabular-compact' : ''}`
  }, 
    // 标题
    !isNoHeaderMode && props.content && React.createElement('div', { 
      className: 'tabular-title',
      key: 'header'
    }, cleanTabularTags(props.content)),
    // 表格行
    rows
  )
}

// ---------------------------------------------------------------------------
// 辅助工具函数
// ---------------------------------------------------------------------------

/**
 * 清理标签，用于显示标题
 */
function cleanTabularTags(content: string): string {
  return content
    .replace(TABULAR_TAG, '')
    .replace(TABULAR_PROP_TAG, '')
    .replace(TABULAR_COMPACT_TAG, '')
    .replace(TABULAR_NOCOL_HEADER_TAG, '')
    .trim()
}

// ---------------------------------------------------------------------------
// 触发器：斜杠命令、右键菜单、快捷键
// ---------------------------------------------------------------------------

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
    'Insert Tabular View (Compact)',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_COMPACT_TAG}\n`)
      }
    }
  )
}

function registerBlockContextMenu(): void {
  logseqAPI.Editor.registerBlockContextMenuItem(
    'Toggle Tabular View',
    async ({ uuid }) => {
      const block = await logseqAPI.Editor.getBlock(uuid)
      if (block?.content) {
        let newContent = block.content
        const hasTag = newContent.includes(TABULAR_TAG) || 
                       newContent.includes(TABULAR_PROP_TAG)
        
        if (hasTag) {
          newContent = newContent.replace(TABULAR_TAG, '')
          newContent = newContent.replace(TABULAR_PROP_TAG, '')
        } else {
          newContent += `\n${TABULAR_TAG}`
        }
        
        await logseqAPI.Editor.updateBlock(uuid, newContent.trim())
      }
    }
  )
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
        const hasTag = newContent.includes(TABULAR_TAG) || 
                       newContent.includes(TABULAR_PROP_TAG)
        
        if (hasTag) {
          newContent = newContent.replace(TABULAR_TAG, '')
          newContent = newContent.replace(TABULAR_PROP_TAG, '')
        } else {
          newContent += `\n${TABULAR_TAG}`
        }
        
        await logseqAPI.Editor.updateBlock(block.uuid, newContent.trim())
      }
    }
  )
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

export function registerTabularView(): void {
  // 优先使用 Experiments API
  if (hasExperimentsApi()) {
    registerWithExperiments()
  } else {
    logger.info('[TabularView] Experiments API not available, tabular view skipped')
  }

  // 无论如何都注册触发器（斜杠命令等）
  registerSlashCommands()
  registerBlockContextMenu()
  registerKeyboardShortcuts()

  logger.info('[TabularView] Registration complete')
}
