import { remainingSeconds as secondsUntil } from './study'

export type Phase = 'focus' | 'break'

export type TimerState =
  | { status: 'idle' }
  | {
      status: 'running'
      phase: Phase
      plannedSeconds: number
      startedAtMs: number
      endsAtMs: number
      moduleId: string | null
    }
  | {
      status: 'paused'
      phase: Phase
      plannedSeconds: number
      startedAtMs: number
      remainingSeconds: number
      moduleId: string | null
    }

export const IDLE: TimerState = { status: 'idle' }

// The database accepts sessions from 1 minute to 8 hours
export const MIN_SECONDS = 60
export const MAX_SECONDS = 8 * 60 * 60

export function startTimer(
  phase: Phase,
  plannedSeconds: number,
  moduleId: string | null,
  nowMs: number
): TimerState {
  return {
    status: 'running',
    phase,
    plannedSeconds,
    startedAtMs: nowMs,
    endsAtMs: nowMs + plannedSeconds * 1000,
    moduleId,
  }
}

export function pauseTimer(state: TimerState, nowMs: number): TimerState {
  if (state.status !== 'running') return state
  return {
    status: 'paused',
    phase: state.phase,
    plannedSeconds: state.plannedSeconds,
    startedAtMs: state.startedAtMs,
    remainingSeconds: secondsUntil(state.endsAtMs, nowMs),
    moduleId: state.moduleId,
  }
}

export function resumeTimer(state: TimerState, nowMs: number): TimerState {
  if (state.status !== 'paused') return state
  return {
    status: 'running',
    phase: state.phase,
    plannedSeconds: state.plannedSeconds,
    startedAtMs: state.startedAtMs,
    endsAtMs: nowMs + state.remainingSeconds * 1000,
    moduleId: state.moduleId,
  }
}

export function secondsLeft(state: TimerState, nowMs: number): number {
  if (state.status === 'running') return secondsUntil(state.endsAtMs, nowMs)
  if (state.status === 'paused') return state.remainingSeconds
  return 0
}

export function elapsedSeconds(state: TimerState, nowMs: number): number {
  if (state.status === 'idle') return 0
  return Math.max(0, state.plannedSeconds - secondsLeft(state, nowMs))
}

export function isFinished(state: TimerState, nowMs: number): boolean {
  return state.status === 'running' && nowMs >= state.endsAtMs
}

function isNumber(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
}

// Anything read back from browser storage is checked before it is trusted
export function parseTimerState(raw: unknown): TimerState {
  if (typeof raw !== 'object' || raw === null) return IDLE
  const r = raw as Record<string, unknown>

  const phase: Phase | null =
    r.phase === 'focus' ? 'focus' : r.phase === 'break' ? 'break' : null
  const moduleId = typeof r.moduleId === 'string' ? r.moduleId : null
  const planned = r.plannedSeconds
  const startedAt = r.startedAtMs
  const maxMs = 8.64e15

  if (
    phase === null ||
    !isNumber(planned, MIN_SECONDS, MAX_SECONDS) ||
    !isNumber(startedAt, 0, maxMs)
  ) {
    return IDLE
  }

  const endsAt = r.endsAtMs
  if (r.status === 'running' && isNumber(endsAt, 0, maxMs)) {
    return {
      status: 'running',
      phase,
      plannedSeconds: planned,
      startedAtMs: startedAt,
      endsAtMs: endsAt,
      moduleId,
    }
  }

  const left = r.remainingSeconds
  if (r.status === 'paused' && isNumber(left, 0, planned)) {
    return {
      status: 'paused',
      phase,
      plannedSeconds: planned,
      startedAtMs: startedAt,
      remainingSeconds: left,
      moduleId,
    }
  }

  return IDLE
}