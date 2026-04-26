import '../main.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index.tsx'
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import CommentApp from '../components/Comment/CommentApp.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'
import { useState } from 'react'

// 简单的 hiccup 解析器
function parseHiccup(hiccup: any): React.ReactNode {
  if (typeof hiccup === 'string' || typeof hiccup === 'number') {
    return hiccup
  }
  
  if (Array.isArray(hiccup)) {
    const [tag, ...rest] = hiccup
    
    if (typeof tag !== 'string') {
      return null
    }
    
    let props: any = {}
    let children: React.ReactNode[] = []
    
    if (rest.length > 0 && typeof rest[0] === 'object' && !Array.isArray(rest[0])) {
      props = rest[0]
      children = rest.slice(1)
    } else {
      children = rest
    }
    
    // 处理类名
    if (props.class) {
      props.className = props.class
      delete props.class
    }
    
    // 处理 data-* 属性
    Object.keys(props).forEach(key => {
      if (key.startsWith('data-')) {
        props[key] = props[key]
      }
    })
    
    return React.createElement(
      tag,
      props,
      ...children.map(child => parseHiccup(child))
    )
  }
  
  return null
}

function TestApp() {
  // 使用设置上下文
  const { settings } = useSettingsContext()
  
  // hiccup 内容状态
  const [hiccupInput, setHiccupInput] = useState<string>('[:div {:class "container"} [:h1 "Hiccup 渲染演示"] [:p "这是一个段落"] [:ul [:li "项目 1"] [:li "项目 2"]]]')
  const [parsedHiccup, setParsedHiccup] = useState<any>(null)
  
  // 解析 hiccup 内容
  const handleHiccupChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setHiccupInput(value)
    
    try {
      // 安全地评估 hiccup 内容
      const parsed = eval(`(${value})`)
      setParsedHiccup(parsed)
    } catch (error) {
      console.error('Hiccup 解析错误:', error)
      setParsedHiccup(null)
    }
  }

  // 左侧面板内容
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

  // 右侧面板内容
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

  // 中间内容区域 - 包含 TextSelectionDemo 和 Hiccup 渲染演示
  const centerContent = (
    <div className="center-content">
      <TextSelectionDemo />
      
      {/* Hiccup 渲染演示 */}
      <div className="hiccup-demo">
        <h2>Hiccup 实时渲染</h2>
        <div className="hiccup-input-container">
          <label htmlFor="hiccup-input">输入 Hiccup 内容:</label>
          <textarea
            id="hiccup-input"
            value={hiccupInput}
            onChange={handleHiccupChange}
            className="hiccup-input"
            rows={6}
            placeholder="例如: [:div {:class \"container\"} [:h1 \"Hello\"]]"
          />
        </div>
        <div className="hiccup-output-container">
          <h3>渲染结果:</h3>
          <div className="hiccup-output">
            {parsedHiccup ? parseHiccup(parsedHiccup) : <div className="error">解析错误</div>}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div id="app-container" className={`app ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* 右上角工具栏横幅 */}
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
      
      {/* 顶部区域 */}
      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
        </div>
      </div>
      
      {/* 使用TestLayout布局 */}
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      {/* Toast 容器 */}
      <ToastContainer />
      

    </div>
  )
}

export default TestApp
