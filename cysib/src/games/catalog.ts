import type { GameId } from '../storage/types'

export type GameIcon = 'writer' | 'sheets' | 'planner'

export type GameMeta = {
  id: GameId
  file: string
  title: string
  app: string
  blurb: string
  icon: GameIcon
  variant: 'writer' | 'sheets'
}

export const GAMES: GameMeta[] = [
  {
    id: 'breakdown',
    file: 'Document1',
    title: 'Document1 - Writer',
    app: 'Writer',
    blurb: 'Internal memo, still circulating.',
    icon: 'writer',
    variant: 'writer',
  },
  {
    id: 'costcutter',
    file: 'Spend_Review',
    title: 'Spend_Review - Sheets',
    app: 'Sheets',
    blurb: 'Stacked costs for a week that will not sit still.',
    icon: 'sheets',
    variant: 'sheets',
  },
  {
    id: 'crash',
    file: 'Week_Plan',
    title: 'Week_Plan - Sheets',
    app: 'Sheets',
    blurb: 'A full calendar, if the blocks will agree.',
    icon: 'planner',
    variant: 'sheets',
  },
  {
    id: 'leadership',
    file: 'Q3_Forecast',
    title: 'Q3_Forecast - Sheets',
    app: 'Sheets',
    blurb: 'High case and low case, sharing one chart.',
    icon: 'sheets',
    variant: 'sheets',
  },
]

export function gameMeta(id: GameId): GameMeta {
  const found = GAMES.find((game) => game.id === id)
  if (!found) throw new Error(id)
  return found
}
