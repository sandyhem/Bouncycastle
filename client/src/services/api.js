import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sessionAPI = {
  // Step 1: Initialize session and get nonce
  initSession: async () => {
    try {
      const response = await api.post('/session/init')
      return response.data
    } catch (error) {
      throw new Error(`Failed to initialize session: ${error.message}`)
    }
  },

  // Step 3: Authenticate with ML-DSA signature and ML-KEM ciphertext
  authenticate: async (authPayload) => {
    try {
      const response = await api.post('/session/auth', authPayload)
      return response.data
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
  },
}

export default api
