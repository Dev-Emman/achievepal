export type Priority = 'low' | 'medium' | 'high'
export type Status = 'not_started' | 'in_progress' | 'completed'
export type Semester = 1 | 2

export type Module = {
  id: string
  code: string
  name: string
  semester: Semester
}

export type NewModule = Omit<Module, 'id'>

export type Assignment = {
  id: string
  moduleId: string
  moduleCode: string
  title: string
  deadline: string // format: YYYY-MM-DD
  priority: Priority
  status: Status
  completed: boolean // always equals (status === 'completed'), kept for convenience
}

export type NewAssignment = Omit<
  Assignment,
  'id' | 'moduleCode' | 'status' | 'completed'
>

export type Assessment = {
  id: string
  moduleId: string
  name: string
  weight: number // percentage of the module, 0 to 100
  mark: number | null // null until the mark is known
}

export type NewAssessment = Omit<Assessment, 'id'>