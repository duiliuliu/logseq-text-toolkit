/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务查询和统计逻辑
 */

import { TaskProgress, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'

function getStatusColor(status: string): string {
  const settings = getSettings()
  const normalizedStatus = status.toLowerCase()
  return settings?.taskProgress?.statusColors?.[normalizedStatus] || 
         settings?.taskProgress?.statusColors?.[status] || 
         STATUS_COLORS[normalizedStatus] || 
         STATUS_COLORS[status] || 
         '#6b7280'
}

export async function calculateTaskProgress(parentBlockId: string): Promise<TaskProgress | null> {
  try {
    const query = `
      [:find ?status-title (count ?b)
       :where
       [?p :block/uuid #uuid "${parentBlockId}"]
       [?b :block/parent ?p]
       [?b :block/tags ?t]
       [?t :block/title "Task"]
       [?b :logseq.property/status ?status]
       [?status :block/title ?status-title]]
    `

    const results = await logseqAPI.DB.datascriptQuery(query)

    if (!results || results.length === 0) {
      return null
    }

    const statusStats: StatusStat[] = []
    let totalTasks = 0

    results.forEach((result: [string, number]) => {
      if (result && result.length === 2) {
        const status = result[0]
        const count = result[1]
        totalTasks += count
        statusStats.push({
          status,
          count,
          color: getStatusColor(status)
        })
      }
    })

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
    }
  } catch (error) {
    console.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
