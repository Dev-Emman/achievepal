import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import * as api from '../lib/api'
import * as assessmentsApi from '../lib/assessmentsApi'
import type {
  Assessment,
  Assignment,
  Module,
  NewAssessment,
  NewAssignment,
  NewModule,
} from '../types'

type StudyData = {
  modules: Module[]
  assignments: Assignment[]
  assessments: Assessment[]
  addModule: (data: NewModule) => Promise<void>
  deleteModule: (id: string) => Promise<void>
  addAssignment: (data: NewAssignment) => Promise<void>
  toggleAssignment: (id: string) => Promise<void>
  deleteAssignment: (id: string) => Promise<void>
  addAssessment: (data: NewAssessment) => Promise<void>
  setAssessmentMark: (id: string, mark: number | null) => Promise<void>
  deleteAssessment: (id: string) => Promise<void>
}

const StudyDataContext = createContext<StudyData | null>(null)

export function StudyDataProvider() {
  const { user } = useAuth()
  const userId = user?.id

  const [modules, setModules] = useState<Module[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    Promise.all([
      api.fetchModules(),
      api.fetchAssignments(),
      assessmentsApi.fetchAssessments(),
    ])
      .then(([loadedModules, loadedAssignments, loadedAssessments]) => {
        if (cancelled) return
        setModules(loadedModules)
        setAssignments(loadedAssignments)
        setAssessments(loadedAssessments)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // "Add" and "set mark" throw on failure so the form can show the message next to the field
  async function addModule(data: NewModule) {
    const created = await api.insertModule(data)
    setModules((prev) => [...prev, created])
  }

  async function addAssignment(data: NewAssignment) {
    const created = await api.insertAssignment(data)
    setAssignments((prev) => [...prev, created])
  }

  async function addAssessment(data: NewAssessment) {
    const created = await assessmentsApi.insertAssessment(data)
    setAssessments((prev) => [...prev, created])
  }

  async function setAssessmentMark(id: string, mark: number | null) {
    await assessmentsApi.updateAssessmentMark(id, mark)
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, mark } : a))
    )
  }

  // Delete and toggle actions show failures in the banner instead
  async function deleteModule(id: string) {
    try {
      await api.deleteModuleById(id)
      setModules((prev) => prev.filter((m) => m.id !== id))
      setAssignments((prev) => prev.filter((a) => a.moduleId !== id))
      setAssessments((prev) => prev.filter((a) => a.moduleId !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  async function toggleAssignment(id: string) {
    const target = assignments.find((a) => a.id === id)
    if (!target) return
    const completed = !target.completed
    try {
      await api.setAssignmentCompleted(id, completed)
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, completed } : a))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  async function deleteAssignment(id: string) {
    try {
      await api.deleteAssignmentById(id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  async function deleteAssessment(id: string) {
    try {
      await assessmentsApi.deleteAssessmentById(id)
      setAssessments((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  if (loading) {
    return <p className="empty">Loading your data...</p>
  }

  return (
    <StudyDataContext.Provider
      value={{
        modules,
        assignments,
        assessments,
        addModule,
        deleteModule,
        addAssignment,
        toggleAssignment,
        deleteAssignment,
        addAssessment,
        setAssessmentMark,
        deleteAssessment,
      }}
    >
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button
            className="icon-btn"
            onClick={() => setError('')}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}
      <Outlet />
    </StudyDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudyData() {
  const context = useContext(StudyDataContext)
  if (!context) {
    throw new Error('useStudyData must be used inside <StudyDataProvider>')
  }
  return context
}