import ModuleGrades from '../components/ModuleGrades'
import { useStudyData } from '../context/StudyDataContext'

function Grades() {
  const { modules } = useStudyData()

  const sorted = [...modules].sort(
    (a, b) => a.semester - b.semester || a.code.localeCompare(b.code)
  )

  if (sorted.length === 0) {
    return (
      <div className="card">
        <p className="empty">
          Add a module first, then you can track its assessments here.
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {sorted.map((m) => (
        <ModuleGrades key={m.id} mod={m} />
      ))}
    </div>
  )
}

export default Grades