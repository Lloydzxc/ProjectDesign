import React, { useState } from 'react'
import LoginButton from "./components/LoginButton.jsx";
import WebcamScreen from './components/WebcamScreen.jsx';

export default function App() {
  // "isLoggedIn" is just a flag for demo purposes.
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="container">
      <div className="card">
        <h1>Foot Detection Classification</h1>
        <p className="small">
          Simple frontend with a Login button, real-time webcam, Upload Image, and Capture buttons.
          No database yet — ready to plug in later.
        </p>
        <div style={{ marginTop: 10 }}>
          <LoginButton
            isLoggedIn={isLoggedIn}
            onLogin={() => setIsLoggedIn(true)}
            onLogout={() => setIsLoggedIn(false)}
          />
        </div>
      </div>

      {isLoggedIn ? (
        <div style={{ marginTop: 20 }}>
          <WebcamScreen />
        </div>
      ) : (
        <div className="card" style={{ marginTop: 20 }}>
          <h2>Welcome</h2>
          <p>Click <span className="mono">Login</span> to open the webcam screen.</p>
        </div>
      )}
    </div>
  )
}
