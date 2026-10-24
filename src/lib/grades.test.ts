import { describe, it, expect } from 'vitest'
import { summarise, requiredMark, ceilTo1 } from './grades'
import type { Assessment } from '../types'

function make(weight: number, mark: number | null): Assessment {
  return { id: String(Math.random()), moduleId: 'm1', name: 'x', weight, mark }
}

describe('summarise', () => {
  it('banks points only for marked work', () => {
    const s = summarise([make(30, 70), make(70, null)])
    expect(s.points).toBeCloseTo(21)
    expect(s.markedWeight).toBe(30)
    expect(s.remainingWeight).toBe(70)
    expect(s.average).toBeCloseTo(70)
  })

  it('has no average when nothing is marked', () => {
    const s = summarise([])
    expect(s.average).toBeNull()
    expect(s.remainingWeight).toBe(100)
  })

  it('never reports negative remaining weight', () => {
    const s = summarise([make(60, 50), make(60, 50)])
    expect(s.remainingWeight).toBe(0)
  })
})

describe('requiredMark', () => {
  it('works out the mark needed on the rest', () => {
    const r = requiredMark(21, 70, 70)
    expect(r.kind).toBe('needed')
    if (r.kind === 'needed') expect(r.required).toBeCloseTo(70)
  })

  it('says achieved when the target is already secured', () => {
    expect(requiredMark(75, 20, 70).kind).toBe('achieved')
  })

  it('says impossible when even 100% is not enough', () => {
    const r = requiredMark(10, 20, 70)
    expect(r.kind).toBe('impossible')
    if (r.kind === 'impossible') expect(r.bestPossible).toBeCloseTo(30)
  })

  it('reports the final mark when nothing remains', () => {
    const r = requiredMark(68, 0, 70)
    expect(r).toEqual({ kind: 'final', final: 68, met: false })
  })
})

describe('ceilTo1', () => {
  it('does not inflate exact values', () => {
    expect(ceilTo1(70)).toBe(70)
    expect(ceilTo1(70.00000000000001)).toBe(70)
  })
  it('rounds up otherwise', () => {
    expect(ceilTo1(70.04)).toBe(70.1)
  })
})