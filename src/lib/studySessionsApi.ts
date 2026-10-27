import { supabase } from './supabase'
import { fail } from './api'
import type { NewStudySession, StudySession } from '../types'

type SessionRow = {
  id: string
  module_id: string | null
  started_at: string
  duration_seconds: number
}

const COLUMNS = 'id, module_id, started_at, duration_seconds'

function toSession(row: SessionRow): StudySession {
  return {
    id: row.id,
    moduleId: row.module_id,
    startedAt: row.started_at,
    durationSeconds: row.duration_seconds,
  }
}

// Newest first, capped so the app never downloads an unbounded history
export async function fetchSessions(): Promise<StudySession[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(COLUMNS)
    .order('started_at', { ascending: false })
    .limit(500)
  if (error) fail(error, 'Could not load your study sessions.')
  return ((data ?? []) as unknown as SessionRow[]).map(toSession)
}

export async function insertSession(s: NewStudySession): Promise<StudySession> {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      module_id: s.moduleId,
      started_at: s.startedAt,
      duration_seconds: s.durationSeconds,
    })
    .select(COLUMNS)
    .single()
  if (error) fail(error, 'Could not save your study session. Please try again.')
  return toSession(data as unknown as SessionRow)
}

export async function deleteSessionById(id: string): Promise<void> {
  const { error } = await supabase.from('study_sessions').delete().eq('id', id)
  if (error) fail(error, 'Could not delete the session. Please try again.')
}