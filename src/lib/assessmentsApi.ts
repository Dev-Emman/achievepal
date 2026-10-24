import { supabase } from './supabase'
import { fail } from './api'
import type { Assessment, NewAssessment } from '../types'

type AssessmentRow = {
  id: string
  module_id: string
  name: string
  weight: number | string
  mark: number | string | null
}

const COLUMNS = 'id, module_id, name, weight, mark'

function toAssessment(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    moduleId: row.module_id,
    name: row.name,
    weight: Number(row.weight),
    mark: row.mark === null ? null : Number(row.mark),
  }
}

export async function fetchAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select(COLUMNS)
    .order('created_at')
  if (error) fail(error, 'Could not load your assessments.')
  return ((data ?? []) as unknown as AssessmentRow[]).map(toAssessment)
}

export async function insertAssessment(a: NewAssessment): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      module_id: a.moduleId,
      name: a.name,
      weight: a.weight,
      mark: a.mark,
    })
    .select(COLUMNS)
    .single()
  if (error) fail(error, 'Could not add the assessment. Please try again.')
  return toAssessment(data as unknown as AssessmentRow)
}

export async function updateAssessmentMark(
  id: string,
  mark: number | null
): Promise<void> {
  const { error } = await supabase
    .from('assessments')
    .update({ mark })
    .eq('id', id)
  if (error) fail(error, 'Could not save the mark. Please try again.')
}

export async function deleteAssessmentById(id: string): Promise<void> {
  const { error } = await supabase.from('assessments').delete().eq('id', id)
  if (error) fail(error, 'Could not delete the assessment. Please try again.')
}