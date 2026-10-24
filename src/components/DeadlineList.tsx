import type { Assignment } from '../types'

type DeadlineListProps = {
  assignments: Assignment[]
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  title?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function DeadlineList({
  assignments,
  onToggle,
  onDelete,
  title = 'Upcoming deadlines',
}: DeadlineListProps) {
  return (
    <section className="card">
      <h2 className="section-title">{title}</h2>

      {assignments.length === 0 ? (
        <p className="empty">Nothing to show here yet.</p>
      ) : (
        <ul className="deadline-list">
          {assignments.map((a) => (
            <li key={a.id} className={`deadline-item ${a.completed ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={a.completed}
                onChange={() => onToggle(a.id)}
                aria-label={`Mark ${a.title} as complete`}
              />
              <div className="deadline-info">
                <p className="deadline-title">{a.title}</p>
                <p className="deadline-meta">
                  {a.moduleCode} · due {formatDate(a.deadline)}
                </p>
              </div>
              <span className={`badge badge-${a.priority}`}>{a.priority}</span>
              {onDelete && (
                <button
                  className="icon-btn"
                  onClick={() => onDelete(a.id)}
                  aria-label={`Delete ${a.title}`}
                >
                  🗑️
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DeadlineList