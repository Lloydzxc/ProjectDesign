import React from 'react'

/**
 * A very simple "Login" button that toggles a logged-in state.
 * No real authentication yet — this is just UI wiring.
 */
export default function LoginButton({ isLoggedIn, onLogin, onLogout }) {
  return (
    <div className="row">
      {!isLoggedIn ? (
        <button onClick={onLogin}>Login</button>
      ) : (
        <button className="secondary" onClick={onLogout}>Logout</button>
      )}
    </div>
  )
}
