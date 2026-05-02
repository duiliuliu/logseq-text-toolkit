/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务查询和统计逻辑 (V2 - 支持多层嵌套)
 */

import { TaskProgress, StatusStat, STATUS_COLORS, NestingLevel } from './types'
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

interface NestedTaskQueryOptions {
  parentBlockId: string
  maxDepth: number           // 1 = 直接子节点, 2 = 两层, 3 = 三层, -1 = 全部
  onlyLeaves: boolean       // true = 只统计叶子节点
}

/**
 * 获取直接子块
 */
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

/**
 * 检查块是否为任务块
 */
function isTaskBlock(block: any): boolean {
  // 检查是否有 #task 标签
  const hasTaskTag = block.tags?.some(
    (tag: any) => tag?.title?.toLowerCase() === 'task'
  )
  
  // 检查是否有 status 属性
  const hasStatus = block.properties?.status !== undefined
  
  return hasTaskTag || hasStatus
}

/**
 * 获取任务块的状态
 */
function getTaskStatus(block: any): string | undefined {
  return block.properties?.status
}

/**
 * 检查任务块是否有子任务
 */
async function hasChildTasks(blockId: string): Promise<boolean> {
  const children = await queryDirectChildren(blockId)
  return children.some(child => isTaskBlock(child))
}

/**
 * 过滤叶子节点
 */
function filterLeafTasks(tasks: any[], taskMap: Map<string, boolean>): any[] {
  return tasks.filter(task => {
    const hasChildren = taskMap.get(task.uuid) || false
    return !hasChildren
  })
}

/**
 * 递归获取嵌套任务（分层查询）
 */
async function queryNestedTasks(options: NestedTaskQueryOptions): Promise<any[]> {
  const { parentBlockId, maxDepth, onlyLeaves } = options
  const allTasks: any[] = []
  
  // 获取直接子块
  const directChildren = await queryDirectChildren(parentBlockId)
  
  // 过滤出任务块
  const directTasks = directChildren.filter(block => isTaskBlock(block))
  allTasks.push(...directTasks)
  
  // 如果 maxDepth 为 1，直接返回
  if (maxDepth === 1) {
    return allTasks
  }
  
  // 递归获取更深层级
  const remainingDepth = maxDepth === -1 ? -1 : maxDepth - 1
  for (const task of directTasks) {
    const descendants = await queryNestedTasks({
      parentBlockId: task.uuid,
      maxDepth: remainingDepth,
      onlyLeaves: false
    })
    allTasks.push(...descendants)
  }
  
  return allTasks
}

/**
 * 计算任务进度
 */
export async function calculateTaskProgress(parentBlockId: string): Promise<TaskProgress | null> {
  try {
    const settings = getSettings()
    
    // 获取嵌套层级配置
    const nestingLevel = settings?.taskProgress?.nestingLevel ?? 1
    const onlyLeaves = settings?.taskProgress?.onlyLeaves ?? false
    
    // 将 nestingLevel 转换为 maxDepth
    let maxDepth: number
    if (nestingLevel === 'all') {
      maxDepth = -1  // -1 表示无限层级
    } else {
      maxDepth = nestingLevel as number
    }
    
    // 查询嵌套任务
    let tasks = await queryNestedTasks({
      parentBlockId,
      maxDepth,
      onlyLeaves: false  // 先查询所有任务
    })
    
    // 如果启用了 onlyLeaves，进行过滤
    if (onlyLeaves) {
      // 创建任务 UUID 映射
      const taskMap = new Map<string, boolean>()
      for (const task of tasks) {
        const hasChildren = tasks.some(
          other => other.properties?.parent === task.uuid
        )
        taskMap.set(task.uuid, hasChildren)
      }
      tasks = filterLeafTasks(tasks, taskMap)
    }
    
    if (tasks.length === 0) {
      return null
    }
    
    // 统计各状态数量
    const statusMap = new Map<string, number>()
    for (const task of tasks) {
      const status = getTaskStatus(task)
      if (status) {
        const normalizedStatus = status.toLowerCase()
        statusMap.set(normalizedStatus, (statusMap.get(normalizedStatus) || 0) + 1)
      }
    }
    
    // 构建状态统计
    const statusStats: StatusStat[] = []
    let totalTasks = 0
    
    statusMap.forEach((count, status) => {
      totalTasks += count
      statusStats.push({
        status,
        count,
        color: getStatusColor(status)
      })
    })
    
    if (totalTasks === 0) {
      return null
    }
    
    // 计算完成进度
    const completedTasks = statusMap.get('done') || 0
    const progress = Math.round((completedTasks / totalTasks) * 100)
    
    // 规范化 nestingLevel 为数字或字符串
    const effectiveNestingLevel = nestingLevel === 'all' ? 'all' : nestingLevel
    
    return {
      blockId: parentBlockId,
      parentBlockId: parentBlockId,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
      nestingLevel: effectiveNestingLevel as any,
      leafTasksOnly: onlyLeaves
    }
  } catch (error) {
    console.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
