import React, { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage.jsx'
import WebcamScreen from './components/WebcamScreen.jsx'
import HistoryPage from './components/HistoryPage.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('detection') // 'detection' or 'history'

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setCurrentPage('detection')
    }
  }

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // If user is logged in, show main app
  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Foot Detection and Classification System</h1>
            <p className="small">
              Welcome back, <strong>{user.fullName}</strong>! Analyze foot conditions using AI-powered detection.
            </p>
          </div>
          <button className="secondary" onClick={handleLogout}>
             Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {currentPage === 'detection' ? (
          <WebcamScreen onViewHistory={() => setCurrentPage('history')} />
        ) : (
          <HistoryPage onBack={() => setCurrentPage('detection')} />
        )}
      </div>
    </div>
  )
}