import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.jsx'
import '../src/index.css'
import '../src/main.css'

// 导入mock logseq
import './mock/mock.js'

// 初始化应用
const initializeApp = async () => {
  // 初始化mock logseq
  await window.logseq.ready()
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// 启动应用
initializeApp()