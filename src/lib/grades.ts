import type { Assessment } from '../types'

export type ModuleSummary = {
  totalWeight: number // all assessment weights added up
  markedWeight: number // weight of assessments that have a mark
  remainingWeight: number // weight still to come (module = 100%)
  points: number // marks earned so far, in module points
  average: number | null // average % on marked work, null if nothing marked
}

export type TargetResult =
  | { kind: 'achieved' }
  | { kind: 'needed'; required: number }
  | { kind: 'impossible'; bestPossible: number }
  | { kind: 'final'; final: number; met: boolean }

// Tolerance for floating point rounding errors
const EPSILON = 1e-9

export function summarise(assessments: Assessment[]): ModuleSummary {
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0)
  const marked = assessments.filter((a) => a.mark !== null)
  const markedWeight = marked.reduce((sum, a) => sum + a.weight, 0)
  const points = marked.reduce(
    (sum, a) => sum + ((a.mark ?? 0) * a.weight) / 100,
    0
  )

  return {
    totalWeight,
    markedWeight,
    remainingWeight: Math.max(0, 100 - markedWeight),
    points,
    average: markedWeight > 0 ? (points / markedWeight) * 100 : null,
  }
}

export function requiredMark(
  points: number,
  remainingWeight: number,
  target: number
): TargetResult {
  // Nothing left to sit: the module mark is final
  if (remainingWeight <= EPSILON) {
    return { kind: 'final', final: points, met: points + EPSILON >= target }
  }

  const required = ((target - points) / remainingWeight) * 100

  if (required <= EPSILON) return { kind: 'achieved' }
  if (required > 100 + EPSILON) {
    return { kind: 'impossible', bestPossible: points + remainingWeight }
  }
  return { kind: 'needed', required }
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// Round UP to 1 decimal place, so "you need 70.04%" is never shown as "70%"
export function ceilTo1(n: number): number {
  const cleaned = Math.round(n * 1e6) / 1e6
  return Math.ceil(cleaned * 10) / 10
}