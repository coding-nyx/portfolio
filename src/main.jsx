import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { MotionProvider } from './context/MotionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <MotionProvider><App /></MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
