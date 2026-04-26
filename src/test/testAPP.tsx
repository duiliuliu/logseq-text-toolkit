import '../main.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index.tsx'
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx'
import HiccupRenderer from './components/HiccupRenderer/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import CommentApp from '../components/Comment/CommentApp.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'

function TestApp() {
  // 使用设置上下文
  const { settings } = useSettingsContext()

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

  // 中间内容区域 - 使用 HiccupRenderer 组件支持 hiccup 实时渲染
  const centerContent = (
    <div className="center-content">
      <TextSelectionDemo />
      <div className="hiccup-renderer-container">
        <HiccupRenderer />
      </div>
    </div>
  )

  // 确定当前主题
  const getCurrentTheme = () => {
    if (!settings) return 'light';
    
    if (settings.theme === 'system') {
      // 检测系统主题
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return settings.theme;
  };

  const currentTheme = getCurrentTheme();

  return (
    <div id="app-container" className={`app ${currentTheme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
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
