import type { Priority, Status } from '../types'

export const statusOrder: Status[] = ['not_started', 'in_progress', 'completed']

export const statusLabels: Record<Status, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
}

export const priorityOrder: Priority[] = ['high', 'medium', 'low']

export const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}