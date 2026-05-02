/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务查询和统计逻辑
 */

import { TaskProgress, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'
import type { NestingLevel } from '../../settings/types'

function getStatusColor(status: string): string {
  const settings = getSettings()
  const normalizedStatus = status.toLowerCase()
  return settings?.taskProgress?.statusColors?.[normalizedStatus] || 
         settings?.taskProgress?.statusColors?.[status] || 
         STATUS_COLORS[normalizedStatus] || 
         STATUS_COLORS[status] || 
         '#6b7280'
}

interface NestedTaskQueryOptions {
  parentBlockId: string
  maxDepth: number
  onlyLeaves: boolean
}

async function queryDirectChildren(parentBlockId: string): Promise<any[]> {
  const query = `
    [:find (pull ?b [*])
     :in $ ?parent-uuid
     :where
     [?p :block/uuid ?parent-uuid]
     [?b :block/parent ?p]]
  `
  
  const results = await logseqAPI.DB.datascriptQuery(query, `#uuid "${parentBlockId}"`)
  return (results || []).flat()
}

function filterTaskBlocks(blocks: any[]): any[] {
  return blocks.filter(block => {
    const hasTaskTag = block.tags?.some(
      (tag: any) => tag?.title?.toLowerCase() === 'task'
    )
    const hasStatus = block.properties?.status !== undefined
    return hasTaskTag || hasStatus
  })
}

function filterLeafTasks(tasks: any[], allBlocks: any[]): any[] {
  const taskIds = new Set(tasks.map(t => t.uuid))
  
  return tasks.filter(task => {
    const hasChildren = allBlocks.some(
      block => block.parent && block.parent.uuid === task.uuid
    )
    return !hasChildren
  })
}

async function queryNestedTasks(options: NestedTaskQueryOptions): Promise<any[]> {
  const { parentBlockId, maxDepth, onlyLeaves } = options
  const allTasks: any[] = []
  const allBlocks: any[] = []
  
  async function queryLevel(parentId: string, currentDepth: number, maxD: number): Promise<void> {
    if (maxD !== -1 && currentDepth > maxD) return
    
    const children = await queryDirectChildren(parentId)
    allBlocks.push(...children)
    
    const tasks = filterTaskBlocks(children)
    if (!onlyLeaves) {
      allTasks.push(...tasks)
    }
    
    if (maxD === -1 || currentDepth < maxD) {
      for (const task of tasks) {
        await queryLevel(task.uuid, currentDepth + 1, maxD)
      }
    }
  }
  
  await queryLevel(parentBlockId, 1, maxDepth)
  
  if (onlyLeaves) {
    return filterLeafTasks(allBlocks, allBlocks)
  }
  
  return allTasks
}

export async function calculateTaskProgress(
  parentBlockId: string,
  options?: { nestingLevel?: number | 'all'; onlyLeaves?: boolean }
): Promise<TaskProgress | null> {
  try {
    const settings = getSettings()
    const nestingLevel = options?.nestingLevel ?? settings?.taskProgress?.nestingLevel ?? 1
    const onlyLeaves = options?.onlyLeaves ?? settings?.taskProgress?.onlyLeaves ?? false
    
    const maxDepth = nestingLevel === 'all' ? -1 : nestingLevel
    
    const tasks = await queryNestedTasks({
      parentBlockId,
      maxDepth,
      onlyLeaves
    })
    
    const statusCounts: Record<string, number> = {}
    
    for (const task of tasks) {
      const status = task.properties?.status
      if (status) {
        statusCounts[status] = (statusCounts[status] || 0) + 1
      }
    }
    
    const statusStats: StatusStat[] = []
    let totalTasks = 0
    
    for (const [status, count] of Object.entries(statusCounts)) {
      totalTasks += count
      statusStats.push({
        status,
        count,
        color: getStatusColor(status)
      })
    }
    
    if (totalTasks === 0) {
      return null
    }
    
    const completedTasks = statusStats.find(s => s.status.toLowerCase() === 'done')?.count || 0
    const progress = Math.round((completedTasks / totalTasks) * 100)
    
    return {
      blockId: parentBlockId,
      parentBlockId: parentBlockId,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
      nestingLevel: nestingLevel,
      leafTasksOnly: onlyLeaves
    }
  } catch (error) {
    console.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
