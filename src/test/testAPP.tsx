import { useEffect, useState } from 'react'
import '../index.css'
import '../main.css'
import SettingsModal from '../components/SettingsModal/index.tsx'
import TestLayout from './components/TestLayout/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'
import { logseqAPI } from '../logseq/index.ts'

function TestApp() {
  const [isReady, setIsReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // 使用设置上下文
  const { settings } = useSettingsContext()

  // 初始化 mock logseq
  useEffect(() => {
    const initLogseqPlugin = async () => {
      try {
        console.log('Welcome to Text Toolkit Test Mode!')
        await logseqAPI.ready()
        console.log('Mock Logseq plugin ready')
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize mock plugin:', error)
        setIsReady(false)
      }
    }

    initLogseqPlugin()
  }, [])

  // 确保settings存在
  if (!settings) {
    return (
      <div className="App">
        <h1>Text Toolkit Plugin (Test Mode)</h1>
        <p>Loading settings...</p>
      </div>
    )
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

  // 中间内容区域
  const centerContent = (
    <div className="center-content">
      <div className="content-header">
        <h2>{testConfig.content.title}</h2>
        <p className="content-description">测试工具栏功能和文本编辑操作</p>
      </div>
      
      <div className="test-content-section">
        <div className="content-card">
          <h3>工具栏演示</h3>
          <div className="content-area">
            {testConfig.content.paragraphs.map((paragraph, index) => (
              <div key={index} id={`editable-paragraph-${index + 1}`} className="editable-paragraph">
                {paragraph}
              </div>
            ))}
          </div>
          <div className="content-actions">
            <button className="action-button">应用样式</button>
            <button className="action-button">重置</button>
          </div>
        </div>
        
        <div className="content-card">
          <h3>功能说明</h3>
          <ul className="feature-list">
            <li>点击工具栏按钮可应用相应的文本格式</li>
            <li>支持粗体、斜体、下划线等基本格式</li>
            <li>可通过设置自定义工具栏布局</li>
            <li>支持深色/浅色主题切换</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div id="app-container" className={`App ${settings.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* 顶部工具栏 */}
      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
          <div className="toolbar-actions">
            <div id="toolbar" className="toolbar-container">
            </div>
            <button 
              id="settings-btn" 
              className="settings-button"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
      
      <p className="status-text">{isReady ? 'Plugin is ready and running' : 'Initializing plugin...'}</p>
      
      {/* 使用TestLayout布局 */}
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={settings.theme}
      />
      
      {/* Toast 容器 */}
      <ToastContainer />
    </div>
  )
}

export default TestApp
