import { APPROACHING_THRESHOLD, TOKEN_STATUS } from './constants'

export const formatToken = (number) => `#${String(Number(number) || 0).padStart(3, '0')}`

export const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

export const queueDateFor = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const tokenSortKey = (token) => {
  const recalled = token?.isRecalled ? 0 : 1
  return [recalled, Number(token?.tokenNumber) || 0]
}

export const compareTokens = (a, b) => {
  const [recalledA, numberA] = tokenSortKey(a)
  const [recalledB, numberB] = tokenSortKey(b)
  if (recalledA !== recalledB) return recalledA - recalledB
  return numberA - numberB
}

export const sortTokens = (tokens = []) => [...tokens].sort(compareTokens)

export const waitingTokens = (tokens = []) =>
  sortTokens(tokens.filter((token) => token?.status === TOKEN_STATUS.WAITING))

export const peopleAheadOf = (tokens = [], tokenNumber) =>
  waitingTokens(tokens).filter((token) => Number(token.tokenNumber) < Number(tokenNumber)).length

export const isApproaching = (peopleAhead) => Number(peopleAhead) <= APPROACHING_THRESHOLD

export const statusLabel = (status) => {
  const labels = {
    WAITING: 'Waiting',
    SERVING: 'In consultation',
    COMPLETED: 'Completed',
    SKIPPED: 'Skipped',
    CANCELLED: 'Absent / Cancelled',
  }
  return labels[status] || 'Unknown'
}

export const queueStatusLabel = (status) => {
  const labels = { OPEN: 'Open', PAUSED: 'Paused', CLOSED: 'Closed' }
  return labels[status] || 'Unknown'
}

export const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'QL'

export const truncate = (value, length = 60) => {
  const text = String(value || '')
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}
