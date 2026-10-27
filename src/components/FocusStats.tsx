import { Trash2 } from 'lucide-react'
import WeeklyChart from './WeeklyChart'
import { useStudyData } from '../context/StudyDataContext'
import { todayIso, whenLabel } from '../lib/dates'
import { formatDuration, secondsOnDay, weeklyTotals } from '../lib/study'
import type { StudySession } from '../types'

const RECENT_COUNT = 6

function FocusStats() {
  const { sessions, modules, deleteSession } = useStudyData()
  const now = new Date()
  const today = todayIso(now)

  const sessionsToday = sessions.filter(
    (s) => todayIso(new Date(s.startedAt)) === today
  )
  const secondsToday = secondsOnDay(sessions, now)

  const week = weeklyTotals(sessions, now)
  const secondsThisWeek = week.reduce((sum, d) => sum + d.seconds, 0)

  const recent = [...sessions]
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
    .slice(0, RECENT_COUNT)

  function moduleName(s: StudySession) {
    return modules.find((m) => m.id === s.moduleId)?.code ?? 'No module'
  }

  function handleDelete(s: StudySession) {
    const label = `${formatDuration(s.durationSeconds)} on ${moduleName(s)}`
    if (window.confirm(`Delete this session (${label})?`)) {
      deleteSession(s.id)
    }
  }

  return (
    <div className="focus-stats">
      <section className="card">
        <h2 className="section-title">Your study time</h2>

        <div className="today-grid">
          <div>
            <p className="tile-label">Studied today</p>
            <p className="grade-big">{formatDuration(secondsToday)}</p>
          </div>
          <div>
            <p className="tile-label">Sessions today</p>
            <p className="grade-big">{sessionsToday.length}</p>
          </div>
        </div>

        <div className="week-head">
          <h3 className="week-title">This week</h3>
          <p className="deadline-meta">{formatDuration(secondsThisWeek)} in total</p>
        </div>
        <WeeklyChart days={week} />
      </section>

      <section className="card">
        <h2 className="section-title">Recent sessions</h2>

        {recent.length === 0 ? (
          <p className="empty">
            No sessions yet. Finish a focus session and it will show up here.
          </p>
        ) : (
          <ul className="session-list">
            {recent.map((s) => (
              <li key={s.id} className="session-row">
                <div className="session-info">
                  <p className="deadline-title">{moduleName(s)}</p>
                  <p className="deadline-meta">{whenLabel(s.startedAt, now)}</p>
                </div>
                <span className="session-duration">
                  {formatDuration(s.durationSeconds)}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => handleDelete(s)}
                  aria-label={`Delete session: ${formatDuration(s.durationSeconds)} on ${moduleName(s)}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default FocusStats