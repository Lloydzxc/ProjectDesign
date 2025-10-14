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

  // Mock user database (in real app, this would be in backend)
  const getUsers = () => {
    const users = localStorage.getItem('users')
    return users ? JSON.parse(users) : []
  }

  const saveUser = (user) => {
    const users = getUsers()
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

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

      // Check if user already exists
      const users = getUsers()
      if (users.some(u => u.email === formData.email)) {
        setError('An account with this email already exists')
        setIsLoading(false)
        return
      }

      // Save new user
      saveUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      })

      alert('Account created successfully! Please login.')
      setIsSignUp(false)
      setFormData({ email: formData.email, password: '', confirmPassword: '', fullName: '' })
    } else {
      // Login Logic
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      const users = getUsers()
      const user = users.find(
        u => u.email === formData.email && u.password === formData.password
      )

      if (!user) {
        // Check if email exists but password is wrong
        const emailExists = users.some(u => u.email === formData.email)
        if (emailExists) {
          setError('❌ Incorrect password. Please try again.')
        } else {
          setError('❌ No account found with this email. Please sign up first.')
        }
        setIsLoading(false)
        return
      }

      // Successful login
      onLoginSuccess(user)
    }

    setIsLoading(false)
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
              : 'Login to access foot detection system'}
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
              isSignUp ? ' Create Account' : 'Login'
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="secondary"
              onClick={toggleMode}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)',
                padding: '8px',
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'underline'
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