import { describe, it, expect } from 'vitest'
import {
  IDLE,
  elapsedSeconds,
  isFinished,
  parseTimerState,
  pauseTimer,
  resumeTimer,
  secondsLeft,
  startTimer,
} from './timer'

const T0 = 1_000_000

describe('timer', () => {
  it('counts down from a fixed end time', () => {
    const s = startTimer('focus', 1500, null, T0)
    expect(secondsLeft(s, T0)).toBe(1500)
    expect(secondsLeft(s, T0 + 60_000)).toBe(1440)
    expect(isFinished(s, T0 + 1_499_000)).toBe(false)
    expect(isFinished(s, T0 + 1_500_000)).toBe(true)
  })

  it('pauses and resumes without losing time', () => {
    const running = startTimer('focus', 1500, null, T0)
    const paused = pauseTimer(running, T0 + 600_000)
    expect(paused.status).toBe('paused')
    expect(secondsLeft(paused, T0 + 9_999_999)).toBe(900)

    const resumed = resumeTimer(paused, T0 + 3_600_000)
    expect(secondsLeft(resumed, T0 + 3_600_000)).toBe(900)
    expect(secondsLeft(resumed, T0 + 3_660_000)).toBe(840)
  })

  it('reports elapsed time', () => {
    const s = startTimer('focus', 1500, null, T0)
    expect(elapsedSeconds(s, T0 + 90_000)).toBe(90)
    expect(elapsedSeconds(IDLE, T0)).toBe(0)
  })

  it('ignores pause and resume when they do not apply', () => {
    expect(pauseTimer(IDLE, T0)).toBe(IDLE)
    const running = startTimer('focus', 1500, null, T0)
    expect(resumeTimer(running, T0)).toBe(running)
  })
})

describe('parseTimerState', () => {
  it('round-trips a running state', () => {
    const s = startTimer('break', 300, 'abc', T0)
    expect(parseTimerState(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it('round-trips a paused state', () => {
    const s = pauseTimer(startTimer('focus', 1500, null, T0), T0 + 60_000)
    expect(parseTimerState(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it('rejects junk', () => {
    expect(parseTimerState(null)).toEqual(IDLE)
    expect(parseTimerState('hello')).toEqual(IDLE)
    expect(
      parseTimerState({
        status: 'running',
        phase: 'focus',
        plannedSeconds: -5,
        startedAtMs: 1,
        endsAtMs: 2,
        moduleId: null,
      })
    ).toEqual(IDLE)
    expect(
      parseTimerState({
        status: 'running',
        phase: 'nap',
        plannedSeconds: 1500,
        startedAtMs: 1,
        endsAtMs: 2,
        moduleId: null,
      })
    ).toEqual(IDLE)
    expect(
      parseTimerState({
        status: 'paused',
        phase: 'focus',
        plannedSeconds: 1500,
        startedAtMs: 1,
        remainingSeconds: 99_999,
        moduleId: null,
      })
    ).toEqual(IDLE)
  })
})