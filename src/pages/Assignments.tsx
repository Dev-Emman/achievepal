import { useState } from 'react'
import AssignmentForm from '../components/AssignmentForm'
import DeadlineList from '../components/DeadlineList'
import { useStudyData } from '../context/StudyDataContext'

type Filter = 'all' | 'pending' | 'completed'
type SortBy = 'deadline' | 'priority'

const priorityOrder = { high: 0, medium: 1, low: 2 }

function Assignments() {
  const { modules, assignments, toggleAssignment, addAssignment, deleteAssignment } =
    useStudyData()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('deadline')

  const query = search.trim().toLowerCase()

  const visible = assignments
    .filter((a) => {
      if (filter === 'pending') return !a.completed
      if (filter === 'completed') return a.completed
      return true
    })
    .filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.moduleCode.toLowerCase().includes(query)
    )
    .sort((a, b) =>
      sortBy === 'deadline'
        ? a.deadline.localeCompare(b.deadline)
        : priorityOrder[a.priority] - priorityOrder[b.priority]
    )

  function handleDelete(id: string) {
    const target = assignments.find((a) => a.id === id)
    if (target && window.confirm(`Delete "${target.title}"?`)) {
      deleteAssignment(id)
    }
  }

  return (
    <div className="dashboard">
      <AssignmentForm modules={modules} onAdd={addAssignment} />

      <div className="toolbar">
        <input
          className="toolbar-search"
          type="search"
          placeholder="Search title or module"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="deadline">Sort by deadline</option>
          <option value="priority">Sort by priority</option>
        </select>
      </div>

      <DeadlineList
        title={`Assignments (${visible.length})`}
        assignments={visible}
        onToggle={toggleAssignment}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Assignments