function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Today's date as YYYY-MM-DD in the user's own timezone
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Whole days from today until the date (negative means it's in the past)
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = parseIso(iso)
  const today = parseIso(todayIso(now))
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function dueLabel(iso: string, now: Date = new Date()): string {
  const n = daysUntil(iso, now)
  if (n < -1) return `Overdue by ${-n} days`
  if (n === -1) return 'Overdue by 1 day'
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  if (n <= 7) return `Due in ${n} days`
  return `Due ${parseIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}`
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}