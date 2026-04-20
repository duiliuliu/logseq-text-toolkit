import '../index.css'
import '../main.css'
import TestLayout from './components/TestLayout/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
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

  // 中间内容区域
  const centerContent = (
    <div className="center-content">
      <div className="content-header">
        <h2 className="content-title">文字选择工具栏演示</h2>
        <p className="content-description">选择下方文本，体验完整的文字格式化工具</p>
      </div>
      
      <div className="demo-container">
        <div className="demo-section">
          <h3 className="demo-section-title">基础文本格式化</h3>
          <p className="demo-text">
            Logseq Text Toolkit 是一款强大的文字格式化工具，支持多种格式转换，包括：
            <strong>粗体文字</strong>、<em>斜体文字</em>、<u>下划线文字</u>、
            <del>删除线文字</del>、<mark>高亮文字</mark>等。
            无论您是在记笔记、写文档，还是在进行知识管理，这个工具都能帮助您提高效率。
          </p>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">代码和列表</h3>
          <div className="demo-code">
            <code>const greeting = "Hello, Logseq!";</code>
          </div>
          <ul className="demo-list">
            <li>项目一：文本格式化</li>
            <li>项目二：颜色高亮</li>
            <li>项目三：代码块</li>
            <li>项目四：列表样式</li>
          </ul>
        </div>
        
        <div className="demo-section">
          <h3 className="demo-section-title">高级格式化</h3>
          <p className="demo-text">
            此外，还支持 <span className="highlight-yellow">黄色高亮</span>、
            <span className="highlight-red">红色高亮</span>、
            <span className="highlight-blue">蓝色高亮</span> 等多种颜色标记功能，
            让您的笔记更加丰富多彩。
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div id="app-container" className={`App ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
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
