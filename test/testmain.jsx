import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.jsx'
import '../src/index.css'
import '../src/main.css'
import './mock/mock.js'

// 初始化 Mock Logseq 并启动应用
const initializeWithMock = async () => {
  // 确保 mock.logseq 已就绪
  await window.logseq.ready()
  
  // 初始化应用
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// 启动应用
initializeWithMock()