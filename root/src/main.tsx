import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Global polyfills for AT Protocol
import { Buffer } from 'buffer'
window.Buffer = Buffer
window.process = { env: {} } as any

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)