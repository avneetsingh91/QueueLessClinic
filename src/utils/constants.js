export const TOKEN_STATUS = Object.freeze({
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED',
})

export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
})

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
})

export const DEFAULT_AVERAGE_CONSULTATION_MINUTES = 8
export const ROLLING_AVERAGE_SAMPLE_SIZE = 10
export const APPROACHING_THRESHOLD = 2
export const MAX_TOKENS_PER_DAY = 999

export const ANNOUNCEMENT_PRESETS = [
  { label: 'Doctor on a 15-minute break', message: 'The doctor is on a short 15-minute break. Thank you for your patience.' },
  { label: 'Consultation delayed ~30 min', message: 'Consultations are running approximately 30 minutes behind schedule.' },
  { label: 'Emergency case in progress', message: 'An emergency case is currently being handled. Normal service will resume shortly.' },
  { label: 'Clinic temporarily closed', message: 'The clinic is temporarily closed. Please check back later.' },
  { label: 'Clear announcement', message: '' },
]

export const TOKEN_STATUS_STYLES = {
  WAITING: 'bg-amber-50 text-amber-700 ring-amber-200',
  SERVING: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SKIPPED: 'bg-slate-100 text-slate-600 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export const QUEUE_STATUS_STYLES = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PAUSED: 'bg-amber-50 text-amber-700 ring-amber-200',
  CLOSED: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export const EVENT_LABELS = {
  QUEUE_CREATED: 'Queue opened for the day',
  TOKEN_CREATED: 'Token issued',
  NEXT_TOKEN: 'Next token called',
  SKIP_TOKEN: 'Token skipped',
  COMPLETE_TOKEN: 'Consultation completed',
  RECALL_TOKEN: 'Token recalled',
  MARK_ABSENT: 'Patient marked absent',
  RESET_QUEUE: 'Daily queue reset',
  UNDO_ACTION: 'Action undone',
  STATUS_CHANGED: 'Queue status changed',
  ANNOUNCEMENT_SET: 'Announcement updated',
}
