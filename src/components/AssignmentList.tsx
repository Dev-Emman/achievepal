import { Trash2 } from 'lucide-react'
import { dueLabel, formatDate, todayIso } from '../lib/dates'
import { priorityLabels, statusLabels, statusOrder } from '../lib/labels'
import type { Assignment, Status } from '../types'

type AssignmentListProps = {
  assignments: Assignment[]
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
}

type StatusSelectProps = {
  assignment: Assignment
  onChange: (id: string, status: Status) => void
}

function StatusSelect({ assignment, onChange }: StatusSelectProps) {
  return (
    <select
      className={`status-select status-${assignment.status}`}
      value={assignment.status}
      onChange={(e) => onChange(assignment.id, e.target.value as Status)}
      aria-label={`Status of ${assignment.title}`}
    >
      {statusOrder.map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  )
}

function DueInfo({ assignment }: { assignment: Assignment }) {
  const overdue = !assignment.completed && assignment.deadline < todayIso()
  return (
    <div className="due-stack">
      <span className="due-date">{formatDate(assignment.deadline)}</span>
      {!assignment.completed && (
        <span className={overdue ? 'due-note is-overdue' : 'due-note'}>
          {dueLabel(assignment.deadline)}
        </span>
      )}
    </div>
  )
}

function AssignmentList({ assignments, onStatusChange, onDelete }: AssignmentListProps) {
  return (
    <>
      {/* Laptop and desktop: a table */}
      <div className="card table-card a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Assignment</th>
              <th scope="col">Module</th>
              <th scope="col">Due date</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className={a.completed ? 'row-done' : ''}>
                <td className="cell-title">{a.title}</td>
                <td>{a.moduleCode}</td>
                <td>
                  <DueInfo assignment={a} />
                </td>
                <td>
                  <span className={`badge badge-${a.priority}`}>
                    {priorityLabels[a.priority]}
                  </span>
                </td>
                <td>
                  <StatusSelect assignment={a} onChange={onStatusChange} />
                </td>
                <td>
                  <button
                    className="icon-btn"
                    onClick={() => onDelete(a.id)}
                    aria-label={`Delete ${a.title}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones and tablets: cards */}
      <ul className="a-cards">
        {assignments.map((a) => (
          <li key={a.id} className={a.completed ? 'card a-card row-done' : 'card a-card'}>
            <div className="a-card-top">
              <div className="a-card-titles">
                <p className="a-title">{a.title}</p>
                <p className="deadline-meta">{a.moduleCode}</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => onDelete(a.id)}
                aria-label={`Delete ${a.title}`}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="a-card-mid">
              <DueInfo assignment={a} />
              <span className={`badge badge-${a.priority}`}>
                {priorityLabels[a.priority]}
              </span>
            </div>
            <StatusSelect assignment={a} onChange={onStatusChange} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default AssignmentList