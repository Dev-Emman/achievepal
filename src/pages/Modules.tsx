import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import ModuleForm from '../components/ModuleForm'
import ProgressRing from '../components/ProgressRing'
import { useStudyData } from '../context/StudyDataContext'
import { summarise, round1 } from '../lib/grades'
import type { Module } from '../types'

type SemesterFilter = 'all' | '1' | '2'

const tones = ['lavender', 'mint', 'peach', 'sky'] as const

// Same module code always gets the same colour
function toneFor(code: string) {
  let sum = 0
  for (const ch of code) sum += ch.charCodeAt(0)
  return tones[sum % tones.length]
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

function Modules() {
  const { modules, assignments, assessments, addModule, deleteModule } =
    useStudyData()

  const [search, setSearch] = useState('')
  const [semester, setSemester] = useState<SemesterFilter>('all')
  const [showForm, setShowForm] = useState(false)

  const query = search.trim().toLowerCase()

  const visible = [...modules]
    .filter((m) => semester === 'all' || String(m.semester) === semester)
    .filter(
      (m) =>
        m.code.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query)
    )
    .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code))

  function handleDelete(m: Module) {
    const assignmentCount = assignments.filter((a) => a.moduleId === m.id).length
    const assessmentCount = assessments.filter((a) => a.moduleId === m.id).length

    const parts: string[] = []
    if (assignmentCount > 0) parts.push(plural(assignmentCount, 'assignment'))
    if (assessmentCount > 0) parts.push(plural(assessmentCount, 'assessment'))
    const extra = parts.length > 0 ? ` This will also delete its ${parts.join(' and ')}.` : ''

    if (window.confirm(`Delete ${m.code}?${extra}`)) {
      deleteModule(m.id)
    }
  }

  return (
    <div className="dashboard">
      <div className="toolbar">
        <input
          className="toolbar-search"
          type="search"
          placeholder="Search modules"
          aria-label="Search modules"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value as SemesterFilter)}
          aria-label="Filter by semester"
        >
          <option value="all">All semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <button
          className="btn-primary btn-with-icon"
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
        >
          <Plus size={18} aria-hidden="true" />
          Add module
        </button>
      </div>

      {showForm && (
        <ModuleForm
          existingCodes={modules.map((m) => m.code)}
          onAdd={async (data) => {
            await addModule(data)
            setShowForm(false)
          }}
        />
      )}

      {modules.length === 0 ? (
        <div className="card">
          <p className="empty">
            No modules yet. Add your first module to start tracking assignments
            and grades.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <p className="empty">No modules match your search.</p>
        </div>
      ) : (
        <div className="module-grid">
          {visible.map((m) => {
            const mine = assignments.filter((a) => a.moduleId === m.id)
            const done = mine.filter((a) => a.completed).length
            const average = summarise(
              assessments.filter((a) => a.moduleId === m.id)
            ).average

            return (
              <article key={m.id} className="card mod-card">
                <div className="mod-top">
                  <span className={`mod-icon tone-${toneFor(m.code)}`}>
                    <BookOpen size={20} aria-hidden="true" />
                  </span>
                  <div className="mod-titles">
                    <h3 className="mod-name">{m.name}</h3>
                    <p className="mod-code">
                      {m.code} · Semester {m.semester}
                    </p>
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => handleDelete(m)}
                    aria-label={`Delete ${m.code}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>

                <div className="mod-body">
                  <ProgressRing
                    value={average}
                    label={
                      average === null
                        ? `${m.code}: no marks yet`
                        : `${m.code}: current average ${round1(average)}%`
                    }
                  />
                  <div>
                    <p className="tile-label">Current average</p>
                    <p className="mod-avg">
                      {average === null ? 'No marks yet' : `${round1(average)}%`}
                    </p>
                  </div>
                </div>

                <div className="mod-foot">
                  <span>
                    {mine.length === 0
                      ? 'No assignments yet'
                      : `${done} of ${mine.length} assignments done`}
                  </span>
                  <Link to="/grades" className="card-link">
                    Open grades
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Modules