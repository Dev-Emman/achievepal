import { AlertTriangle, CheckCircle2, ClipboardList, Target } from 'lucide-react'
import StatCard from '../components/StatCard'
import UpcomingList from '../components/UpcomingList'
import { useAuth } from '../context/AuthContext'
import { useStudyData } from '../context/StudyDataContext'
import { summarise, round1 } from '../lib/grades'
import { daysUntil, greeting, todayIso } from '../lib/dates'
import heroPanel from '../assets/hero-panel.webp'

function Dashboard() {
  const { user } = useAuth()
  const { modules, assignments, assessments, toggleAssignment } = useStudyData()
  const today = todayIso()

  const fullName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''
  const firstName = fullName.trim().split(/\s+/)[0] ?? ''

  const completed = assignments.filter((a) => a.completed).length
  const overdue = assignments.filter((a) => !a.completed && a.deadline < today).length
  const upcoming = assignments.filter((a) => !a.completed && a.deadline >= today)
  const dueThisWeek = upcoming.filter((a) => daysUntil(a.deadline) <= 7).length

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
      <section className="welcome">
        <h2>
          {greeting()}
          {firstName ? `, ${firstName}` : ''} <span aria-hidden="true">👋</span>
        </h2>
        <p>Here's where things stand today.</p>
      </section>

      <div className="stat-grid">
        <StatCard
          tone="lavender"
          icon={ClipboardList}
          label="Upcoming"
          value={upcoming.length}
          hint={`${dueThisWeek} due this week`}
        />
        <StatCard
          tone="peach"
          icon={AlertTriangle}
          label="Overdue"
          value={overdue}
          hint={overdue === 0 ? 'All caught up' : 'Needs attention'}
        />
        <StatCard
          tone="mint"
          icon={CheckCircle2}
          label="Completed"
          value={completed}
          hint="Assignments done"
        />
        <StatCard
          tone="sky"
          icon={Target}
          label="Average"
          value={overall === null ? '—' : `${round1(overall)}%`}
          hint={overall === null ? 'Add marks in Grades' : 'Across your modules'}
        />
      </div>

      <UpcomingList assignments={assignments} onToggle={toggleAssignment} />

      <section className="banner">
        <img src={heroPanel} alt="" className="banner-img" loading="lazy" />
        <div className="banner-shade" />
        <div className="banner-text">
          <h2>Small steps make big progress</h2>
          <p>Keep going. You've got this.</p>
        </div>
      </section>
    </div>
  )
}

export default Dashboard