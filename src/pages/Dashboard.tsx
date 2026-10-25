import StatCard from '../components/StatCard'
import DeadlineList from '../components/DeadlineList'
import { useStudyData } from '../context/StudyDataContext'
import { summarise, round1 } from '../lib/grades'

function Dashboard() {
  const { modules, assignments, assessments, toggleAssignment } = useStudyData()
  const today = new Date().toISOString().slice(0, 10)

  const completed = assignments.filter((a) => a.completed).length
  const overdue = assignments.filter((a) => !a.completed && a.deadline < today).length
  const pending = assignments.filter((a) => !a.completed && a.deadline >= today).length

  const sorted = [...assignments].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  )

  // Average of each module's current average (modules with at least one mark)
  const moduleAverages = modules
    .map((m) => summarise(assessments.filter((a) => a.moduleId === m.id)).average)
    .filter((avg): avg is number => avg !== null)
  const overall =
    moduleAverages.length === 0
      ? null
      : moduleAverages.reduce((sum, v) => sum + v, 0) / moduleAverages.length

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <StatCard label="Pending" value={pending} hint="assignments" />
        <StatCard label="Overdue" value={overdue} hint="needs attention" />
        <StatCard label="Completed" value={completed} hint="this semester" />
        <StatCard
          label="Average"
          value={overall === null ? '—' : `${round1(overall)}%`}
          hint={overall === null ? 'add marks in Grades' : 'across modules'}
        />
      </div>
      <DeadlineList assignments={sorted} onToggle={toggleAssignment} />
    </div>
  )
}

export default Dashboard