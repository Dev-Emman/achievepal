import { Link } from 'react-router-dom'
import { useStudyData } from '../context/StudyDataContext'
import { formatDuration, weeklyTotals } from '../lib/study'

function GoalCard() {
  const { sessions, profile } = useStudyData()

  const studied = weeklyTotals(sessions).reduce((sum, d) => sum + d.seconds, 0)
  const goal = profile.weeklyGoalMinutes * 60
  const reached = goal > 0 && studied >= goal
  const percent = goal > 0 ? Math.floor((studied / goal) * 100) : 0

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="section-title">Weekly study goal</h2>
        <Link to="/focus" className="card-link">
          Start a session
        </Link>
      </div>

      {goal === 0 ? (
        <p className="empty">
          You've studied {formatDuration(studied)} this week.{' '}
          <Link to="/settings" className="card-link">Set a weekly goal</Link> to track
          your progress.
        </p>
      ) : (
        <>
          <p className="goal-line">
            <strong>{formatDuration(studied)}</strong> of {formatDuration(goal)}{' '}
            <span className="deadline-meta">({percent}%)</span>
          </p>
          <div
            className="progress"
            role="progressbar"
            aria-label="Weekly study goal progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(100, percent)}
          >
            <div
              className="progress-bar"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <p className="deadline-meta">
            {reached
              ? 'Goal reached. Well done!'
              : `${formatDuration(goal - studied)} to go this week.`}
          </p>
        </>
      )}
    </section>
  )
}

export default GoalCard