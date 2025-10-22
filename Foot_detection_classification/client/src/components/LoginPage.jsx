import React, { useState } from 'react'

export default function LoginPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign Up Logic
        if (!formData.fullName.trim()) {
          setError('Please enter your full name')
          setIsLoading(false)
          return
        }

        if (!formData.email.trim() || !formData.email.includes('@')) {
          setError('Please enter a valid email address')
          setIsLoading(false)
          return
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:4000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Sign up failed')
          setIsLoading(false)
          return
        }

        // Save token
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        alert('✅ Account created successfully!')
        onLoginSuccess(data.user)
      } else {
        // Login Logic
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Please enter both email and password')
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:4000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Login failed')
          setIsLoading(false)
          return
        }

        // Save token
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        onLoginSuccess(data.user)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Connection error. Please check if server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ marginBottom: 8 }}>
            {isSignUp ? ' Create Account' : ' Welcome '}
          </h1>
          <p className="small" style={{ color: 'var(--text-secondary)' }}>
            {isSignUp 
              ? 'Sign up to start detecting foot conditions' 
              : 'Login to access foot detection and classification system'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--text-secondary)'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid var(--card-border)',
                  background: 'var(--dark-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text-secondary)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid var(--card-border)',
                background: 'var(--dark-bg)',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text-secondary)'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid var(--card-border)',
                background: 'var(--dark-bg)',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
          </div>

          {isSignUp && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--text-secondary)'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid var(--card-border)',
                  background: 'var(--dark-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
              />
            </div>
          )}

          {error && (
            <div className="error-box" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', fontSize: 16, marginBottom: 16 }}
          >
            {isLoading ? (
              <><span className="loading"></span>{isSignUp ? 'Creating Account...' : 'Logging in...'}</>
            ) : (
              isSignUp ? ' Create Account' : ' Login'
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={toggleMode}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)',
                padding: '8px',
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'underline',
                boxShadow: 'none'
              }}
            >
              {isSignUp 
                ? 'Already have an account? Login' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}