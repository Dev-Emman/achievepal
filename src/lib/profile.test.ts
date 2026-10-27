import { describe, it, expect } from 'vitest'
import { minutesToHoursText, parseHours, parseTarget } from './profile'

describe('parseHours', () => {
  it('turns hours into minutes', () => {
    expect(parseHours('10')).toBe(600)
    expect(parseHours('7.5')).toBe(450)
    expect(parseHours('0')).toBe(0)
    expect(parseHours('168')).toBe(10080)
  })

  it('rounds to whole minutes', () => {
    expect(parseHours('1.234')).toBe(74)
  })

  it('rejects nonsense', () => {
    expect(parseHours('')).toBeNull()
    expect(parseHours('   ')).toBeNull()
    expect(parseHours('-1')).toBeNull()
    expect(parseHours('169')).toBeNull()
    expect(parseHours('abc')).toBeNull()
    expect(parseHours('Infinity')).toBeNull()
  })
})

describe('parseTarget', () => {
  it('accepts percentages from 0 to 100', () => {
    expect(parseTarget('70')).toBe(70)
    expect(parseTarget('65.5')).toBe(65.5)
    expect(parseTarget('0')).toBe(0)
    expect(parseTarget('100')).toBe(100)
  })

  it('rejects anything else', () => {
    expect(parseTarget('')).toBeNull()
    expect(parseTarget('101')).toBeNull()
    expect(parseTarget('-5')).toBeNull()
    expect(parseTarget('seventy')).toBeNull()
  })
})

describe('minutesToHoursText', () => {
  it('shows hours without trailing zeros', () => {
    expect(minutesToHoursText(600)).toBe('10')
    expect(minutesToHoursText(450)).toBe('7.5')
    expect(minutesToHoursText(0)).toBe('0')
  })
})