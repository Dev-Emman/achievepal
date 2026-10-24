import { supabase } from './supabase'
import type {
  Assignment,
  Module,
  NewAssignment,
  NewModule,
  Priority,
  Semester,
} from '../types'

type ModuleRow = {
  id: string
  code: string
  name: string
  semester: number
}

type AssignmentRow = {
  id: string
  module_id: string
  title: string
  deadline: string
  priority: string
  completed: boolean
  modules: { code: string } | null
}

const MODULE_COLUMNS = 'id, code, name, semester'
const ASSIGNMENT_COLUMNS =
  'id, module_id, title, deadline, priority, completed, modules(code)'

function toModule(row: ModuleRow): Module {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    semester: row.semester as Semester,
  }
}

function toAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    moduleId: row.module_id,
    moduleCode: row.modules?.code ?? '?',
    title: row.title,
    deadline: row.deadline,
    priority: row.priority as Priority,
    completed: row.completed,
  }
}

// Log the technical details for us, show the user a friendly message
function fail(error: unknown, friendly: string): never {
  console.error(error)
  throw new Error(friendly)
}

export async function fetchModules(): Promise<Module[]> {
  const { data, error } = await supabase
    .from('modules')
    .select(MODULE_COLUMNS)
    .order('semester')
    .order('code')
  if (error) fail(error, 'Could not load your modules.')
  return ((data ?? []) as unknown as ModuleRow[]).map(toModule)
}

export async function insertModule(m: NewModule): Promise<Module> {
  const { data, error } = await supabase
    .from('modules')
    .insert({ code: m.code, name: m.name, semester: m.semester })
    .select(MODULE_COLUMNS)
    .single()
  if (error) {
    if (error.code === '23505') {
      fail(error, `You already have a module with the code ${m.code}.`)
    }
    fail(error, 'Could not add the module. Please try again.')
  }
  return toModule(data as unknown as ModuleRow)
}

export async function deleteModuleById(id: string): Promise<void> {
  const { error } = await supabase.from('modules').delete().eq('id', id)
  if (error) fail(error, 'Could not delete the module. Please try again.')
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select(ASSIGNMENT_COLUMNS)
    .order('deadline')
  if (error) fail(error, 'Could not load your assignments.')
  return ((data ?? []) as unknown as AssignmentRow[]).map(toAssignment)
}

export async function insertAssignment(a: NewAssignment): Promise<Assignment> {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      module_id: a.moduleId,
      title: a.title,
      deadline: a.deadline,
      priority: a.priority,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single()
  if (error) fail(error, 'Could not add the assignment. Please try again.')
  return toAssignment(data as unknown as AssignmentRow)
}

export async function setAssignmentCompleted(
  id: string,
  completed: boolean
): Promise<void> {
  const { error } = await supabase
    .from('assignments')
    .update({ completed })
    .eq('id', id)
  if (error) fail(error, 'Could not update the assignment. Please try again.')
}

export async function deleteAssignmentById(id: string): Promise<void> {
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) fail(error, 'Could not delete the assignment. Please try again.')
}