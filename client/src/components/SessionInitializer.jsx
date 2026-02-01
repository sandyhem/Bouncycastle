import React, { useState } from 'react'
import { sessionAPI } from '../services/api'
import { cryptoAPI } from '../services/crypto'
import './SessionInitializer.css'

export default function SessionInitializer({ onSessionEstablished }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(0) // 0: init, 1: generating keys, 2: authenticating

  const handleInitializeSession = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep(1)

      // Step 1: Initialize session
      console.log('Initializing session...')
      const initResponse = await sessionAPI.initSession()
      console.log('Session initialized:', initResponse)

      const { sessionId, serverNonce } = initResponse

      // Step 2: Generate client keys
      console.log('Generating ML-DSA-65 keys...')
      setStep(2)
      const keysResponse = await cryptoAPI.generateKeys()
      console.log('Keys generated')

      const { publicKey: clientPublicKey, privateKey } = keysResponse

      // Step 3: Get server's ML-KEM public key
      console.log('Fetching server ML-KEM public key...')
      const serverKemResponse = await cryptoAPI.getServerKemPublicKey()
      const { publicKey: serverKemPublicKey } = serverKemResponse

      // Step 4: Sign the authentication data
      console.log('Signing authentication data...')
      const signResponse = await cryptoAPI.signData(
        privateKey,
        sessionId,
        serverNonce
      )
      const { signature } = signResponse

      // Step 5: Encapsulate the shared secret
      console.log('Encapsulating ML-KEM shared secret...')
      const encapsulateResponse = await cryptoAPI.encapsulateSecret(
        serverKemPublicKey
      )
      const { ciphertext: kemCiphertext } = encapsulateResponse

      // Step 6: Authenticate the session
      console.log('Authenticating session...')
      const authPayload = {
        sessionId,
        clientPublicKey,
        signature,
        kemCiphertext,
      }

      const authResponse = await sessionAPI.authenticate(authPayload)
      console.log('Authentication response:', authResponse)

      if (authResponse.status === 'SESSION_ESTABLISHED') {
        onSessionEstablished({
          sessionId,
          established: true,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const getStepLabel = () => {
    switch (step) {
      case 1:
        return 'Initializing session...'
      case 2:
        return 'Generating keys and signing...'
      case 3:
        return 'Authenticating session...'
      default:
        return 'Ready to establish session'
    }
  }

  return (
    <div className="session-initializer">
      <div className="session-card">
        <h2>Establish Secure Session</h2>
        <p className="description">
          Initialize a post-quantum cryptographic session using ML-DSA-65 for
          authentication and ML-KEM-768 for key agreement.
        </p>

        <div className="session-info">
          <div className="info-box">
            <h3>Protocol Steps</h3>
            <ol>
              <li>Initialize session (get server nonce)</li>
              <li>Generate ML-DSA-65 key pair</li>
              <li>Sign session ID and nonce</li>
              <li>Get server's ML-KEM-768 public key</li>
              <li>Encapsulate shared secret</li>
              <li>Authenticate with server</li>
            </ol>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="step-indicator">
          <p className="step-label">{getStepLabel()}</p>
          {loading && <div className="spinner"></div>}
        </div>

        <button
          onClick={handleInitializeSession}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Processing...' : 'Establish Session'}
        </button>
      </div>
    </div>
  )
}
