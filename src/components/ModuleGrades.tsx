import { useState } from 'react'
import type { FormEvent } from 'react'
import MarkInput from './MarkInput'
import { useStudyData } from '../context/StudyDataContext'
import { summarise, requiredMark, round1, ceilTo1 } from '../lib/grades'
import type { TargetResult } from '../lib/grades'
import type { Assessment, Module } from '../types'

function describe(result: TargetResult, target: number, remaining: number) {
  switch (result.kind) {
    case 'achieved':
      return {
        tone: 'result-good',
        text: `You've already secured ${target}%. Even 0% on the rest would get you there.`,
      }
    case 'needed':
      return {
        tone: 'result-info',
        text: `You need ${ceilTo1(result.required)}% on the remaining ${round1(remaining)}% to reach ${target}%.`,
      }
    case 'impossible':
      return {
        tone: 'result-bad',
        text: `${target}% is out of reach. Even 100% on the rest gives ${round1(result.bestPossible)}%.`,
      }
    case 'final':
      return result.met
        ? {
            tone: 'result-good',
            text: `Final mark: ${round1(result.final)}%. Target reached.`,
          }
        : {
            tone: 'result-warn',
            text: `Final mark: ${round1(result.final)}%, below your ${target}% target.`,
          }
  }
}

type ModuleGradesProps = {
  mod: Module
}

function ModuleGrades({ mod }: ModuleGradesProps) {
  const { assessments, addAssessment, setAssessmentMark, deleteAssessment } =
    useStudyData()

  const [target, setTarget] = useState('70')
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [mark, setMark] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const mine = assessments.filter((a) => a.moduleId === mod.id)
  const summary = summarise(mine)

  const targetNumber = Number(target)
  const targetValid =
    target.trim() !== '' &&
    Number.isFinite(targetNumber) &&
    targetNumber >= 0 &&
    targetNumber <= 100

  const outcome = targetValid
    ? describe(
        requiredMark(summary.points, summary.remainingWeight, targetNumber),
        targetNumber,
        summary.remainingWeight
      )
    : null

  const weightsOff =
    mine.length > 0 && Math.abs(summary.totalWeight - 100) > 0.001

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanName = name.trim()
    const weightNumber = Number(weight)
    const markNumber = mark.trim() === '' ? null : Number(mark)

    if (!cleanName) {
      setError('Please enter a name, for example "Coursework 1".')
      return
    }
    if (
      weight.trim() === '' ||
      !Number.isFinite(weightNumber) ||
      weightNumber <= 0 ||
      weightNumber > 100
    ) {
      setError('Weight must be above 0 and at most 100.')
      return
    }
    if (
      markNumber !== null &&
      (!Number.isFinite(markNumber) || markNumber < 0 || markNumber > 100)
    ) {
      setError('Mark must be between 0 and 100, or left empty.')
      return
    }
    if (summary.totalWeight + weightNumber > 100.001) {
      setError(
        `Weights would add up to ${round1(summary.totalWeight + weightNumber)}%, which is over 100%.`
      )
      return
    }

    setBusy(true)
    try {
      await addAssessment({
        moduleId: mod.id,
        name: cleanName,
        weight: weightNumber,
        mark: markNumber,
      })
      setName('')
      setWeight('')
      setMark('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  function handleDelete(a: Assessment) {
    if (window.confirm(`Delete "${a.name}"?`)) {
      deleteAssessment(a.id)
    }
  }

  return (
    <section className="card grade-panel">
      <div>
        <h2 className="module-code">{mod.code}</h2>
        <p className="module-name">{mod.name}</p>
      </div>

      <div className="grade-summary">
        <div>
          <p className="stat-label">Current average</p>
          <p className="grade-big">
            {summary.average === null ? '—' : `${round1(summary.average)}%`}
          </p>
        </div>
        <div>
          <p className="stat-label">Points banked</p>
          <p className="grade-big">
            {round1(summary.points)}{' '}
            <span className="deadline-meta">/ {round1(summary.markedWeight)}</span>
          </p>
        </div>
        <label className="field">
          Target (%)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
      </div>

      {!targetValid && (
        <p className="form-error" role="alert">
          Enter a target between 0 and 100.
        </p>
      )}
      {targetValid && mine.length === 0 && (
        <p className="deadline-meta">
          Add your assessments below to see what you need.
        </p>
      )}
      {outcome && mine.length > 0 && (
        <p className={`result ${outcome.tone}`} role="status">
          {outcome.text}
        </p>
      )}
      {weightsOff && (
        <p className="result result-warn" role="status">
          Your weights add up to {round1(summary.totalWeight)}%. They should total
          100% for the module.
        </p>
      )}

      {mine.length === 0 ? (
        <p className="empty">No assessments yet. Add the first one below.</p>
      ) : (
        <ul className="assessment-list">
          {mine.map((a) => (
            <li key={a.id} className="assessment-row">
              <div className="assessment-info">
                <p className="deadline-title">{a.name}</p>
                <p className="deadline-meta">{round1(a.weight)}% of module</p>
              </div>
              <MarkInput
                value={a.mark}
                label={`Mark for ${a.name}`}
                onSave={(m) => setAssessmentMark(a.id, m)}
              />
              <button
                className="icon-btn"
                onClick={() => handleDelete(a)}
                aria-label={`Delete ${a.name}`}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="assessment-form" onSubmit={handleAdd}>
        <h3>Add assessment</h3>
        <div className="form-grid">
          <label className="field">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Coursework 1"
            />
          </label>
          <label className="field">
            Weight (%)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label className="field">
            Mark (%), optional
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={mark}
              onChange={(e) => setMark(e.target.value)}
            />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Saving...' : 'Add assessment'}
        </button>
      </form>
    </section>
  )
}

export default ModuleGrades