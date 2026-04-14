import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'

// 根据启动模式加载不同的应用
let AppComponent
if (import.meta.env.MODE === 'test') {
  // 测试模式下加载testAPP
  import('./test/testAPP.jsx').then((module) => {
    // testAPP.jsx已经包含了完整的初始化逻辑
  })
} else {
  // 正常模式下加载App
  import('./App.jsx').then((module) => {
    AppComponent = module.default
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <AppComponent />
      </React.StrictMode>,
    )
  })
}