import { todayIso } from './dates'
import type { StudySession } from '../types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export type DayTotal = {
  label: string
  date: Date
  seconds: number
}

// 1500 seconds becomes "25:00"
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(s / 60)
  const rest = s % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

// 8100 seconds becomes "2h 15m", 2700 becomes "45m"
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours === 0 ? `${rest}m` : `${hours}h ${rest}m`
}

// Seconds left until a fixed end time (rounded up, never negative)
export function remainingSeconds(endsAtMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000))
}

// Total study time on one calendar day, in the user's own timezone
export function secondsOnDay(sessions: StudySession[], day: Date): number {
  const key = todayIso(day)
  return sessions
    .filter((s) => todayIso(new Date(s.startedAt)) === key)
    .reduce((sum, s) => sum + s.durationSeconds, 0)
}

// Monday to Sunday of the current week, with the study time on each day
export function weeklyTotals(
  sessions: StudySession[],
  now: Date = new Date()
): DayTotal[] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  return DAY_LABELS.map((label, i) => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    )
    return { label, date, seconds: secondsOnDay(sessions, date) }
  })
}