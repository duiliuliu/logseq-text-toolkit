/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务进度演示组件
 */

import React, { useEffect, useState } from 'react'
import TaskProgress from '../../../components/TaskProgress/TaskProgress'
import { calculateTaskProgress } from '../../../lib/taskProgress/taskQuery'
import { ProgressDisplayType } from '../../../lib/taskProgress/types'

const defaultConfig = {
  taskProgress: {
    displayOptions: {
      'mini-circle': { size: 'small', showLabel: true, labelFormat: 'fraction' },
      'dot-matrix': { maxDots: 10, size: 'small' }
    }
  }
}

const TaskProgressDemo: React.FC = () => {
  const [progressData, setProgressData] = useState(null)
  const [config, setConfig] = useState(defaultConfig)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const loadProgress = async () => {
        try {
          const data = await calculateTaskProgress('#task-parent-block')
          setProgressData(data)
          setError(null)
        } catch (err) {
          console.error('[TaskProgressDemo] calculateTaskProgress error:', err)
          setError(String(err))
        }
      }
      loadProgress()
    } catch (err) {
      console.error('[TaskProgressDemo] useEffect error:', err)
      setError(String(err))
    }
  }, [])

  const refreshProgress = async () => {
    try {
      const data = await calculateTaskProgress('#task-parent-block')
      setProgressData(data)
      setError(null)
    } catch (err) {
      console.error('[TaskProgressDemo] refresh error:', err)
      setError(String(err))
    }
  }

  const displayTypes: { type: ProgressDisplayType; label: string }[] = [
    { type: 'mini-circle', label: '微型圆环' },
    { type: 'dot-matrix', label: '点阵进度' },
    { type: 'status-cursor', label: '状态光标' },
    { type: 'progress-capsule', label: '进度胶囊' },
    { type: 'step-progress', label: '阶梯进度' }
  ]

  if (error) {
    return (
      <div className="task-progress-demo">
        <h3>任务进度演示</h3>
        <div style={{ padding: '20px', color: '#e74c3c' }}>
          <p>发生错误:</p>
          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
            {error}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="task-progress-demo">
      <h3>任务进度演示</h3>
      
      {progressData ? (
        <>
          <div className="progress-info" style={{ marginBottom: '16px' }}>
            <p>总任务数: {progressData.totalTasks}</p>
            <p>已完成: {progressData.completedTasks}</p>
            <p>进度: {progressData.progress}%</p>
          </div>
          
          <div className="all-display-types">
            {displayTypes.map(({ type, label }) => (
              <div key={type} className="display-type-item" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="type-label" style={{ minWidth: '80px' }}>{label}:</span>
                <TaskProgress
                  progressData={progressData}
                  displayType={type}
                  config={config?.taskProgress?.displayOptions?.[type]}
                />
              </div>
            ))}
          </div>
          
          <button 
            className="refresh-btn"
            onClick={refreshProgress}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            刷新进度
          </button>
        </>
      ) : (
        <div style={{ padding: '20px', color: '#666' }}>
          <p>未找到任务数据</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            请确保页面中有带有 task_tracking 属性的子任务块
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskProgressDemo
