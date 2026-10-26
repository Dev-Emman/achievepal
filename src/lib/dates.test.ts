import { describe, it, expect } from 'vitest'
import { daysUntil, dueLabel, greeting, todayIso } from './dates'

const now = new Date(2026, 9, 26, 14, 30) // 26 Oct 2026, 14:30 local time

describe('dates', () => {
  it('formats today as YYYY-MM-DD', () => {
    expect(todayIso(now)).toBe('2026-10-26')
  })

  it('counts whole days, negative when past', () => {
    expect(daysUntil('2026-10-26', now)).toBe(0)
    expect(daysUntil('2026-10-29', now)).toBe(3)
    expect(daysUntil('2026-10-24', now)).toBe(-2)
  })

  it('writes friendly due labels', () => {
    expect(dueLabel('2026-10-26', now)).toBe('Due today')
    expect(dueLabel('2026-10-27', now)).toBe('Due tomorrow')
    expect(dueLabel('2026-10-29', now)).toBe('Due in 3 days')
    expect(dueLabel('2026-10-25', now)).toBe('Overdue by 1 day')
    expect(dueLabel('2026-10-24', now)).toBe('Overdue by 2 days')
    expect(dueLabel('2026-11-11', now)).toBe('Due 11 Nov')
  })

  it('greets by time of day', () => {
    expect(greeting(new Date(2026, 9, 26, 9))).toBe('Good morning')
    expect(greeting(new Date(2026, 9, 26, 14))).toBe('Good afternoon')
    expect(greeting(new Date(2026, 9, 26, 20))).toBe('Good evening')
  })
})