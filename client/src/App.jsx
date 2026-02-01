import React, { useState } from 'react'
import SessionInitializer from './components/SessionInitializer'
import SessionDashboard from './components/SessionDashboard'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Banking Session Manager</h1>
        <p>Post-Quantum Cryptography Session with ML-DSA & ML-KEM</p>
      </header>

      <main className="app-main">
        {!session ? (
          <SessionInitializer onSessionEstablished={setSession} />
        ) : (
          <SessionDashboard session={session} onLogout={() => setSession(null)} />
        )}
      </main>
    </div>
  )
}
