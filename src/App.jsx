import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'
import { clearTokens } from '@/lib/api'

import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kst_username')
    const token = localStorage.getItem('kst_jwt')
    return saved && token ? saved : null
  })

  const handleLogin = (username) => {
    setUser(username)
  }

  const handleLogout = () => {
    setUser(null)
    clearTokens()
  }

  if (!user) {
    return (
      <TooltipProvider>
        <LoginPage onLogin={handleLogin} />
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="/data-peta-kawasan" element={<Navigate to="/data-peta-lokasi" replace />} />
          <Route path="/kst" element={<Navigate to="/data-peta-lokasi" replace />} />
          <Route path="/*" element={<Dashboard username={user} onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
