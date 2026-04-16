import { useEffect, useState, useRef } from 'react'
import '../index.css'
import '../main.css'
import SelectToolbar from '../components/SelectToolbar/index.tsx'
import SettingsModal from '../components/SettingsModal/index.tsx'
import TestLayout from './components/TestLayout/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import { toolbarItems as testData } from './testData.ts'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../config/useSettings.tsx'
import { logseqAPI } from '../logseq/index.ts'

// 导入mock logseq
import '../logseq/mock/index.ts'

function TestApp() {
  const [isReady, setIsReady] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
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

  // 当组件挂载后，更新targetElement
  useEffect(() => {
    if (contentRef.current) {
      setTargetElement(contentRef.current)
      console.log('Target element set:', contentRef.current)
    }
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
    <div className="center-content" ref={contentRef}>
      <h2>{testConfig.content.title}</h2>
      {testConfig.content.paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )

  return (
    <div className={`App ${settings.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* 顶部工具栏 */}
      <div className="top-toolbar">
        <h1>Text Toolkit Plugin (Test Mode)</h1>
        <button 
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          ⚙️ 设置
        </button>
      </div>
      
      <p className="status-text">{isReady ? 'Plugin is ready and running' : 'Initializing plugin...'}</p>
      
      {/* 使用TestLayout布局 */}
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      <SelectToolbar 
        targetElement={targetElement || undefined}
        items={testData} 
        theme={settings.theme} 
        showBorder={settings.toolbar.showBorder}
        width={settings.toolbar.width}
        height={settings.toolbar.height}
        hoverDelay={settings.toolbar.hoverDelay}
        sponsorEnabled={settings.toolbar.sponsorEnabled}
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
