import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewModule, Semester } from '../types'

type ModuleFormProps = {
  existingCodes: string[]
  onAdd: (data: NewModule) => Promise<void>
}

function ModuleForm({ existingCodes, onAdd }: ModuleFormProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [semester, setSemester] = useState<Semester>(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanCode = code.trim().toUpperCase()
    const cleanName = name.trim()

    if (!cleanCode) {
      setError('Please enter a module code, for example COM398.')
      return
    }
    if (!cleanName) {
      setError('Please enter a module name.')
      return
    }
    if (existingCodes.includes(cleanCode)) {
      setError(`You already have a module with the code ${cleanCode}.`)
      return
    }

    setBusy(true)
    try {
      await onAdd({ code: cleanCode, name: cleanName, semester })
      setCode('')
      setName('')
      setSemester(1)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card assignment-form" onSubmit={handleSubmit}>
      <h2 className="section-title">Add module</h2>

      <div className="form-grid">
        <label className="field">
          Code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={20}
            placeholder="e.g. COM398"
          />
        </label>

        <label className="field">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="e.g. System Security"
          />
        </label>

        <label className="field">
          Semester
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value) as Semester)}
          >
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Saving...' : 'Add module'}
      </button>
    </form>
  )
}

export default ModuleForm