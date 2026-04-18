import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import App from './App.tsx'
import TestApp from './test/testAPP.tsx'
import { getDocument } from './logseq/utils.ts'
import { SettingsProvider } from './config/useSettings.tsx'

interface RenderComponentProps {
  [key: string]: any
}

const renderComponent = (container: HTMLElement | null, Component: React.ComponentType<any>, props: RenderComponentProps = {}) => {
  if (container) {
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

async function main() {
  console.log('Initializing Text Toolkit Plugin')
  logseq.UI.showMsg('❤️  Message from Hello World Plugin :)')
  console.log('Text Toolkit Plugin initialized successfully')
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp)
  logseq.ready(main).catch(console.error)
} else {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, App)
  logseq.ready(main).catch(console.error)
}
