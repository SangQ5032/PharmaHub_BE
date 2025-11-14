import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
// Use WHATWG URL APIs to avoid path helpers and keep compatibility
// with Node ESM on all platforms (Windows-friendly).
// We'll rely on fs supporting file:// URLs directly.

// Fallback logic for Firebase Admin initialization:
// 1) FIREBASE_SERVICE_ACCOUNT_PATH -> path to JSON file
// 2) FIREBASE_SERVICE_ACCOUNT -> JSON string
// 3) Default credentials (ADC) if available
;(() => {
  try {
    const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    const defaultUrl = new URL('./firebase-service-account.json', import.meta.url)
    const resolvedPath = envPath ? envPath : defaultUrl

    if (resolvedPath && existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'))
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
      return
    }

    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT
    if (envJson) {
      const serviceAccount = JSON.parse(envJson)
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
      return
    }

    // Use Application Default Credentials as a last resort
    admin.initializeApp()
    console.warn(
      '[firebase] Initialized with default credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT for explicit creds.'
    )
  } catch (err) {
    console.error('[firebase] Failed to initialize Firebase Admin:', err)
    // Re-throw only if absolutely necessary; keeping server up is preferable
    // throw err
  }
})()

export default admin
