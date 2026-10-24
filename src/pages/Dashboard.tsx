import StatCard from '../components/StatCard'
import DeadlineList from '../components/DeadlineList'
import { useStudyData } from '../context/StudyDataContext'

function Dashboard() {
  const { assignments, toggleAssignment } = useStudyData()
  const today = new Date().toISOString().slice(0, 10)

  const completed = assignments.filter((a) => a.completed).length
  const overdue = assignments.filter((a) => !a.completed && a.deadline < today).length
  const pending = assignments.filter((a) => !a.completed && a.deadline >= today).length

  const sorted = [...assignments].sort((a, b) =>
    a.deadline.localeCompare(b.deadline)
  )

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <StatCard label="Pending" value={pending} hint="assignments" />
        <StatCard label="Overdue" value={overdue} hint="needs attention" />
        <StatCard label="Completed" value={completed} hint="this semester" />
        <StatCard label="Average" value="68%" hint="across modules" />
      </div>
      <DeadlineList assignments={sorted} onToggle={toggleAssignment} />
    </div>
  )
}

export default Dashboard