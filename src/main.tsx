import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 Main.tsx loaded successfully')
console.log('📦 React version:', React.version)
console.log('🎯 Root element:', document.getElementById('root'))

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(<App />)
  console.log('✅ React app rendered successfully')
} else {
  console.error('❌ Root element not found')
}
