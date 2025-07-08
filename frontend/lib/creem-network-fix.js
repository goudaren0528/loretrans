// Creem Network Fix for Node.js compatibility
// This file provides compatibility fixes for Creem SDK in Next.js environment

module.exports = {
  // Network adapter for fetch API
  createNetworkAdapter: () => {
    return {
      request: async (config) => {
        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers || {},
          body: config.data ? JSON.stringify(config.data) : undefined,
        })
        
        return {
          data: await response.json(),
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }
      }
    }
  },
  
  // Crypto utilities for signature verification
  createCryptoUtils: () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto')
    
    return {
      verifySignature: (payload, signature, secret) => {
        try {
          const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex')
          
          return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
          )
        } catch (error) {
          console.error('Signature verification error:', error)
          return false
        }
      }
    }
  }
}
