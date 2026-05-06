/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Logseq API Token Query 组件
 * 通过 API 查询指定 block 下的任务并展示 progress
 */

import React, { useState, useEffect } from 'react'
import { logseqAPI, HealthStatus, TaskProgressData } from '../../services/logseqAPI'
import TaskProgress from '../../../components/TaskProgress/TaskProgress'
import { getSettings } from '../../../settings'
import { t } from '../../../translations/i18n'
import { SupportedLanguage } from '../../../translations/translations'
import { StatusStat, STATUS_COLORS } from '../../../lib/taskProgress/types'

const APIQueryDemo: React.FC = () => {
  const settings = getSettings()
  const currentLang = (settings?.language || 'zh-CN') as SupportedLanguage

  const [enabled, setEnabled] = useState(false)
  const [apiToken, setApiToken] = useState('')
  const [blockUuid, setBlockUuid] = useState('')
  const [nestingLevel, setNestingLevel] = useState<number>(1)
  const [onlyLeaves, setOnlyLeaves] = useState(false)

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<TaskProgressData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [blockTitle, setBlockTitle] = useState<string>('')

  useEffect(() => {
    if (enabled && apiToken) {
      logseqAPI.setToken(apiToken)
      checkConnection()
    }
  }, [enabled, apiToken])

  useEffect(() => {
    if (enabled && apiToken && blockUuid) {
      queryTasks()
    }
  }, [enabled, apiToken, blockUuid, nestingLevel, onlyLeaves])

  const checkConnection = async () => {
    try {
      const status = await logseqAPI.checkHealth()
      setHealthStatus(status)
      if (!status.connected) {
        setError(status.error === 'invalid_token' 
          ? 'Invalid API token. Check your token in Logseq settings.' 
          : 'Cannot connect to Logseq. Make sure the API server is enabled.')
      } else {
        setError(null)
      }
    } catch (err: any) {
      setHealthStatus({ connected: false, graphName: null, error: 'connection_refused' })
      setError(err.message)
    }
  }

  const queryTasks = async () => {
    if (!blockUuid.trim()) {
      setTasks([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const block = await logseqAPI.queryBlockByUuid(blockUuid.trim())
      if (block) {
        setBlockTitle(block['block/title'] || block.title || block['block/content'] || '')
      } else {
        setBlockTitle('')
      }

      const results = await logseqAPI.queryTasksByBlockUuid(blockUuid.trim(), nestingLevel, onlyLeaves)
      setTasks(results)

      if (results.length === 0) {
        setError('No tasks found in this block.')
      }
    } catch (err: any) {
      setError(err.message)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (tasks.length === 0) return null

    const statusCounts: Record<string, number> = {}
    for (const task of tasks) {
      const status = task.status || 'todo'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }

    const statusStats: StatusStat[] = []
    let totalTasks = 0
    let completedTasks = 0

    for (const [status, count] of Object.entries(statusCounts)) {
      totalTasks += count
      if (status.toLowerCase() === 'done') {
        completedTasks = count
      }
      statusStats.push({
        status,
        count,
        color: STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS[status] || '#6b7280'
      })
    }

    const progress = Math.round((completedTasks / totalTasks) * 100)

    return {
      blockId: blockUuid,
      parentBlockId: blockUuid,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
      nestingLevel,
      leafTasksOnly: onlyLeaves
    }
  }

  const progressData = calculateProgress()

  const getStatusNameDisplay = (status: string) => {
    const key = `settings.taskProgress.statusNames.${status}`
    const translation = t(key, currentLang)
    return translation !== key ? translation : status
  }

  const statusOptions = [
    { value: 'todo', label: '● Todo', color: '#f59e0b' },
    { value: 'doing', label: '○ Doing', color: '#3b82f6' },
    { value: 'in-review', label: '⊛ In Review', color: '#06b6d4' },
    { value: 'done', label: '✓ Done', color: '#10b981' },
    { value: 'waiting', label: '◐ Waiting', color: '#8b5cf6' },
    { value: 'canceled', label: '✗ Canceled', color: '#ef4444' },
  ]

  const normalizeStatus = (status: string) => {
    if (!status) return 'todo'
    const strStatus = String(status).toLowerCase()
    if (statusOptions.some(o => o.value === strStatus)) {
      return strStatus
    }
    return 'todo'
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeStatus(status)
    const option = statusOptions.find(o => o.value === normalizedStatus)
    return option?.label?.charAt(0) || '●'
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = normalizeStatus(status)
    const option = statusOptions.find(o => o.value === normalizedStatus)
    return option?.color || '#6b7280'
  }

  if (!enabled) {
    return (
      <div style={{ 
        marginTop: '24px', 
        padding: '20px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
            Enable Logseq API Query
          </label>
          <button
            onClick={() => setEnabled(true)}
            style={{
              padding: '6px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Enable
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Connect to local Logseq server to query tasks from any block
        </p>
      </div>
    )
  }

  return (
    <div style={{ 
      marginTop: '24px', 
      padding: '20px', 
      backgroundColor: '#f8fafc', 
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
          Enable Logseq API Query
        </label>
        <button
          onClick={() => {
            setEnabled(false)
            setTasks([])
            setError(null)
            setHealthStatus(null)
          }}
          style={{
            padding: '6px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          Disable
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
            API Token (from Logseq Settings)
          </label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your Logseq API token"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
            Block UUID
          </label>
          <input
            type="text"
            value={blockUuid}
            onChange={(e) => setBlockUuid(e.target.value)}
            placeholder="e.g., 69fab8da-af37-4c02-b0d8-7439bbd54587"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
            Nesting Level
          </label>
          <select
            value={nestingLevel}
            onChange={(e) => setNestingLevel(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none'
            }}
          >
            <option value={1}>Level 1</option>
            <option value={2}>Level 1-2</option>
            <option value={3}>Level 1-3</option>
            <option value={10}>All Levels</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyLeaves}
              onChange={(e) => setOnlyLeaves(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            Only Leaf Tasks
          </label>
        </div>
      </div>

      {healthStatus && (
        <div style={{ 
          padding: '10px 12px', 
          backgroundColor: healthStatus.connected ? '#ecfdf5' : '#fef2f2',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '13px',
          color: healthStatus.connected ? '#059669' : '#dc2626'
        }}>
          {healthStatus.connected 
            ? `✓ Connected to graph: ${healthStatus.graphName}` 
            : healthStatus.error === 'invalid_token'
              ? '✗ Invalid API token'
              : '✗ Cannot connect to Logseq server'
          }
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px 12px', 
          backgroundColor: '#fef2f2',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px'
        }}>
          Loading...
        </div>
      )}

      {!loading && progressData && (
        <div>
          {blockTitle && (
            <div style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                Block: {blockTitle}
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                UUID: {blockUuid}
              </p>
            </div>
          )}

          <div style={{ 
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#334155' }}>
                {progressData.progress}%
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Total: {progressData.totalTasks} tasks
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Completed: {progressData.completedTasks}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {progressData.statusStats.map(stat => (
                <div key={stat.status} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: stat.color 
                  }} />
                  <span style={{ color: '#475569' }}>
                    {getStatusNameDisplay(stat.status)}: {stat.count}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              {(['mini-circle', 'dot-matrix', 'progress-capsule'] as const).map(type => (
                <div key={type} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b', minWidth: '80px' }}>
                    {type}:
                  </span>
                  <TaskProgress
                    progressData={progressData}
                    displayType={type}
                    config={{
                      showLabel: true,
                      labelFormat: 'percentage'
                    }}
                    lang={currentLang}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
              Task Details ({tasks.length})
            </h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {tasks.map((task, index) => (
                <div key={task.uuid || index} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px'
                }}>
                  <span style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    backgroundColor: getStatusColor(task.status),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>
                    {getStatusIcon(task.status)}
                  </span>
                  <span style={{ flex: 1, color: '#334155' }}>
                    {task.title || '(No title)'}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    {getStatusNameDisplay(task.status)}
                  </span>
                  <span style={{ 
                    fontSize: '10px',
                    color: '#94a3b8',
                    fontFamily: 'monospace'
                  }}>
                    {task.uuid?.slice(0, 8)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !progressData && !error && blockUuid && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px'
        }}>
          Enter a valid Block UUID to query tasks
        </div>
      )}
    </div>
  )
}

export default APIQueryDemo
