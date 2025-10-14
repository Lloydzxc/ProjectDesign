import React, { useState } from 'react'
import LoginPage from './components/LoginPage.jsx'
import WebcamScreen from './components/WebcamScreen.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setUser(null)
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
            <h1>Foot Detection System</h1>
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
        <WebcamScreen />
      </div>
    </div>
  )
}