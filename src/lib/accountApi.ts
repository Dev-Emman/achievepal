import { supabase } from './supabase'

// Both functions return an error message, or null when it worked

export async function updateFullName(fullName: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  })
  if (error) {
    console.error(error)
    return 'Could not update your name. Please try again.'
  }
  return null
}

export async function changePassword(newPassword: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    console.error(error)
    // These messages are about the user's own input, such as "same as old password"
    return error.message
  }
  return null
}