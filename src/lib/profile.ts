import type { Profile } from '../types'

export const DEFAULT_PROFILE: Profile = {
  weeklyGoalMinutes: 600,
  defaultTarget: 70,
}

const MAX_HOURS_PER_WEEK = 168

// "7.5" becomes 450 minutes. Returns null when the text isn't a sensible number of hours.
export function parseHours(text: string): number | null {
  if (text.trim() === '') return null
  const hours = Number(text)
  if (!Number.isFinite(hours) || hours < 0 || hours > MAX_HOURS_PER_WEEK) {
    return null
  }
  return Math.round(hours * 60)
}

// "65.5" becomes 65.5. Returns null when the text isn't a percentage from 0 to 100.
export function parseTarget(text: string): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return n
}

// 450 minutes becomes "7.5", 600 becomes "10"
export function minutesToHoursText(minutes: number): string {
  return String(Math.round((minutes / 60) * 100) / 100)
}