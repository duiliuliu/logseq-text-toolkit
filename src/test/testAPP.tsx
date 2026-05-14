import { useState } from 'react'
import '../main.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index'
import TextSelectionDemo from './components/TextSelectionDemo/index'
import HiccupRenderer from './components/HiccupRenderer/index'
import BlockRenderer from './components/BlockRenderer/index'
import TaskProgressDemo from './components/TaskProgressDemo/index'
import HeatmapDemo from './components/HeatmapDemo/index'
import { SummaryDemo } from './components/SummaryDemo'
import { ProxySettings } from './components/ProxySettings'
import ToastContainer from '../components/Toast/Toast'
import testConfig from './testConfig'
import { useSettingsContext } from '../settings/useSettings'
import { setMode, getMode, configureProxyMode, resetLogseqAPI } from '../logseq'
import logger from '../logseq/logger'

interface TaskItem {
  id: string
  content: string
  status: string
}

const statusOptions = [
  { value: 'todo', label: '● Todo', color: '#f59e0b' },
  { value: 'doing', label: '○ Doing', color: '#3b82f6' },
  { value: 'in-review', label: '⊛ In Review', color: '#06b6d4' },
  { value: 'done', label: '✓ Done', color: '#10b981' },
  { value: 'waiting', label: '◐ Waiting', color: '#8b5cf6' },
  { value: 'canceled', label: '✗ Canceled', color: '#ef4444' },
]

function TestApp() {
  const { settings } = useSettingsContext()

  // Proxy 设置状态
  const [apiMode, setApiMode] = useState<'mock' | 'proxy'>(getMode())
  const [showProxyModal, setShowProxyModal] = useState(false)
  const [proxyUrl, setProxyUrl] = useState('http://127.0.0.1:12315/')
  const [proxyToken, setProxyToken] = useState('')
  const [proxyStatus, setProxyStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [proxyError, setProxyError] = useState<string>('')
  const [summaryPages, setSummaryPages] = useState<{ name: string, blocks: any[] }[]>([])

  // 模式切换处理
  const handleModeChange = (mode: 'mock' | 'proxy') => {
    setApiMode(mode)
    setMode(mode)
    logger.info(`[TestApp] Switched to ${mode} mode`)
  }

  // 代理连接处理
  const handleProxyConnect = async () => {
    setProxyStatus('connecting')
    logger.info(`[TestApp] Connecting to proxy: ${proxyUrl}`)
    // TODO: 实现实际的连接逻辑
    configureProxyMode(proxyUrl, proxyToken)
    setProxyStatus('connected')
    resetLogseqAPI() // 重置 Logseq API 以应用新的代理设置
    logger.info('[TestApp] Connected to proxy and Logseq API reset')
  }

  const handleProxyDisconnect = () => {
    logger.info('[TestApp] Disconnecting from proxy')
    configureProxyMode('', '')
    setMode('mock') // 切回 mock 模式
    setProxyStatus('disconnected')
    resetLogseqAPI() // 重置 Logseq API 以应用新的设置
    logger.info('[TestApp] Disconnected from proxy and switched to mock mode')
  }

  const handleSummaryGenerate = (pageName: string, blocks: any[]) => {
    setSummaryPages(prev => [...prev, { name: pageName, blocks }])
    logger.info(`[TestApp] Summary generated: ${pageName}`)
  }

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'task-child-1', content: 'Design the UI #task', status: 'done' },
    { id: 'task-child-2', content: 'Setup project #task', status: 'done' },
    { id: 'task-child-3', content: 'Implement the logic #task', status: 'doing' },
    { id: 'task-child-4', content: 'Write documentation #task', status: 'todo' },
    { id: 'task-child-5', content: 'Create examples #task', status: 'todo' },
    { id: 'task-child-6', content: 'Write tests #task', status: 'waiting' },
  ])

  const [newTaskContent, setNewTaskContent] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('todo')
  const [taskCounter, setTaskCounter] = useState(7)

  const addTask = () => {
    if (!newTaskContent.trim()) return

    const newTask: TaskItem = {
      id: `task-child-${taskCounter}`,
      content: newTaskContent.trim(),
      status: newTaskStatus,
    }

    setTasks(prev => [...prev, newTask])
    setTaskCounter(prev => prev + 1)
    setNewTaskContent('')
    setNewTaskStatus('todo')
  }

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find(o => o.value === status)
    return option?.label?.charAt(0) || '●'
  }

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(o => o.value === status)
    return option?.color || '#6b7280'
  }

  const leftContent = (
    <div className="left-panel">
      <h3>{testConfig.leftPanel.title}</h3>
      {testConfig.leftPanel.sections.map((section, index) => (
        <div key={index} className="panel-section">
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  const rightContent = (
    <div className="right-panel">
      <h3>{testConfig.rightPanel.title}</h3>
      <div className="actions">
        {testConfig.rightPanel.actions.map((action) => (
          <button key={action.id} className="action-btn">
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  const centerContent = (
    <div className="center-content">
      <TextSelectionDemo />

      <div className="hiccup-renderer-container">
        <HiccupRenderer />
      </div>

      <div className="block-demo-container" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Block 渲染演示</h3>

        <div id="task-parent-block" className="block" data-block-id="task-parent-block" style={{ marginBottom: '12px' }}>
          <BlockRenderer
            blockId="#task-parent-block"
            content="My Project Tasks {{renderer :taskprogress}}"
            properties={{}}
          />

          {tasks.map(task => {
            const icon = getStatusIcon(task.status)
            const color = getStatusColor(task.status)

            return (
              <div key={task.id} className="block" data-block-id={task.id}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  marginLeft: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                data-properties={JSON.stringify({ status: task.status })}>
                <span style={{ color }}>{icon}</span>
                <span style={{ flex: 1 }}>{task.content} ({task.status})</span>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeTask(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px'
                  }}>
                  ×
                </button>
              </div>
            )
          })}
        </div>

        {/* 添加任务表单 */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="任务内容"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px'
            }}
          />
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={addTask}
            disabled={!newTaskContent.trim()}
            style={{
              padding: '6px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
            + 添加任务
          </button>
        </div>
      </div>

      <TaskProgressDemo />

      {/* 嵌套任务块 */}
      <div id="nested-task-parent" className="block" data-block-id="nested-task-parent" style={{ marginTop: '24px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>嵌套任务演示</h4>
        <div id="nested-task-1" className="block" data-block-id="nested-task-1"
          data-properties={JSON.stringify({ status: 'doing' })}
          style={{ padding: '8px', marginBottom: '4px', marginLeft: '20px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <span># Level 1 - Planning #task</span>
          <div id="nested-task-1-1" className="block" data-block-id="nested-task-1-1"
            data-properties={JSON.stringify({ status: 'done' })}
            style={{ padding: '8px', marginBottom: '4px', marginLeft: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <span>## Level 2 - Research #task</span>
            <div id="nested-task-1-1-1" className="block" data-block-id="nested-task-1-1-1"
              data-properties={JSON.stringify({ status: 'done' })}
              style={{ padding: '8px', marginBottom: '4px', marginLeft: '60px', backgroundColor: '#fff', borderRadius: '4px' }}>
              <span>### Level 3 - Done #task</span>
            </div>
            <div id="nested-task-1-1-2" className="block" data-block-id="nested-task-1-1-2"
              data-properties={JSON.stringify({ status: 'todo' })}
              style={{ padding: '8px', marginLeft: '60px', backgroundColor: '#fff', borderRadius: '4px' }}>
              <span>### Level 3 - Todo #task</span>
            </div>
          </div>
          <div id="nested-task-1-2" className="block" data-block-id="nested-task-1-2"
            data-properties={JSON.stringify({ status: 'todo' })}
            style={{ padding: '8px', marginLeft: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <span>## Level 2 - Design #task</span>
          </div>
        </div>
        <div id="nested-task-2" className="block" data-block-id="nested-task-2"
          data-properties={JSON.stringify({ status: 'done' })}
          style={{ padding: '8px', marginLeft: '20px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <span># Level 1 - Execution #task</span>
        </div>
      </div>

      <HeatmapDemo />

      {/* BlockView 演示说明 */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>📋 BlockView 说明</h3>
        <p>BlockView 通过以下方式启用：</p>
        <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>
          <li>在 Logseq 块中使用宏：<code>{`{{renderer :blockview}}`}</code></li>
          <li>通过 Settings 配置默认视图和隐藏视图切换栏</li>
          <li>点击视图按钮会自动保存到宏参数中</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#666' }}>
          视图切换 Bar 会显示在块上方，应用相应 CSS 类来调整子块显示。
        </p>
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>📊 真实 Block 结构示例 (来自 test.html)</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>创建块数:</strong> <span style={{ color: '#1976d2', fontWeight: 'bold' }}>156</span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>完成任务:</strong> <span style={{ color: '#388e3c', fontWeight: 'bold' }}>28 / 35</span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>活跃天数:</strong> <span style={{ color: '#f57c00', fontWeight: 'bold' }}>6 / 7</span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong>新增页面:</strong> <span style={{ color: '#7b1fa2', fontWeight: 'bold' }}>12</span>
        </div>

        <p style={{ fontSize: '12px', color: '#666' }}>
          真实 Block 结构包含 marker、content、page、created-at、updated-at 等字段，可根据宏命令参数调整视图样式。
        </p>
      </div>

      {/* Summary 生成器放在最下面 */}
      <SummaryDemo onGenerateSuccess={handleSummaryGenerate} />
    </div>
  )

  return (
    <div id="app-container" className={`app ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div id="toolbar" className="toolbar-banner">
        <div className="toolbar-banner-content">
          <span className="toolbar-banner-text">Text Toolkit - Test Mode</span>
          <div className="toolbar-banner-actions">
            {/* Proxy 设置按钮 */}
            <button
              className="button toolbar-banner-btn"
              title="Proxy 设置"
              onClick={() => setShowProxyModal(true)}
            >
              <span style={{ fontSize: '18px' }}>🔗</span>
            </button>

            <a
              className="button toolbar-banner-btn"
              title="Settings JSON"
              onClick={() => {
                const jsonStr = JSON.stringify(settings, null, 2);
                alert('Settings JSON:\n\n' + jsonStr);
                logger.debug('[TestApp] Settings JSON logged', { settings });
              }}
            >
              <i className="ti ti-settings-cancel"></i>
            </a>
          </div>
        </div>
      </div>

      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
          <div className="mode-indicator">
            <span className={`mode-badge ${apiMode}`}>
              {apiMode === 'mock' ? '📱 Mock Mode' : '🔗 Proxy Mode'}
            </span>
          </div>
        </div>
      </div>

      <TestLayout
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />

      {/* Proxy 设置 Modal */}
      <ProxySettings
        isOpen={showProxyModal}
        onClose={() => setShowProxyModal(false)}
        apiMode={apiMode}
        onModeChange={handleModeChange}
        proxyUrl={proxyUrl}
        onProxyUrlChange={setProxyUrl}
        proxyToken={proxyToken}
        onProxyTokenChange={setProxyToken}
        onConnect={handleProxyConnect}
        onDisconnect={handleProxyDisconnect}
        connectionStatus={proxyStatus}
        errorMessage={proxyError}
      />

      <ToastContainer />
    </div>
  )
}

export default TestApp
