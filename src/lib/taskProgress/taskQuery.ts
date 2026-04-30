/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务查询和统计逻辑
 */

import { TaskProgress, TaskBlock, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'

function getStatusColor(status: string): string {
  const settings = getSettings()
  return settings?.meta?.taskProgress?.statusColors?.[status] || settings?.taskProgress?.statusColors?.[status] || STATUS_COLORS[status] || '#6b7280'
}

export async function getDirectTaskChildren(parentBlockId: string): Promise<TaskBlock[]> {
  try {
    // 使用 datascriptQuery 查询块及其子块
    const results = await logseqAPI.DB.datascriptQuery(
      `[:find (pull ?b [*])
        :in $ ?parent
        :where
        [?p :block/uuid ?parent]
        [?b :block/parent ?p]]`,
      parentBlockId
    )

    if (!results || !Array.isArray(results)) {
      return []
    }

    return results
      .map((result: any) => {
        const block = result[0]
        if (!block) return null

        const content = block.content || ''
        const hasStatusProp = block.properties?.status !== undefined
        const hasTaskTag = content.includes('#task')

        if (!hasStatusProp && !hasTaskTag) return null

        return {
          id: block.uuid,
          content: content,
          status: block.properties?.status as string,
          isTask: true,
          properties: block.properties,
        }
      })
      .filter(Boolean) as TaskBlock[]
  } catch (error) {
    console.error('[TaskProgress] getDirectTaskChildren error:', error)
    return []
  }
}

export async function calculateTaskProgress(parentBlockId: string): Promise<TaskProgress | null> {
  const tasks = await getDirectTaskChildren(parentBlockId)
  
  if (tasks.length === 0) {
    return null
  }
  
  const statusStats: StatusStat[] = []
  const statusCountMap = new Map<string, number>()
  
  tasks.forEach(task => {
    const status = task.status || 'todo'
    statusCountMap.set(status, (statusCountMap.get(status) || 0) + 1)
  })
  
  statusCountMap.forEach((count, status) => {
    statusStats.push({ 
      status, 
      count, 
      color: getStatusColor(status) 
    })
  })
  
  const totalTasks = tasks.length
  const completedTasks = statusCountMap.get('done') || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  return {
    blockId: parentBlockId,
    parentBlockId: parentBlockId,
    totalTasks,
    completedTasks,
    statusStats,
    progress,
  }
}
