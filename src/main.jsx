import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import App from './App.jsx'
import TestApp from './test/testAPP.jsx'
import { SettingsProvider } from './hooks/useSettings.jsx'

// 根据启动模式选择应用
const AppComponent = import.meta.env.MODE === 'test' ? TestApp : App

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <AppComponent />
    </SettingsProvider>
  </React.StrictMode>,
)