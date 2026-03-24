import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { registerSW } from 'virtual:pwa-register'

// This will automatically update the app when a new version is available
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      
    </AuthProvider>
  </StrictMode>,
)
