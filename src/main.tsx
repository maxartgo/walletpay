import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Admin } from './pages/Admin.tsx'
import { WalletProvider } from './contexts/WalletContext'
import { LanguageProvider } from './contexts/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <WalletProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WalletProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
