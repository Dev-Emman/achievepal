import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoMark from '../assets/logo-mark.png'
import heroPanel from '../assets/hero-panel.webp'

type Mode = 'login' | 'signup'

type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}

function PasswordField({ label, value, onChange, autoComplete }: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={72}
        />
        <button
          type="button"
          className="eye-btn"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const nameId = useId()
  const emailId = useId()

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    if (mode === 'signup' && !cleanName) {
      setError('Please enter your full name.')
      return
    }
    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (mode === 'signup' && password !== confirm) {
      setError('The two passwords do not match.')
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
      const result = await signUp(cleanEmail, password, cleanName)
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
    setPassword('')
    setConfirm('')
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <img
          src={heroPanel}
          alt=""
          className="auth-hero-img"
          loading="lazy"
          decoding="async"
        />
        <div className="auth-hero-shade" />
        <div className="auth-hero-content">
          <div className="auth-hero-brand">
            <img src={logoMark} alt="" />
            <span>AchievePal</span>
          </div>
          <div>
            <h2>Your academic success, all in one place.</h2>
            <p>
              Manage your modules, assignments, grades and study time with ease.
            </p>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-mobile-brand">
            <img src={logoMark} alt="" />
            <span>AchievePal</span>
          </div>

          <div>
            <h1 className="auth-title">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="auth-sub">
              {isLogin
                ? 'Log in to continue to your dashboard.'
                : 'Join AchievePal and take control of your studies.'}
            </p>
          </div>

          {!isLogin && (
            <div className="field">
              <label htmlFor={nameId}>Full name</label>
              <input
                id={nameId}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                maxLength={80}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor={emailId}>Email address</label>
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
            />
          </div>

          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {!isLogin && (
            <PasswordField
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
          </button>

          <p className="auth-sub auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="link-btn" onClick={switchMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  )
}

export default AuthPage