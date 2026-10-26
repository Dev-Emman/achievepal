import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AssignmentForm from '../components/AssignmentForm'
import AssignmentList from '../components/AssignmentList'
import { useStudyData } from '../context/StudyDataContext'
import {
  priorityLabels,
  priorityOrder,
  statusLabels,
  statusOrder,
} from '../lib/labels'
import type { Priority, Status } from '../types'

type SortBy = 'deadline' | 'priority'

function Assignments() {
  const {
    modules,
    assignments,
    addAssignment,
    setAssignmentStatus,
    deleteAssignment,
  } = useStudyData()

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [sortBy, setSortBy] = useState<SortBy>('deadline')

  const query = search.trim().toLowerCase()

  const visible = assignments
    .filter((a) => moduleFilter === 'all' || a.moduleId === moduleFilter)
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a) => priorityFilter === 'all' || a.priority === priorityFilter)
    .filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.moduleCode.toLowerCase().includes(query)
    )
    .sort((a, b) =>
      sortBy === 'deadline'
        ? a.deadline.localeCompare(b.deadline)
        : priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    )

  function handleDelete(id: string) {
    const target = assignments.find((a) => a.id === id)
    if (target && window.confirm(`Delete "${target.title}"?`)) {
      deleteAssignment(id)
    }
  }

  return (
    <div className="dashboard">
      <div className="toolbar">
        <input
          className="toolbar-search"
          type="search"
          placeholder="Search assignments"
          aria-label="Search assignments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          aria-label="Filter by module"
        >
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {priorityOrder.map((p) => (
            <option key={p} value={p}>
              {priorityLabels[p]}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="Sort assignments"
        >
          <option value="deadline">Sort by deadline</option>
          <option value="priority">Sort by priority</option>
        </select>
        <button
          className="btn-primary btn-with-icon"
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
        >
          <Plus size={18} aria-hidden="true" />
          Add assignment
        </button>
      </div>

      {showForm && (
        <AssignmentForm
          modules={modules}
          onAdd={async (data) => {
            await addAssignment(data)
            setShowForm(false)
          }}
        />
      )}

      {assignments.length === 0 ? (
        <div className="card">
          <p className="empty">
            No assignments yet.{' '}
            {modules.length === 0 ? (
              <>
                <Link to="/modules" className="card-link">Add a module</Link> first, then
                add your first assignment.
              </>
            ) : (
              'Add your first one to start tracking deadlines.'
            )}
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <p className="empty">No assignments match your filters.</p>
        </div>
      ) : (
        <>
          <p className="result-count">
            Showing {visible.length} of {assignments.length}
          </p>
          <AssignmentList
            assignments={visible}
            onStatusChange={setAssignmentStatus}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  )
}

export default Assignments