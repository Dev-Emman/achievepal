import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Module, NewAssignment, Priority } from '../types'

type AssignmentFormProps = {
  modules: Module[]
  onAdd: (data: NewAssignment) => Promise<void>
}

function AssignmentForm({ modules, onAdd }: AssignmentFormProps) {
  const [title, setTitle] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanTitle = title.trim()

    if (!cleanTitle) {
      setError('Please enter a title.')
      return
    }
    if (!moduleId) {
      setError('Please choose a module.')
      return
    }
    if (!deadline) {
      setError('Please choose a deadline.')
      return
    }

    setBusy(true)
    try {
      await onAdd({ title: cleanTitle, moduleId, deadline, priority })
      setTitle('')
      setModuleId('')
      setDeadline('')
      setPriority('medium')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card assignment-form" onSubmit={handleSubmit}>
      <h2 className="section-title">Add assignment</h2>

      <div className="form-grid">
        <label className="field field-wide">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Network security report"
          />
        </label>

        <label className="field">
          Module
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="">Choose module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label className="field">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      {modules.length === 0 && (
        <p className="deadline-meta">Add a module first, then you can add assignments.</p>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Saving...' : 'Add assignment'}
      </button>
    </form>
  )
}

export default AssignmentForm