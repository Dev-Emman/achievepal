export type Priority = 'low' | 'medium' | 'high'
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
  completed: boolean
}

export type NewAssignment = Omit<Assignment, 'id' | 'moduleCode' | 'completed'>