import '../index.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index.tsx'
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'

function TestApp() {
  // 使用设置上下文
  const { settings } = useSettingsContext()

  // 左侧面板内容
  const leftContent = (
    <div className="ltt-left-panel">
      <h3>{testConfig.leftPanel.title}</h3>
      {testConfig.leftPanel.sections.map((section, index) => (
        <div key={index} className="ltt-panel-section">
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
    <div className="ltt-right-panel">
      <h3>{testConfig.rightPanel.title}</h3>
      <div className="ltt-actions">
        {testConfig.rightPanel.actions.map((action) => (
          <button key={action.id} className="ltt-action-btn">
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  // 中间内容区域 - 使用独立的 TextSelectionDemo 组件
  const centerContent = <TextSelectionDemo />

  return (
    <div id="ltt-app-container" className={`ltt-app ${settings?.theme === 'dark' ? 'ltt-dark-mode' : 'ltt-light-mode'}`}>
      {/* 右上角工具栏横幅 */}
      <div id="ltt-toolbar" className="ltt-toolbar-banner">
        <div className="ltt-toolbar-banner-content">
          <span className="ltt-toolbar-banner-text">工具栏演示</span>
          <div className="ltt-toolbar-banner-actions">
            <button className="ltt-toolbar-banner-btn" title="粗体">
              <span className="ltt-toolbar-icon">B</span>
            </button>
            <button className="ltt-toolbar-banner-btn" title="斜体">
              <span className="ltt-toolbar-icon">I</span>
            </button>
            <button className="ltt-toolbar-banner-btn" title="下划线">
              <span className="ltt-toolbar-icon">U</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 顶部区域 */}
      <div id="ltt-head" className="ltt-top-toolbar">
        <div className="ltt-toolbar-content">
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
