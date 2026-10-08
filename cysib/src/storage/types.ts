export type GameId = 'breakdown' | 'leadership' | 'costcutter' | 'crash'

export type ScoreEntry = {
  company: string
  game: GameId
  score: number
  date: string
}

/** Swap this for a Supabase-backed store later. Callers only depend on the interface. */
export interface BusyStorage {
  getCompany(): string | null
  setCompany(name: string): void
  getScores(): ScoreEntry[]
  addScore(entry: ScoreEntry): void
  getPlaySeconds(): number
  addPlaySeconds(seconds: number): number
  getCompanySeconds(): Record<string, number>
  addCompanySeconds(company: string, seconds: number): void
  getMuted(): boolean
  setMuted(muted: boolean): void
  /** Fleet estimate plus this desk. A remote store should return the real aggregate. */
  getSiteWideSeconds(now?: number): number
}
