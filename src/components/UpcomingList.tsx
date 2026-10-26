import { Link } from 'react-router-dom'
import { dueLabel, todayIso } from '../lib/dates'
import type { Assignment } from '../types'

type UpcomingListProps = {
  assignments: Assignment[]
  onToggle: (id: string) => void
}

const MAX_ROWS = 6

function UpcomingList({ assignments, onToggle }: UpcomingListProps) {
  const today = todayIso()

  const pending = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const shown = pending.slice(0, MAX_ROWS)

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="section-title">Upcoming deadlines</h2>
        <Link to="/assignments" className="card-link">
          View all
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="empty">
          You're all caught up. <Link to="/assignments" className="card-link">Add an assignment</Link> to
          see it here.
        </p>
      ) : (
        <ul className="deadline-list">
          {shown.map((a) => (
            <li key={a.id} className="deadline-item">
              <input
                type="checkbox"
                checked={a.completed}
                onChange={() => onToggle(a.id)}
                aria-label={`Mark ${a.title} as complete`}
              />
              <div className="deadline-info">
                <p className="deadline-title">{a.title}</p>
                <p
                  className={
                    a.deadline < today ? 'deadline-meta is-overdue' : 'deadline-meta'
                  }
                >
                  {a.moduleCode} · {dueLabel(a.deadline)}
                </p>
              </div>
              <span className={`badge badge-${a.priority}`}>{a.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default UpcomingList