// Crypto helper service - requires backend support for ML-KEM and ML-DSA
// This component will communicate with a crypto helper endpoint

import api from './api'

export const cryptoAPI = {
  // Generate ML-DSA-65 key pair on backend
  generateKeys: async () => {
    try {
      const response = await api.post('/crypto/generate-keys')
      return response.data // { publicKey: base64, privateKey: base64 }
    } catch (error) {
      throw new Error(`Failed to generate keys: ${error.message}`)
    }
  },

  // Sign data with ML-DSA-65
  signData: async (privateKey, sessionId, serverNonce) => {
    try {
      const response = await api.post('/crypto/sign', {
        privateKey,
        sessionId,
        serverNonce,
      })
      return response.data // { signature: base64 }
    } catch (error) {
      throw new Error(`Failed to sign data: ${error.message}`)
    }
  },

  // Get server's ML-KEM public key
  getServerKemPublicKey: async () => {
    try {
      const response = await api.get('/crypto/server-kem-public-key')
      return response.data // { publicKey: base64 }
    } catch (error) {
      throw new Error(`Failed to get server KEM public key: ${error.message}`)
    }
  },

  // Encapsulate shared secret with ML-KEM-768
  encapsulateSecret: async (serverPublicKey) => {
    try {
      const response = await api.post('/crypto/encapsulate', {
        serverPublicKey,
      })
      return response.data // { ciphertext: base64, sharedSecret: base64 }
    } catch (error) {
      throw new Error(`Failed to encapsulate secret: ${error.message}`)
    }
  },
}

export default cryptoAPI
