import { describe, it, expect } from 'vitest'
import { whenLabel } from './dates'

const now = new Date(2026, 9, 28, 15, 0) // 28 Oct 2026, 15:00 local time

describe('whenLabel', () => {
  it('says Today and Yesterday', () => {
    expect(whenLabel(new Date(2026, 9, 28, 9, 5).toISOString(), now)).toBe(
      'Today, 09:05'
    )
    expect(whenLabel(new Date(2026, 9, 27, 23, 40).toISOString(), now)).toBe(
      'Yesterday, 23:40'
    )
  })

  it('shows the date for older sessions', () => {
    const label = whenLabel(new Date(2026, 9, 24, 9, 0).toISOString(), now)
    expect(label).toContain('24 Oct')
    expect(label).toContain('09:00')
  })
})