import { useState } from 'react'
import '../main.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index.tsx'
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx'
import HiccupRenderer from './components/HiccupRenderer/index.tsx'
import BlockRenderer from './components/BlockRenderer/index.tsx'
import TaskProgressDemo from './components/TaskProgressDemo/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'

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
  
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'task-child-1', content: 'Design the UI', status: 'done' },
    { id: 'task-child-2', content: 'Setup project', status: 'done' },
    { id: 'task-child-3', content: 'Implement the logic', status: 'doing' },
    { id: 'task-child-4', content: 'Write documentation', status: 'todo' },
    { id: 'task-child-5', content: 'Create examples', status: 'todo' },
    { id: 'task-child-6', content: 'Write tests', status: 'waiting' },
  ])
  
  // 嵌套任务示例
  const [nestedTasks, setNestedTasks] = useState<TaskItem[]>([
    { id: 'nested-1', content: 'Frontend Development', status: 'doing' },
    { id: 'nested-1-1', content: 'Setup React', status: 'done' },
    { id: 'nested-1-2', content: 'Add components', status: 'doing' },
    { id: 'nested-1-2-1', content: 'Button component', status: 'done' },
    { id: 'nested-1-2-2', content: 'Input component', status: 'todo' },
    { id: 'nested-2', content: 'Backend Development', status: 'todo' },
    { id: 'nested-2-1', content: 'Setup API', status: 'todo' },
    { id: 'nested-3', content: 'Testing', status: 'waiting' },
  ])
  
  const [newTaskContent, setNewTaskContent] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('todo')
  const [taskCounter, setTaskCounter] = useState(7)

  const renderNestedTask = (
    task: TaskItem,
    level: number,
    allTasks: TaskItem[],
    setTasksFn: React.Dispatch<React.SetStateAction<TaskItem[]>>,
    statusIconFn: (status: string) => string,
    statusColorFn: (status: string) => string,
    statusOptionsArr: any[],
    updateStatusFn: (id: string, status: string) => void,
    removeTaskFn: (id: string) => void
  ) => {
    const icon = statusIconFn(task.status)
    const color = statusColorFn(task.status)
    const marginLeft = 20 + level * 20
    
    // 查找此任务的子任务（基于 id 前缀）
    const childTasks = allTasks.filter(t => 
      t.id.startsWith(task.id + '-') && 
      t.id.match(new RegExp(`^${task.id}-[^-]+$`))
    )
    
    return (
      <div key={task.id}>
        <div className="block" data-block-id={task.id} 
          style={{ 
            padding: '8px', 
            marginBottom: '4px', 
            backgroundColor: level === 0 ? '#fff8e1' : level === 1 ? '#fffbe8' : '#fff',
            borderRadius: '4px', 
            marginLeft: `${marginLeft}px`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          data-properties={JSON.stringify({ status: task.status })}>
          <span style={{ color, fontSize: '10px', opacity: 0.6 }}>
            {level > 0 ? '└ ' : ''}
          </span>
          <span style={{ color }}>{icon}</span>
          <span style={{ flex: 1 }}>{task.content} ({task.status})</span>
          <select 
            value={task.status}
            onChange={(e) => updateStatusFn(task.id, e.target.value)}
            style={{ 
              padding: '2px 6px', 
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
            {statusOptionsArr.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={() => removeTaskFn(task.id)}
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
        {/* 递归渲染子任务 */}
        {childTasks.map(childTask => 
          renderNestedTask(
            childTask, 
            level + 1, 
            allTasks, 
            setTasksFn, 
            statusIconFn, 
            statusColorFn, 
            statusOptionsArr, 
            updateStatusFn, 
            removeTaskFn
          )
        )}
      </div>
    )
  }

  const updateNestedTaskStatus = (taskId: string, newStatus: string) => {
    setNestedTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const removeNestedTask = (taskId: string) => {
    setNestedTasks(prev => prev.filter(task => 
      !task.id.startsWith(taskId)
    ))
  }

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
        
        {/* 嵌套任务示例 */}
        <div id="nested-task-parent" className="block" data-block-id="nested-task-parent" style={{ marginTop: '24px', marginBottom: '12px', padding: '12px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
          <div className="block" data-block-id="nested-task-parent" 
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: '#d0e8f2',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
            data-properties={JSON.stringify({ status: 'doing' })}>
            🎯 Nested Tasks V2 Demo {{renderer :taskprogress}}
          </div>
          
          {/* 渲染 Level 1 任务 */}
          {nestedTasks.slice(0, 1).map(task => 
            renderNestedTask(
              task, 
            0,
            nestedTasks,
            setNestedTasks,
            getStatusIcon,
            getStatusColor,
            statusOptions,
            updateNestedTaskStatus,
            removeNestedTask
          ))}
          
          {nestedTasks.slice(1, 2).map(task => 
            renderNestedTask(
              task, 
              0,
              nestedTasks,
              setNestedTasks,
              getStatusIcon,
              getStatusColor,
              statusOptions,
              updateNestedTaskStatus,
              removeNestedTask
          ))}
          
          {nestedTasks.slice(2, 3).map(task => 
            renderNestedTask(
              task, 
              0,
              nestedTasks,
              setNestedTasks,
              getStatusIcon,
              getStatusColor,
              statusOptions,
              updateNestedTaskStatus,
              removeNestedTask
          ))}
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
    </div>
  )

  return (
    <div id="app-container" className={`app ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div id="toolbar" className="toolbar-banner">
        <div className="toolbar-banner-content">
          <span className="toolbar-banner-text">工具栏演示</span>
          <div className="toolbar-banner-actions">
            <button className="toolbar-banner-btn" title="粗体">
              <span className="toolbar-icon">B</span>
            </button>
            <button className="toolbar-banner-btn" title="斜体">
              <span className="toolbar-icon">I</span>
            </button>
            <button className="toolbar-banner-btn" title="下划线">
              <span className="toolbar-icon">U</span>
            </button>
          </div>
        </div>
      </div>
      
      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
        </div>
      </div>
      
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      <ToastContainer />
    </div>
  )
}

export default TestApp