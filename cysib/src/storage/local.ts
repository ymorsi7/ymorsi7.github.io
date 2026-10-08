import type { BusyStorage, ScoreEntry } from './types'

const PREFIX = 'cysib.v1.'

/** Play-seconds credited to the wider floor per real second, so the meter moves without a server. */
const FLEET_EPOCH = Date.UTC(2026, 0, 1)
const FLEET_RATE = 4

export function fleetPlaySeconds(now = Date.now()): number {
  return Math.max(0, (now - FLEET_EPOCH) / 1000) * FLEET_RATE
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function createLocalStorage(): BusyStorage {
  return {
    getCompany() {
      const name = localStorage.getItem(PREFIX + 'company')
      return name && name.trim() ? name : null
    },
    setCompany(name: string) {
      localStorage.setItem(PREFIX + 'company', name.trim().slice(0, 48))
    },
    getScores() {
      return readJson<ScoreEntry[]>('scores', [])
    },
    addScore(entry: ScoreEntry) {
      const scores = readJson<ScoreEntry[]>('scores', [])
      scores.push(entry)
      localStorage.setItem(PREFIX + 'scores', JSON.stringify(scores.slice(-200)))
    },
    getPlaySeconds() {
      const n = Number(localStorage.getItem(PREFIX + 'play') || '0')
      return Number.isFinite(n) ? n : 0
    },
    addPlaySeconds(seconds: number) {
      const next = this.getPlaySeconds() + seconds
      localStorage.setItem(PREFIX + 'play', String(next))
      return next
    },
    getCompanySeconds() {
      return readJson<Record<string, number>>('companyPlay', {})
    },
    addCompanySeconds(company: string, seconds: number) {
      const map = this.getCompanySeconds()
      map[company] = (map[company] || 0) + seconds
      localStorage.setItem(PREFIX + 'companyPlay', JSON.stringify(map))
    },
    getMuted() {
      return localStorage.getItem(PREFIX + 'muted') !== '0'
    },
    setMuted(muted: boolean) {
      localStorage.setItem(PREFIX + 'muted', muted ? '1' : '0')
    },
    getSiteWideSeconds(now = Date.now()) {
      return fleetPlaySeconds(now) + this.getPlaySeconds()
    },
  }
}
