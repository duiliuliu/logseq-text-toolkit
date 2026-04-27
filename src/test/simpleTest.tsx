import React from 'react'
import ReactDOM from 'react-dom/client'
import HiccupRenderer from './components/HiccupRenderer/index.tsx'

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HiccupRenderer />
    </React.StrictMode>
  )
}
