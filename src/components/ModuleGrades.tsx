import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import MarkInput from './MarkInput'
import ProgressRing from './ProgressRing'
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
  const targetId = useId()

  const [target, setTarget] = useState('70')
  const [showForm, setShowForm] = useState(false)
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
      setShowForm(false)
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
    <div className="dashboard">
      <div className="g-top">
        <section className="card g-avg">
          <ProgressRing
            value={summary.average}
            size={96}
            label={
              summary.average === null
                ? `${mod.code}: no marks yet`
                : `${mod.code}: current average ${round1(summary.average)}%`
            }
          />
          <div>
            <p className="tile-label">Current average</p>
            <p className="grade-big">
              {summary.average === null ? '—' : `${round1(summary.average)}%`}
            </p>
            <p className="deadline-meta">
              {round1(summary.points)} of {round1(summary.markedWeight)} points
              banked
            </p>
          </div>
        </section>

        <section className="card g-target">
          <label htmlFor={targetId} className="tile-label">
            Target grade
          </label>
          <div className="target-input">
            <input
              id={targetId}
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <span>%</span>
          </div>
          <p className="deadline-meta">
            {round1(summary.remainingWeight)}% of the module still to come
          </p>
        </section>
      </div>

      {!targetValid && (
        <p className="form-error" role="alert">
          Enter a target between 0 and 100.
        </p>
      )}
      {outcome && mine.length > 0 && (
        <p className={`result result-lg ${outcome.tone}`} role="status">
          {outcome.text}
        </p>
      )}
      {weightsOff && (
        <p className="result result-warn" role="status">
          Your weights add up to {round1(summary.totalWeight)}%. They should total
          100% for the module.
        </p>
      )}

      <section className="card g-card">
        <div className="g-head">
          <h2 className="section-title">Assessments</h2>
          <button
            className="btn-secondary btn-with-icon"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
          >
            <Plus size={18} aria-hidden="true" />
            Add assessment
          </button>
        </div>

        {mine.length === 0 ? (
          <p className="empty g-empty">
            No assessments yet. Add the first one to see what you need.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="a-table g-table">
              <thead>
                <tr>
                  <th scope="col">Assessment</th>
                  <th scope="col">Mark</th>
                  <th scope="col" className="col-weight">Weight</th>
                  <th scope="col">Weighted mark</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mine.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="cell-title">{a.name}</span>
                      <span className="weight-inline">{round1(a.weight)}% of module</span>
                    </td>
                    <td>
                      <MarkInput
                        value={a.mark}
                        label={`Mark for ${a.name}`}
                        onSave={(m) => setAssessmentMark(a.id, m)}
                      />
                    </td>
                    <td className="col-weight">{round1(a.weight)}%</td>
                    <td>
                      {a.mark === null ? '—' : round1((a.mark * a.weight) / 100)}
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(a)}
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td></td>
                  <td className="col-weight">{round1(summary.totalWeight)}%</td>
                  <td>{round1(summary.points)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {showForm && (
          <form className="assessment-form" onSubmit={handleAdd}>
            <h3>New assessment</h3>
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
              {busy ? 'Saving...' : 'Save assessment'}
            </button>
          </form>
        )}
      </section>

      <p className="deadline-meta">
        Weighted mark = mark × weight ÷ 100. Your points banked are the weighted
        marks added together.
      </p>
    </div>
  )
}

export default ModuleGrades