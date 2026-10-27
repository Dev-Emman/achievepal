import { describe, it, expect } from 'vitest'
import {
  formatClock,
  formatDuration,
  remainingSeconds,
  secondsOnDay,
  weeklyTotals,
} from './study'
import type { StudySession } from '../types'

// 26 October 2026 is a Monday
function at(day: number, hour: number, minute = 0, month = 9): string {
  return new Date(2026, month, day, hour, minute).toISOString()
}

function session(startedAt: string, minutes: number): StudySession {
  return {
    id: startedAt,
    moduleId: null,
    startedAt,
    durationSeconds: minutes * 60,
  }
}

describe('formatClock', () => {
  it('shows minutes and seconds', () => {
    expect(formatClock(1500)).toBe('25:00')
    expect(formatClock(59)).toBe('00:59')
    expect(formatClock(0)).toBe('00:00')
  })
  it('never goes negative', () => {
    expect(formatClock(-5)).toBe('00:00')
  })
})

describe('formatDuration', () => {
  it('shows hours and minutes', () => {
    expect(formatDuration(8100)).toBe('2h 15m')
    expect(formatDuration(2700)).toBe('45m')
    expect(formatDuration(0)).toBe('0m')
  })
})

describe('remainingSeconds', () => {
  it('rounds up so the clock never shows 00:00 early', () => {
    expect(remainingSeconds(10_000, 8_500)).toBe(2)
    expect(remainingSeconds(10_000, 9_001)).toBe(1)
  })
  it('stops at zero', () => {
    expect(remainingSeconds(10_000, 10_000)).toBe(0)
    expect(remainingSeconds(10_000, 12_000)).toBe(0)
  })
})

describe('secondsOnDay', () => {
  it('counts only sessions that started on that day', () => {
    const sessions = [
      session(at(26, 10), 25),
      session(at(26, 23, 50), 30),
      session(at(27, 0, 10), 20),
    ]
    expect(secondsOnDay(sessions, new Date(2026, 9, 26))).toBe(55 * 60)
    expect(secondsOnDay(sessions, new Date(2026, 9, 27))).toBe(20 * 60)
    expect(secondsOnDay(sessions, new Date(2026, 9, 28))).toBe(0)
  })
})

describe('weeklyTotals', () => {
  const sessions = [
    session(at(26, 9), 25), // Monday
    session(at(28, 14), 50), // Wednesday
    session(at(2, 9, 0, 10), 40), // Monday of the next week
  ]

  it('covers Monday to Sunday of the current week', () => {
    const week = weeklyTotals(sessions, new Date(2026, 9, 28, 12))
    expect(week.map((d) => d.label)).toEqual([
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
    ])
    expect(week.map((d) => d.seconds)).toEqual([
      1500, 0, 3000, 0, 0, 0, 0,
    ])
  })

  it('still starts on Monday when today is Sunday', () => {
    const week = weeklyTotals(sessions, new Date(2026, 10, 1, 12))
    expect(week[0].date.getDate()).toBe(26)
    expect(week[6].date.getDate()).toBe(1)
  })
})