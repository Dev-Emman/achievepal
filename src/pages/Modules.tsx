import ModuleForm from '../components/ModuleForm'
import { useStudyData } from '../context/StudyDataContext'
import type { Module } from '../types'

function Modules() {
  const { modules, assignments, addModule, deleteModule } = useStudyData()

  const sorted = [...modules].sort(
    (a, b) => a.semester - b.semester || a.code.localeCompare(b.code)
  )

  function handleDelete(m: Module) {
    const count = assignments.filter((a) => a.moduleId === m.id).length
    const extra =
      count > 0
        ? ` This will also delete its ${count} assignment${count === 1 ? '' : 's'}.`
        : ''
    if (window.confirm(`Delete ${m.code}?${extra}`)) {
      deleteModule(m.id)
    }
  }

  return (
    <div className="dashboard">
      <ModuleForm existingCodes={modules.map((m) => m.code)} onAdd={addModule} />

      {sorted.length === 0 ? (
        <div className="card">
          <p className="empty">No modules yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="module-grid">
          {sorted.map((m) => {
            const mine = assignments.filter((a) => a.moduleId === m.id)
            const done = mine.filter((a) => a.completed).length
            const percent = mine.length === 0 ? 0 : Math.round((done / mine.length) * 100)

            return (
              <article key={m.id} className="card module-card">
                <div className="module-top">
                  <span className="semester-tag">Semester {m.semester}</span>
                  <button
                    className="icon-btn"
                    onClick={() => handleDelete(m)}
                    aria-label={`Delete ${m.code}`}
                  >
                    🗑️
                  </button>
                </div>
                <h3 className="module-code">{m.code}</h3>
                <p className="module-name">{m.name}</p>

                <div className="progress" aria-hidden="true">
                  <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>
                <p className="deadline-meta">
                  {mine.length === 0
                    ? 'No assignments yet'
                    : `${done} of ${mine.length} assignments done`}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Modules