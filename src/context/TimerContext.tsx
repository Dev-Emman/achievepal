import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useStudyData } from './StudyDataContext'
import { formatClock } from '../lib/study'
import {
  IDLE,
  MAX_SECONDS,
  MIN_SECONDS,
  elapsedSeconds,
  isFinished,
  parseTimerState,
  pauseTimer,
  resumeTimer,
  secondsLeft,
  startTimer,
} from '../lib/timer'
import type { Phase, TimerState } from '../lib/timer'

type RunningState = Extract<TimerState, { status: 'running' }>

type TimerResult =
  | { type: 'saved'; seconds: number; moduleId: string | null; early: boolean }
  | { type: 'break-over' }

type TimerContextType = {
  state: TimerState
  remaining: number
  elapsed: number
  result: TimerResult | null
  problem: string
  start: (phase: Phase, minutes: number, moduleId: string | null) => void
  pause: () => void
  resume: () => void
  reset: () => void
  stopAndSave: () => Promise<void>
  dismissResult: () => void
}

const TimerContext = createContext<TimerContextType | null>(null)

// One saved timer per account, so people sharing a browser never see each other's
function storageKey(userId: string) {
  return `achievepal.timer.${userId}`
}

function loadState(userId: string | undefined): TimerState {
  if (!userId) return IDLE
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    return raw ? parseTimerState(JSON.parse(raw)) : IDLE
  } catch {
    return IDLE
  }
}

export function TimerProvider() {
  const { user } = useAuth()
  const { modules, addSession } = useStudyData()
  const userId = user?.id

  const [state, setState] = useState<TimerState>(() => loadState(userId))
  const [now, setNow] = useState(() => Date.now())
  const [result, setResult] = useState<TimerResult | null>(null)
  const [problem, setProblem] = useState('')

  // Remembers which period has already been handled, so it is never saved twice
  const handled = useRef<number | null>(null)

  async function saveFocus(
    seconds: number,
    startedAtMs: number,
    moduleId: string | null,
    early: boolean
  ) {
    // If the module was deleted while the timer ran, save without one
    const validModule =
      moduleId !== null && modules.some((m) => m.id === moduleId) ? moduleId : null
    try {
      await addSession({
        moduleId: validModule,
        startedAt: new Date(startedAtMs).toISOString(),
        durationSeconds: seconds,
      })
      setResult({ type: 'saved', seconds, moduleId: validModule, early })
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Could not save your session.')
    }
  }

  function finish(s: RunningState) {
    if (handled.current === s.startedAtMs) return
    handled.current = s.startedAtMs
    setState(IDLE)
    if (s.phase === 'focus') {
      void saveFocus(s.plannedSeconds, s.startedAtMs, s.moduleId, false)
    } else {
      setResult({ type: 'break-over' })
    }
  }

  // The clock below always calls the newest version of finish()
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  })

  // Tick while running, and finish when the end time arrives
  useEffect(() => {
    if (state.status !== 'running') return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (isFinished(state, t)) {
        window.clearInterval(id)
        finishRef.current(state)
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [state])

  // Keep the timer through a page refresh
  useEffect(() => {
    if (!userId) return
    try {
      if (state.status === 'idle') {
        window.localStorage.removeItem(storageKey(userId))
      } else {
        window.localStorage.setItem(storageKey(userId), JSON.stringify(state))
      }
    } catch {
      // Storage unavailable: the timer still works, it just will not survive a refresh
    }
  }, [state, userId])

  const remaining = secondsLeft(state, now)
  const elapsed = elapsedSeconds(state, now)

  // Show the countdown in the browser tab title
  useEffect(() => {
    if (state.status === 'idle') return
    const label = state.phase === 'focus' ? 'Focus' : 'Break'
    document.title =
      state.status === 'paused'
        ? `Paused · ${label}`
        : `${formatClock(remaining)} · ${label}`
    return () => {
      document.title = 'AchievePal'
    }
  }, [state, remaining])

  function start(phase: Phase, minutes: number, moduleId: string | null) {
    const planned = Math.round(minutes * 60)
    if (planned < MIN_SECONDS || planned > MAX_SECONDS) return
    const t = Date.now()
    setNow(t)
    setResult(null)
    setProblem('')
    setState(startTimer(phase, planned, moduleId, t))
  }

  function pause() {
    const t = Date.now()
    setNow(t)
    setState((s) => pauseTimer(s, t))
  }

  function resume() {
    const t = Date.now()
    setNow(t)
    setState((s) => resumeTimer(s, t))
  }

  function reset() {
    setState(IDLE)
  }

  async function stopAndSave() {
    if (state.status === 'idle' || state.phase !== 'focus') return
    const seconds = Math.floor(elapsedSeconds(state, Date.now()))
    const { startedAtMs, moduleId } = state
    handled.current = startedAtMs
    setState(IDLE)
    if (seconds >= MIN_SECONDS) {
      await saveFocus(seconds, startedAtMs, moduleId, true)
    }
  }

  function dismissResult() {
    setResult(null)
  }

  return (
    <TimerContext.Provider
      value={{
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
      }}
    >
      <Outlet />
    </TimerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used inside <TimerProvider>')
  }
  return context
}