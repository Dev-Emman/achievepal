import { useState } from 'react'
import type { FormEvent } from 'react'
import { useStudyData } from '../context/StudyDataContext'
import { summarise, round1 } from '../lib/grades'
import type { Assessment, Module } from '../types'

type ModuleGradesProps = {
  mod: Module
}

function ModuleGrades({ mod }: ModuleGradesProps) {
  const { assessments, addAssessment, deleteAssessment } = useStudyData()

  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [mark, setMark] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const mine = assessments.filter((a) => a.moduleId === mod.id)
  const summary = summarise(mine)

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
        <p className="deadline-meta">
          Weights added so far: {round1(summary.totalWeight)}% of 100%
        </p>
      </div>

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
              <span className="assessment-mark">
                {a.mark === null ? 'Not marked yet' : `${round1(a.mark)}%`}
              </span>
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