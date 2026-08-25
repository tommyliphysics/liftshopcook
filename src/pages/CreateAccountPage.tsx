import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.ts'
import GoogleButton from '../components/GoogleButton.tsx'
import './pages.css'

function CreateAccountPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  async function handleGoogleSignIn() {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch {
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <section className="page page-center">
      <h1>Create Account</h1>

      <GoogleButton label="Sign up with Google" onClick={handleGoogleSignIn} />

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
          autoComplete="new-password"
          required
        />

        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary">
          Create Account
        </button>
      </form>
      <Link to="/" className="back-link">
        &larr; Back
      </Link>
    </section>
  )
}

export default CreateAccountPage
