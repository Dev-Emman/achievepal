import { supabase } from './supabase'
import { fail } from './api'
import { DEFAULT_PROFILE } from './profile'
import type { Profile } from '../types'

type ProfileRow = {
  weekly_goal_minutes: number
  default_target: number | string
}

const COLUMNS = 'weekly_goal_minutes, default_target'

function toProfile(row: ProfileRow): Profile {
  return {
    weeklyGoalMinutes: row.weekly_goal_minutes,
    defaultTarget: Number(row.default_target),
  }
}

// A new account has no row yet, so we fall back to the defaults
export async function fetchProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(COLUMNS)
    .maybeSingle()
  if (error) fail(error, 'Could not load your settings.')
  return data ? toProfile(data as unknown as ProfileRow) : DEFAULT_PROFILE
}

// Creates the row the first time and updates it after that
export async function saveProfileRow(p: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        weekly_goal_minutes: p.weeklyGoalMinutes,
        default_target: p.defaultTarget,
      },
      { onConflict: 'user_id' }
    )
    .select(COLUMNS)
    .single()
  if (error) fail(error, 'Could not save your settings. Please try again.')
  return toProfile(data as unknown as ProfileRow)
}