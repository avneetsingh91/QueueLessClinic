import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns'

export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const formatTime = (value) => {
  const date = toDate(value)
  return date ? format(date, 'h:mm a') : '—'
}

export const formatDate = (value) => {
  const date = toDate(value)
  return date ? format(date, 'MMM d, yyyy') : '—'
}

export const formatDateTime = (value) => {
  const date = toDate(value)
  return date ? format(date, 'MMM d, h:mm a') : '—'
}

export const formatRelative = (value) => {
  const date = toDate(value)
  if (!date) return '—'
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`
  return `${formatDistanceToNowStrict(date)} ago`
}

export const formatQueueDate = (queueDate) => {
  if (!queueDate) return '—'
  const [year, month, day] = String(queueDate).split('-').map(Number)
  if (!year || !month || !day) return queueDate
  return format(new Date(year, month - 1, day), 'EEEE, MMMM d, yyyy')
}
