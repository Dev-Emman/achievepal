import { useState } from 'react'
import { Coffee, Pause, Play, RotateCcw, Square } from 'lucide-react'
import TimerRing from '../components/TimerRing'
import FocusStats from '../components/FocusStats'
import { useStudyData } from '../context/StudyDataContext'
import { useTimer } from '../context/TimerContext'
import { formatClock, formatDuration } from '../lib/study'
import { MIN_SECONDS } from '../lib/timer'

// The 1-minute option is for testing and can be removed later
const FOCUS_OPTIONS = [1, 15, 25, 30, 45, 50, 60, 90]
const BREAK_OPTIONS = [5, 10, 15, 20]

function minutesLabel(m: number) {
  return m === 1 ? '1 minute (test)' : `${m} minutes`
}

function Focus() {
  const { modules } = useStudyData()
  const {
    state,
    remaining,
    elapsed,
    result,
    problem,
    start,
    pause,
    resume,
    reset,
    stopAndSave,
    dismissResult,
  } = useTimer()

  const [focusMinutes, setFocusMinutes] = useState('25')
  const [breakMinutes, setBreakMinutes] = useState('5')
  const [moduleId, setModuleId] = useState('')

  const active = state.status !== 'idle'
  const phase = state.status === 'idle' ? 'focus' : state.phase
  const planned =
    state.status === 'idle' ? Number(focusMinutes) * 60 : state.plannedSeconds
  const shownSeconds = state.status === 'idle' ? planned : remaining
  const fraction = planned > 0 ? shownSeconds / planned : 0
  const shownModule =
    state.status === 'idle' ? moduleId : (state.moduleId ?? '')

  const tone =
    state.status === 'paused'
      ? 'paused'
      : phase === 'break'
        ? 'break'
        : active
          ? 'focus'
          : 'idle'
  const label =
    state.status === 'paused' ? 'Paused' : phase === 'break' ? 'Break' : 'Focus'

  const savedModule =
    result?.type === 'saved' && result.moduleId
      ? modules.find((m) => m.id === result.moduleId)?.code
      : undefined

  function handleStart() {
    start('focus', Number(focusMinutes), moduleId || null)
  }

  function startBreak() {
    start('break', Number(breakMinutes), null)
  }

  function handleReset() {
    const wouldLoseWork = phase === 'focus' && elapsed >= MIN_SECONDS
    if (
      wouldLoseWork &&
      !window.confirm('Reset the timer? This session will not be saved.')
    ) {
      return
    }
    reset()
  }

  return (
    <div className="focus-layout">
      <section className="card focus-main">
        {result?.type === 'saved' && (
          <div className="result result-good" role="status">
            <p>
              Session saved: {formatDuration(result.seconds)}
              {savedModule ? ` on ${savedModule}` : ''}.
              {result.early ? '' : ' Nice work!'}
            </p>
            <div className="result-actions">
              <button
                className="btn-secondary btn-with-icon"
                onClick={startBreak}
              >
                <Coffee size={18} aria-hidden="true" />
                Start {breakMinutes}-minute break
              </button>
              <button className="link-btn" onClick={dismissResult}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {result?.type === 'break-over' && (
          <div className="result result-info" role="status">
            <p>Break's over. Ready for another focus session?</p>
            <div className="result-actions">
              <button className="link-btn" onClick={dismissResult}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {problem && (
          <p className="form-error" role="alert">
            {problem}
          </p>
        )}

        <TimerRing
          fraction={fraction}
          clock={formatClock(shownSeconds)}
          label={label}
          tone={tone}
        />

        <div className="focus-controls">
          {state.status === 'idle' && (
            <button className="btn-primary btn-with-icon" onClick={handleStart}>
              <Play size={18} aria-hidden="true" />
              Start focus session
            </button>
          )}
          {state.status === 'running' && (
            <button className="btn-primary btn-with-icon" onClick={pause}>
              <Pause size={18} aria-hidden="true" />
              Pause
            </button>
          )}
          {state.status === 'paused' && (
            <button className="btn-primary btn-with-icon" onClick={resume}>
              <Play size={18} aria-hidden="true" />
              Resume
            </button>
          )}
          {active && (
            <button className="btn-secondary btn-with-icon" onClick={handleReset}>
              <RotateCcw size={18} aria-hidden="true" />
              {phase === 'break' ? 'Skip break' : 'Reset'}
            </button>
          )}
          {active && phase === 'focus' && elapsed >= MIN_SECONDS && (
            <button
              className="btn-secondary btn-with-icon"
              onClick={stopAndSave}
            >
              <Square size={18} aria-hidden="true" />
              Stop and save
            </button>
          )}
        </div>
      </section>

      <section className="card focus-settings">
        <h2 className="section-title">Session settings</h2>

        <label className="field">
          What are you studying?
          <select
            value={shownModule}
            onChange={(e) => setModuleId(e.target.value)}
            disabled={active}
          >
            <option value="">No module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Focus time
          <select
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(e.target.value)}
            disabled={active}
          >
            {FOCUS_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {minutesLabel(m)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Break time
          <select
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            disabled={state.status === 'running' || state.status === 'paused'}
          >
            {BREAK_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {minutesLabel(m)}
              </option>
            ))}
          </select>
        </label>

        <p className="deadline-meta">
          A session is recorded when the timer finishes, or when you stop it
          after at least 1 minute.
        </p>
            </section>

      <FocusStats />
    </div>
  )
}

export default Focus