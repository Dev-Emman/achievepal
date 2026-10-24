import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'signup'

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (mode === 'login' && !password) {
      setError('Please enter your password.')
      return
    }

    setBusy(true)

    if (mode === 'login') {
      const err = await signIn(cleanEmail, password)
      if (err) setError(err)
    } else {
      const result = await signUp(cleanEmail, password)
      if (result.error) setError(result.error)
      else if (result.needsConfirmation) {
        setMessage('Check your email to confirm your account, then log in.')
      }
    }

    setBusy(false)
  }

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setMessage('')
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="auth-brand">AchievePal</p>
          <p className="auth-sub">
            {mode === 'login' ? 'Welcome back. Log in to continue.' : 'Create your account.'}
          </p>
        </div>

        <label className="field">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={254}
          />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            maxLength={72}
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <p className="auth-sub">
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  )
}

export default AuthPage