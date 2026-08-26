import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.ts'
import GoogleButton from '../components/GoogleButton.tsx'
import { signInWithGoogle } from '../lib/googleSignIn.ts'
import './pages.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch {
      setError('Incorrect email or password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    const success = await signInWithGoogle()
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <section className="page page-center">
      <h1>Log In</h1>

      <GoogleButton label="Continue with Google" onClick={handleGoogleSignIn} />

      <div className="divider">or</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <Link to="/" className="back-link">
        &larr; Back
      </Link>
    </section>
  )
}

export default LoginPage
