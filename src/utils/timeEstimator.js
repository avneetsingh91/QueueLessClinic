import {
  DEFAULT_AVERAGE_CONSULTATION_MINUTES,
  ROLLING_AVERAGE_SAMPLE_SIZE,
} from './constants'

export function toMinutes(value) {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.getTime()
}

export function rollingAverage(durations = [], fallback = DEFAULT_AVERAGE_CONSULTATION_MINUTES) {
  const valid = durations
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .slice(-ROLLING_AVERAGE_SAMPLE_SIZE)
  if (!valid.length) return fallback
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length
  const clamped = Math.min(60, Math.max(2, mean))
  return Math.round(clamped * 10) / 10
}

export function consultationDurationMinutes(token) {
  if (!token?.servingStartedAt || !token?.completedAt) return null
  const start = toMinutes(token.servingStartedAt)
  const end = toMinutes(token.completedAt)
  if (start === null || end === null || end <= start) return null
  return (end - start) / 60000
}

export function estimateWait(peopleAhead = 0, averageMinutes = DEFAULT_AVERAGE_CONSULTATION_MINUTES) {
  const ahead = Math.max(0, Number(peopleAhead) || 0)
  const average = Math.max(1, Number(averageMinutes) || DEFAULT_AVERAGE_CONSULTATION_MINUTES)
  if (ahead === 0) {
    return { minutes: 0, min: 0, max: 5, label: 'Almost now', detail: 'Please proceed to the reception.' }
  }
  const minutes = ahead * average
  const min = Math.max(1, Math.floor(minutes * 0.8))
  const max = Math.ceil(minutes * 1.25)
  return {
    minutes: Math.round(minutes),
    min,
    max,
    label: `${min}–${max} minutes`,
    detail: `Based on the last few consultations (~${Math.round(average)} min each).`,
  }
}
