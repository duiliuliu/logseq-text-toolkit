/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务进度演示组件
 */

import React, { useEffect, useState } from 'react'
import TaskProgress from '../../../components/TaskProgress/TaskProgress'
import { calculateTaskProgress } from '../../../lib/taskProgress/taskQuery'
import { getSettings } from '../../../settings'
import { TaskProgress as TaskProgressType, ProgressDisplayType } from '../../../lib/taskProgress/types'
import { getStatusName } from '../../../translations/i18n'
import { SupportedLanguage } from '../../../translations/translations'

const TaskProgressDemo: React.FC = () => {
  const [progressData, setProgressData] = useState<TaskProgressType | null>(null)
  const [nestedProgressData, setNestedProgressData] = useState<TaskProgressType | null>(null)
  const settings = getSettings()
  const currentLang: SupportedLanguage = (settings?.language || 'zh-CN') as SupportedLanguage
  
  // 添加嵌套层级测试选项
  const [testNestingLevel, setTestNestingLevel] = useState<number | 'all'>(1)
  const [testOnlyLeaves, setTestOnlyLeaves] = useState(false)

  useEffect(() => {
    const loadProgress = async () => {
      const data = await calculateTaskProgress('#task-parent-block')
      setProgressData(data)
    }
    loadProgress()
  }, [])

  const refreshProgress = async () => {
    const data = await calculateTaskProgress('#task-parent-block')
    setProgressData(data)
  }
  
  const refreshNestedProgress = async () => {
    const data = await calculateTaskProgress('#nested-task-parent', {
      nestingLevel: testNestingLevel,
      onlyLeaves: testOnlyLeaves
    })
    setNestedProgressData(data)
  }
  
  // 加载嵌套任务进度
  useEffect(() => {
    refreshNestedProgress()
  }, [testNestingLevel, testOnlyLeaves])

  const displayTypes: { type: ProgressDisplayType; label: string }[] = [
    { type: 'mini-circle', label: '微型圆环' },
    { type: 'dot-matrix', label: '点阵进度' },
    { type: 'status-cursor', label: '状态光标' },
    { type: 'progress-capsule', label: '进度胶囊' },
    { type: 'step-progress', label: '阶梯进度' }
  ]

  return (
    <div className="task-progress-demo">
      <h3>任务进度演示</h3>
      
      {/* 基础任务演示 */}
      {progressData ? (
        <>
          <div className="progress-info" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <p style={{ margin: '4px 0' }}><strong>总任务数:</strong> {progressData.totalTasks}</p>
            <p style={{ margin: '4px 0' }}><strong>已完成:</strong> {progressData.completedTasks}</p>
            <p style={{ margin: '4px 0' }}><strong>进度:</strong> {progressData.progress}%</p>
            <div style={{ marginTop: '8px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
              <strong>状态明细:</strong>
              {progressData.statusStats.map(stat => (
                <div key={stat.status} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  margin: '4px 0',
                  fontSize: '13px'
                }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: stat.color 
                  }} />
                  <span style={{ minWidth: '60px' }}>{getStatusName(stat.status, currentLang)}:</span>
                  <span style={{ fontWeight: 'bold' }}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="all-display-types">
            {displayTypes.map(({ type, label }) => (
              <div key={type} className="display-type-item" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="type-label" style={{ minWidth: '80px' }}>{label}:</span>
                <TaskProgress
                  progressData={progressData}
                  displayType={type}
                  config={{
                    ...settings?.taskProgress?.displayOptions?.[type],
                    showLabel: settings?.taskProgress?.showLabel ?? true,
                    labelFormat: settings?.taskProgress?.labelFormat || 'fraction'
                  }}
                  lang={currentLang}
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
            }}>
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
      
      {/* V2 嵌套任务演示 */}
      <div style={{ marginTop: '32px', borderTop: '2px solid #ddd', paddingTop: '24px' }}>
        <h3>🔄 V2 嵌套任务演示</h3>
        
        {/* 测试控制面板 */}
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f7fa', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>嵌套层级:</span>
            <select 
              value={typeof testNestingLevel === 'number' ? testNestingLevel : testNestingLevel}
              onChange={(e) => {
                const val = e.target.value
                setTestNestingLevel(val === 'all' ? 'all' : parseInt(val))
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value={1}>Level 1</option>
              <option value={2}>Level 1-2</option>
              <option value={3}>Level 1-3</option>
              <option value="all">All levels</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox"
              id="only-leaves"
              checked={testOnlyLeaves}
              onChange={(e) => setTestOnlyLeaves(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="only-leaves" style={{ fontWeight: 'bold' }}>仅统计叶子任务 (Leaf Tasks)</label>
          </div>
          
          <button 
            onClick={refreshNestedProgress}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            刷新嵌套任务进度
          </button>
        </div>
        
        {nestedProgressData ? (
          <>
            <div className="progress-info" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
              <p style={{ margin: '4px 0' }}>
                <strong>配置:</strong> 层级={typeof testNestingLevel === 'number' ? testNestingLevel : '全部'}, 仅叶子={testOnlyLeaves ? '是' : '否'}
              </p>
              <p style={{ margin: '4px 0' }}><strong>总任务数:</strong> {nestedProgressData.totalTasks}</p>
              <p style={{ margin: '4px 0' }}><strong>已完成:</strong> {nestedProgressData.completedTasks}</p>
              <p style={{ margin: '4px 0' }}><strong>进度:</strong> {nestedProgressData.progress}%</p>
              <div style={{ marginTop: '8px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>状态明细:</strong>
                {nestedProgressData.statusStats.map(stat => (
                  <div key={stat.status} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    margin: '4px 0',
                    fontSize: '13px'
                  }}>
                    <span style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: stat.color 
                    }} />
                    <span style={{ minWidth: '60px' }}>{getStatusName(stat.status, currentLang)}:</span>
                    <span style={{ fontWeight: 'bold' }}>{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="all-display-types">
              {displayTypes.map(({ type, label }) => (
                <div key={type} className="display-type-item" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="type-label" style={{ minWidth: '80px' }}>{label}:</span>
                  <TaskProgress
                    progressData={nestedProgressData}
                    displayType={type}
                    config={{
                      ...settings?.taskProgress?.displayOptions?.[type],
                      showLabel: settings?.taskProgress?.showLabel ?? true,
                      labelFormat: settings?.taskProgress?.labelFormat || 'fraction'
                    }}
                    lang={currentLang}
                    nestingLevel={testNestingLevel}
                    onlyLeaves={testOnlyLeaves}
                    showNestingIndicator={settings?.taskProgress?.showNestingIndicator ?? false}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: '20px', color: '#666' }}>
            <p>未找到嵌套任务数据</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              请确保 nested-task-parent 块下有子任务
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskProgressDemo
