import React from 'react'
import './SessionDashboard.css'

export default function SessionDashboard({ session, onLogout }) {
  return (
    <div className="session-dashboard">
      <div className="session-card">
        <h2>Session Established</h2>

        <div className="session-details">
          <div className="detail-row">
            <label>Session ID:</label>
            <code>{session.sessionId}</code>
            <button
              onClick={() => navigator.clipboard.writeText(session.sessionId)}
              className="btn-copy"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>

          <div className="detail-row">
            <label>Status:</label>
            <span className="status-badge success">
              ✓ Authenticated via ML-DSA-65
            </span>
          </div>

          <div className="detail-row">
            <label>Key Agreement:</label>
            <span className="status-badge">ML-KEM-768</span>
          </div>

          <div className="detail-row">
            <label>Established:</label>
            <span>{new Date(session.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <div className="session-info-box">
          <h3>Security Information</h3>
          <ul>
            <li>
              <strong>Signature Algorithm:</strong> ML-DSA-65 (Post-Quantum)
            </li>
            <li>
              <strong>Key Agreement:</strong> ML-KEM-768 (Post-Quantum)
            </li>
            <li>
              <strong>Protection:</strong> Resistant to quantum computing attacks
            </li>
            <li>
              <strong>Session Key:</strong> Derived from ML-KEM shared secret
            </li>
          </ul>
        </div>

        <button onClick={onLogout} className="btn-logout">
          Logout & End Session
        </button>
      </div>
    </div>
  )
}
