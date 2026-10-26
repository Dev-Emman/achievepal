import { useState } from 'react'
import { Link } from 'react-router-dom'
import ModuleGrades from '../components/ModuleGrades'
import { useStudyData } from '../context/StudyDataContext'

function Grades() {
  const { modules } = useStudyData()
  const [selectedId, setSelectedId] = useState('')

  const sorted = [...modules].sort(
    (a, b) => a.semester - b.semester || a.code.localeCompare(b.code)
  )

  if (sorted.length === 0) {
    return (
      <div className="card">
        <p className="empty">
          <Link to="/modules" className="card-link">Add a module</Link> first, then you
          can track its assessments here.
        </p>
      </div>
    )
  }

  // If the chosen module was deleted, fall back to the first one
  const selected = sorted.find((m) => m.id === selectedId) ?? sorted[0]

  return (
    <div className="dashboard">
      <div className="card">
        <label className="field">
          Module
          <select
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {sorted.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ModuleGrades key={selected.id} mod={selected} />
    </div>
  )
}

export default Grades