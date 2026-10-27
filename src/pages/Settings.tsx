import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStudyData } from '../context/StudyDataContext'
import { changePassword, updateFullName } from '../lib/accountApi'
import { minutesToHoursText, parseHours, parseTarget } from '../lib/profile'

type Feedback = { kind: 'error' | 'success'; text: string } | null

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  return feedback.kind === 'error' ? (
    <p className="form-error" role="alert">{feedback.text}</p>
  ) : (
    <p className="form-success" role="status">{feedback.text}</p>
  )
}

function ProfileCard() {
  const { user } = useAuth()
  const current =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''

  const [name, setName] = useState(current)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) {
      setFeedback({ kind: 'error', text: 'Please enter your name.' })
      return
    }

    setBusy(true)
    const err = await updateFullName(clean)
    setBusy(false)

    if (err) {
      setFeedback({ kind: 'error', text: err })
    } else {
      setName(clean)
      setFeedback({ kind: 'success', text: 'Name updated.' })
    }
  }

  return (
    <form className="card assignment-form" onSubmit={handleSubmit}>
      <h2 className="section-title">Profile</h2>

      <div className="settings-fields">
        <label className="field">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
          />
        </label>
        <label className="field">
          Email address
          <input value={user?.email ?? ''} readOnly />
        </label>
      </div>
      <p className="deadline-meta">Changing your email isn't available yet.</p>

      <FeedbackLine feedback={feedback} />
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Saving...' : 'Save name'}
      </button>
    </form>
  )
}

function GoalsCard() {
  const { profile, saveProfile } = useStudyData()

  const [hours, setHours] = useState(minutesToHoursText(profile.weeklyGoalMinutes))
  const [target, setTarget] = useState(String(profile.defaultTarget))
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const minutes = parseHours(hours)
    const targetNumber = parseTarget(target)

    if (minutes === null) {
      setFeedback({
        kind: 'error',
        text: 'Weekly goal must be a number of hours between 0 and 168.',
      })
      return
    }
    if (targetNumber === null) {
      setFeedback({ kind: 'error', text: 'Target must be between 0 and 100.' })
      return
    }

    setBusy(true)
    try {
      await saveProfile({ weeklyGoalMinutes: minutes, defaultTarget: targetNumber })
      setFeedback({ kind: 'success', text: 'Goals saved.' })
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card assignment-form" onSubmit={handleSubmit}>
      <h2 className="section-title">Study goals</h2>

      <div className="settings-fields">
        <label className="field">
          Weekly study goal (hours)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={168}
            step="any"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </label>
        <label className="field">
          Default target grade (%)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
      </div>
      <p className="deadline-meta">
        Set the weekly goal to 0 for no goal. The default target is where the
        Grade Calculator starts for each module.
      </p>

      <FeedbackLine feedback={feedback} />
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Saving...' : 'Save goals'}
      </button>
    </form>
  )
}

function PasswordCard() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 8) {
      setFeedback({ kind: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setFeedback({ kind: 'error', text: 'The two passwords do not match.' })
      return
    }

    setBusy(true)
    const err = await changePassword(password)
    setBusy(false)

    if (err) {
      setFeedback({ kind: 'error', text: err })
    } else {
      setPassword('')
      setConfirm('')
      setFeedback({ kind: 'success', text: 'Password changed.' })
    }
  }

  return (
    <form className="card assignment-form" onSubmit={handleSubmit}>
      <h2 className="section-title">Change password</h2>

      <div className="settings-fields">
        <label className="field">
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
          />
        </label>
        <label className="field">
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
          />
        </label>
      </div>

      <FeedbackLine feedback={feedback} />
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Saving...' : 'Change password'}
      </button>
    </form>
  )
}

function Settings() {
  return (
    <div className="settings-stack">
      <ProfileCard />
      <GoalsCard />
      <PasswordCard />
    </div>
  )
}

export default Settings