import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { AuthGate } from './AuthGate.tsx'
import { ToastProvider } from './components/Toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate>
        <AppProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppProvider>
      </AuthGate>
    </AuthProvider>
  </StrictMode>,
)

