import '../index.css'
import '../main.css'
import './testApp.css'
import TestLayout from './components/TestLayout/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import DemoContent from './components/DemoContent/index.tsx'
import testConfig from './testConfig.ts'
import { useSettingsContext } from '../settings/useSettings.tsx'

function TestApp() {
  // 使用设置上下文
  const { settings, saveSettings } = useSettingsContext()
  
  // 重置设置函数
  const handleResetSettings = async () => {
    try {
      // 重置为默认设置
      const defaultSettings = {
        theme: 'light',
        language: 'zh-CN',
        toolbar: {
          enabled: true,
          showBorder: true,
          width: '110px',
          height: '24px',
          hoverDelay: 500,
          sponsorEnabled: true,
          items: {
            "group-format": {
              id: "group-format",
              isGroup: true,
              label: "Format",
              items: {
                "wrap-bold": {
                  id: "wrap-bold",
                  label: "Bold",
                  binding: "",
                  icon: "bold",
                  funcmode: "replace",
                  clickfunc: "**${selectedText}**"
                },
                "wrap-italic": {
                  id: "wrap-italic",
                  label: "Italic",
                  binding: "mod+shift+i",
                  icon: "italic",
                  funcmode: "replace",
                  clickfunc: "*${selectedText}*"
                },
                "wrap-strike-through": {
                  id: "wrap-strike-through",
                  label: "Strikethrough",
                  binding: "",
                  icon: "strikethrough",
                  funcmode: "replace",
                  clickfunc: "~~${selectedText}~~"
                },
                "wrap-underline": {
                  id: "wrap-underline",
                  label: "Underline",
                  binding: "",
                  icon: "underline",
                  funcmode: "replace",
                  clickfunc: "__${selectedText}__"
                }
              }
            },
            "group-hl": {
              id: "group-hl",
              isGroup: true,
              label: "Highlight",
              items: {
                "wrap-yellow-hl": {
                  id: "wrap-yellow-hl",
                  label: "Yellow",
                  binding: "",
                  icon: "highlighter",
                  funcmode: "replace",
                  clickfunc: "==${selectedText}=="
                },
                "wrap-red-hl": {
                  id: "wrap-red-hl",
                  label: "Red",
                  binding: "",
                  icon: "highlighter",
                  funcmode: "replace",
                  clickfunc: "[:mark.red ${selectedText}]"
                },
                "wrap-blue-hl": {
                  id: "wrap-blue-hl",
                  label: "Blue",
                  binding: "",
                  icon: "highlighter",
                  funcmode: "replace",
                  clickfunc: "[:mark.blue ${selectedText}]"
                }
              }
            },
            "group-text": {
              id: "group-text",
              isGroup: true,
              label: "Text",
              items: {
                "wrap-red-text": {
                  id: "wrap-red-text",
                  label: "Red Text",
                  binding: "",
                  icon: "type",
                  funcmode: "replace",
                  clickfunc: "[[:color.red ${selectedText}]]"
                },
                "wrap-blue-text": {
                  id: "wrap-blue-text",
                  label: "Blue Text",
                  binding: "",
                  icon: "type",
                  funcmode: "replace",
                  clickfunc: "[[:color.blue ${selectedText}]]"
                }
              }
            },
            "wrap-cloze": {
              id: "wrap-cloze",
              label: "Cloze",
              binding: "",
              icon: "menu",
              funcmode: "replace",
              clickfunc: " {{cloze ${selectedText}}}"
            }
          }
        }
      }
      
      await saveSettings(defaultSettings)
      alert('设置已重置为默认值')
    } catch (error) {
      console.error('重置设置失败:', error)
      alert('重置设置失败，请重试')
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
          <button 
            key={action.id} 
            className="action-btn"
            onClick={() => {
              if (action.id === 'reset-settings') {
                handleResetSettings()
              } else if (action.id === 'toggle-theme') {
                // 切换主题功能
                const newTheme = settings?.theme === 'light' ? 'dark' : 'light'
                saveSettings({ ...settings, theme: newTheme })
              } else if (action.id === 'clear-all') {
                // 清空内容功能
                alert('内容已清空')
              }
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  // 中间内容区域
  const centerContent = <DemoContent />

  return (
    <div id="app-container" className={`App ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* 测试工具栏 */}
      <div id="test-toolbar">
        <div className="test-toolbar-content">
          <span className="test-toolbar-text">工具栏演示</span>
          <div className="test-toolbar-actions">
            <button className="test-toolbar-btn" title="粗体">
              <span className="test-toolbar-icon">B</span>
            </button>
            <button className="test-toolbar-btn" title="斜体">
              <span className="test-toolbar-icon">I</span>
            </button>
            <button className="test-toolbar-btn" title="下划线">
              <span className="test-toolbar-icon">U</span>
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
