import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/index.css'
import '../src/main.css'
import './mock/mock.js'
import testToolbarItems from './test-data.js'

// 测试用的 App 组件
const TestApp = () => {
  // 处理工具栏项目点击
  const handleToolbarItemClick = async (commandId) => {
    console.log('Clicked command:', commandId);
    // 模拟执行命令
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      let result = selectedText;
      switch (commandId) {
        case 'bold':
          result = `**${selectedText}**`;
          break;
        case 'highlight':
          result = `==${selectedText}==`;
          break;
        case 'file-link':
          result = `[[${selectedText}]]`;
          break;
        default:
          break;
      }
      // 替换选中文本
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(result));
      }
    }
  };

  return (
    <div className="App">
      <div 
        style={{
          left: '50px',
          top: '50px',
          position: 'fixed',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          color: '#333333'
        }}
      >
        <div className="flex gap-1">
          {testToolbarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleToolbarItemClick(item.id)}
              className="px-3 py-1 rounded-md hover:bg-gray-100 flex items-center gap-1"
            >
              {item.icon && <span className="font-bold">{item.icon}</span>}
              {item.label && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 初始化 Mock Logseq 并启动应用
const initializeWithMock = async () => {
  // 确保 mock.logseq 已就绪
  await window.logseq.ready()
  
  // 初始化应用
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>,
  )
}

// 启动应用
initializeWithMock()