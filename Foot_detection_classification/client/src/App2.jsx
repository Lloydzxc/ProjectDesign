import React, { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage.jsx'
import WebcamScreen from './components/WebcamScreen.jsx'
import HistoryPage from './components/HistoryPage.jsx'
import MeasurementScreen from './components/MeasurementScreen.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  // Page navigation state: 'detection', 'history', or 'measurement'
  const [currentPage, setCurrentPage] = useState('detection')

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

  // If user is logged in, show main app with navigation
  return (
    <div className="container">
      {/* Header Card with User Info and Logout */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Foot Detection and Classification System</h1>
            <p className="small">
              Welcome back, <strong>{user.fullName}</strong>! Analyze foot conditions using AI-powered detection.
            </p>
          </div>
          <button className="secondary" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* AI Detection Tab */}
          <button 
            onClick={() => setCurrentPage('detection')}
            style={{
              background: currentPage === 'detection' ? 'var(--primary)' : 'transparent',
              border: currentPage === 'detection' ? 'none' : '2px solid var(--card-border)',
              color: currentPage === 'detection' ? 'white' : 'var(--text-primary)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🤖 AI Detection
          </button>

          {/* Foot Measurement Tab */}
          <button 
            onClick={() => setCurrentPage('measurement')}
            style={{
              background: currentPage === 'measurement' ? 'var(--primary)' : 'transparent',
              border: currentPage === 'measurement' ? 'none' : '2px solid var(--card-border)',
              color: currentPage === 'measurement' ? 'white' : 'var(--text-primary)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📏 Foot Measurements
          </button>

          {/* History Tab */}
          <button 
            onClick={() => setCurrentPage('history')}
            style={{
              background: currentPage === 'history' ? 'var(--primary)' : 'transparent',
              border: currentPage === 'history' ? 'none' : '2px solid var(--card-border)',
              color: currentPage === 'history' ? 'white' : 'var(--text-primary)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📚 History
          </button>
        </div>
      </div>

      {/* Page Content - Renders based on currentPage state */}
      <div style={{ marginTop: 20 }}>
        {currentPage === 'detection' && (
          // AI-powered foot detection using YOLO model
          <WebcamScreen onViewHistory={() => setCurrentPage('history')} />
        )}
        
        {currentPage === 'measurement' && (
          // Manual foot measurement using A4 reference paper (no AI)
          <MeasurementScreen onBack={() => setCurrentPage('detection')} />
        )}
        
        {currentPage === 'history' && (
          // View past AI detection results
          <HistoryPage onBack={() => setCurrentPage('detection')} />
        )}
      </div>
    </div>
  )
}