import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.ts'

const SPURIOUS_ERROR_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
])

/**
 * Chrome's Cross-Origin-Opener-Policy handling can make signInWithPopup
 * reject with a spurious "closed"/"cancelled" error a moment before the
 * sign-in actually completes and auth state updates. For those specific
 * error codes, give auth state a brief chance to catch up before treating
 * it as a real failure.
 */
export async function signInWithGoogle(): Promise<boolean> {
  try {
    await signInWithPopup(auth, googleProvider)
    return true
  } catch (err) {
    const code = (err as { code?: string }).code
    if (!code || !SPURIOUS_ERROR_CODES.has(code)) return false

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        unsubscribe()
        resolve(!!auth.currentUser)
      }, 1500)

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        clearTimeout(timer)
        unsubscribe()
        resolve(!!user)
      })
    })
  }
}
